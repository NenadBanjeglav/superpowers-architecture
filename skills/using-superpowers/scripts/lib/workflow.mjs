import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rmdir,
  rm,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';

import { resolveApprovalPolicy } from './policy.mjs';
import {
  inspectArtifactBytes,
  prepareReadyArtifactBytes,
  validateArtifact,
} from './artifacts.mjs';
import {
  foundationManifestPaths,
  prepareFoundationMigration,
  validateApprovedFoundation,
  withFoundationWriterExclusion,
} from './foundations.mjs';

const exec = promisify(execFile);
const REQUEST_SCHEMA = 'superpowers-architecture-workflow-migration-v1';
const LOCK_SCHEMA = 'superpowers-architecture-workflow-migration-lock-v1';
const JOURNAL_SCHEMA = 'superpowers-architecture-workflow-migration-transaction-v1';
const RESULT_SCHEMA = 'superpowers-architecture-workflow-migration-result-v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const ID = /^[a-z0-9](?:[a-z0-9._-]{0,63})$/;
const OPERATION_PREFIX = 'docs/superpowers/workflow-migrations/';

function workflowError(subject, expected, actual, recovery = 'Recovery: repair the reviewed migration request or exact operation state, then retry.') {
  return new Error(`Workflow migration ${subject}: expected ${expected}; actual ${actual}. ${recovery}`);
}

function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function decodeUtf8(bytes, subject) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (error) {
    throw workflowError(subject, 'strict UTF-8 bytes', error.message);
  }
}

function assertExactKeys(value, keys, subject) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw workflowError(subject, `an object with exactly ${keys.join(', ')}`, value === null ? 'null' : typeof value);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw workflowError(subject, `keys ${expected.join(', ')}`, `keys ${actual.join(', ')}`);
  }
}

function parseJson(bytes, subject) {
  try {
    return JSON.parse(decodeUtf8(bytes, subject));
  } catch (error) {
    if (error.message.startsWith('Workflow migration')) throw error;
    throw workflowError(subject, 'valid JSON', error.message);
  }
}

function normalizeRelativePath(value, subject) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.includes('\\') ||
    value.startsWith('/') ||
    value.endsWith('/') ||
    value.split('/').some((part) => part === '' || part === '.' || part === '..')
  ) {
    throw workflowError(subject, 'a normalized checkout-relative path without traversal', JSON.stringify(value));
  }
  return value;
}

function portableRelative(root, target) {
  return relative(root, target).split(sep).join('/');
}

function contained(root, target) {
  const rel = relative(root, target);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel));
}

async function regularBytes(rootRealPath, path, { allowAbsent = false } = {}) {
  const target = join(rootRealPath, ...path.split('/'));
  let current = rootRealPath;
  const segments = path.split('/');
  for (let index = 0; index < segments.length; index += 1) {
    current = join(current, segments[index]);
    let entry;
    try {
      entry = await lstat(current);
    } catch (error) {
      if (error.code === 'ENOENT' && index === segments.length - 1 && allowAbsent) {
        return { target, bytes: null, mode: null };
      }
      throw workflowError(`path ${path}`, 'an existing physical path with regular parents', error.code ?? error.message);
    }
    if (entry.isSymbolicLink()) {
      throw workflowError(`path ${path}`, 'no symbolic-link or junction traversal', `symbolic link at ${portableRelative(rootRealPath, current)}`);
    }
    const physical = await realpath(current);
    if (!contained(rootRealPath, physical)) {
      throw workflowError(`path ${path}`, 'physical containment by the checkout root', physical);
    }
    if (index < segments.length - 1 && !entry.isDirectory()) {
      throw workflowError(`path ${path}`, 'regular directory parents', `non-directory ${portableRelative(rootRealPath, current)}`);
    }
    if (index === segments.length - 1 && !entry.isFile()) {
      throw workflowError(`path ${path}`, 'a regular file or declared absent target', `non-file ${path}`);
    }
  }
  const targetStat = await stat(target);
  return { target, bytes: await readFile(target), mode: targetStat.mode };
}

async function readOptionalOperationFile(rootRealPath, path) {
  try {
    return await regularBytes(rootRealPath, path, { allowAbsent: true });
  } catch (error) {
    if (error.message.includes('actual ENOENT')) return { target: join(rootRealPath, ...path.split('/')), bytes: null, mode: null };
    throw error;
  }
}

async function gitOutput(root, args, subject) {
  try {
    const { stdout } = await exec('git', ['-C', root, ...args], { windowsHide: true });
    return stdout.trim();
  } catch (error) {
    throw workflowError(subject, `git ${args.join(' ')} success`, error.stderr?.trim() || error.code || error.message);
  }
}

async function assertIgnored(root, path) {
  try {
    await exec('git', ['-C', root, 'check-ignore', '--quiet', '--no-index', '--', path], { windowsHide: true });
  } catch (error) {
    throw workflowError(
      `operation-state path ${path}`,
      'Git ignore coverage before any operation-state write',
      error.code ?? error.message,
      'Recovery: add narrow ignore coverage for docs/superpowers/workflow-migrations/ before creating or running the request.',
    );
  }
}

function assertSortedUnique(entries, subject) {
  const paths = entries.map(({ path }) => path);
  const sorted = [...paths].sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  if (new Set(paths).size !== paths.length || JSON.stringify(paths) !== JSON.stringify(sorted)) {
    throw workflowError(subject, 'unique unsigned UTF-8 path order', JSON.stringify(paths));
  }
}

function allowedWorkflowMutation(path) {
  return (
    path === 'AGENTS.md' ||
    path.endsWith('/AGENTS.md') ||
    path === 'CONTEXT.md' ||
    path.startsWith('docs/agentic/') && path.endsWith('.md') ||
    path.startsWith('docs/superpowers/specs/') && path.endsWith('.md') ||
    path.startsWith('docs/superpowers/plans/') && path.endsWith('.md')
  );
}

