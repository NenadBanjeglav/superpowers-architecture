import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  posix,
  relative,
  resolve,
  sep,
} from 'node:path';
import { promisify } from 'node:util';

import {
  approveArtifact,
  validateApprovedArtifact,
  validateDraftArtifact,
} from './artifacts.mjs';

const FOUNDATION_ARTIFACT_TYPE = 'Agentic Foundation';
const FOUNDATION_SCHEMA = 'superpowers-architecture-agentic-foundation-v1';
const MANIFEST_RELATIVE_PATH = 'docs/agentic/WAYFINDING.md';
const REQUIRED_FOUNDATION_FILES = [
  'AGENTS.md',
  'CONTEXT.md',
  'docs/agentic/AGENTS.md',
  'docs/agentic/WAYFINDING.md',
  'docs/agentic/PROJECT-BLUEPRINT.md',
  'docs/agentic/PRODUCT.md',
  'docs/agentic/DOMAIN.md',
  'docs/agentic/ARCHITECTURE.md',
  'docs/agentic/DECISIONS.md',
  'docs/agentic/ROADMAP.md',
  'docs/agentic/VERIFICATION.md',
];
const LIFECYCLE_LABELS = ['Artifact Type', 'Status', 'Revision', 'Approved Revision', 'Approved At'];
const LIFECYCLE_LINE_SOURCE =
  '^\\*\\*(Artifact Type|Status|Revision|Approved Revision|Approved At):\\*\\*[^\\n]*(?:\\n|$)';
const COMPLETE_REVISION = /^sha256:[0-9a-f]{64}$/;
const ISO_8601_TIMESTAMP =
  /^(?<year>\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const CANDIDATE_SCHEMA = 'superpowers-architecture-foundation-candidate-v1';
const APPLIED_SCHEMA = 'superpowers-architecture-foundation-applied-v1';
const TRANSACTION_SCHEMA = 'superpowers-architecture-foundation-transaction-v1';
const CANDIDATE_PARENT_RELATIVE_PATH = 'docs/superpowers/foundation-candidates';
const DESIGN_SPEC_PARENT_RELATIVE_PATH = 'docs/superpowers/specs';
const REVIEW_FILE = 'DESIGN-CHANGE-SET.md';
const APPLIED_FILE = 'APPLIED.json';
const TRANSACTION_DIRECTORY = '.transaction';
const execFile = promisify(execFileCallback);

function recoveryAction() {
  return 'Recovery: run foundation draft before editing, run foundation refresh after editing, obtain renewed user review, then run foundation approve with the exact refreshed revision.';
}

function foundationError(subject, expected, actual, recovery = recoveryAction()) {
  return new Error(`Agentic Foundation ${subject}: expected ${expected}; actual ${actual}. ${recovery}`);
}

function assertSupportedNode() {
  const version = process.versions?.node ?? 'unknown';
  const major = Number.parseInt(version.split('.')[0], 10);
  if (!Number.isInteger(major) || major < 20) {
    throw foundationError(
      'runtime',
      'Node.js 20 or newer',
      `Node.js ${version}`,
      'Recovery: install Node.js 20 or newer, then rerun the Foundation operation.',
    );
  }
}

function isIso8601Timestamp(value) {
  if (typeof value !== 'string') return false;
  const match = value.match(ISO_8601_TIMESTAMP);
  if (!match) return false;
  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1] && !Number.isNaN(Date.parse(value));
}

function decodeStrictUtf8(input, subject) {
  const bytes =
    typeof input === 'string'
      ? Buffer.from(input, 'utf8')
      : Buffer.isBuffer(input)
        ? input
        : input instanceof Uint8Array
          ? Buffer.from(input)
          : null;
  if (!bytes) {
    throw foundationError(
      subject,
      'UTF-8 string or bytes',
      input === null ? 'null' : typeof input,
      'Recovery: provide each Foundation record as a UTF-8 string, Buffer, or Uint8Array.',
    );
  }

  const withoutBom = bytes.subarray(0, 3).equals(UTF8_BOM) ? bytes.subarray(3) : bytes;
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true })
      .decode(withoutBom)
      .replace(/\r\n?/g, '\n');
  } catch (error) {
    throw foundationError(
      subject,
      'valid UTF-8 bytes with an optional UTF-8 BOM',
      error.message,
      'Recovery: save the managed Foundation file as UTF-8 and retry.',
    );
  }
}

