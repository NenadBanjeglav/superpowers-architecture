import { createHash } from 'node:crypto';
import { mkdir, readFile, rmdir, writeFile } from 'node:fs/promises';
import { isIso8601Timestamp, policyAcceptsReady, resolveApprovalPolicy } from './policy.mjs';

const LIFECYCLE_LABELS = ['Artifact Type', 'Status', 'Revision', 'Approved Revision', 'Approved At'];
const LIFECYCLE_LINE = /^\*\*(Artifact Type|Status|Revision|Approved Revision|Approved At):\*\*[^\n]*(?:\n|$)/gm;
const SHA256_REVISION = /^sha256:[0-9a-f]{64}$/;
const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);

function decodeArtifactBytes(input) {
  const bytes = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const withoutBom = bytes.subarray(0, 3).equals(UTF8_BOM) ? bytes.subarray(3) : bytes;
  const decoded = new TextDecoder('utf-8', { fatal: true }).decode(withoutBom);
  return decoded.replace(/\r\n?/g, '\n');
}

function maskMarkdownFences(normalized) {
  let insideFence = false;
  let fenceCharacter = '';
  let fenceLength = 0;

  return normalized
    .split(/(?<=\n)/)
    .map((segment) => {
      const hasNewline = segment.endsWith('\n');
      const line = hasNewline ? segment.slice(0, -1) : segment;
      const opening = insideFence ? null : line.match(/^ {0,3}(`{3,}|~{3,})/);
      const closing = insideFence
        ? line.match(new RegExp(`^ {0,3}${fenceCharacter === '`' ? '`' : '~'}{${fenceLength},}[ \\t]*$`))
        : null;
      const masked = `${' '.repeat(line.length)}${hasNewline ? '\n' : ''}`;

      if (opening) {
        insideFence = true;
        fenceCharacter = opening[1][0];
        fenceLength = opening[1].length;
        return masked;
      }
      if (insideFence) {
        if (closing) {
          insideFence = false;
          fenceCharacter = '';
          fenceLength = 0;
        }
        return masked;
      }
      return segment;
    })
    .join('');
}

export function canonicalizeArtifactBytes(input) {
  const normalized = decodeArtifactBytes(input);
  const payload = normalized.replace(LIFECYCLE_LINE, '').replace(/\n+$/g, '');
  return Buffer.from(`${payload}\n`, 'utf8');
}

export function computeArtifactRevision(input) {
  return `sha256:${createHash('sha256').update(canonicalizeArtifactBytes(input)).digest('hex')}`;
}

function recoveryAction() {
  return 'Recovery: run artifact draft before editing and artifact refresh afterward. Resolve applicable review findings, then use artifact ready under Autonomous or obtain clear human approval and use artifact approve under Review-gated.';
}

function artifactError(path, expected, actual, recovery = recoveryAction()) {
  return new Error(`Artifact ${path}: expected ${expected}; actual ${actual}. ${recovery}`);
}

function assertArtifactType(path, expected, actual) {
  if (actual !== expected) {
    throw artifactError(path, `artifact type ${expected}`, actual || 'missing artifact type');
  }
}

function assertRevisionArgument(path, revision, optionName = 'expected revision') {
  if (!SHA256_REVISION.test(revision ?? '')) {
    throw artifactError(
      path,
      `${optionName} as a complete lowercase sha256 digest`,
      revision ?? 'missing',
      'Recovery: provide the exact sha256:<64 lowercase hex characters> revision shown by artifact refresh.',
    );
  }
}

function parseLifecycleMetadata(path, normalized) {
  const metadataSource = maskMarkdownFences(normalized);
  const values = {};
  for (const label of LIFECYCLE_LABELS) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = [...metadataSource.matchAll(new RegExp(`^\\*\\*${escaped}:\\*\\*[ \\t]*(.*?)[ \\t]*$`, 'gm'))];
    if (matches.length !== 1) {
      throw artifactError(
        path,
        `exactly one ${label} metadata line`,
        `${matches.length} lines (missing or duplicate ${label})`,
      );
    }
    values[label] = matches[0][1];
  }

  return {
    artifactType: values['Artifact Type'],
    status: values.Status,
    revision: values.Revision,
    approvedRevision: values['Approved Revision'],
    approvedAt: values['Approved At'],
  };
}

function serializeMetadata(metadata) {
  return [
    `**Artifact Type:** ${metadata.artifactType}`,
    `**Status:** ${metadata.status}`,
    `**Revision:** ${metadata.revision}`,
    `**Approved Revision:** ${metadata.approvedRevision}`,
    `**Approved At:** ${metadata.approvedAt}`,
  ].join('\n') + '\n';
}

function replaceLifecycleMetadata(normalized, metadata) {
  const metadataSource = maskMarkdownFences(normalized);
  const matches = [...metadataSource.matchAll(LIFECYCLE_LINE)];
  const firstLifecycleIndex = matches[0]?.index ?? -1;
  let withoutLifecycle = normalized;
  for (const match of matches.reverse()) {
    withoutLifecycle = `${withoutLifecycle.slice(0, match.index)}${withoutLifecycle.slice(match.index + match[0].length)}`;
  }
  let insertionIndex = firstLifecycleIndex;

  if (insertionIndex < 0) {
    const firstLineEnd = withoutLifecycle.indexOf('\n');
    if (firstLineEnd >= 0) {
      insertionIndex = firstLineEnd + 1;
    } else if (withoutLifecycle.length > 0) {
      return `${withoutLifecycle}\n${serializeMetadata(metadata)}`;
    } else {
      insertionIndex = 0;
    }
  }

  return `${withoutLifecycle.slice(0, insertionIndex)}${serializeMetadata(metadata)}${withoutLifecycle.slice(insertionIndex)}`;
}

async function readArtifact(path) {
  let bytes;
  try {
    bytes = await readFile(path);
  } catch (error) {
    throw artifactError(
      path,
      'a readable UTF-8 artifact file',
      error.code ?? error.message,
      'Recovery: restore or create the artifact at the supplied path, then retry the lifecycle operation.',
    );
  }

  try {
    return { bytes, normalized: decodeArtifactBytes(bytes) };
  } catch (error) {
    throw artifactError(
      path,
      'valid UTF-8 bytes with an optional UTF-8 BOM',
      error.message,
      'Recovery: save the artifact as UTF-8 and retry the lifecycle operation.',
    );
  }
}

async function writeArtifact(path, normalized, metadata) {
  await writeFile(path, replaceLifecycleMetadata(normalized, metadata), 'utf8');
  return { path, ...metadata };
}

async function withArtifactWriterLock(path, operation) {
  const lockPath = `${path}.spa-artifact-operation.lock`;
  try {
    await mkdir(lockPath, { mode: 0o700 });
  } catch (error) {
    throw artifactError(path, `exclusive cooperative writer lock ${lockPath}`, error.code ?? error.message, `Recovery: confirm no artifact lifecycle writer is active. Remove ${lockPath} only when a prior writer demonstrably terminated, then reread and refresh the artifact.`);
  }
  let operationError;
  try {
    return await operation();
  } catch (error) {
    operationError = error;
    throw error;
  } finally {
    try {
      await rmdir(lockPath);
    } catch (error) {
      const cleanupError = artifactError(path, `empty operation-owned writer lock ${lockPath}`, error.code ?? error.message, `Recovery: preserve and inspect ${lockPath}; do not recursively remove unknown contents.`);
      if (operationError) {
        throw new AggregateError([operationError, cleanupError], `${operationError.message} Artifact writer-lock cleanup also failed: ${cleanupError.message}`, { cause: operationError });
      }
      throw cleanupError;
    }
  }
}

async function draftArtifactUnlocked({ path, artifactType }) {
  if (!artifactType) {
    throw artifactError(
      path,
      'an explicit artifact type',
      'missing artifact type',
      'Recovery: pass --type "Design Spec" or --type "Implementation Plan" explicitly.',
    );
  }
  const { bytes, normalized } = await readArtifact(path);
  const revision = computeArtifactRevision(bytes);
  return writeArtifact(path, normalized, {
    artifactType,
    status: 'Draft',
    revision,
    approvedRevision: 'none',
    approvedAt: 'none',
  });
}

async function refreshArtifactRevisionUnlocked({ path, artifactType }) {
  const { bytes, normalized } = await readArtifact(path);
  const current = parseLifecycleMetadata(path, normalized);
  assertArtifactType(path, artifactType, current.artifactType);
  if (!['Draft', 'Ready', 'Approved'].includes(current.status)) {
    throw artifactError(path, 'status Draft, Ready, or Approved', current.status || 'missing status');
  }

  const revision = computeArtifactRevision(bytes);
  const approvalStillValid =
    current.status === 'Approved' &&
    current.revision === revision &&
    current.approvedRevision === revision &&
    current.approvedAt !== 'none' &&
    isIso8601Timestamp(current.approvedAt);
  const readinessStillValid =
    current.status === 'Ready' &&
    current.revision === revision &&
    current.approvedRevision === 'none' &&
    current.approvedAt === 'none';

  if (approvalStillValid || readinessStillValid) {
    return { path, ...current };
  }

  return writeArtifact(path, normalized, {
    artifactType,
    status: 'Draft',
    revision,
    approvedRevision: 'none',
    approvedAt: 'none',
  });
}

async function readyArtifactUnlocked({ path, artifactType, expectedRevision }) {
  assertRevisionArgument(path, expectedRevision);
  const checked = await readArtifact(path);
  const current = parseLifecycleMetadata(path, checked.normalized);
  assertArtifactType(path, artifactType, current.artifactType);
  if (current.status !== 'Draft' || current.revision !== expectedRevision || current.approvedRevision !== 'none' || current.approvedAt !== 'none' || computeArtifactRevision(checked.bytes) !== expectedRevision) {
    throw artifactError(path, `refreshed Draft ${expectedRevision} with no approval metadata`, `Status ${current.status}; Revision ${current.revision}; Approved Revision ${current.approvedRevision}; Approved At ${current.approvedAt}; payload ${computeArtifactRevision(checked.bytes)}`);
  }
  return writeArtifact(path, checked.normalized, {
    artifactType,
    status: 'Ready',
    revision: expectedRevision,
    approvedRevision: 'none',
    approvedAt: 'none',
  });
}

async function approveArtifactUnlocked({ path, artifactType, expectedRevision, approvedAt = new Date().toISOString() }) {
  assertRevisionArgument(path, expectedRevision);
  const { bytes, normalized } = await readArtifact(path);
  const current = parseLifecycleMetadata(path, normalized);
  assertArtifactType(path, artifactType, current.artifactType);
  if (current.status !== 'Draft') {
    throw artifactError(
      path,
      'status Draft before approval',
      current.status || 'missing status',
      'Recovery: run artifact draft before any edit, artifact refresh afterward, and obtain user review of the refreshed revision before approval.',
    );
  }

  const actualRevision = computeArtifactRevision(bytes);
  if (actualRevision !== expectedRevision) {
    throw artifactError(path, `reviewed revision ${expectedRevision}`, actualRevision);
  }
  if (!isIso8601Timestamp(approvedAt)) {
    throw artifactError(
      path,
      'Approved At as an ISO-8601 timestamp',
      approvedAt,
      'Recovery: supply a valid ISO-8601 approval timestamp.',
    );
  }

  return writeArtifact(path, normalized, {
    artifactType,
    status: 'Approved',
    revision: actualRevision,
    approvedRevision: actualRevision,
    approvedAt,
  });
}

export function draftArtifact(args) {
  return withArtifactWriterLock(args.path, () => draftArtifactUnlocked(args));
}

export function refreshArtifactRevision(args) {
  return withArtifactWriterLock(args.path, () => refreshArtifactRevisionUnlocked(args));
}

export function readyArtifact(args) {
  return withArtifactWriterLock(args.path, () => readyArtifactUnlocked(args));
}

export function approveArtifact(args) {
  return withArtifactWriterLock(args.path, () => approveArtifactUnlocked(args));
}

export async function validateDraftArtifact({ path, artifactType, expectedRevision }) {
  assertRevisionArgument(path, expectedRevision);
  const { bytes, normalized } = await readArtifact(path);
  const current = parseLifecycleMetadata(path, normalized);
  assertArtifactType(path, artifactType, current.artifactType);

  if (current.status !== 'Draft') {
    throw artifactError(path, 'status Draft', current.status || 'missing status');
  }
  if (current.revision !== expectedRevision) {
    throw artifactError(path, `Revision ${expectedRevision}`, current.revision || 'missing revision');
  }
  if (current.approvedRevision !== 'none') {
    throw artifactError(path, 'Approved Revision none', current.approvedRevision || 'missing approved revision');
  }
  if (current.approvedAt !== 'none') {
    throw artifactError(path, 'Approved At none', current.approvedAt || 'missing Approved At');
  }

  const actualRevision = computeArtifactRevision(bytes);
  if (actualRevision !== expectedRevision) {
    throw artifactError(path, `Draft Revision payload digest ${expectedRevision}`, actualRevision);
  }

  return { path, ...current };
}

export async function validateArtifact({ path, artifactType, expectedRevision, policy }) {
  assertRevisionArgument(path, expectedRevision);
  const resolvedPolicy = resolveApprovalPolicy(policy);
  const { bytes, normalized } = await readArtifact(path);
  const current = parseLifecycleMetadata(path, normalized);
  assertArtifactType(path, artifactType, current.artifactType);

  const actualRevision = computeArtifactRevision(bytes);
  if (current.revision !== expectedRevision || actualRevision !== expectedRevision) {
    throw artifactError(path, `current payload and Revision ${expectedRevision}`, `Revision ${current.revision}; payload ${actualRevision}`);
  }
  if (current.status === 'Ready' && policyAcceptsReady(resolvedPolicy)) {
    if (current.approvedRevision !== 'none' || current.approvedAt !== 'none') {
      throw artifactError(path, 'Ready with Approved Revision none and Approved At none', `Approved Revision ${current.approvedRevision}; Approved At ${current.approvedAt}`);
    }
    return { path, ...current, policy: resolvedPolicy };
  }
  if (current.status !== 'Approved') {
    throw artifactError(path, `status Approved under ${resolvedPolicy}`, current.status || 'missing status');
  }
  if (current.approvedRevision !== expectedRevision) {
    throw artifactError(path, `approved revision ${expectedRevision}`, current.approvedRevision || 'missing approved revision');
  }
  if (!isIso8601Timestamp(current.approvedAt)) {
    throw artifactError(path, 'a valid ISO-8601 Approved At value', current.approvedAt || 'missing Approved At');
  }
  return { path, ...current, policy: resolvedPolicy };
}

export async function validateApprovedArtifact(args) {
  const result = await validateArtifact({ ...args, policy: 'Review-gated' });
  const { policy: omitted, ...legacyResult } = result;
  return legacyResult;
}