function validateRequest(request, root, policy) {
  assertExactKeys(request, ['schema', 'id', 'root', 'branch', 'policy', 'policyOwner', 'readSet', 'changes', 'artifacts', 'foundation'], 'request');
  if (request.schema !== REQUEST_SCHEMA) throw workflowError('request schema', REQUEST_SCHEMA, request.schema ?? 'missing');
  if (!ID.test(request.id ?? '')) throw workflowError('request id', '1-64 lowercase safe identity characters', request.id ?? 'missing');
  if (request.root !== root) throw workflowError('request root', root, request.root ?? 'missing');
  if (request.policy !== policy || policy !== 'Autonomous') {
    throw workflowError('request policy', 'explicit Autonomous migration policy', request.policy ?? 'missing');
  }
  normalizeRelativePath(request.policyOwner, 'policy owner');
  if (!Array.isArray(request.readSet) || !Array.isArray(request.changes) || !Array.isArray(request.artifacts)) {
    throw workflowError('request graph', 'readSet, changes, and artifacts arrays', 'missing or non-array graph');
  }
  for (const [index, entry] of request.readSet.entries()) {
    assertExactKeys(entry, ['path', 'sha256'], `readSet entry ${index}`);
    normalizeRelativePath(entry.path, `readSet entry ${index} path`);
    if (entry.sha256 !== 'none' && !SHA256.test(entry.sha256 ?? '')) {
      throw workflowError(`readSet entry ${index} digest`, 'none or a complete raw sha256 digest', entry.sha256 ?? 'missing');
    }
  }
  for (const [index, entry] of request.changes.entries()) {
    assertExactKeys(entry, ['path', 'content'], `change ${index}`);
    normalizeRelativePath(entry.path, `change ${index} path`);
    if (!allowedWorkflowMutation(entry.path) || entry.path.endsWith('/APPLIED.json')) {
      throw workflowError(`change ${index} path`, 'a named instruction, workflow document, or current lifecycle artifact', entry.path);
    }
    if (typeof entry.content !== 'string') throw workflowError(`change ${index} content`, 'complete UTF-8 document text', typeof entry.content);
    if (decodeUtf8(Buffer.from(entry.content, 'utf8'), `change ${index} content`) !== entry.content) {
      throw workflowError(`change ${index} content`, 'lossless valid Unicode text', 'unpaired or non-round-tripping code points');
    }
  }
  assertSortedUnique(request.readSet, 'read set');
  assertSortedUnique(request.changes, 'change set');
  if (request.foundation !== null) {
    assertExactKeys(request.foundation, ['manifestPath', 'baseRevision', 'resultRevision', 'specPath', 'specRevision', 'receiptPath'], 'Foundation graph');
    for (const name of ['manifestPath', 'specPath', 'receiptPath']) normalizeRelativePath(request.foundation[name], `Foundation ${name}`);
    for (const name of ['baseRevision', 'resultRevision', 'specRevision']) {
      if (!SHA256.test(request.foundation[name] ?? '')) throw workflowError(`Foundation ${name}`, 'a complete sha256 digest', request.foundation[name] ?? 'missing');
    }
    if (request.foundation.manifestPath !== 'docs/agentic/WAYFINDING.md') throw workflowError('Foundation manifest path', 'docs/agentic/WAYFINDING.md', request.foundation.manifestPath);
    if (!request.foundation.specPath.startsWith('docs/superpowers/specs/') || !request.foundation.specPath.endsWith('.md')) throw workflowError('Foundation migration spec', 'a Design Spec under docs/superpowers/specs/', request.foundation.specPath);
    const stem = request.foundation.specPath.slice(request.foundation.specPath.lastIndexOf('/') + 1, -3);
    const expectedReceipt = `docs/superpowers/foundation-candidates/${stem}/APPLIED.json`;
    if (request.foundation.receiptPath !== expectedReceipt) throw workflowError('Foundation receipt path', expectedReceipt, request.foundation.receiptPath);
  }
  for (const [index, entry] of request.artifacts.entries()) {
    assertExactKeys(entry, ['path', 'artifactType', 'expectedRevision', 'sourceSpecPath'], `artifact ${index}`);
    normalizeRelativePath(entry.path, `artifact ${index} path`);
    if (!['Design Spec', 'Implementation Plan'].includes(entry.artifactType)) {
      throw workflowError(`artifact ${index} type`, 'Design Spec or Implementation Plan', entry.artifactType ?? 'missing');
    }
    if (!SHA256.test(entry.expectedRevision ?? '')) throw workflowError(`artifact ${index} revision`, 'a complete sha256 digest', entry.expectedRevision ?? 'missing');
    if (entry.artifactType === 'Design Spec' && entry.sourceSpecPath !== 'none') {
      throw workflowError(`artifact ${entry.path} source`, 'none for a Design Spec', entry.sourceSpecPath);
    }
    if (entry.artifactType === 'Implementation Plan') normalizeRelativePath(entry.sourceSpecPath, `artifact ${entry.path} source`);
  }
  assertSortedUnique(request.artifacts, 'artifact graph');
}

function exactField(content, label, subject) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...content.matchAll(new RegExp(`^\\*\\*${escaped}:\\*\\*[ \\t]*(.*?)[ \\t]*$`, 'gm'))];
  if (matches.length !== 1) throw workflowError(subject, `exactly one ${label} field`, `${matches.length} fields`);
  return matches[0][1];
}

function absoluteArtifactPath(root, path) {
  return join(root, ...path.split('/'));
}

async function prepareArtifactGraph(rootRealPath, request, snapshot) {
  const artifacts = new Map(request.artifacts.map((entry) => [entry.path, entry]));
  const changedArtifacts = request.changes.filter(({ path }) => path.startsWith('docs/superpowers/specs/') || path.startsWith('docs/superpowers/plans/'));
  for (const change of changedArtifacts) {
    if (!artifacts.has(change.path)) throw workflowError(`changed artifact ${change.path}`, 'an artifact graph entry', 'missing');
  }
  for (const artifact of request.artifacts) {
    if (!request.readSet.some(({ path }) => path === artifact.path)) throw workflowError(`artifact ${artifact.path}`, 'an exact readSet entry', 'missing');
  }
  const states = new Map();
  const outputs = new Map();
  const history = [];
  for (const artifact of request.artifacts) {
    const source = snapshot.get(artifact.path);
    if (!source || source.bytes === null) throw workflowError(`artifact ${artifact.path}`, 'an existing regular artifact', 'absent');
    const change = request.changes.find(({ path }) => path === artifact.path);
    if (!change || Buffer.from(change.content, 'utf8').equals(source.bytes)) {
      const state = await validateArtifact({ path: source.target, artifactType: artifact.artifactType, expectedRevision: artifact.expectedRevision, policy: request.policy });
      states.set(artifact.path, state);
      continue;
    }
    const inspected = inspectArtifactBytes({ path: source.target, bytes: source.bytes, artifactType: artifact.artifactType });
    if (inspected.status === 'Approved' && inspected.revision === inspected.payloadRevision && inspected.approvedRevision === inspected.revision) {
      history.push({ path: artifact.path, bytes: source.bytes, mode: source.mode, kind: 'Approved artifact' });
    }
    const prepared = prepareReadyArtifactBytes({ path: source.target, bytes: Buffer.from(change.content, 'utf8'), artifactType: artifact.artifactType });
    if (prepared.state.revision !== artifact.expectedRevision) {
      throw workflowError(`artifact ${artifact.path} target revision`, artifact.expectedRevision, prepared.state.revision);
    }
    states.set(artifact.path, { path: source.target, ...prepared.state, policy: request.policy });
    outputs.set(artifact.path, prepared.content);
  }
  for (const artifact of request.artifacts) {
    if (artifact.artifactType !== 'Implementation Plan') continue;
    const source = artifacts.get(artifact.sourceSpecPath);
    if (!source || source.artifactType !== 'Design Spec') {
      throw workflowError(`plan ${artifact.path} source graph`, 'an included Design Spec entry', artifact.sourceSpecPath);
    }
    const planBytes = outputs.get(artifact.path) ?? snapshot.get(artifact.path).bytes;
    const content = decodeUtf8(planBytes, `plan ${artifact.path}`);
    const expectedSpecPath = absoluteArtifactPath(rootRealPath, source.path);
    if (exactField(content, 'Spec', `plan ${artifact.path}`) !== expectedSpecPath) throw workflowError(`plan ${artifact.path} Spec`, expectedSpecPath, exactField(content, 'Spec', `plan ${artifact.path}`));
    if (exactField(content, 'Spec Revision', `plan ${artifact.path}`) !== source.expectedRevision) throw workflowError(`plan ${artifact.path} Spec Revision`, source.expectedRevision, exactField(content, 'Spec Revision', `plan ${artifact.path}`));
    const foundationExpected = request.foundation === null ? {
      'Foundation Manifest': 'none',
      'Foundation Base Revision': 'none',
      'Foundation Result Revision': 'none',
      'Foundation Application Receipt': 'none',
    } : {
      'Foundation Manifest': absoluteArtifactPath(rootRealPath, request.foundation.manifestPath),
      'Foundation Base Revision': request.foundation.baseRevision,
      'Foundation Result Revision': request.foundation.resultRevision,
      'Foundation Application Receipt': absoluteArtifactPath(rootRealPath, request.foundation.receiptPath),
    };
    for (const [label, expected] of Object.entries(foundationExpected)) {
      const actual = exactField(content, label, `plan ${artifact.path}`);
      if (actual !== expected) throw workflowError(`plan ${artifact.path} ${label}`, expected, actual);
    }
  }
  return { states, outputs, history };
}

function foundationReceipt({ request, prepared, artifactGraph, nonce, appliedAt }) {
  const spec = artifactGraph.states.get(request.foundation.specPath);
  if (!spec) throw workflowError('Foundation migration spec state', 'an artifact graph state', 'missing');
  return {
    schema: 'superpowers-architecture-foundation-application-v2',
    operationNonce: nonce,
    specPath: request.foundation.specPath,
    specRevision: request.foundation.specRevision,
    manifestPath: request.foundation.manifestPath,
    baseRevision: request.foundation.baseRevision,
    resultRevision: request.foundation.resultRevision,
    appliedAt,
    policy: request.policy,
    specState: {
      status: spec.status,
      revision: spec.revision,
      approvedRevision: spec.approvedRevision,
      approvedAt: spec.approvedAt,
    },
    foundationState: prepared.state,
    actions: prepared.actions.map(({ path, action }) => ({ path, action })),
  };
}