function transformOutsideMarkdownFences(normalized, transformLine) {
  let insideFence = false;
  let fenceCharacter = '';
  let fenceLength = 0;
  const output = [];

  for (const line of normalized.split('\n')) {
    const opening = insideFence ? null : line.match(/^ {0,3}(`{3,}|~{3,})/);
    const closing = insideFence
      ? line.match(new RegExp(`^ {0,3}${fenceCharacter === '`' ? '`' : '~'}{${fenceLength},}[ \\t]*$`))
      : null;

    if (opening) {
      insideFence = true;
      fenceCharacter = opening[1][0];
      fenceLength = opening[1].length;
      output.push(line);
      continue;
    }
    if (insideFence) {
      output.push(line);
      if (closing) {
        insideFence = false;
        fenceCharacter = '';
        fenceLength = 0;
      }
      continue;
    }

    const transformed = transformLine(line);
    if (transformed !== null) output.push(transformed);
  }

  return output.join('\n');
}

function normalizeRecordContent(path, input) {
  let normalized = decodeStrictUtf8(input, `record ${path}`);
  if (path === MANIFEST_RELATIVE_PATH) {
    normalized = transformOutsideMarkdownFences(normalized, (line) =>
      /^\*\*(Artifact Type|Status|Revision|Approved Revision|Approved At):\*\*[^\n]*$/.test(line)
        ? null
        : line,
    );
  }
  return `${normalized.replace(/\n+$/g, '')}\n`;
}

function assertNormalizedRecordPath(path, subject = 'record path') {
  if (typeof path !== 'string' || path.length === 0) {
    throw foundationError(
      subject,
      'a non-empty normalized repository-relative path',
      path === '' ? 'empty path' : typeof path,
      'Recovery: use a non-empty forward-slash repository-relative path.',
    );
  }
  if (
    path.includes('\\') ||
    path.includes('\0') ||
    path.startsWith('/') ||
    /^[A-Za-z]:\//.test(path) ||
    path.startsWith('//')
  ) {
    throw foundationError(
      subject,
      'a normalized forward-slash repository-relative path',
      path,
      'Recovery: remove absolute prefixes and backslashes, then use a repository-relative path.',
    );
  }
  if (
    posix.normalize(path) !== path ||
    path === '.' ||
    path.startsWith('./') ||
    path.endsWith('/') ||
    path.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw foundationError(
      subject,
      'a normalized path without traversal or redundant segments',
      path,
      'Recovery: remove traversal, dot, empty, and trailing-slash path segments.',
    );
  }
}

function encodeUnsigned64(value) {
  const encoded = Buffer.alloc(8);
  encoded.writeBigUInt64BE(BigInt(value));
  return encoded;
}

export function canonicalizeFoundationRecords(records) {
  assertSupportedNode();
  if (!Array.isArray(records)) {
    throw foundationError(
      'records',
      'an array of path/content records',
      typeof records,
      'Recovery: pass an array whose records each contain path and content values.',
    );
  }

  const seen = new Set();
  const normalizedRecords = records.map((record, index) => {
    if (!record || typeof record !== 'object') {
      throw foundationError(
        `record ${index}`,
        'an object with path and content',
        record === null ? 'null' : typeof record,
        'Recovery: provide complete Foundation path/content records.',
      );
    }
    assertNormalizedRecordPath(record.path, `record ${index} path`);
    if (seen.has(record.path)) {
      throw foundationError(
        `record ${index} path`,
        'a unique managed path',
        `duplicate ${record.path}`,
        'Recovery: remove duplicate Foundation manifest paths.',
      );
    }
    seen.add(record.path);

    return {
      pathBytes: Buffer.from(record.path, 'utf8'),
      contentBytes: Buffer.from(normalizeRecordContent(record.path, record.content), 'utf8'),
    };
  });

  normalizedRecords.sort((left, right) => Buffer.compare(left.pathBytes, right.pathBytes));
  const parts = [
    Buffer.from(FOUNDATION_SCHEMA, 'ascii'),
    Buffer.from([0]),
    encodeUnsigned64(normalizedRecords.length),
  ];
  for (const record of normalizedRecords) {
    parts.push(
      encodeUnsigned64(record.pathBytes.length),
      record.pathBytes,
      encodeUnsigned64(record.contentBytes.length),
      record.contentBytes,
    );
  }
  return Buffer.concat(parts);
}

export function computeFoundationRevision(records) {
  return `sha256:${createHash('sha256').update(canonicalizeFoundationRecords(records)).digest('hex')}`;
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

function parseLifecycleMetadata(manifestPath, normalized) {
  const metadataSource = maskMarkdownFences(normalized);
  const values = {};
  for (const label of LIFECYCLE_LABELS) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = [...metadataSource.matchAll(new RegExp(`^\\*\\*${escaped}:\\*\\*[ \\t]*(.*?)[ \\t]*$`, 'gm'))];
    if (matches.length !== 1) {
      throw foundationError(
        `manifest ${manifestPath}`,
        `exactly one unfenced ${label} lifecycle line`,
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
  const lifecyclePattern = new RegExp(LIFECYCLE_LINE_SOURCE, 'gm');
  const matches = [...metadataSource.matchAll(lifecyclePattern)];
  let withoutLifecycle = normalized;
  for (const match of [...matches].reverse()) {
    withoutLifecycle =
      withoutLifecycle.slice(0, match.index) +
      withoutLifecycle.slice(match.index + match[0].length);
  }
  return (
    withoutLifecycle.slice(0, matches[0].index) +
    serializeMetadata(metadata) +
    withoutLifecycle.slice(matches[0].index)
  );
}

function parseFoundationFiles(manifestPath, normalized) {
  const masked = maskMarkdownFences(normalized);
  const headings = [...masked.matchAll(/^## Foundation Files[ \t]*$/gm)];
  if (headings.length !== 1) {
    throw foundationError(
      `manifest ${manifestPath} Foundation Files`,
      'exactly one unfenced ## Foundation Files section',
      `${headings.length} sections`,
      'Recovery: keep exactly one unfenced ## Foundation Files heading followed only by backticked Markdown bullets.',
    );
  }

  const heading = headings[0];
  const bodyStart = heading.index + heading[0].length;
  const remainder = masked.slice(bodyStart);
  const nextHeading = remainder.match(/^#{1,2}[ \t]+.+$/m);
  const bodyEnd = nextHeading ? bodyStart + nextHeading.index : normalized.length;
  const body = normalized.slice(bodyStart, bodyEnd);
  const files = [];

  for (const line of body.split('\n')) {
    if (/^[ \t]*$/.test(line)) continue;
    const bullet = line.match(/^- `([^`]+)`[ \t]*$/);
    if (!bullet) {
      throw foundationError(
        `manifest ${manifestPath} Foundation Files`,
        'only backticked Markdown bullets such as - `docs/agentic/PRODUCT.md`',
        `malformed line ${JSON.stringify(line)}`,
        'Recovery: remove prose, fences, nested lists, and non-backticked entries from the Foundation Files section.',
      );
    }
    files.push(bullet[1]);
  }
  if (files.length === 0) {
    throw foundationError(
      `manifest ${manifestPath} Foundation Files`,
      'at least the eleven required Foundation paths',
      'an empty section',
    );
  }

  const seen = new Set();
  for (const path of files) {
    assertNormalizedRecordPath(path, `manifest Foundation Files path ${path}`);
    if (seen.has(path)) {
      throw foundationError(
        `manifest ${manifestPath} Foundation Files`,
        'unique managed paths',
        `duplicate ${path}`,
        'Recovery: remove the duplicate manifest bullet and refresh the Foundation revision.',
      );
    }
    seen.add(path);
  }
  for (const required of REQUIRED_FOUNDATION_FILES) {
    if (!seen.has(required)) {
      throw foundationError(
        `manifest ${manifestPath} Foundation Files`,
        `required path ${required}`,
        'missing',
        `Recovery: restore the - \`${required}\` manifest bullet and the corresponding regular UTF-8 file.`,
      );
    }
  }
  for (const path of files) {
    if (!REQUIRED_FOUNDATION_FILES.includes(path) && !path.startsWith('docs/agentic/')) {
      throw foundationError(
        `manifest ${manifestPath} Foundation Files path ${path}`,
        'an optional authoritative file under docs/agentic/',
        'outside the allowed optional-document directory',
        'Recovery: remove the path or move the optional authoritative document under docs/agentic/.',
      );
    }
  }
  return files;
}

function assertCompleteRevision(subject, revision) {
  if (!COMPLETE_REVISION.test(revision ?? '')) {
    throw foundationError(
      subject,
      'a complete lowercase sha256 revision',
      revision ?? 'missing',
      'Recovery: provide the exact sha256:<64 lowercase hex characters> revision shown by foundation refresh.',
    );
  }
}

function assertArtifactType(manifestPath, actual) {
  if (actual !== FOUNDATION_ARTIFACT_TYPE) {
    throw foundationError(
      `manifest ${manifestPath}`,
      `Artifact Type ${FOUNDATION_ARTIFACT_TYPE}`,
      actual || 'missing Artifact Type',
    );
  }
}

function isContained(rootPath, targetPath) {
  const pathFromRoot = relative(rootPath, targetPath);
  return (
    pathFromRoot === '' ||
    (!isAbsolute(pathFromRoot) && pathFromRoot !== '..' && !pathFromRoot.startsWith(`..${sep}`))
  );
}

async function validateCheckout(root, manifestPath) {
  if (typeof root !== 'string' || !isAbsolute(root)) {
    throw foundationError(
      'root',
      'an absolute existing checkout root',
      root ?? 'missing',
      'Recovery: pass --root as the absolute downstream checkout root.',
    );
  }
  if (typeof manifestPath !== 'string' || !isAbsolute(manifestPath)) {
    throw foundationError(
      'manifest',
      `the absolute ${MANIFEST_RELATIVE_PATH} path`,
      manifestPath ?? 'missing',
      `Recovery: pass --manifest as the absolute ${MANIFEST_RELATIVE_PATH} file inside the checkout root.`,
    );
  }

  let rootStat;
  try {
    rootStat = await lstat(root);
  } catch (error) {
    throw foundationError(
      'root',
      'an absolute existing checkout directory',
      error.code ?? error.message,
      'Recovery: restore the checkout directory or pass its exact absolute path.',
    );
  }
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw foundationError(
      'root',
      'an existing non-symbolic-link checkout directory',
      rootStat.isSymbolicLink() ? 'symbolic link' : 'non-directory',
      'Recovery: pass the physical checkout directory as --root.',
    );
  }

  const expectedManifestPath = join(root, ...MANIFEST_RELATIVE_PATH.split('/'));
  if (manifestPath !== expectedManifestPath) {
    throw foundationError(
      'manifest',
      `the exact ${MANIFEST_RELATIVE_PATH} path ${expectedManifestPath}`,
      manifestPath,
      `Recovery: pass --manifest "${expectedManifestPath}".`,
    );
  }

  const [rootRealPath, manifestStat] = await Promise.all([
    realpath(root),
    lstat(manifestPath).catch((error) => {
      throw foundationError(
        `manifest ${manifestPath}`,
        'an existing regular UTF-8 file',
        error.code ?? error.message,
        `Recovery: restore ${MANIFEST_RELATIVE_PATH} inside the checkout root.`,
      );
    }),
  ]);
  if (manifestStat.isSymbolicLink() || !manifestStat.isFile()) {
    throw foundationError(
      `manifest ${manifestPath}`,
      'a non-symbolic-link regular file',
      manifestStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
      `Recovery: replace ${MANIFEST_RELATIVE_PATH} with a regular UTF-8 file.`,
    );
  }
  const manifestRealPath = await realpath(manifestPath);
  if (!isContained(rootRealPath, manifestRealPath)) {
    throw foundationError(
      `manifest ${manifestPath}`,
      'a real path contained by the checkout root',
      `outside root at ${manifestRealPath}`,
      `Recovery: restore ${MANIFEST_RELATIVE_PATH} as a regular file inside the checkout.`,
    );
  }

  return { rootRealPath };
}

async function readManagedRecords(root, rootRealPath, files) {
  const records = [];
  for (const path of files) {
    const filePath = resolve(root, ...path.split('/'));
    let fileStat;
    try {
      fileStat = await lstat(filePath);
    } catch (error) {
      throw foundationError(
        `managed path ${path}`,
        'an existing regular file',
        error.code ?? error.message,
        `Recovery: restore ${path} as a regular UTF-8 file or remove it if it is a non-core optional manifest entry.`,
      );
    }
    if (fileStat.isSymbolicLink() || !fileStat.isFile()) {
      throw foundationError(
        `managed path ${path}`,
        'a non-symbolic-link regular file',
        fileStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
        `Recovery: replace ${path} with a regular UTF-8 file inside the checkout.`,
      );
    }

    const fileRealPath = await realpath(filePath);
    if (!isContained(rootRealPath, fileRealPath)) {
      throw foundationError(
        `managed path ${path}`,
        'a real path contained by the checkout root',
        `outside root at ${fileRealPath}`,
        `Recovery: remove the junction or symlink escape and restore ${path} inside the checkout.`,
      );
    }

    let content;
    try {
      content = await readFile(filePath);
      decodeStrictUtf8(content, `managed path ${path}`);
    } catch (error) {
      if (error.message?.startsWith('Agentic Foundation')) throw error;
      throw foundationError(
        `managed path ${path}`,
        'a readable UTF-8 regular file',
        error.code ?? error.message,
        `Recovery: restore read access to ${path} and retry.`,
      );
    }
    records.push({ path, content });
  }
  return records;
}

async function loadFoundation({ root, manifestPath }) {
  const { rootRealPath } = await validateCheckout(root, manifestPath);
  let manifestBytes;
  try {
    manifestBytes = await readFile(manifestPath);
  } catch (error) {
    throw foundationError(
      `manifest ${manifestPath}`,
      'a readable UTF-8 file',
      error.code ?? error.message,
      `Recovery: restore read access to ${MANIFEST_RELATIVE_PATH} and retry.`,
    );
  }
  const normalizedManifest = `${decodeStrictUtf8(manifestBytes, `manifest ${manifestPath}`).replace(/\n+$/g, '')}\n`;
  const current = parseLifecycleMetadata(manifestPath, normalizedManifest);
  const files = parseFoundationFiles(manifestPath, normalizedManifest);
  const records = await readManagedRecords(root, rootRealPath, files);
  const revision = computeFoundationRevision(records);
  return { current, files, normalizedManifest, records, revision, rootRealPath };
}

function foundationResult({ root, manifestPath, files }, metadata) {
  return {
    root,
    manifestPath,
    files: [...files],
    ...metadata,
  };
}

async function writeFoundationMetadata(context, metadata) {
  await writeFile(
    context.manifestPath,
    replaceLifecycleMetadata(context.normalizedManifest, metadata),
    'utf8',
  );
  return foundationResult(context, metadata);
}

export async function draftFoundation({ root, manifestPath }) {
  assertSupportedNode();
  const loaded = await loadFoundation({ root, manifestPath });
  return writeFoundationMetadata(
    { root, manifestPath, ...loaded },
    {
      artifactType: FOUNDATION_ARTIFACT_TYPE,
      status: 'Draft',
      revision: loaded.revision,
      approvedRevision: 'none',
      approvedAt: 'none',
    },
  );
}

export async function refreshFoundationRevision({ root, manifestPath }) {
  assertSupportedNode();
  const loaded = await loadFoundation({ root, manifestPath });
  assertArtifactType(manifestPath, loaded.current.artifactType);
  if (!['Draft', 'Approved'].includes(loaded.current.status)) {
    throw foundationError(
      `manifest ${manifestPath}`,
      'Status Draft or Approved',
      loaded.current.status || 'missing Status',
    );
  }

  const approvalStillValid =
    loaded.current.status === 'Approved' &&
    loaded.current.revision === loaded.revision &&
    loaded.current.approvedRevision === loaded.revision &&
    loaded.current.approvedAt !== 'none' &&
    isIso8601Timestamp(loaded.current.approvedAt);
  return writeFoundationMetadata(
    { root, manifestPath, ...loaded },
    {
      artifactType: FOUNDATION_ARTIFACT_TYPE,
      status: approvalStillValid ? 'Approved' : 'Draft',
      revision: loaded.revision,
      approvedRevision: approvalStillValid ? loaded.revision : 'none',
      approvedAt: approvalStillValid ? loaded.current.approvedAt : 'none',
    },
  );
}

export async function approveFoundation({
  root,
  manifestPath,
  expectedRevision,
  approvedAt = new Date().toISOString(),
}) {
  assertSupportedNode();
  assertCompleteRevision(`manifest ${manifestPath}`, expectedRevision);
  const loaded = await loadFoundation({ root, manifestPath });
  assertArtifactType(manifestPath, loaded.current.artifactType);
  if (loaded.current.status !== 'Draft') {
    throw foundationError(
      `manifest ${manifestPath}`,
      'Status Draft before approval',
      loaded.current.status || 'missing Status',
    );
  }
  if (loaded.current.revision !== expectedRevision) {
    throw foundationError(
      `manifest ${manifestPath}`,
      `reviewed Revision ${expectedRevision}`,
      loaded.current.revision || 'missing Revision',
    );
  }
  if (loaded.revision !== expectedRevision) {
    throw foundationError(
      `manifest ${manifestPath}`,
      `reviewed bundle revision ${expectedRevision}`,
      loaded.revision,
    );
  }
  if (!isIso8601Timestamp(approvedAt)) {
    throw foundationError(
      `manifest ${manifestPath}`,
      'Approved At as an ISO-8601 timestamp',
      approvedAt,
      'Recovery: supply a valid ISO-8601 approval timestamp.',
    );
  }

  return writeFoundationMetadata(
    { root, manifestPath, ...loaded },
    {
      artifactType: FOUNDATION_ARTIFACT_TYPE,
      status: 'Approved',
      revision: loaded.revision,
      approvedRevision: loaded.revision,
      approvedAt,
    },
  );
}

export async function validateApprovedFoundation({ root, manifestPath, expectedRevision }) {
  assertSupportedNode();
  assertCompleteRevision(`manifest ${manifestPath}`, expectedRevision);
  const loaded = await loadFoundation({ root, manifestPath });
  assertArtifactType(manifestPath, loaded.current.artifactType);
  if (loaded.current.status !== 'Approved') {
    throw foundationError(
      `manifest ${manifestPath}`,
      'Status Approved',
      loaded.current.status || 'missing Status',
    );
  }
  if (loaded.current.approvedRevision !== expectedRevision) {
    throw foundationError(
      `manifest ${manifestPath}`,
      `Approved Revision ${expectedRevision}`,
      loaded.current.approvedRevision || 'missing Approved Revision',
    );
  }
  if (loaded.current.revision !== loaded.current.approvedRevision) {
    throw foundationError(
      `manifest ${manifestPath}`,
      `Revision ${loaded.current.approvedRevision}`,
      loaded.current.revision || 'missing Revision',
    );
  }
  if (!isIso8601Timestamp(loaded.current.approvedAt)) {
    throw foundationError(
      `manifest ${manifestPath}`,
      'Approved At as an ISO-8601 timestamp',
      loaded.current.approvedAt || 'missing Approved At',
    );
  }
  if (loaded.revision !== loaded.current.approvedRevision) {
    throw foundationError(
      `manifest ${manifestPath}`,
      `approved bundle revision ${loaded.current.approvedRevision}`,
      loaded.revision,
    );
  }

  return foundationResult(
    { root, manifestPath, files: loaded.files },
    loaded.current,
  );
}

function portableRelativePath(root, targetPath, subject) {
  if (typeof targetPath !== 'string' || !isAbsolute(targetPath)) {
    throw foundationError(
      subject,
      'an absolute path inside the checkout root',
      targetPath ?? 'missing',
      'Recovery: pass the exact absolute path from the current checkout.',
    );
  }
  const relativePath = relative(root, targetPath);
  if (
    relativePath === '' ||
    isAbsolute(relativePath) ||
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`)
  ) {
    throw foundationError(
      subject,
      'an absolute path to a file inside the checkout root',
      targetPath,
      'Recovery: use the exact file path inside the current checkout.',
    );
  }
  const portable = relativePath.split(sep).join('/');
  assertNormalizedRecordPath(portable, subject);
  return portable;
}

async function validateCandidateLocation({
  root,
  manifestPath,
  candidateRoot,
  specPath,
}) {
  const { rootRealPath } = await validateCheckout(root, manifestPath);
  const designSpecPath = portableRelativePath(root, specPath, 'Design Spec path');
  const specPrefix = `${DESIGN_SPEC_PARENT_RELATIVE_PATH}/`;
  if (!designSpecPath.startsWith(specPrefix) || extname(designSpecPath) !== '.md') {
    throw foundationError(
      'Design Spec path',
      `a Markdown file under ${DESIGN_SPEC_PARENT_RELATIVE_PATH}/`,
      designSpecPath,
      `Recovery: keep the Draft Design Spec under ${DESIGN_SPEC_PARENT_RELATIVE_PATH}/ and retry.`,
    );
  }
  let specStat;
  try {
    specStat = await lstat(specPath);
  } catch (error) {
    throw foundationError(
      'Design Spec path',
      'an existing non-symbolic-link regular UTF-8 file',
      error.code ?? error.message,
      'Recovery: restore the Draft Design Spec inside the checkout and retry.',
    );
  }
  if (specStat.isSymbolicLink() || !specStat.isFile()) {
    throw foundationError(
      'Design Spec path',
      'a non-symbolic-link regular UTF-8 file',
      specStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
      'Recovery: replace the Draft Design Spec with a regular file inside the checkout.',
    );
  }
  const specRealPath = await realpath(specPath);
  if (!isContained(rootRealPath, specRealPath)) {
    throw foundationError(
      'Design Spec path',
      'a real path contained by the checkout root',
      `outside root at ${specRealPath}`,
      'Recovery: remove the filesystem escape and restore the Draft Design Spec inside the checkout.',
    );
  }

  const expectedCandidateRoot = join(
    root,
    ...CANDIDATE_PARENT_RELATIVE_PATH.split('/'),
    basename(designSpecPath, '.md'),
  );
  if (typeof candidateRoot !== 'string' || !isAbsolute(candidateRoot)) {
    throw foundationError(
      'candidate root',
      `the absolute ${expectedCandidateRoot} directory`,
      candidateRoot ?? 'missing',
      `Recovery: pass --candidate-root "${expectedCandidateRoot}".`,
    );
  }
  if (candidateRoot !== expectedCandidateRoot) {
    throw foundationError(
      'candidate root',
      `the exact ignored Design Spec candidate directory ${expectedCandidateRoot}`,
      candidateRoot,
      `Recovery: move the candidate to ${expectedCandidateRoot} and retry.`,
    );
  }

  let candidateStat;
  try {
    candidateStat = await lstat(candidateRoot);
  } catch (error) {
    throw foundationError(
      'candidate root',
      'an existing non-symbolic-link directory',
      error.code ?? error.message,
      `Recovery: create ${expectedCandidateRoot} as a regular directory and restore its candidate.json and files/ content.`,
    );
  }
  if (candidateStat.isSymbolicLink() || !candidateStat.isDirectory()) {
    throw foundationError(
      'candidate root',
      'an existing non-symbolic-link directory',
      candidateStat.isSymbolicLink() ? 'symbolic link' : 'non-directory',
      `Recovery: replace ${candidateRoot} with a physical directory inside the checkout.`,
    );
  }
  const candidateRealPath = await realpath(candidateRoot);
  if (!isContained(rootRealPath, candidateRealPath)) {
    throw foundationError(
      'candidate root',
      'a real path contained by the checkout root',
      `outside root at ${candidateRealPath}`,
      'Recovery: remove the junction or symlink escape and restore the candidate inside the checkout.',
    );
  }

  return { candidateRealPath, designSpecPath, rootRealPath };
}

async function pathState(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function validatePhysicalTargetPath(root, targetPath, subject) {
  if (
    typeof root !== 'string' ||
    !isAbsolute(root) ||
    typeof targetPath !== 'string' ||
    !isAbsolute(targetPath) ||
    !isContained(root, targetPath) ||
    targetPath === root
  ) {
    throw foundationError(
      subject,
      `an absolute target contained by ${root}`,
      targetPath ?? 'missing',
      'Recovery: restore the exact operation target inside its physical root and retry.',
    );
  }
  const rootStat = await pathState(root);
  if (!rootStat || rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw foundationError(
      subject,
      'a physical non-symbolic-link root directory',
      !rootStat
        ? 'missing root'
        : rootStat.isSymbolicLink()
          ? 'symbolic-link root'
          : 'non-directory root',
      'Recovery: restore the operation root as a physical directory and retry.',
    );
  }
  const rootRealPath = await realpath(root);
  const relativeTarget = relative(root, targetPath);
  const ancestorParts = relativeTarget.split(sep).slice(0, -1);
  let ancestorPath = root;
  for (const part of ancestorParts) {
    ancestorPath = join(ancestorPath, part);
    const ancestorStat = await pathState(ancestorPath);
    if (!ancestorStat) break;
    if (ancestorStat.isSymbolicLink() || !ancestorStat.isDirectory()) {
      throw foundationError(
        subject,
        'an existing physical directory ancestor chain',
        `${ancestorStat.isSymbolicLink() ? 'symbolic link or junction' : 'non-directory'} at ${ancestorPath}`,
        'Recovery: remove the escaping ancestor and restore physical directories inside the exact root.',
      );
    }
    const ancestorRealPath = await realpath(ancestorPath);
    if (!isContained(rootRealPath, ancestorRealPath)) {
      throw foundationError(
        subject,
        'an existing ancestor chain physically contained by the exact root',
        `outside root at ${ancestorRealPath}`,
        'Recovery: remove the junction escape and restore physical directories inside the exact root.',
      );
    }
  }
  return rootRealPath;
}

async function validateRegularTargetIfPresent(targetPath, subject) {
  const targetStat = await pathState(targetPath);
  if (targetStat && (targetStat.isSymbolicLink() || !targetStat.isFile())) {
    throw foundationError(
      subject,
      'a missing path or non-symbolic-link regular file',
      targetStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
      'Recovery: restore the exact target as a physical regular file or remove the unsafe entry.',
    );
  }
  return targetStat;
}

async function rejectAppliedCandidate(candidateRoot) {
  const appliedPath = join(candidateRoot, APPLIED_FILE);
  if (await pathState(appliedPath)) {
    throw foundationError(
      'candidate state',
      `no ${APPLIED_FILE} marker before preview or apply`,
      `already applied at ${appliedPath}`,
      'Recovery: do not reuse an applied candidate; create a new Draft Design Spec revision and candidate root.',
    );
  }
}

async function rejectTransaction(candidateRoot) {
  const transactionRoot = join(candidateRoot, TRANSACTION_DIRECTORY);
  if (await pathState(transactionRoot)) {
    throw foundationError(
      'candidate transaction',
      'no incomplete transaction during preview',
      `transaction state exists at ${transactionRoot}`,
      'Recovery: run foundation apply with the exact reviewed bindings so it can recover the interrupted transaction.',
    );
  }
}

function assertExactKeys(value, expectedKeys, subject) {
  const actualKeys =
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.keys(value).sort()
      : [];
  const expected = [...expectedKeys].sort();
  if (
    actualKeys.length !== expected.length ||
    actualKeys.some((key, index) => key !== expected[index])
  ) {
    throw foundationError(
      subject,
      `exact keys ${expected.join(', ')}`,
      value && typeof value === 'object' && !Array.isArray(value)
        ? `keys ${actualKeys.join(', ') || '(none)'}`
        : value === null
          ? 'null'
          : typeof value,
      'Recovery: rewrite the record to match the documented Foundation Candidate schema exactly.',
    );
  }
}

async function readStrictJsonFile(path, subject, containedBy) {
  let fileStat;
  try {
    fileStat = await lstat(path);
  } catch (error) {
    throw foundationError(
      subject,
      'an existing regular UTF-8 JSON file',
      error.code ?? error.message,
      `Recovery: restore ${path} as a regular UTF-8 JSON file.`,
    );
  }
  if (fileStat.isSymbolicLink() || !fileStat.isFile()) {
    throw foundationError(
      subject,
      'a non-symbolic-link regular UTF-8 JSON file',
      fileStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
      `Recovery: replace ${path} with a regular UTF-8 JSON file.`,
    );
  }
  const fileRealPath = await realpath(path);
  if (!isContained(containedBy, fileRealPath)) {
    throw foundationError(
      subject,
      'a real file contained by its operation directory',
      `outside at ${fileRealPath}`,
      `Recovery: restore ${path} inside its operation directory.`,
    );
  }

  let normalized;
  try {
    normalized = decodeStrictUtf8(await readFile(path), subject);
  } catch (error) {
    if (error.message?.startsWith('Agentic Foundation')) throw error;
    throw foundationError(
      subject,
      'readable UTF-8 JSON',
      error.code ?? error.message,
      `Recovery: restore read access to ${path} and retry.`,
    );
  }
  try {
    return JSON.parse(normalized);
  } catch (error) {
    throw foundationError(
      subject,
      'valid JSON',
      error.message,
      `Recovery: repair the JSON syntax in ${path} and retry.`,
    );
  }
}

function validateCandidateRecord(
  record,
  {
    designSpecPath,
    expectedBaseRevision,
    expectedSpecRevision,
  },
) {
  assertExactKeys(
    record,
    [
      'schema',
      'manifestPath',
      'baseRevision',
      'designSpecPath',
      'designSpecRevision',
      'changes',
    ],
    'candidate.json',
  );
  if (record.schema !== CANDIDATE_SCHEMA) {
    throw foundationError(
      'candidate schema',
      CANDIDATE_SCHEMA,
      record.schema ?? 'missing',
      'Recovery: regenerate candidate.json with the documented V1 schema.',
    );
  }
  const bindings = [
    ['manifest path binding', MANIFEST_RELATIVE_PATH, record.manifestPath],
    ['base revision binding', expectedBaseRevision, record.baseRevision],
    ['Design Spec path binding', designSpecPath, record.designSpecPath],
    ['Design Spec revision binding', expectedSpecRevision, record.designSpecRevision],
  ];
  for (const [subject, expected, actual] of bindings) {
    if (actual !== expected) {
      throw foundationError(
        `candidate ${subject}`,
        expected,
        actual ?? 'missing',
        'Recovery: regenerate the candidate from the exact Approved base and exact Draft Design Spec.',
      );
    }
  }
  assertCompleteRevision('candidate base revision', record.baseRevision);
  assertCompleteRevision('candidate Design Spec revision', record.designSpecRevision);
  if (!Array.isArray(record.changes)) {
    throw foundationError(
      'candidate changes',
      'an array of exact path/action records',
      typeof record.changes,
      'Recovery: declare every candidate action once in the changes array.',
    );
  }

  const seen = new Set();
  return record.changes.map((change, index) => {
    assertExactKeys(change, ['path', 'action'], `candidate change ${index}`);
    assertNormalizedRecordPath(change.path, `candidate change ${index} path`);
    if (seen.has(change.path)) {
      throw foundationError(
        `candidate change ${index} path`,
        'a unique declared path',
        `duplicate ${change.path}`,
        'Recovery: declare each Foundation path exactly once.',
      );
    }
    seen.add(change.path);
    if (!['upsert', 'delete'].includes(change.action)) {
      throw foundationError(
        `candidate change ${change.path}`,
        'action upsert or delete',
        change.action ?? 'missing',
        'Recovery: use upsert for a complete candidate file or delete for an existing optional file.',
      );
    }
    return { path: change.path, action: change.action };
  });
}

async function scanCandidateDirectory(directory, prefix, candidateRealPath, files) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const entryStat = await lstat(absolutePath);
    if (entryStat.isSymbolicLink()) {
      throw foundationError(
        `candidate file ${relativePath}`,
        'a non-symbolic-link regular UTF-8 file',
        'symbolic link',
        'Recovery: replace candidate links with complete regular files inside files/.',
      );
    }
    const entryRealPath = await realpath(absolutePath);
    if (!isContained(candidateRealPath, entryRealPath)) {
      throw foundationError(
        `candidate file ${relativePath}`,
        'a real path contained by the candidate root',
        `outside at ${entryRealPath}`,
        'Recovery: remove the filesystem escape and restore the candidate inside files/.',
      );
    }
    if (entryStat.isDirectory()) {
      await scanCandidateDirectory(absolutePath, relativePath, candidateRealPath, files);
      continue;
    }
    if (!entryStat.isFile()) {
      throw foundationError(
        `candidate file ${relativePath}`,
        'a regular UTF-8 file',
        'non-regular file',
        'Recovery: replace the candidate entry with a complete regular UTF-8 file.',
      );
    }
    assertNormalizedRecordPath(relativePath, `candidate file ${relativePath}`);
    const content = await readFile(absolutePath);
    decodeStrictUtf8(content, `candidate file ${relativePath}`);
    files.set(relativePath, { content, mode: entryStat.mode });
  }
}

async function readCandidateFiles(candidateRoot, candidateRealPath) {
  const filesRoot = join(candidateRoot, 'files');
  let filesStat;
  try {
    filesStat = await lstat(filesRoot);
  } catch (error) {
    throw foundationError(
      'candidate files directory',
      'an existing non-symbolic-link directory',
      error.code ?? error.message,
      `Recovery: create ${filesRoot}; leave it empty only when changes is empty.`,
    );
  }
  if (filesStat.isSymbolicLink() || !filesStat.isDirectory()) {
    throw foundationError(
      'candidate files directory',
      'a non-symbolic-link directory',
      filesStat.isSymbolicLink() ? 'symbolic link' : 'non-directory',
      `Recovery: replace ${filesRoot} with a physical directory.`,
    );
  }
  const filesRealPath = await realpath(filesRoot);
  if (!isContained(candidateRealPath, filesRealPath)) {
    throw foundationError(
      'candidate files directory',
      'a real path contained by the candidate root',
      `outside at ${filesRealPath}`,
      'Recovery: remove the filesystem escape and restore files/ inside the candidate root.',
    );
  }

  const files = new Map();
  await scanCandidateDirectory(filesRoot, '', candidateRealPath, files);
  return files;
}

function sortChangedFiles(changes) {
  return [...changes].sort((left, right) =>
    Buffer.compare(Buffer.from(left.path, 'utf8'), Buffer.from(right.path, 'utf8')));
}

function assertCandidateFileEquality(changes, candidateFiles) {
  const expected = new Set(
    changes.filter(({ action }) => action === 'upsert').map(({ path }) => path),
  );
  for (const path of expected) {
    if (!candidateFiles.has(path)) {
      throw foundationError(
        'candidate files',
        `complete upsert file ${path}`,
        'missing',
        `Recovery: write the complete candidate to files/${path}.`,
      );
    }
  }
  for (const path of candidateFiles.keys()) {
    if (!expected.has(path)) {
      throw foundationError(
        'candidate files',
        'exact equality with the declared upsert set',
        `extra or undeclared ${path}`,
        `Recovery: remove files/${path} or declare one matching upsert action.`,
      );
    }
  }
}

function materializeProspectiveFoundation(baseLoaded, changes, candidateFiles, manifestPath) {
  const baseFiles = new Map(
    baseLoaded.records.map(({ path, content }) => [path, Buffer.from(content)]),
  );
  const prospectiveFiles = new Map(baseFiles);

  for (const change of changes) {
    if (change.action === 'delete') {
      if (!prospectiveFiles.has(change.path)) {
        throw foundationError(
          `candidate change ${change.path}`,
          'an existing optional Foundation file to delete',
          'declared delete is a no-op',
          'Recovery: remove the no-op action or regenerate it from the exact Approved base.',
        );
      }
      prospectiveFiles.delete(change.path);
      continue;
    }

    const candidate = candidateFiles.get(change.path).content;
    const existing = prospectiveFiles.get(change.path);
    if (
      existing &&
      normalizeRecordContent(change.path, existing) ===
        normalizeRecordContent(change.path, candidate)
    ) {
      throw foundationError(
        `candidate change ${change.path}`,
        'a content-changing upsert',
        'declared upsert is a no-op',
        'Recovery: remove the no-op action or write the reviewed complete candidate content.',
      );
    }
    prospectiveFiles.set(change.path, candidate);
  }

  const prospectiveManifest = prospectiveFiles.get(MANIFEST_RELATIVE_PATH);
  if (!prospectiveManifest) {
    throw foundationError(
      'prospective Foundation',
      `required core file ${MANIFEST_RELATIVE_PATH}`,
      'deleted',
      `Recovery: retain ${MANIFEST_RELATIVE_PATH} in every Foundation candidate.`,
    );
  }
  const normalizedManifest =
    `${decodeStrictUtf8(prospectiveManifest, 'prospective manifest').replace(/\n+$/g, '')}\n`;
  const lifecycle = parseLifecycleMetadata(manifestPath, normalizedManifest);
  assertArtifactType(manifestPath, lifecycle.artifactType);
  const manifestFiles = parseFoundationFiles(manifestPath, normalizedManifest);
  const declaredSet = new Set(manifestFiles);
  const prospectiveSet = new Set(prospectiveFiles.keys());
  const missing = [...declaredSet].filter((path) => !prospectiveSet.has(path));
  const undeclared = [...prospectiveSet].filter((path) => !declaredSet.has(path));
  if (missing.length > 0 || undeclared.length > 0) {
    throw foundationError(
      'prospective Foundation file set',
      'exact equality between the prospective manifest and prospective files',
      [
        missing.length > 0 ? `missing ${missing.join(', ')}` : '',
        undeclared.length > 0 ? `undeclared ${undeclared.join(', ')}` : '',
      ].filter(Boolean).join('; '),
      'Recovery: update the complete WAYFINDING.md candidate and declared actions together.',
    );
  }

  const records = [...prospectiveFiles].map(([path, content]) => ({ path, content }));
  return {
    baseFiles,
    prospectiveFiles,
    prospectiveRevision: computeFoundationRevision(records),
    normalizedManifest,
  };
}

function normalizeDiffContent(content, subject) {
  return `${decodeStrictUtf8(content, subject).replace(/\n+$/g, '')}\n`;
}

async function renderGitDiff({
  candidateRoot,
  path,
  before,
  after,
}) {
  const temporaryRoot = await mkdtemp(join(candidateRoot, '.foundation-diff-'));
  const beforePath = `before/${path}`;
  const afterPath = `after/${path}`;
  try {
    const absoluteBefore = join(temporaryRoot, ...beforePath.split('/'));
    const absoluteAfter = join(temporaryRoot, ...afterPath.split('/'));
    await mkdir(dirname(absoluteBefore), { recursive: true });
    await mkdir(dirname(absoluteAfter), { recursive: true });
    await writeFile(
      absoluteBefore,
      before === undefined ? '' : normalizeDiffContent(before, `diff base ${path}`),
      'utf8',
    );
    await writeFile(
      absoluteAfter,
      after === undefined ? '' : normalizeDiffContent(after, `diff candidate ${path}`),
      'utf8',
    );

    let output = '';
    try {
      const result = await execFile(
        'git',
        [
          'diff',
          '--no-index',
          '--text',
          '--no-color',
          '--no-ext-diff',
          '--no-renames',
          '--',
          beforePath,
          afterPath,
        ],
        {
          cwd: temporaryRoot,
          encoding: 'utf8',
          maxBuffer: 16 * 1024 * 1024,
          windowsHide: true,
        },
      );
      output = result.stdout;
    } catch (error) {
      if (Number(error.code) !== 1) {
        throw foundationError(
          `candidate diff ${path}`,
          'git diff --no-index exit 0 or 1',
          `exit ${error.code ?? 'unknown'}: ${error.stderr || error.message}`,
          'Recovery: restore Git and readable candidate files, then rerun foundation preview.',
        );
      }
      output = error.stdout ?? '';
    }

    const normalized = output.replace(/\r\n?/g, '\n');
    const lines = normalized.split('\n');
    const diffIndex = lines.findIndex((line) => line.startsWith('diff --git '));
    if (diffIndex >= 0) lines[diffIndex] = `diff --git a/${path} b/${path}`;
    const beforeIndex = lines.findIndex((line) => line.startsWith('--- '));
    if (beforeIndex >= 0) {
      lines[beforeIndex] = before === undefined ? '--- /dev/null' : `--- a/${path}`;
    }
    const afterIndex = lines.findIndex((line) => line.startsWith('+++ '));
    if (afterIndex >= 0) {
      lines[afterIndex] = after === undefined ? '+++ /dev/null' : `+++ b/${path}`;
    }
    return `${lines.join('\n').replace(/\n+$/g, '')}\n`;
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function writeDesignChangeSet({
  candidateRoot,
  specPath,
  specRevision,
  manifestPath,
  baseRevision,
  prospectiveRevision,
  changedFiles,
  baseFiles,
  prospectiveFiles,
}) {
  const sections = [
    '# Design Change Set',
    '',
    `- **Design Spec:** \`${specPath}\``,
    `- **Design Spec Revision:** \`${specRevision}\``,
    `- **Foundation Manifest:** \`${manifestPath}\``,
    `- **Approved Base Foundation Revision:** \`${baseRevision}\``,
    `- **Prospective Foundation Revision:** \`${prospectiveRevision}\``,
    '',
    '## Changed Files',
    '',
  ];
  if (changedFiles.length === 0) {
    sections.push(
      'No durable Foundation file changes. Applying this Design Change Set approves the exact Design Spec and preserves the current Approved Foundation revision.',
      '',
    );
  } else {
    sections.push('| Path | Action |', '| --- | --- |');
    for (const change of changedFiles) {
      sections.push(`| \`${change.path}\` | ${change.action} |`);
    }
    sections.push('', '## Normalized Diffs', '');
    for (const change of changedFiles) {
      const before = baseFiles.get(change.path);
      const after = prospectiveFiles.get(change.path);
      const diff = await renderGitDiff({
        candidateRoot,
        path: change.path,
        before,
        after,
      });
      sections.push(`### \`${change.path}\``, '', '```diff', diff.replace(/\n$/g, ''), '```', '');
    }
  }
  const reviewPath = join(candidateRoot, REVIEW_FILE);
  await validatePhysicalTargetPath(
    candidateRoot,
    reviewPath,
    'Design Change Set report target',
  );
  const reviewStat = await pathState(reviewPath);
  if (reviewStat && !reviewStat.isFile() && !reviewStat.isSymbolicLink()) {
    throw foundationError(
      'Design Change Set report target',
      'a missing path, regular file, or safely replaceable symbolic link',
      'non-regular filesystem entry',
      `Recovery: remove the unsafe ${reviewPath} entry and rerun foundation preview.`,
    );
  }
  if (reviewStat?.isSymbolicLink()) {
    throw foundationError(
      'Design Change Set report target',
      'a missing path or non-symbolic-link regular file',
      'symbolic link',
      `Recovery: remove the symbolic ${reviewPath} entry and rerun foundation preview.`,
    );
  }
  const stagedReviewPath = await stageSiblingFile(
    reviewPath,
    `${sections.join('\n').replace(/\n+$/g, '')}\n`,
    reviewStat?.mode ?? 0o600,
    candidateRoot,
  );
  try {
    await validatePhysicalTargetPath(
      candidateRoot,
      reviewPath,
      'Design Change Set report replacement',
    );
    await realReplacePath({
      targetPath: reviewPath,
      stagedPath: stagedReviewPath,
      action: 'upsert',
    });
  } finally {
    await validatePhysicalTargetPath(
      candidateRoot,
      stagedReviewPath,
      'Design Change Set staged cleanup',
    );
    await rm(stagedReviewPath, { force: true });
  }
  return reviewPath;
}

async function readBoundCandidateOperation(
  {
    root,
    manifestPath,
    candidateRoot,
    specPath,
    expectedSpecRevision,
    expectedBaseRevision,
  },
  location,
) {
  const candidate = await readStrictJsonFile(
    join(candidateRoot, 'candidate.json'),
    'candidate.json',
    location.candidateRealPath,
  );
  const changes = validateCandidateRecord(candidate, {
    designSpecPath: location.designSpecPath,
    expectedBaseRevision,
    expectedSpecRevision,
  });
  const candidateFiles = await readCandidateFiles(
    candidateRoot,
    location.candidateRealPath,
  );
  assertCandidateFileEquality(changes, candidateFiles);
  const changedFiles = sortChangedFiles(changes);
  const targetPaths = [
    specPath,
    ...changedFiles.map(({ path }) => join(root, ...path.split('/'))),
    manifestPath,
  ];
  return {
    changes,
    candidateFiles,
    changedFiles,
    targetPaths: [...new Set(targetPaths)],
  };
}

async function prepareFoundationChangeSet({
  root,
  manifestPath,
  candidateRoot,
  specPath,
  expectedSpecRevision,
  expectedBaseRevision,
}) {
  assertSupportedNode();
  assertCompleteRevision('candidate expected Design Spec revision', expectedSpecRevision);
  assertCompleteRevision('candidate expected base revision', expectedBaseRevision);
  const location = await validateCandidateLocation({
    root,
    manifestPath,
    candidateRoot,
    specPath,
  });
  await rejectAppliedCandidate(candidateRoot);
  await rejectTransaction(candidateRoot);

  await validateApprovedFoundation({
    root,
    manifestPath,
    expectedRevision: expectedBaseRevision,
  });
  await validateDraftArtifact({
    path: specPath,
    artifactType: 'Design Spec',
    expectedRevision: expectedSpecRevision,
  });
  const baseLoaded = await loadFoundation({ root, manifestPath });
  const {
    changes,
    candidateFiles,
    changedFiles,
  } = await readBoundCandidateOperation(
    {
      root,
      manifestPath,
      candidateRoot,
      specPath,
      expectedSpecRevision,
      expectedBaseRevision,
    },
    location,
  );
  const prospective = materializeProspectiveFoundation(
    baseLoaded,
    changes,
    candidateFiles,
    manifestPath,
  );
  const reviewPath = await writeDesignChangeSet({
    candidateRoot,
    specPath,
    specRevision: expectedSpecRevision,
    manifestPath,
    baseRevision: expectedBaseRevision,
    prospectiveRevision: prospective.prospectiveRevision,
    changedFiles,
    baseFiles: prospective.baseFiles,
    prospectiveFiles: prospective.prospectiveFiles,
  });

  return {
    root,
    manifestPath,
    candidateRoot,
    specPath,
    designSpecPath: location.designSpecPath,
    expectedSpecRevision,
    expectedBaseRevision,
    baseLoaded,
    candidateFiles,
    changedFiles,
    reviewPath,
    ...prospective,
  };
}

function publicChangeSetResult(context) {
  return {
    specPath: context.specPath,
    specRevision: context.expectedSpecRevision,
    manifestPath: context.manifestPath,
    baseRevision: context.expectedBaseRevision,
    prospectiveRevision: context.prospectiveRevision,
    candidateRoot: context.candidateRoot,
    reviewPath: context.reviewPath,
    changedFiles: context.changedFiles,
  };
}

export async function previewFoundationChangeSet({
  root,
  manifestPath,
  candidateRoot,
  specPath,
  expectedSpecRevision,
  expectedBaseRevision,
}) {
  return publicChangeSetResult(await prepareFoundationChangeSet({
    root,
    manifestPath,
    candidateRoot,
    specPath,
    expectedSpecRevision,
    expectedBaseRevision,
  }));
}

let temporaryFileSequence = 0;

async function stageSiblingFile(targetPath, content, mode, physicalRoot) {
  await validatePhysicalTargetPath(
    physicalRoot,
    targetPath,
    `staging target ${targetPath}`,
  );
  await mkdir(dirname(targetPath), { recursive: true });
  await validatePhysicalTargetPath(
    physicalRoot,
    targetPath,
    `staging target ${targetPath}`,
  );
  for (let attempt = 0; attempt < 20; attempt += 1) {
    temporaryFileSequence += 1;
    const stagedPath = join(
      dirname(targetPath),
      `.${basename(targetPath)}.spa-foundation-${process.pid}-${temporaryFileSequence}.tmp`,
    );
    try {
      await writeFile(stagedPath, content, {
        flag: 'wx',
        mode: (mode ?? 0o644) & 0o777,
      });
      return stagedPath;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  throw foundationError(
    `staging ${targetPath}`,
    'an available sibling temporary filename',
    'twenty collisions',
    'Recovery: remove stale .spa-foundation-*.tmp files from the destination directory and retry.',
  );
}

async function realReplacePath({ targetPath, stagedPath, action }) {
  if (action === 'delete') {
    await rm(targetPath);
    return;
  }
  await rename(stagedPath, targetPath);
}

async function writeTransactionJournal(transactionRoot, journal) {
  const journalPath = join(transactionRoot, 'journal.json');
  const journalStat = await pathState(journalPath);
  const stagedPath = await stageSiblingFile(
    journalPath,
    `${JSON.stringify(journal, null, 2)}\n`,
    journalStat?.mode ?? 0o600,
    transactionRoot,
  );
  try {
    await realReplacePath({
      targetPath: journalPath,
      stagedPath,
      action: 'upsert',
    });
  } finally {
    await validatePhysicalTargetPath(
      transactionRoot,
      stagedPath,
      'candidate transaction journal staged cleanup',
    );
    await rm(stagedPath, { force: true });
  }
}

async function removeEmptyParents(path, stopAt) {
  let current = path;
  while (current !== stopAt && isContained(stopAt, current)) {
    try {
      await rmdir(current);
    } catch (error) {
      if (['ENOENT', 'ENOTEMPTY', 'EEXIST', 'EPERM'].includes(error.code)) return;
      throw error;
    }
    current = dirname(current);
  }
}

function validateTransactionJournal(
  journal,
  args,
  transactionRoot,
  expectedTargetPaths,
) {
  assertExactKeys(
    journal,
    [
      'schema',
      'root',
      'manifestPath',
      'specPath',
      'candidateRoot',
      'expectedBaseRevision',
      'expectedSpecRevision',
      'expectedResultRevision',
      'state',
      'entries',
      'stagedPaths',
    ],
    'candidate transaction journal',
  );
  if (journal.schema !== TRANSACTION_SCHEMA) {
    throw foundationError(
      'candidate transaction schema',
      TRANSACTION_SCHEMA,
      journal.schema ?? 'missing',
      'Recovery: do not edit transaction state; restore the matching operation core or recover from exact backups.',
    );
  }
  const bindings = [
    ['root', args.root, journal.root],
    ['manifest', args.manifestPath, journal.manifestPath],
    ['Design Spec', args.specPath, journal.specPath],
    ['candidate root', args.candidateRoot, journal.candidateRoot],
    ['base revision', args.expectedBaseRevision, journal.expectedBaseRevision],
    ['Design Spec revision', args.expectedSpecRevision, journal.expectedSpecRevision],
    ['result revision', args.expectedResultRevision, journal.expectedResultRevision],
  ];
  for (const [subject, expected, actual] of bindings) {
    if (actual !== expected) {
      throw foundationError(
        `candidate transaction ${subject} binding`,
        expected,
        actual ?? 'missing',
        'Recovery: retry only from the exact checkout, candidate, and reviewed revisions that created this transaction.',
      );
    }
  }
  if (!Array.isArray(journal.entries)) {
    throw foundationError(
      'candidate transaction entries',
      'an array of exact backup entries',
      typeof journal.entries,
      'Recovery: restore the transaction journal and backups before retrying.',
    );
  }
  if (!Array.isArray(journal.stagedPaths)) {
    throw foundationError(
      'candidate transaction staged paths',
      'an array of sibling temporary paths',
      typeof journal.stagedPaths,
      'Recovery: restore the original transaction journal before retrying.',
    );
  }

  const seenTargets = new Set();
  for (const entry of journal.entries) {
    assertExactKeys(
      entry,
      ['targetPath', 'backupPath', 'existed', 'mode'],
      'candidate transaction entry',
    );
    const authoritativeRelativePath =
      entry.targetPath === args.specPath
        ? null
        : entry.targetPath === args.manifestPath
          ? MANIFEST_RELATIVE_PATH
          : typeof entry.targetPath === 'string' &&
              isAbsolute(entry.targetPath) &&
              isContained(args.root, entry.targetPath)
            ? relative(args.root, entry.targetPath).split(sep).join('/')
            : null;
    const allowedAuthoritativeTarget =
      entry.targetPath === args.specPath ||
      authoritativeRelativePath === MANIFEST_RELATIVE_PATH ||
      REQUIRED_FOUNDATION_FILES.includes(authoritativeRelativePath) ||
      authoritativeRelativePath?.startsWith('docs/agentic/');
    if (
      typeof entry.targetPath !== 'string' ||
      !isAbsolute(entry.targetPath) ||
      !allowedAuthoritativeTarget
    ) {
      throw foundationError(
        'candidate transaction target',
        'the exact Design Spec or an allowed authoritative Foundation path',
        entry.targetPath ?? 'missing',
        'Recovery: reject the altered journal and restore it from the interrupted operation.',
      );
    }
    if (seenTargets.has(entry.targetPath)) {
      throw foundationError(
        'candidate transaction target',
        'unique backup targets',
        `duplicate ${entry.targetPath}`,
        'Recovery: restore the original journal before retrying.',
      );
    }
    seenTargets.add(entry.targetPath);
    if (typeof entry.existed !== 'boolean') {
      throw foundationError(
        `candidate transaction entry ${entry.targetPath}`,
        'existed as a boolean',
        typeof entry.existed,
        'Recovery: restore the original transaction journal before retrying.',
      );
    }
    if (entry.existed) {
      assertNormalizedRecordPath(entry.backupPath, 'candidate transaction backup path');
      const backupAbsolutePath = resolve(
        transactionRoot,
        ...entry.backupPath.split('/'),
      );
      if (!isContained(transactionRoot, backupAbsolutePath)) {
        throw foundationError(
          'candidate transaction backup',
          'a normalized path inside the transaction directory',
          entry.backupPath,
          'Recovery: restore the original backup path before retrying.',
        );
      }
      if (!Number.isInteger(entry.mode)) {
        throw foundationError(
          `candidate transaction entry ${entry.targetPath}`,
          'an integer original file mode',
          entry.mode ?? 'missing',
          'Recovery: restore the original transaction journal before retrying.',
        );
      }
    } else if (entry.backupPath !== null || entry.mode !== null) {
      throw foundationError(
        `candidate transaction entry ${entry.targetPath}`,
        'null backupPath and mode for an originally missing file',
        JSON.stringify({ backupPath: entry.backupPath, mode: entry.mode }),
        'Recovery: restore the original transaction journal before retrying.',
      );
    }
  }
  const expectedTargets = new Set(expectedTargetPaths);
  if (
    journal.entries.length !== expectedTargets.size ||
    [...expectedTargets].some((targetPath) => !seenTargets.has(targetPath))
  ) {
    throw foundationError(
      'candidate transaction target set',
      `the exact candidate-derived targets ${[...expectedTargets].join(', ')}`,
      `journal targets ${journal.entries.map(({ targetPath }) => targetPath).join(', ')}`,
      'Recovery: reject the altered journal and retry only with the exact candidate and reviewed operation bindings.',
    );
  }
  for (const stagedPath of journal.stagedPaths) {
    if (typeof stagedPath !== 'string' || !isAbsolute(stagedPath)) {
      throw foundationError(
        'candidate transaction staged path',
        'an absolute sibling temporary path',
        stagedPath ?? 'missing',
        'Recovery: restore the original transaction journal before retrying.',
      );
    }
    const target = journal.entries.find(
      (entry) =>
        dirname(entry.targetPath) === dirname(stagedPath) &&
        basename(stagedPath).startsWith(`.${basename(entry.targetPath)}.spa-foundation-`) &&
        basename(stagedPath).endsWith('.tmp'),
    );
    if (!target) {
      throw foundationError(
        'candidate transaction staged path',
        'a recorded sibling temporary path for one transaction target',
        stagedPath,
        'Recovery: restore the original transaction journal before retrying.',
      );
    }
  }
  return journal;
}

async function cleanupJournalStagedPaths(journal) {
  const stagedPaths = new Set(journal.stagedPaths);
  for (const entry of journal.entries) {
    await validatePhysicalTargetPath(
      journal.root,
      entry.targetPath,
      `transaction staged cleanup for ${entry.targetPath}`,
    );
    let siblingNames;
    try {
      siblingNames = await readdir(dirname(entry.targetPath));
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    const prefix = `.${basename(entry.targetPath)}.spa-foundation-`;
    for (const siblingName of siblingNames) {
      if (siblingName.startsWith(prefix) && siblingName.endsWith('.tmp')) {
        stagedPaths.add(join(dirname(entry.targetPath), siblingName));
      }
    }
  }
  for (const stagedPath of stagedPaths) {
    await validatePhysicalTargetPath(
      journal.root,
      stagedPath,
      `transaction staged cleanup ${stagedPath}`,
    );
    await rm(stagedPath, { force: true });
  }
  for (const entry of journal.entries) {
    if (!entry.existed) {
      await removeEmptyParents(dirname(entry.targetPath), journal.root);
    }
  }
}

async function restoreTransaction(journal, transactionRoot) {
  const transactionRealPath = await realpath(transactionRoot);
  for (const entry of [...journal.entries].reverse()) {
    await validatePhysicalTargetPath(
      journal.root,
      entry.targetPath,
      `transaction restore target ${entry.targetPath}`,
    );
    await validateRegularTargetIfPresent(
      entry.targetPath,
      `transaction restore target ${entry.targetPath}`,
    );
    if (!entry.existed) {
      await rm(entry.targetPath, { force: true });
      await removeEmptyParents(dirname(entry.targetPath), journal.root);
      continue;
    }
    const backupPath = resolve(transactionRoot, ...entry.backupPath.split('/'));
    const backupStat = await lstat(backupPath);
    if (backupStat.isSymbolicLink() || !backupStat.isFile()) {
      throw foundationError(
        `transaction backup ${entry.backupPath}`,
        'a non-symbolic-link regular backup file',
        backupStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
        'Recovery: restore the exact transaction backup before retrying.',
      );
    }
    const backupRealPath = await realpath(backupPath);
    if (!isContained(transactionRealPath, backupRealPath)) {
      throw foundationError(
        `transaction backup ${entry.backupPath}`,
        'a real path contained by the transaction directory',
        `outside at ${backupRealPath}`,
        'Recovery: restore the exact transaction backup inside the transaction directory.',
      );
    }
    const stagedPath = await stageSiblingFile(
      entry.targetPath,
      await readFile(backupPath),
      entry.mode,
      journal.root,
    );
    try {
      await validatePhysicalTargetPath(
        journal.root,
        entry.targetPath,
        `transaction restore replacement ${entry.targetPath}`,
      );
      await validateRegularTargetIfPresent(
        entry.targetPath,
        `transaction restore replacement ${entry.targetPath}`,
      );
      await realReplacePath({
        targetPath: entry.targetPath,
        stagedPath,
        action: 'upsert',
      });
      await chmod(entry.targetPath, entry.mode & 0o777);
    } finally {
      await validatePhysicalTargetPath(
        journal.root,
        stagedPath,
        `transaction restore staged cleanup ${stagedPath}`,
      );
      await rm(stagedPath, { force: true });
    }
  }
}

async function validateRestoredState(args) {
  await validateApprovedFoundation({
    root: args.root,
    manifestPath: args.manifestPath,
    expectedRevision: args.expectedBaseRevision,
  });
  await validateDraftArtifact({
    path: args.specPath,
    artifactType: 'Design Spec',
    expectedRevision: args.expectedSpecRevision,
  });
}

async function validateTerminalAppliedState(
  args,
  operation,
  journal,
  candidateRealPath,
) {
  const appliedPath = join(args.candidateRoot, APPLIED_FILE);
  const appliedStat = await pathState(appliedPath);
  if (!appliedStat) return false;
  if (journal.state !== 'recording-applied') {
    throw foundationError(
      'candidate terminal transaction state',
      'recording-applied when APPLIED.json exists',
      journal.state,
      'Recovery: preserve the transaction and marker for exact inspection; do not roll back an uncertain applied result.',
    );
  }
  const applied = await readStrictJsonFile(
    appliedPath,
    'candidate applied marker',
    candidateRealPath,
  );
  assertExactKeys(
    applied,
    [
      'schema',
      'specPath',
      'specRevision',
      'manifestPath',
      'baseRevision',
      'resultRevision',
      'approvedAt',
      'actions',
    ],
    'candidate applied marker',
  );
  if (applied.schema !== APPLIED_SCHEMA) {
    throw foundationError(
      'candidate applied marker schema',
      APPLIED_SCHEMA,
      applied.schema ?? 'missing',
      'Recovery: preserve the terminal transaction and restore the exact applied marker.',
    );
  }
  const bindings = [
    ['Design Spec path', operation.location.designSpecPath, applied.specPath],
    ['Design Spec revision', args.expectedSpecRevision, applied.specRevision],
    ['manifest path', MANIFEST_RELATIVE_PATH, applied.manifestPath],
    ['base revision', args.expectedBaseRevision, applied.baseRevision],
    ['result revision', args.expectedResultRevision, applied.resultRevision],
  ];
  for (const [subject, expected, actual] of bindings) {
    if (actual !== expected) {
      throw foundationError(
        `candidate applied marker ${subject} binding`,
        expected,
        actual ?? 'missing',
        'Recovery: preserve the terminal state and retry only from the exact candidate operation that created it.',
      );
    }
  }
  if (
    !Array.isArray(applied.actions) ||
    JSON.stringify(applied.actions) !== JSON.stringify(operation.changedFiles)
  ) {
    throw foundationError(
      'candidate applied marker actions binding',
      JSON.stringify(operation.changedFiles),
      JSON.stringify(applied.actions),
      'Recovery: preserve the terminal state and restore the exact applied marker actions.',
    );
  }
  if (!isIso8601Timestamp(applied.approvedAt)) {
    throw foundationError(
      'candidate applied marker timestamp',
      'an ISO-8601 timestamp',
      applied.approvedAt ?? 'missing',
      'Recovery: preserve the terminal state and restore the exact applied marker timestamp.',
    );
  }
  const foundation = await validateApprovedFoundation({
    root: args.root,
    manifestPath: args.manifestPath,
    expectedRevision: args.expectedResultRevision,
  });
  const spec = await validateApprovedArtifact({
    path: args.specPath,
    artifactType: 'Design Spec',
    expectedRevision: args.expectedSpecRevision,
  });
  if (
    foundation.approvedAt !== applied.approvedAt ||
    spec.approvedAt !== applied.approvedAt
  ) {
    throw foundationError(
      'candidate terminal approval timestamp',
      `the same ${applied.approvedAt} timestamp in marker, Design Spec, and Foundation`,
      `Design Spec ${spec.approvedAt}; Foundation ${foundation.approvedAt}`,
      'Recovery: preserve the terminal state; the applied result does not match its marker.',
    );
  }
  return true;
}

async function recoverExistingTransaction(args, operation) {
  const transactionRoot = join(args.candidateRoot, TRANSACTION_DIRECTORY);
  const transactionStat = await pathState(transactionRoot);
  if (!transactionStat) return false;
  if (transactionStat.isSymbolicLink() || !transactionStat.isDirectory()) {
    throw foundationError(
      'candidate transaction',
      'a physical operation-owned transaction directory',
      transactionStat.isSymbolicLink() ? 'symbolic link' : 'non-directory',
      'Recovery: preserve the candidate, remove the forged transaction entry, and rerun preview before apply.',
    );
  }
  const transactionRealPath = await realpath(transactionRoot);
  const candidateRealPath = await realpath(args.candidateRoot);
  if (!isContained(candidateRealPath, transactionRealPath)) {
    throw foundationError(
      'candidate transaction',
      'a real path contained by the candidate root',
      `outside at ${transactionRealPath}`,
      'Recovery: preserve the candidate and restore its transaction directory inside the candidate root.',
    );
  }
  const journal = validateTransactionJournal(
    await readStrictJsonFile(
      join(transactionRoot, 'journal.json'),
      'candidate transaction journal',
      transactionRealPath,
    ),
    args,
    transactionRoot,
    operation.targetPaths,
  );
  for (const entry of journal.entries) {
    await validatePhysicalTargetPath(
      args.root,
      entry.targetPath,
      `candidate transaction target ${entry.targetPath}`,
    );
    await validateRegularTargetIfPresent(
      entry.targetPath,
      `candidate transaction target ${entry.targetPath}`,
    );
  }
  try {
    if (
      await validateTerminalAppliedState(
        args,
        operation,
        journal,
        candidateRealPath,
      )
    ) {
      await cleanupJournalStagedPaths(journal);
      await rm(transactionRoot, { recursive: true, force: true });
      return 'applied';
    }
    await restoreTransaction(journal, transactionRoot);
    await cleanupJournalStagedPaths(journal);
    await validateRestoredState(args);
    await rm(transactionRoot, { recursive: true, force: true });
    return true;
  } catch (error) {
    throw foundationError(
      'candidate transaction recovery',
      'exact restoration of the Approved base Foundation and Draft Design Spec',
      error.message,
      `Recovery: preserve ${transactionRoot} and its backups, repair the reported filesystem problem, then retry the exact foundation apply command.`,
    );
  }
}

async function createTransaction(context, expectedResultRevision) {
  const transactionRoot = join(context.candidateRoot, TRANSACTION_DIRECTORY);
  await validatePhysicalTargetPath(
    context.candidateRoot,
    transactionRoot,
    'candidate transaction directory',
  );
  const targetPaths = [
    context.specPath,
    ...context.changedFiles.map(({ path }) =>
      join(context.root, ...path.split('/'))),
    context.manifestPath,
  ];
  const uniqueTargets = [...new Set(targetPaths)];
  for (const targetPath of uniqueTargets) {
    await validatePhysicalTargetPath(
      context.root,
      targetPath,
      `transaction target ${targetPath}`,
    );
  }
  await mkdir(transactionRoot);
  try {
    const backupsRoot = join(transactionRoot, 'backups');
    await validatePhysicalTargetPath(
      transactionRoot,
      backupsRoot,
      'candidate transaction backup directory',
    );
    await mkdir(backupsRoot);
    const entries = [];
    for (let index = 0; index < uniqueTargets.length; index += 1) {
      const targetPath = uniqueTargets[index];
      const targetStat = await pathState(targetPath);
      if (targetStat && (targetStat.isSymbolicLink() || !targetStat.isFile())) {
        throw foundationError(
          `transaction target ${targetPath}`,
          'a missing path or non-symbolic-link regular file',
          targetStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
          'Recovery: restore the authoritative path as a regular file before retrying.',
        );
      }
      if (!targetStat) {
        entries.push({
          targetPath,
          backupPath: null,
          existed: false,
          mode: null,
        });
        continue;
      }
      const backupPath = `backups/${index}.bin`;
      await writeFile(
        join(transactionRoot, ...backupPath.split('/')),
        await readFile(targetPath),
      );
      entries.push({
        targetPath,
        backupPath,
        existed: true,
        mode: targetStat.mode,
      });
    }
    const journal = {
      schema: TRANSACTION_SCHEMA,
      root: context.root,
      manifestPath: context.manifestPath,
      specPath: context.specPath,
      candidateRoot: context.candidateRoot,
      expectedBaseRevision: context.expectedBaseRevision,
      expectedSpecRevision: context.expectedSpecRevision,
      expectedResultRevision,
      state: 'prepared',
      entries,
      stagedPaths: [],
    };
    await writeTransactionJournal(transactionRoot, journal);
    return { journal, transactionRoot };
  } catch (error) {
    await rm(transactionRoot, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

function transactionEntry(transaction, targetPath) {
  const entry = transaction.journal.entries.find(
    (candidate) => candidate.targetPath === targetPath,
  );
  if (!entry) {
    throw foundationError(
      'candidate transaction target binding',
      `an entry for ${targetPath}`,
      'missing',
      'Recovery: preserve the transaction and retry only from the exact reviewed candidate.',
    );
  }
  return entry;
}

async function recordMutation(transaction, mutations, mutation) {
  mutations.push(mutation);
  if (!mutation.stagedPath) return;
  transaction.journal.stagedPaths.push(mutation.stagedPath);
  await writeTransactionJournal(
    transaction.transactionRoot,
    transaction.journal,
  );
}

async function buildMutations(context, approvedAt, transaction) {
  const mutations = [];
  try {
    const specEntry = transactionEntry(transaction, context.specPath);
    const transactionSpecPath = join(transaction.transactionRoot, 'approved-spec.md');
    await writeFile(transactionSpecPath, await readFile(context.specPath));
    await approveArtifact({
      path: transactionSpecPath,
      artifactType: 'Design Spec',
      expectedRevision: context.expectedSpecRevision,
      approvedAt,
    });
    await recordMutation(transaction, mutations, {
      path: context.designSpecPath,
      action: 'upsert',
      targetPath: context.specPath,
      stagedPath: await stageSiblingFile(
        context.specPath,
        await readFile(transactionSpecPath),
        specEntry.mode,
        context.root,
      ),
      mode: specEntry.mode,
    });

    for (const change of context.changedFiles) {
      if (change.path === MANIFEST_RELATIVE_PATH) continue;
      const targetPath = join(context.root, ...change.path.split('/'));
      if (change.action === 'delete') {
        await recordMutation(transaction, mutations, {
          ...change,
          targetPath,
          stagedPath: null,
          mode: null,
        });
        continue;
      }
      const candidate = context.candidateFiles.get(change.path);
      const targetEntry = transactionEntry(transaction, targetPath);
      const mode = targetEntry.existed ? targetEntry.mode : 0o644;
      await recordMutation(transaction, mutations, {
        ...change,
        targetPath,
        stagedPath: await stageSiblingFile(
          targetPath,
          candidate.content,
          mode,
          context.root,
        ),
        mode,
      });
    }

    const manifestEntry = transactionEntry(transaction, context.manifestPath);
    const approvedManifest = replaceLifecycleMetadata(
      context.normalizedManifest,
      {
        artifactType: FOUNDATION_ARTIFACT_TYPE,
        status: 'Approved',
        revision: context.prospectiveRevision,
        approvedRevision: context.prospectiveRevision,
        approvedAt,
      },
    );
    await recordMutation(transaction, mutations, {
      path: MANIFEST_RELATIVE_PATH,
      action: 'upsert',
      targetPath: context.manifestPath,
      stagedPath: await stageSiblingFile(
        context.manifestPath,
        approvedManifest,
        manifestEntry.mode,
        context.root,
      ),
      mode: manifestEntry.mode,
    });
    return mutations;
  } catch (error) {
    await cleanupStagedMutations(mutations, context.root).catch(() => {});
    throw error;
  }
}

async function cleanupStagedMutations(mutations, physicalRoot) {
  for (const mutation of mutations) {
    if (mutation.stagedPath) {
      await validatePhysicalTargetPath(
        physicalRoot,
        mutation.stagedPath,
        `candidate staged cleanup ${mutation.stagedPath}`,
      );
      await rm(mutation.stagedPath, { force: true });
    }
  }
}

export async function applyFoundationChangeSet({
  root,
  manifestPath,
  candidateRoot,
  specPath,
  expectedSpecRevision,
  expectedBaseRevision,
  expectedResultRevision,
}, adapters = {}) {
  assertSupportedNode();
  assertCompleteRevision('candidate expected result revision', expectedResultRevision);
  const args = {
    root,
    manifestPath,
    candidateRoot,
    specPath,
    expectedSpecRevision,
    expectedBaseRevision,
    expectedResultRevision,
  };
  const location = await validateCandidateLocation(args);
  const operation = await readBoundCandidateOperation(args, location);
  await recoverExistingTransaction(args, { ...operation, location });
  await rejectAppliedCandidate(candidateRoot);

  const context = await prepareFoundationChangeSet(args);
  if (context.prospectiveRevision !== expectedResultRevision) {
    throw foundationError(
      'candidate prospective revision',
      `reviewed result ${expectedResultRevision}`,
      context.prospectiveRevision,
      'Recovery: rerun foundation preview and return the changed Design Change Set to user review.',
    );
  }

  const approvedAt = (adapters.now ?? (() => new Date().toISOString()))();
  if (!isIso8601Timestamp(approvedAt)) {
    throw foundationError(
      'Design Change Set timestamp',
      'an ISO-8601 timestamp',
      approvedAt,
      'Recovery: restore the local clock adapter and retry.',
    );
  }
  const replacePath = adapters.replacePath ?? realReplacePath;
  if (typeof replacePath !== 'function') {
    throw foundationError(
      'filesystem replacement adapter',
      'a replacement function',
      typeof replacePath,
      'Recovery: remove the invalid adapter and retry with the local filesystem adapter.',
    );
  }

  let transaction;
  let mutations = [];
  const appliedPath = join(candidateRoot, APPLIED_FILE);
  try {
    transaction = await createTransaction(context, expectedResultRevision);
    mutations = await buildMutations(
      context,
      approvedAt,
      transaction,
    );
    await validateApprovedFoundation({
      root,
      manifestPath,
      expectedRevision: expectedBaseRevision,
    });
    await validateDraftArtifact({
      path: specPath,
      artifactType: 'Design Spec',
      expectedRevision: expectedSpecRevision,
    });

    for (let index = 0; index < mutations.length; index += 1) {
      const mutation = mutations[index];
      transaction.journal.state = `replacing:${index}:${mutation.path}`;
      await writeTransactionJournal(transaction.transactionRoot, transaction.journal);
      await validatePhysicalTargetPath(
        root,
        mutation.targetPath,
        `candidate mutation target ${mutation.targetPath}`,
      );
      await validateRegularTargetIfPresent(
        mutation.targetPath,
        `candidate mutation target ${mutation.targetPath}`,
      );
      await replacePath(mutation);
      if (mutation.action === 'upsert') {
        await chmod(mutation.targetPath, mutation.mode & 0o777);
      }
    }

    transaction.journal.state = 'validating';
    await writeTransactionJournal(transaction.transactionRoot, transaction.journal);
    await validateApprovedFoundation({
      root,
      manifestPath,
      expectedRevision: expectedResultRevision,
    });
    await validateApprovedArtifact({
      path: specPath,
      artifactType: 'Design Spec',
      expectedRevision: expectedSpecRevision,
    });

    transaction.journal.state = 'recording-applied';
    await writeTransactionJournal(transaction.transactionRoot, transaction.journal);
    const applied = {
      schema: APPLIED_SCHEMA,
      specPath: context.designSpecPath,
      specRevision: expectedSpecRevision,
      manifestPath: MANIFEST_RELATIVE_PATH,
      baseRevision: expectedBaseRevision,
      resultRevision: expectedResultRevision,
      approvedAt,
      actions: context.changedFiles,
    };
    const stagedAppliedPath = await stageSiblingFile(
      appliedPath,
      `${JSON.stringify(applied, null, 2)}\n`,
      0o600,
      candidateRoot,
    );
    try {
      await validatePhysicalTargetPath(
        candidateRoot,
        appliedPath,
        'candidate applied marker replacement',
      );
      await validateRegularTargetIfPresent(
        appliedPath,
        'candidate applied marker replacement',
      );
      await realReplacePath({
        targetPath: appliedPath,
        stagedPath: stagedAppliedPath,
        action: 'upsert',
      });
    } finally {
      await validatePhysicalTargetPath(
        candidateRoot,
        stagedAppliedPath,
        'candidate applied marker staged cleanup',
      );
      await rm(stagedAppliedPath, { force: true });
    }
    await cleanupStagedMutations(mutations, context.root);
    await rm(transaction.transactionRoot, { recursive: true, force: true });

    return {
      ...publicChangeSetResult(context),
      approvedAt,
      appliedPath,
    };
  } catch (operationError) {
    await validatePhysicalTargetPath(
      candidateRoot,
      appliedPath,
      'candidate applied marker cleanup',
    )
      .then(() => rm(appliedPath, { force: true }))
      .catch(() => {});
    await cleanupStagedMutations(mutations, context.root).catch(() => {});
    if (!transaction) throw operationError;
    try {
      await restoreTransaction(transaction.journal, transaction.transactionRoot);
      await cleanupJournalStagedPaths(transaction.journal);
      await validateRestoredState(args);
      await rm(transaction.transactionRoot, { recursive: true, force: true });
      throw new Error(
        `Foundation Design Change Set apply failed: ${operationError.message} Recovery succeeded; the exact Approved base Foundation and Draft Design Spec were restored.`,
        { cause: operationError },
      );
    } catch (recoveryError) {
      if (recoveryError.cause === operationError) throw recoveryError;
      throw new Error(
        `Foundation Design Change Set apply failed: ${operationError.message} Recovery failed: ${recoveryError.message}. Preserve ${transaction.transactionRoot} and its backups for deterministic retry.`,
        { cause: operationError },
      );
    }
  }
}
