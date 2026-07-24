import { createHash } from 'node:crypto';
import { lstat, readFile, realpath, writeFile } from 'node:fs/promises';
import {
  isAbsolute,
  join,
  posix,
  relative,
  resolve,
  sep,
} from 'node:path';

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
  return { current, files, normalizedManifest, revision };
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