function prepareFoundationGraph(rootRealPath, request, snapshot, artifactGraph, operation) {
  if (request.foundation === null) return null;
  const binding = request.foundation;
  const manifestSnapshot = snapshot.get(binding.manifestPath);
  if (!manifestSnapshot || manifestSnapshot.bytes === null) throw workflowError('Foundation manifest read set', 'an existing manifest snapshot', 'missing');
  const basePaths = foundationManifestPaths({ manifestPath: manifestSnapshot.target, bytes: manifestSnapshot.bytes });
  const changeByPath = new Map(request.changes.map((change) => [change.path, Buffer.from(change.content, 'utf8')]));
  const prospectiveManifestBytes = changeByPath.get(binding.manifestPath) ?? manifestSnapshot.bytes;
  const prospectivePaths = foundationManifestPaths({ manifestPath: manifestSnapshot.target, bytes: prospectiveManifestBytes });
  const allPaths = new Set([...basePaths, ...prospectivePaths]);
  for (const path of allPaths) {
    if (!snapshot.has(path)) throw workflowError(`Foundation read set ${path}`, 'an exact raw snapshot entry', 'missing');
  }
  if (!snapshot.has(binding.receiptPath) || snapshot.get(binding.receiptPath).bytes !== null) {
    throw workflowError('Foundation receipt target', 'an exact absent readSet target', snapshot.has(binding.receiptPath) ? 'already exists' : 'missing readSet entry');
  }
  const specArtifact = request.artifacts.find(({ path, artifactType }) => path === binding.specPath && artifactType === 'Design Spec');
  if (!specArtifact || specArtifact.expectedRevision !== binding.specRevision) throw workflowError('Foundation migration spec graph', `Design Spec ${binding.specPath} at ${binding.specRevision}`, specArtifact ? JSON.stringify(specArtifact) : 'missing');
  const baseRecords = basePaths.map((path) => ({ path, content: snapshot.get(path).bytes }));
  const managedChanges = request.changes
    .filter(({ path }) => allPaths.has(path))
    .map(({ path, content }) => ({ path, action: 'upsert', content: Buffer.from(content, 'utf8') }));
  const specBytes = artifactGraph.outputs.get(binding.specPath) ?? snapshot.get(binding.specPath)?.bytes;
  const prepared = prepareFoundationMigration({
    manifestPath: manifestSnapshot.target,
    baseRecords,
    changes: managedChanges,
    specBytes,
  });
  if (prepared.baseRevision !== binding.baseRevision || prepared.resultRevision !== binding.resultRevision) {
    throw workflowError('Foundation revision graph', `base ${binding.baseRevision}; result ${binding.resultRevision}`, `base ${prepared.baseRevision}; result ${prepared.resultRevision}`);
  }
  const outputs = new Map();
  for (const record of prepared.records) {
    const current = snapshot.get(record.path).bytes;
    const content = Buffer.from(record.content);
    if (!current.equals(content)) outputs.set(record.path, content);
  }
  let receipt = null;
  if (operation) {
    receipt = foundationReceipt({ request, prepared, artifactGraph, nonce: operation.nonce, appliedAt: operation.appliedAt });
    outputs.set(binding.receiptPath, Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`));
  }
  return {
    prepared,
    outputs,
    receipt,
    history: baseRecords.map((record) => ({ path: record.path, bytes: Buffer.from(record.content), mode: snapshot.get(record.path).mode, kind: 'Foundation record' })),
  };
}

function buildOperationOutputs(request, snapshot, artifactGraph, foundationGraph) {
  const byPath = new Map();
  for (const change of request.changes) {
    byPath.set(change.path, artifactGraph.outputs.get(change.path) ?? Buffer.from(change.content, 'utf8'));
  }
  if (foundationGraph) {
    for (const [path, bytes] of foundationGraph.outputs) byPath.set(path, bytes);
  }
  return [...byPath.entries()]
    .sort(([left], [right]) => Buffer.compare(Buffer.from(left), Buffer.from(right)))
    .map(([path, output]) => {
      const source = snapshot.get(path);
      if (!source) throw workflowError(`output ${path}`, 'an exact readSet snapshot', 'missing');
      return { path, target: source.target, original: source.bytes, mode: source.mode, output };
    });
}

async function validateRepository(root) {
  if (!isAbsolute(root)) throw workflowError('root', 'an absolute physical Git checkout root', root);
  const physical = await realpath(root);
  if (physical !== root) throw workflowError('root', `the exact physical root ${physical}`, root);
  const top = await gitOutput(root, ['rev-parse', '--show-toplevel'], 'checkout root');
  const topPhysical = await realpath(top);
  if (topPhysical !== physical) throw workflowError('checkout root', physical, topPhysical);
  return physical;
}

async function rejectGenericFoundationMutation(rootRealPath, request) {
  if (request.foundation !== null) return;
  const manifestRelative = 'docs/agentic/WAYFINDING.md';
  const manifestPath = join(rootRealPath, 'docs', 'agentic', 'WAYFINDING.md');
  let entry;
  try { entry = await lstat(manifestPath); }
  catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  if (!entry.isFile() || entry.isSymbolicLink()) throw workflowError('generic Foundation detection', 'a physical regular Foundation manifest or no manifest', 'wrong manifest type');
  const paths = new Set(foundationManifestPaths({ manifestPath, bytes: await readFile(manifestPath) }));
  const affected = request.changes.map(({ path }) => path).filter((path) => paths.has(path));
  if (affected.length > 0) {
    throw workflowError('generic Foundation mutation', 'a complete Foundation graph for every managed Foundation change', affected.join(', '), 'Recovery: snapshot the complete Foundation, bind the migration spec/result/receipt graph, and retry transactionally; never bypass the Foundation through generic mode.');
  }
}

async function readSnapshot(rootRealPath, readSet) {
  const snapshot = new Map();
  for (const entry of readSet) {
    const current = await readOptionalOperationFile(rootRealPath, entry.path);
    const actual = current.bytes === null ? 'none' : sha256(current.bytes);
    if (actual !== entry.sha256) {
      throw workflowError(`read set precondition ${entry.path}`, entry.sha256, actual, 'Recovery: reread the affected document, preserve external edits, rebuild and internally review the narrow migration request, then retry.');
    }
    snapshot.set(entry.path, current);
  }
  return snapshot;
}

async function writeExclusiveSynced(path, bytes, mode = 0o600) {
  const handle = await open(path, 'wx', mode & 0o777);
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function replaceJson(path, value) {
  const staged = `${path}.tmp`;
  await rm(staged, { force: true });
  await writeExclusiveSynced(staged, Buffer.from(`${JSON.stringify(value, null, 2)}\n`));
  await rename(staged, path);
}

async function writeStaged(targetPath, bytes, nonce, index, mode) {
  const stagedPath = join(dirname(targetPath), `.${basename(targetPath)}.spa-workflow-${nonce}-${String(index).padStart(4, '0')}.tmp`);
  await writeExclusiveSynced(stagedPath, bytes, mode ?? 0o644);
  return stagedPath;
}

async function readStrictOperationJson(rootRealPath, path, subject) {
  const rel = portableRelative(rootRealPath, path);
  const loaded = await regularBytes(rootRealPath, rel);
  return parseJson(loaded.bytes, subject);
}

function processIsLive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return null;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === 'EPERM') return true;
    if (error.code === 'ESRCH') return false;
    return null;
  }
}

async function withWorkflowWriterExclusion({ root, id, requestDigest }, operation) {
  const identity = createHash('sha256').update(Buffer.from(root, 'utf8')).digest('hex');
  const lockRoot = join(tmpdir(), `.spa-workflow-writer-${identity}.lock`);
  const ownerPath = join(lockRoot, 'owner.json');
  const owner = {
    schema: 'superpowers-architecture-workflow-writer-v1',
    ownerPid: process.pid,
    root,
    id,
    requestDigest,
    acquiredAt: new Date().toISOString(),
  };
  try {
    await mkdir(lockRoot, { mode: 0o700 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let existing;
    try { existing = parseJson(await readFile(ownerPath), 'checkout workflow writer'); }
    catch (readError) { throw workflowError('checkout workflow writer', 'readable exact owner evidence', readError.message, `Recovery: preserve ${lockRoot}; ownership is uncertain.`); }
    assertExactKeys(existing, ['schema', 'ownerPid', 'root', 'id', 'requestDigest', 'acquiredAt'], 'checkout workflow writer');
    const exact = existing.schema === owner.schema && existing.root === root && existing.id === id && existing.requestDigest === requestDigest;
    const live = processIsLive(existing.ownerPid);
    if (!exact || live !== false) {
      throw workflowError('checkout workflow writer', 'no live writer, or the exact demonstrably terminated retry', JSON.stringify(existing), `Recovery: wait for the active writer. Preserve ${lockRoot} when identity or liveness is uncertain.`);
    }
    const reread = parseJson(await readFile(ownerPath), 'checkout workflow writer reread');
    if (JSON.stringify(reread) !== JSON.stringify(existing)) throw workflowError('checkout workflow writer', 'stable dead-owner evidence', 'owner changed');
    await unlink(ownerPath);
    await rmdir(lockRoot);
    await mkdir(lockRoot, { mode: 0o700 });
  }
  try {
    await writeExclusiveSynced(ownerPath, Buffer.from(`${JSON.stringify(owner, null, 2)}\n`));
  } catch (error) {
    let cleanup = 'lock preserved because ownership content may exist';
    try {
      const names = await readdir(lockRoot);
      if (names.length === 0) {
        await rmdir(lockRoot);
        cleanup = 'proven-empty new lock removed';
      }
    } catch (cleanupError) {
      cleanup = `cleanup inspection failed: ${cleanupError.message}`;
    }
    throw workflowError('checkout workflow writer acquisition', 'a synced exact owner record', error.code ?? error.message, `Recovery: ${cleanup}; inspect ${lockRoot} before retrying.`);
  }
  let operationError;
  try {
    return await operation();
  } catch (error) {
    operationError = error;
    throw error;
  } finally {
    try {
      const current = parseJson(await readFile(ownerPath), 'checkout workflow writer release');
      if (JSON.stringify(current) !== JSON.stringify(owner)) throw new Error('writer owner record changed');
      await unlink(ownerPath);
      await rmdir(lockRoot);
    } catch (error) {
      const cleanup = workflowError('checkout workflow writer cleanup', `exact owner at ${lockRoot}`, error.message, `Recovery: preserve ${lockRoot}; never recursively delete unknown lock content.`);
      if (operationError) throw new AggregateError([operationError, cleanup], `${operationError.message} Workflow writer cleanup also failed: ${cleanup.message}`, { cause: operationError });
      throw cleanup;
    }
  }
}

async function releaseLock(rootRealPath, lockPath, lock) {
  const current = await readStrictOperationJson(rootRealPath, lockPath, 'operation lock');
  if (JSON.stringify(current) !== JSON.stringify(lock)) {
    throw workflowError('operation lock release', 'the exact acquired lock record', 'lock bytes changed', 'Recovery: preserve the lock and transaction; another writer may have changed operation state.');
  }
  await unlink(lockPath);
}

async function acquireLock(rootRealPath, lockPath, binding) {
  const lock = {
    schema: LOCK_SCHEMA,
    operationNonce: randomUUID(),
    ownerPid: process.pid,
    root: rootRealPath,
    id: binding.id,
    requestDigest: binding.requestDigest,
    acquiredAt: new Date().toISOString(),
  };
  try {
    await writeExclusiveSynced(lockPath, Buffer.from(`${JSON.stringify(lock, null, 2)}\n`));
    return lock;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const existing = await readStrictOperationJson(rootRealPath, lockPath, 'existing operation lock');
    assertExactKeys(existing, ['schema', 'operationNonce', 'ownerPid', 'root', 'id', 'requestDigest', 'acquiredAt'], 'existing operation lock');
    if (existing.schema !== LOCK_SCHEMA || existing.root !== rootRealPath || existing.id !== binding.id || existing.requestDigest !== binding.requestDigest) {
      throw workflowError('operation lock', 'the exact retry binding', JSON.stringify(existing), 'Recovery: preserve unknown operation state and resolve the conflicting writer before retrying.');
    }
    const live = processIsLive(existing.ownerPid);
    if (live !== false) {
      throw workflowError('operation lock owner', 'a demonstrably terminated exact writer', live ? `live PID ${existing.ownerPid}` : `uncertain PID ${existing.ownerPid}`);
    }
    return { stale: existing, replacement: lock };
  }
}

function journalOutput(entry) {
  return {
    path: entry.path,
    originalSha256: entry.original === null ? 'none' : sha256(entry.original),
    originalBase64: entry.original === null ? null : entry.original.toString('base64'),
    originalMode: entry.mode,
    outputSha256: sha256(entry.output),
    outputBase64: entry.output.toString('base64'),
  };
}

function decodeJournalOutput(entry, index) {
  assertExactKeys(entry, ['path', 'originalSha256', 'originalBase64', 'originalMode', 'outputSha256', 'outputBase64'], `journal output ${index}`);
  normalizeRelativePath(entry.path, `journal output ${index} path`);
  const original = entry.originalBase64 === null ? null : Buffer.from(entry.originalBase64, 'base64');
  const output = Buffer.from(entry.outputBase64, 'base64');
  if (entry.originalBase64 !== null && original.toString('base64') !== entry.originalBase64 || output.toString('base64') !== entry.outputBase64) {
    throw workflowError(`journal output ${entry.path}`, 'canonical base64 bytes', 'malformed base64');
  }
  if ((entry.originalMode !== null && (!Number.isSafeInteger(entry.originalMode) || entry.originalMode < 0)) || (original === null) !== (entry.originalMode === null)) {
    throw workflowError(`journal output ${entry.path} mode`, 'a nonnegative original mode exactly when original bytes exist', String(entry.originalMode));
  }
  if ((original === null ? 'none' : sha256(original)) !== entry.originalSha256 || sha256(output) !== entry.outputSha256) {
    throw workflowError(`journal output ${entry.path}`, 'matching embedded backup and output digests', 'digest mismatch', 'Recovery: preserve the corrupt transaction for inspection; do not infer original bytes.');
  }
  return { ...entry, original, output };
}

async function cleanupTransaction(transactionRoot, outputs) {
  const names = await readdir(transactionRoot);
  const expected = ['backups', 'journal.json'];
  if (JSON.stringify([...names].sort()) !== JSON.stringify(expected)) {
    throw workflowError('transaction cleanup', `only ${expected.join(', ')}`, names.join(', '), 'Recovery: preserve unexpected transaction content for inspection.');
  }
  const backupRoot = join(transactionRoot, 'backups');
  const backupNames = await readdir(backupRoot);
  const expectedBackups = outputs.filter(({ original }) => original !== null).map((_, index) => `${String(index).padStart(4, '0')}.bin`);
  if (JSON.stringify([...backupNames].sort()) !== JSON.stringify(expectedBackups)) {
    throw workflowError('transaction backup cleanup', JSON.stringify(expectedBackups), JSON.stringify(backupNames));
  }
  for (const name of backupNames) {
    const entry = await lstat(join(backupRoot, name));
    if (!entry.isFile() || entry.isSymbolicLink()) throw workflowError('transaction backup cleanup', 'physical regular backup files', `wrong type ${name}`);
    await unlink(join(backupRoot, name));
  }
  await rmdir(backupRoot);
  await unlink(join(transactionRoot, 'journal.json'));
  await rmdir(transactionRoot);
}

async function loadJournal(rootRealPath, transactionRoot, binding, { allowIncompleteBackups = false } = {}) {
  const journalPath = join(transactionRoot, 'journal.json');
  const journal = await readStrictOperationJson(rootRealPath, journalPath, 'transaction journal');
  assertExactKeys(journal, ['schema', 'operationNonce', 'root', 'id', 'requestDigest', 'state', 'readSet', 'artifacts', 'foundation', 'historyPath', 'historySha256', 'receipt', 'outputs'], 'transaction journal');
  if (journal.schema !== JOURNAL_SCHEMA || journal.root !== rootRealPath || journal.id !== binding.id || journal.requestDigest !== binding.requestDigest) {
    throw workflowError('transaction journal binding', JSON.stringify(binding), JSON.stringify(journal));
  }
  if (!Array.isArray(journal.outputs)) throw workflowError('transaction journal outputs', 'an array', typeof journal.outputs);
  const outputs = journal.outputs.map(decodeJournalOutput);
  assertSortedUnique(outputs, 'transaction output graph');
  if (binding.request && (
    JSON.stringify(journal.readSet) !== JSON.stringify(binding.request.readSet) ||
    JSON.stringify(journal.artifacts) !== JSON.stringify(binding.request.artifacts) ||
    JSON.stringify(journal.foundation) !== JSON.stringify(binding.request.foundation)
  )) {
    throw workflowError('transaction target graph', 'exact equality with the current request graph', 'journal graph mismatch');
  }
  if (journal.historyPath !== 'none') normalizeRelativePath(journal.historyPath, 'transaction history path');
  if (journal.historySha256 !== 'none' && !SHA256.test(journal.historySha256 ?? '')) throw workflowError('transaction history digest', 'none or complete sha256', journal.historySha256 ?? 'missing');
  if ((journal.foundation === null) !== (journal.receipt === null)) throw workflowError('transaction receipt graph', 'receipt exactly for a Foundation graph', JSON.stringify(journal.receipt));
  if (journal.receipt !== null) {
    const receiptOutput = outputs.find(({ path }) => path === journal.foundation.receiptPath);
    if (!receiptOutput || decodeUtf8(receiptOutput.output, 'transaction receipt output') !== `${JSON.stringify(journal.receipt, null, 2)}\n`) {
      throw workflowError('transaction receipt output', 'exact equality with the core-generated receipt descriptor', 'mismatch');
    }
  }
  const backupRoot = join(transactionRoot, 'backups');
  let backupNames = [];
  try { backupNames = await readdir(backupRoot); }
  catch (error) {
    if (error.code !== 'ENOENT' || !allowIncompleteBackups) throw error;
  }
  const expectedBackupNames = outputs.filter(({ original }) => original !== null).map((_, index) => `${String(index).padStart(4, '0')}.bin`);
  if (backupNames.some((name) => !expectedBackupNames.includes(name)) || (!allowIncompleteBackups && JSON.stringify([...backupNames].sort()) !== JSON.stringify(expectedBackupNames))) {
    throw workflowError('transaction backup set', allowIncompleteBackups ? 'a subset of exact preparing backups' : JSON.stringify(expectedBackupNames), JSON.stringify(backupNames));
  }
  let backupIndex = 0;
  for (const output of outputs) {
    if (output.original === null) continue;
    const backupName = `${String(backupIndex).padStart(4, '0')}.bin`;
    const backupPath = join(backupRoot, backupName);
    if (allowIncompleteBackups && !backupNames.includes(backupName)) {
      backupIndex += 1;
      continue;
    }
    const backup = await regularBytes(rootRealPath, portableRelative(rootRealPath, backupPath));
    if (sha256(backup.bytes) !== output.originalSha256 || !backup.bytes.equals(output.original)) {
      throw workflowError(`transaction backup ${output.path}`, output.originalSha256, sha256(backup.bytes), 'Recovery: preserve the corrupt backup and transaction; do not mutate current files.');
    }
    backupIndex += 1;
  }
  return { journal, outputs, journalPath };
}

async function cleanupPreparingTransaction(transactionRoot, loaded) {
  const names = await readdir(transactionRoot);
  if (names.some((name) => !['backups', 'journal.json'].includes(name)) || !names.includes('journal.json')) {
    throw workflowError('preparing transaction cleanup', 'journal.json and optional backups only', names.join(', '));
  }
  const backupRoot = join(transactionRoot, 'backups');
  if (names.includes('backups')) {
    const backupNames = await readdir(backupRoot);
    const expected = loaded.outputs.filter(({ original }) => original !== null).map((_, index) => `${String(index).padStart(4, '0')}.bin`);
    if (backupNames.some((name) => !expected.includes(name))) throw workflowError('preparing backup cleanup', 'only exact planned backup names', backupNames.join(', '));
    for (const name of backupNames) {
      const entry = await lstat(join(backupRoot, name));
      if (!entry.isFile() || entry.isSymbolicLink()) throw workflowError('preparing backup cleanup', 'physical regular backup files', `wrong type ${name}`);
      await unlink(join(backupRoot, name));
    }
    await rmdir(backupRoot);
  }
  await unlink(join(transactionRoot, 'journal.json'));
  await rmdir(transactionRoot);
}

async function rollbackTransaction(rootRealPath, transactionRoot, binding, replacePath) {
  const loaded = await loadJournal(rootRealPath, transactionRoot, binding);
  for (const output of loaded.outputs) {
    const current = await readOptionalOperationFile(rootRealPath, output.path);
    const currentDigest = current.bytes === null ? 'none' : sha256(current.bytes);
    if (![output.originalSha256, output.outputSha256].includes(currentDigest)) {
      throw workflowError(`rollback ownership ${output.path}`, `${output.originalSha256} or ${output.outputSha256}`, currentDigest, 'Recovery: preserve transaction evidence and the unknown external edit; do not overwrite it.');
    }
  }
  for (let index = loaded.outputs.length - 1; index >= 0; index -= 1) {
    const output = loaded.outputs[index];
    const current = await readOptionalOperationFile(rootRealPath, output.path);
    const currentDigest = current.bytes === null ? 'none' : sha256(current.bytes);
    if (currentDigest === output.originalSha256) continue;
    if (output.original === null) {
      await rm(current.target);
      continue;
    }
    const stagedPath = await writeStaged(current.target, output.original, loaded.journal.operationNonce, index, output.originalMode);
    await replacePath({ targetPath: current.target, stagedPath });
    if (output.originalMode !== null) await chmod(current.target, output.originalMode & 0o777);
  }
  for (const output of loaded.outputs) {
    const current = await readOptionalOperationFile(rootRealPath, output.path);
    const currentDigest = current.bytes === null ? 'none' : sha256(current.bytes);
    if (currentDigest !== output.originalSha256) throw workflowError(`rollback verification ${output.path}`, output.originalSha256, currentDigest);
  }
  await cleanupTransaction(transactionRoot, loaded.outputs);
}

async function recoverInterruptedTransaction(rootRealPath, transactionRoot, binding, replacePath) {
  const names = await readdir(transactionRoot);
  if (!names.includes('journal.json')) {
    if (names.length !== 0) throw workflowError('pre-journal transaction', 'an empty exact transaction directory', names.join(', '));
    await rmdir(transactionRoot);
    return;
  }
  const raw = await readStrictOperationJson(rootRealPath, join(transactionRoot, 'journal.json'), 'recovery journal state');
  if (raw.state !== 'preparing') {
    await rollbackTransaction(rootRealPath, transactionRoot, binding, replacePath);
    return;
  }
  const loaded = await loadJournal(rootRealPath, transactionRoot, binding, { allowIncompleteBackups: true });
  for (const output of loaded.outputs) {
    const current = await readOptionalOperationFile(rootRealPath, output.path);
    const currentDigest = current.bytes === null ? 'none' : sha256(current.bytes);
    if (currentDigest !== output.originalSha256) throw workflowError(`preparing ownership ${output.path}`, output.originalSha256, currentDigest, 'Recovery: preserve preparation evidence; authoritative bytes changed before the transaction was prepared.');
  }
  await cleanupPreparingTransaction(transactionRoot, loaded);
}

async function pathExists(path) {
  try { await lstat(path); return true; }
  catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function finalizeCompletedState(rootRealPath, lockPath, transactionRoot, binding) {
  const lockExists = await pathExists(lockPath);
  const transactionExists = await pathExists(transactionRoot);
  if (!lockExists && !transactionExists) return;
  if (!lockExists || !transactionExists) {
    if (lockExists && !transactionExists) {
      const lock = await readStrictOperationJson(rootRealPath, lockPath, 'terminal operation lock');
      const live = processIsLive(lock.ownerPid);
      if (lock.schema === LOCK_SCHEMA && lock.root === rootRealPath && lock.id === binding.id && lock.requestDigest === binding.requestDigest && live === false) {
        await releaseLock(rootRealPath, lockPath, lock);
        return;
      }
    }
    throw workflowError('terminal operation state', 'matching lock and transaction or a lone exact dead lock', `lock ${lockExists}; transaction ${transactionExists}`, 'Recovery: preserve incomplete operation state; do not infer ownership.');
  }
  const lock = await readStrictOperationJson(rootRealPath, lockPath, 'terminal operation lock');
  assertExactKeys(lock, ['schema', 'operationNonce', 'ownerPid', 'root', 'id', 'requestDigest', 'acquiredAt'], 'terminal operation lock');
  if (lock.schema !== LOCK_SCHEMA || lock.root !== rootRealPath || lock.id !== binding.id || lock.requestDigest !== binding.requestDigest || processIsLive(lock.ownerPid) !== false) {
    throw workflowError('terminal operation lock', 'the exact demonstrably terminated writer', JSON.stringify(lock));
  }
  const loaded = await loadJournal(rootRealPath, transactionRoot, binding);
  for (const output of loaded.outputs) {
    const current = await regularBytes(rootRealPath, output.path);
    if (sha256(current.bytes) !== output.outputSha256) throw workflowError(`terminal output ${output.path}`, output.outputSha256, sha256(current.bytes));
  }
  await cleanupTransaction(transactionRoot, loaded.outputs);
  await releaseLock(rootRealPath, lockPath, lock);
}

async function completedResult(rootRealPath, resultPath, requestDigest) {
  const relativePath = portableRelative(rootRealPath, resultPath);
  const resultFile = await readOptionalOperationFile(rootRealPath, relativePath);
  if (resultFile.bytes === null) return null;
  const result = parseJson(resultFile.bytes, 'completion result');
  assertExactKeys(result, ['schema', 'id', 'root', 'branch', 'policy', 'requestDigest', 'appliedAt', 'status', 'outputs', 'artifacts', 'foundation', 'historyPath', 'historySha256'], 'completion result');
  if (result.schema !== RESULT_SCHEMA || result.requestDigest !== requestDigest || result.root !== rootRealPath) {
    throw workflowError('completion result binding', `schema ${RESULT_SCHEMA}, request ${requestDigest}, root ${rootRealPath}`, JSON.stringify(result));
  }
  if (!Array.isArray(result.outputs)) throw workflowError('completion outputs', 'an array', typeof result.outputs);
  for (const [index, output] of result.outputs.entries()) {
    assertExactKeys(output, ['path', 'sha256'], `completion output ${index}`);
    const current = await regularBytes(rootRealPath, normalizeRelativePath(output.path, `completion output ${index} path`));
    if (sha256(current.bytes) !== output.sha256) {
      throw workflowError(`completion output ${output.path}`, output.sha256, sha256(current.bytes), 'Recovery: preserve the result and inspect post-migration drift before issuing a successor request.');
    }
  }
  await validateHistory(rootRealPath, result, requestDigest);
  return { ...result, status: 'already-complete' };
}

async function validateHistory(rootRealPath, result, requestDigest) {
  if (result.historyPath === 'none') {
    if (result.historySha256 !== 'none') throw workflowError('completion history digest', 'none with no history', result.historySha256 ?? 'missing');
    return;
  }
  if (!SHA256.test(result.historySha256 ?? '')) throw workflowError('completion history digest', 'a complete sha256 manifest binding', result.historySha256 ?? 'missing');
  normalizeRelativePath(result.historyPath, 'completion history path');
  const expected = `${OPERATION_PREFIX}${result.id}/history/${requestDigest.slice('sha256:'.length)}`;
  if (result.historyPath !== expected) throw workflowError('completion history path', expected, result.historyPath);
  const historyRoot = join(rootRealPath, ...result.historyPath.split('/'));
  const manifestPath = join(historyRoot, 'manifest.json');
  const manifestFile = await regularBytes(rootRealPath, portableRelative(rootRealPath, manifestPath));
  if (sha256(manifestFile.bytes) !== result.historySha256) throw workflowError('history manifest terminal binding', result.historySha256, sha256(manifestFile.bytes));
  const manifest = parseJson(manifestFile.bytes, 'history manifest');
  assertExactKeys(manifest, ['schema', 'root', 'requestDigest', 'entries'], 'history manifest');
  if (manifest.schema !== 'superpowers-architecture-workflow-migration-history-v1' || manifest.root !== rootRealPath || manifest.requestDigest !== requestDigest || !Array.isArray(manifest.entries)) {
    throw workflowError('history manifest binding', `root ${rootRealPath} and request ${requestDigest}`, JSON.stringify(manifest));
  }
  const expectedNames = ['manifest.json'];
  const seen = new Set();
  for (const [index, entry] of manifest.entries.entries()) {
    assertExactKeys(entry, ['path', 'kind', 'sha256', 'mode', 'file'], `history entry ${index}`);
    normalizeRelativePath(entry.path, `history entry ${index} path`);
    const expectedFile = `${String(index).padStart(4, '0')}.bin`;
    if (entry.file !== expectedFile || !SHA256.test(entry.sha256 ?? '') || !Number.isSafeInteger(entry.mode) || entry.mode < 0 || seen.has(entry.path)) {
      throw workflowError(`history entry ${index}`, `unique path, file ${expectedFile}, digest, and mode`, JSON.stringify(entry));
    }
    seen.add(entry.path);
    expectedNames.push(entry.file);
    const loaded = await regularBytes(rootRealPath, `${result.historyPath}/${entry.file}`);
    if (sha256(loaded.bytes) !== entry.sha256) throw workflowError(`history entry ${entry.path}`, entry.sha256, sha256(loaded.bytes));
  }
  const names = (await readdir(historyRoot)).sort();
  if (JSON.stringify(names) !== JSON.stringify(expectedNames.sort())) throw workflowError('history immutable contents', JSON.stringify(expectedNames.sort()), JSON.stringify(names));
}

async function prepareTransaction(transactionRoot, binding, outputs, graph) {
  await mkdir(transactionRoot);
  const journal = {
    schema: JOURNAL_SCHEMA,
    operationNonce: binding.operationNonce,
    root: binding.root,
    id: binding.id,
    requestDigest: binding.requestDigest,
    state: 'preparing',
    readSet: graph.readSet,
    artifacts: graph.artifacts,
    foundation: graph.foundation,
    historyPath: graph.historyPath,
    historySha256: graph.historySha256,
    receipt: graph.receipt,
    outputs: outputs.map(journalOutput),
  };
  try {
    await writeExclusiveSynced(join(transactionRoot, 'journal.json'), Buffer.from(`${JSON.stringify(journal, null, 2)}\n`));
    const backupRoot = join(transactionRoot, 'backups');
    await mkdir(backupRoot);
    let backupIndex = 0;
    for (const output of outputs) {
      if (output.original === null) continue;
      await writeExclusiveSynced(join(backupRoot, `${String(backupIndex).padStart(4, '0')}.bin`), output.original);
      backupIndex += 1;
    }
    journal.state = 'prepared';
    await replaceJson(join(transactionRoot, 'journal.json'), journal);
    return journal;
  } catch (error) {
    try {
      if (await pathExists(join(transactionRoot, 'journal.json'))) {
        const loaded = await loadJournal(binding.root, transactionRoot, binding, { allowIncompleteBackups: true });
        await cleanupPreparingTransaction(transactionRoot, loaded);
      } else {
        const names = await readdir(transactionRoot);
        if (names.length !== 0) throw workflowError('pre-journal cleanup', 'an empty exact transaction directory', names.join(', '));
        await rmdir(transactionRoot);
      }
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], `${error.message} Preparing-transaction cleanup also failed: ${cleanupError.message}`, { cause: error });
    }
    throw error;
  }
}

async function persistHistory(operationRoot, rootRealPath, requestDigest, entries) {
  if (entries.length === 0) return { path: 'none', sha256: 'none' };
  const historyRoot = join(operationRoot, 'history');
  try {
    await mkdir(historyRoot);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const existing = await lstat(historyRoot);
    if (!existing.isDirectory() || existing.isSymbolicLink()) throw workflowError('history root', 'an operation-owned physical directory', 'wrong type');
  }
  const identity = requestDigest.slice('sha256:'.length);
  const revisionRoot = join(historyRoot, identity);
  try {
    await mkdir(revisionRoot);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const existing = await lstat(revisionRoot);
    if (!existing.isDirectory() || existing.isSymbolicLink()) throw workflowError('history revision', 'an operation-owned physical directory', 'wrong type');
  }
  const records = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const file = `${String(index).padStart(4, '0')}.bin`;
    const path = join(revisionRoot, file);
    try {
      await writeExclusiveSynced(path, entry.bytes);
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const current = await regularBytes(rootRealPath, portableRelative(rootRealPath, path));
      if (!current.bytes.equals(entry.bytes)) throw workflowError(`history ${entry.path}`, sha256(entry.bytes), sha256(current.bytes), 'Recovery: preserve conflicting immutable history and issue a successor migration identity.');
    }
    records.push({ path: entry.path, kind: entry.kind, sha256: sha256(entry.bytes), mode: entry.mode, file });
  }
  const manifest = {
    schema: 'superpowers-architecture-workflow-migration-history-v1',
    root: rootRealPath,
    requestDigest,
    entries: records,
  };
  const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  const manifestPath = join(revisionRoot, 'manifest.json');
  try {
    await writeExclusiveSynced(manifestPath, manifestBytes);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const current = await regularBytes(rootRealPath, portableRelative(rootRealPath, manifestPath));
    if (!current.bytes.equals(manifestBytes)) throw workflowError('history manifest', sha256(manifestBytes), sha256(current.bytes));
  }
  const names = (await readdir(revisionRoot)).sort();
  const expected = [...records.map(({ file }) => file), 'manifest.json'].sort();
  if (JSON.stringify(names) !== JSON.stringify(expected)) throw workflowError('history contents', JSON.stringify(expected), JSON.stringify(names), 'Recovery: preserve unexpected immutable history content for inspection.');
  return { path: portableRelative(rootRealPath, revisionRoot), sha256: sha256(manifestBytes) };
}

async function migrateUnlocked({ root, requestPath, policy }, adapters) {
  const rootRealPath = await validateRepository(root);
  if (!isAbsolute(requestPath)) throw workflowError('request path', 'an absolute physical request.json path', requestPath);
  const requestPhysical = await realpath(requestPath);
  if (requestPhysical !== requestPath || !contained(rootRealPath, requestPhysical)) {
    throw workflowError('request path', 'the exact physical request inside the checkout', requestPath);
  }
  const requestBytes = await readFile(requestPhysical);
  const requestDigest = sha256(requestBytes);
  const request = parseJson(requestBytes, 'request JSON');
  const effectivePolicy = resolveApprovalPolicy(policy);
  validateRequest(request, rootRealPath, effectivePolicy);
  await rejectGenericFoundationMutation(rootRealPath, request);
  const expectedRequestRelative = `${OPERATION_PREFIX}${request.id}/request.json`;
  const requestRelative = portableRelative(rootRealPath, requestPhysical);
  if (requestRelative !== expectedRequestRelative) {
    throw workflowError('request location', expectedRequestRelative, requestRelative);
  }
  const operationRoot = dirname(requestPhysical);
  const lockPath = join(operationRoot, 'LOCK.json');
  const transactionRoot = join(operationRoot, '.transaction');
  const resultPath = join(operationRoot, 'RESULT.json');
  const replacePath = adapters.replacePath ?? (async ({ targetPath, stagedPath }) => rename(stagedPath, targetPath));
  for (const path of [requestRelative, portableRelative(rootRealPath, lockPath), portableRelative(rootRealPath, join(transactionRoot, 'journal.json')), portableRelative(rootRealPath, resultPath), portableRelative(rootRealPath, join(operationRoot, 'history'))]) {
    await assertIgnored(rootRealPath, path);
  }
  const branch = await gitOutput(rootRealPath, ['branch', '--show-current'], 'current branch');
  if (branch !== request.branch) throw workflowError('branch binding', request.branch, branch || 'detached HEAD');
  const completed = await completedResult(rootRealPath, resultPath, requestDigest);
  if (completed) {
    await finalizeCompletedState(rootRealPath, lockPath, transactionRoot, { root: rootRealPath, id: request.id, requestDigest, request });
    return completed;
  }

  if (await pathExists(lockPath)) {
    const stale = await acquireLock(rootRealPath, lockPath, { id: request.id, requestDigest });
    if (!stale.stale) throw workflowError('operation recovery', 'an existing lock result', 'unexpected new lock');
    try {
      if (await pathExists(transactionRoot)) {
        await recoverInterruptedTransaction(rootRealPath, transactionRoot, { root: rootRealPath, id: request.id, requestDigest, request }, replacePath);
      }
      await releaseLock(rootRealPath, lockPath, stale.stale);
    } catch (error) {
      throw workflowError('dead-writer recovery', 'an exact recoverable transaction', error.message, 'Recovery: preserve the lock and transaction evidence; repair corrupt or unknown state before retrying.');
    }
  } else if (await pathExists(transactionRoot)) {
    throw workflowError('operation recovery', 'a transaction accompanied by its exact lock', 'transaction without lock', 'Recovery: preserve the orphaned transaction for inspection; do not infer ownership.');
  }

  const snapshot = await readSnapshot(rootRealPath, request.readSet);
  const readPaths = new Set(request.readSet.map(({ path }) => path));
  const changePaths = new Set(request.changes.map(({ path }) => path));
  if (!changePaths.has(request.policyOwner)) throw workflowError('policy owner', 'an explicit reviewed change', request.policyOwner);
  for (const change of request.changes) {
    if (!readPaths.has(change.path)) throw workflowError(`change ${change.path}`, 'an exact readSet precondition', 'missing');
  }
  const owner = request.changes.find(({ path }) => path === request.policyOwner).content;
  if (!/^Workflow Policy Version:\s*2\s*$/m.test(owner) || !/^Approval Policy:\s*Autonomous\s*$/m.test(owner)) {
    throw workflowError('policy owner content', 'Workflow Policy Version: 2 and Approval Policy: Autonomous', 'missing exact markers');
  }
  const artifactGraph = await prepareArtifactGraph(rootRealPath, request, snapshot);
  const foundationGraph = prepareFoundationGraph(rootRealPath, request, snapshot, artifactGraph, null);
  let outputs = buildOperationOutputs(request, snapshot, artifactGraph, foundationGraph);
  if (request.foundation === null && outputs.every((entry) => entry.original !== null && entry.original.equals(entry.output))) {
    return { schema: RESULT_SCHEMA, id: request.id, root: rootRealPath, branch, policy: effectivePolicy, requestDigest, status: 'unchanged', outputs: [], artifacts: [], foundation: null, historyPath: 'none', historySha256: 'none' };
  }

  let lock = await acquireLock(rootRealPath, lockPath, { id: request.id, requestDigest });
  if (lock.stale) {
    try {
      if (await pathExists(transactionRoot)) {
        await recoverInterruptedTransaction(rootRealPath, transactionRoot, { root: rootRealPath, id: request.id, requestDigest, request }, replacePath);
      }
      await releaseLock(rootRealPath, lockPath, lock.stale);
    } catch (error) {
      throw workflowError('dead-writer recovery', 'an exact recoverable transaction', error.message, 'Recovery: preserve the lock and transaction evidence; repair corrupt or unknown state before retrying.');
    }
    lock = await acquireLock(rootRealPath, lockPath, { id: request.id, requestDigest });
  }
  let journal;
  let terminalResult;
  let resultInstalled = false;
  try {
    const lockedSnapshot = await readSnapshot(rootRealPath, request.readSet);
    const lockedArtifactGraph = await prepareArtifactGraph(rootRealPath, request, lockedSnapshot);
    const appliedAt = new Date().toISOString();
    const lockedFoundationGraph = prepareFoundationGraph(rootRealPath, request, lockedSnapshot, lockedArtifactGraph, { nonce: lock.operationNonce, appliedAt });
    const lockedOutputs = buildOperationOutputs(request, lockedSnapshot, lockedArtifactGraph, lockedFoundationGraph);
    const comparableLocked = lockedOutputs.filter(({ path }) => path !== request.foundation?.receiptPath);
    if (comparableLocked.length !== outputs.length) throw workflowError('locked output graph', `${outputs.length} prevalidated outputs`, `${comparableLocked.length} outputs`);
    for (let index = 0; index < outputs.length; index += 1) {
      if (outputs[index].path !== comparableLocked[index].path || !outputs[index].output.equals(comparableLocked[index].output)) {
        throw workflowError(`locked output ${outputs[index].path}`, sha256(outputs[index].output), comparableLocked[index] ? sha256(comparableLocked[index].output) : 'missing');
      }
    }
    outputs = lockedOutputs;
    const history = await persistHistory(operationRoot, rootRealPath, requestDigest, [...lockedArtifactGraph.history, ...(lockedFoundationGraph?.history ?? [])]);
    journal = await prepareTransaction(
      transactionRoot,
      { operationNonce: lock.operationNonce, root: rootRealPath, id: request.id, requestDigest },
      outputs,
      {
        readSet: request.readSet,
        artifacts: request.artifacts,
        foundation: request.foundation,
        historyPath: history.path,
        historySha256: history.sha256,
        receipt: lockedFoundationGraph?.receipt ?? null,
      },
    );
    for (let index = 0; index < outputs.length; index += 1) {
      journal.state = `replacing:${index}:${outputs[index].path}`;
      await replaceJson(join(transactionRoot, 'journal.json'), journal);
      const stagedPath = await writeStaged(outputs[index].target, outputs[index].output, lock.operationNonce, index, outputs[index].mode);
      await replacePath({ targetPath: outputs[index].target, stagedPath });
      if (outputs[index].mode !== null) await chmod(outputs[index].target, outputs[index].mode & 0o777);
    }
    for (const output of outputs) {
      const current = await regularBytes(rootRealPath, output.path);
      if (sha256(current.bytes) !== sha256(output.output)) throw workflowError(`applied output ${output.path}`, sha256(output.output), sha256(current.bytes));
    }
    let foundationResult = null;
    if (request.foundation !== null) {
      const validated = await validateApprovedFoundation({
        root: rootRealPath,
        manifestPath: join(rootRealPath, ...request.foundation.manifestPath.split('/')),
        expectedRevision: request.foundation.resultRevision,
        receiptPath: join(rootRealPath, ...request.foundation.receiptPath.split('/')),
        specPath: join(rootRealPath, ...request.foundation.specPath.split('/')),
        expectedSpecRevision: request.foundation.specRevision,
        expectedBaseRevision: request.foundation.baseRevision,
        policy: request.policy,
      });
      foundationResult = {
        manifestPath: request.foundation.manifestPath,
        baseRevision: request.foundation.baseRevision,
        resultRevision: request.foundation.resultRevision,
        specPath: request.foundation.specPath,
        specRevision: request.foundation.specRevision,
        receiptPath: request.foundation.receiptPath,
        status: validated.status,
        approvedRevision: validated.approvedRevision,
        approvedAt: validated.approvedAt,
      };
    }
    terminalResult = {
      schema: RESULT_SCHEMA,
      id: request.id,
      root: rootRealPath,
      branch,
      policy: effectivePolicy,
      requestDigest,
      appliedAt,
      status: 'applied',
      outputs: outputs.map((output) => ({ path: output.path, sha256: sha256(output.output) })),
      artifacts: request.artifacts.map((artifact) => {
        const state = lockedArtifactGraph.states.get(artifact.path);
        return {
          path: artifact.path,
          artifactType: artifact.artifactType,
          status: state.status,
          revision: state.revision,
          approvedRevision: state.approvedRevision,
          approvedAt: state.approvedAt,
        };
      }),
      foundation: foundationResult,
      historyPath: history.path,
      historySha256: history.sha256,
    };
    await writeExclusiveSynced(resultPath, Buffer.from(`${JSON.stringify(terminalResult, null, 2)}\n`));
    resultInstalled = true;
    await cleanupTransaction(transactionRoot, outputs.map((output) => ({ ...journalOutput(output), original: output.original, output: output.output })));
    await releaseLock(rootRealPath, lockPath, lock);
    return terminalResult;
  } catch (operationError) {
    if (resultInstalled) {
      try {
        for (const output of outputs) {
          const current = await regularBytes(rootRealPath, output.path);
          if (sha256(current.bytes) !== sha256(output.output)) throw workflowError(`terminal recovery output ${output.path}`, sha256(output.output), sha256(current.bytes));
        }
        await validateHistory(rootRealPath, terminalResult, requestDigest);
        if (await pathExists(transactionRoot)) {
          const loaded = await loadJournal(rootRealPath, transactionRoot, { root: rootRealPath, id: request.id, requestDigest, request });
          await cleanupTransaction(transactionRoot, loaded.outputs);
        }
        if (await pathExists(lockPath)) await releaseLock(rootRealPath, lockPath, lock);
        throw new Error(`Workflow migration reported a post-result failure: ${operationError.message} Terminal recovery preserved the exact applied result and cleaned its operation state.`, { cause: operationError });
      } catch (terminalError) {
        if (terminalError.cause === operationError) throw terminalError;
        throw new Error(`Workflow migration installed RESULT.json but terminal recovery failed after: ${operationError.message}. ${terminalError.message} Preserve ${resultPath}, ${transactionRoot}, and ${lockPath}; do not roll back the terminal outputs.`, { cause: operationError });
      }
    }
    try {
      if (journal) await rollbackTransaction(rootRealPath, transactionRoot, { root: rootRealPath, id: request.id, requestDigest, request }, replacePath);
      await releaseLock(rootRealPath, lockPath, lock);
      throw new Error(`Workflow migration failed: ${operationError.message} Rollback succeeded; exact original bytes were restored.`, { cause: operationError });
    } catch (rollbackError) {
      if (rollbackError.cause === operationError) throw rollbackError;
      throw new Error(`Workflow migration failed: ${operationError.message} Rollback failed: ${rollbackError.message}. Preserve ${transactionRoot} and ${lockPath}.`, { cause: operationError });
    }
  }
}

export async function migrateWorkflow(args, adapters = {}) {
  const adapterKeys = Object.keys(adapters);
  if (adapterKeys.some((key) => key !== 'replacePath') || (adapters.replacePath !== undefined && typeof adapters.replacePath !== 'function')) {
    throw workflowError('test adapter', 'only an optional replacePath function', JSON.stringify(adapterKeys));
  }
  const rootRealPath = await validateRepository(args.root);
  if (!isAbsolute(args.requestPath)) throw workflowError('request path', 'an absolute physical request.json path', args.requestPath);
  const requestPhysical = await realpath(args.requestPath);
  if (!contained(rootRealPath, requestPhysical)) throw workflowError('request path', 'containment by the checkout root', requestPhysical);
  const requestBytes = await readFile(requestPhysical);
  const request = parseJson(requestBytes, 'request JSON');
  const policy = resolveApprovalPolicy(args.policy);
  validateRequest(request, rootRealPath, policy);
  const requestRelative = portableRelative(rootRealPath, requestPhysical);
  const expectedRequestRelative = `${OPERATION_PREFIX}${request.id}/request.json`;
  if (requestRelative !== expectedRequestRelative) throw workflowError('request location', expectedRequestRelative, requestRelative);
  const operationRoot = dirname(requestPhysical);
  for (const path of [requestRelative, portableRelative(rootRealPath, join(operationRoot, 'LOCK.json')), portableRelative(rootRealPath, join(operationRoot, '.transaction', 'journal.json')), portableRelative(rootRealPath, join(operationRoot, 'RESULT.json')), portableRelative(rootRealPath, join(operationRoot, 'history'))]) {
    await assertIgnored(rootRealPath, path);
  }
  const requestDigest = sha256(requestBytes);
  return withWorkflowWriterExclusion({ root: rootRealPath, id: request.id, requestDigest }, () => {
    if (request.foundation === null) return migrateUnlocked(args, adapters);
    return withFoundationWriterExclusion({
      root: rootRealPath,
      manifestPath: join(rootRealPath, ...request.foundation.manifestPath.split('/')),
      id: request.id,
      requestDigest,
    }, () => migrateUnlocked(args, adapters));
  });
}
