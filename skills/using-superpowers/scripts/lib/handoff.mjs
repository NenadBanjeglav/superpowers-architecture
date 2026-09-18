import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { readValidatedArtifactSnapshot } from './artifacts.mjs';
import { physicalFile, exactField, maskMarkdownFences, validateImplementationBinding } from './bindings.mjs';
import { resolveApprovalPolicy } from './policy.mjs';

const REVISION = /^sha256:[0-9a-f]{64}$/;
const V2_SCHEMA = 'superpowers-architecture-phase-handoff-v2';
const V2_ENVELOPE_KEYS = Object.freeze([
  'schema',
  'policy',
  'goal',
  'constraintSourcePath',
  'constraintSourceRevision',
  'record',
  'foundationApplicationReceipt',
  'selectedRoadmapOutcome',
  'canonicalBrainstormingPrompt',
]);
const V2_RECORD_KEYS = Object.freeze([
  'phase',
  'repositoryRemote',
  'checkoutRoot',
  'branch',
  'worktreeIdentity',
  'artifactPath',
  'artifactType',
  'artifactRevision',
  'sourceSpecPath',
  'sourceSpecRevision',
  'foundationManifestPath',
  'foundationRevision',
  'pluginSource',
  'pluginRoot',
  'workspacePolicy',
]);
const V1_RECORD_KEYS = Object.freeze(V2_RECORD_KEYS.map((key) => key === 'artifactRevision' ? 'approvedRevision' : key));
const PHASE_ARTIFACTS = Object.freeze({
  brainstorming: 'Agentic Foundation',
  planning: 'Design Spec',
  implementation: 'Implementation Plan',
});
const PLUGIN_SOURCES = new Set(['installed', 'local-plugin-dir']);
const WORKTREE_IDENTITIES = new Set(['main-checkout', 'linked-worktree', 'codex-managed-worktree', 'detached']);

function fail(message) {
  throw new Error(`Phase handoff: ${message}`);
}

function normalizeLf(text) {
  return text.replace(/\r\n?/g, '\n');
}

function runGit(root, args, label = args.join(' '), { allowFailure = false } = {}) {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true });
  if (result.error) fail(`unable to run git for ${label}: ${result.error.message}.`);
  if (result.status !== 0) {
    if (allowFailure) return null;
    const detail = normalizeLf(result.stderr || result.stdout || '').trim();
    fail(`${label} failed${detail ? `: ${detail}` : '.'}`);
  }
  return normalizeLf(result.stdout).trim();
}

function assertExactKeys(value, keys, subject) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${subject} must be an object.`);
  const actual = Object.keys(value);
  if (actual.length !== keys.length || actual.some((key, index) => key !== keys[index])) {
    fail(`${subject} must contain exactly these fields in this order: ${keys.join(', ')}; received ${actual.join(', ') || 'none'}.`);
  }
}

function assertRevision(value, subject) {
  if (!REVISION.test(value ?? '')) fail(`${subject} must be a complete lowercase sha256 revision.`);
}

function assertBoundedText(value, subject, { max = 4000, allowNone = false } = {}) {
  if (allowNone && value === 'none') return;
  if (typeof value !== 'string' || value.length === 0 || value.length > max || value.includes('\0') || value.trim() !== value) {
    fail(`${subject} must be a nonempty, trimmed string no longer than ${max} characters.`);
  }
}

function inside(root, path) {
  const rel = relative(root, path);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`));
}

async function physicalDirectory(path, subject) {
  if (typeof path !== 'string' || !isAbsolute(path)) fail(`${subject} must be an absolute path.`);
  try {
    const physical = await realpath(path);
    if (!(await stat(physical)).isDirectory()) fail(`${subject} is not a directory: ${path}.`);
    if (physical !== resolve(path)) fail(`${subject} must use its physical path; received ${path}, resolved ${physical}.`);
    return physical;
  } catch (error) {
    if (error.message?.startsWith('Phase handoff:')) throw error;
    fail(`${subject} is not a readable physical directory at ${path}: ${error.code ?? error.message}.`);
  }
}

async function requireIgnored(root, path, subject) {
  const relativePath = relative(root, path).replaceAll('\\', '/');
  if (relativePath === 'docs/superpowers' || relativePath.startsWith('docs/superpowers/')) {
    const ignored = runGit(root, ['check-ignore', '--quiet', '--no-index', '--', path], `${subject} ignore check`, { allowFailure: true });
    if (ignored === null) fail(`${subject} under docs/superpowers must be ignored in the exact checkout: ${path}.`);
  }
}

function rawRevision(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function envelopeRevision(envelope) {
  return rawRevision(Buffer.from(`${JSON.stringify(envelope)}\n`, 'utf8'));
}

async function checkoutEvidence(root, record) {
  const physicalRoot = await physicalDirectory(root, 'checkout root');
  const gitRoot = await realpath(runGit(physicalRoot, ['rev-parse', '--show-toplevel'], 'checkout root resolution'));
  if (gitRoot !== physicalRoot) fail(`requested root ${physicalRoot} is not the repository checkout root ${gitRoot}.`);
  if (record.checkoutRoot !== physicalRoot) fail(`record checkoutRoot ${record.checkoutRoot} differs from physical checkout ${physicalRoot}.`);

  const remote = runGit(physicalRoot, ['remote', 'get-url', 'origin'], 'canonical origin remote');
  if (record.repositoryRemote !== remote) fail(`record repository remote ${record.repositoryRemote} differs from checkout remote ${remote}.`);

  const currentBranch = runGit(physicalRoot, ['branch', '--show-current'], 'current branch');
  const detached = currentBranch === '';
  const branch = detached ? runGit(physicalRoot, ['rev-parse', 'HEAD'], 'detached commit') : currentBranch;
  if (record.branch !== branch) fail(`record branch ${record.branch} differs from checkout branch or detached commit ${branch}.`);

  const gitDir = await realpath(resolve(physicalRoot, runGit(physicalRoot, ['rev-parse', '--git-dir'], 'git directory')));
  const commonDir = await realpath(resolve(physicalRoot, runGit(physicalRoot, ['rev-parse', '--git-common-dir'], 'git common directory')));
  const mechanicallyObserved = detached ? 'detached' : (gitDir === commonDir ? 'main-checkout' : 'linked-worktree');
  if (record.worktreeIdentity === 'codex-managed-worktree') {
    if (detached || gitDir === commonDir) fail('codex-managed-worktree requires a mechanically observed linked worktree plus host evidence.');
  } else if (record.worktreeIdentity !== mechanicallyObserved) {
    fail(`record worktree identity ${record.worktreeIdentity} differs from mechanically observed ${mechanicallyObserved}.`);
  }
  return { physicalRoot, remote, branch, worktreeIdentity: record.worktreeIdentity };
}

function validateRecordShape(record, revisionField) {
  if (!Object.hasOwn(PHASE_ARTIFACTS, record.phase)) fail(`unsupported phase ${JSON.stringify(record.phase)}.`);
  if (record.artifactType !== PHASE_ARTIFACTS[record.phase]) {
    fail(`${record.phase} requires artifactType ${PHASE_ARTIFACTS[record.phase]}; received ${record.artifactType}.`);
  }
  assertRevision(record[revisionField], revisionField);
  if (record.workspacePolicy !== 'same-checkout') fail('workspacePolicy must be same-checkout.');
  if (!WORKTREE_IDENTITIES.has(record.worktreeIdentity)) fail(`unsupported worktreeIdentity ${record.worktreeIdentity}.`);
  if (!PLUGIN_SOURCES.has(record.pluginSource)) {
    fail(`unsupported pluginSource ${record.pluginSource}. Install the complete Codex plugin, then prepare a new handoff using installed or local-plugin-dir; do not rewrite an existing envelope.`);
  }
  const sourceNone = record.sourceSpecPath === 'none' && record.sourceSpecRevision === 'none';
  const sourceBoth = record.sourceSpecPath !== 'none' && record.sourceSpecRevision !== 'none';
  if (!sourceNone && !sourceBoth) fail('source-spec path and revision must be both none or both exact values.');
  if (record.phase === 'implementation' && !sourceBoth) fail('implementation requires the exact source Design Spec pair.');
  if (record.phase !== 'implementation' && !sourceNone) fail(`${record.phase} must use none for the separate source Design Spec pair.`);
  const foundationNone = record.foundationManifestPath === 'none' && record.foundationRevision === 'none';
  const foundationBoth = record.foundationManifestPath !== 'none' && record.foundationRevision !== 'none';
  if (!foundationNone && !foundationBoth) fail('Foundation manifest and revision pair must be both none or both exact values.');
  if (foundationBoth) assertRevision(record.foundationRevision, 'foundationRevision');
  if (record.phase === 'brainstorming' && !foundationBoth) fail('brainstorming requires the phase artifact to be the Agentic Foundation.');
  return { sourceBoth, foundationBoth };
}

async function validatePlugin(record, hostEvidenceRequired) {
  if (record.pluginSource === 'installed') {
    if (record.pluginRoot !== 'none') fail('installed pluginSource requires pluginRoot none; the host inventory owns its physical path.');
    hostEvidenceRequired.add('plugin-inventory');
    return;
  }
  if (record.pluginRoot === 'none') fail(`${record.pluginSource} requires an absolute pluginRoot.`);
  const root = await physicalDirectory(record.pluginRoot, 'pluginRoot');
  await physicalFile(join(root, '.codex-plugin', 'plugin.json'), root, 'local plugin manifest');
  await physicalFile(join(root, 'skills', 'using-superpowers', 'SKILL.md'), root, 'local shared using-superpowers skill');
  await physicalFile(join(root, 'skills', 'using-superpowers', 'scripts', 'spa.mjs'), root, 'local shared operation entry point');
  hostEvidenceRequired.add('local-plugin-runtime-binding');
}

async function readUtf8(path, subject) {
  try {
    return normalizeLf(await readFile(path, 'utf8'));
  } catch (error) {
    fail(`unable to read ${subject} ${path}: ${error.message}.`);
  }
}

async function validateRoadmapBindings(record, envelope) {
  if (record.phase !== 'brainstorming') {
    if (envelope.selectedRoadmapOutcome !== 'none' || envelope.canonicalBrainstormingPrompt !== 'none') {
      fail(`${record.phase} must use none for Brainstorming outcome and prompt bindings.`);
    }
    return;
  }
  if (envelope.foundationApplicationReceipt !== 'none') fail('Brainstorming requires Foundation Application Receipt none.');
  if (!/^OUT-[0-9]{3,}$/.test(envelope.selectedRoadmapOutcome)) fail('Brainstorming requires a selected OUT-NNN roadmap identity.');
  assertBoundedText(envelope.canonicalBrainstormingPrompt, 'canonicalBrainstormingPrompt', { max: 4000 });
  const roadmapPath = join(dirname(record.foundationManifestPath), 'ROADMAP.md');
  await physicalFile(roadmapPath, record.checkoutRoot, 'Foundation ROADMAP.md');
  const roadmap = await readUtf8(roadmapPath, 'Foundation ROADMAP.md');
  const escaped = envelope.selectedRoadmapOutcome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const heading = new RegExp(`^### ${escaped}:[^\\n]*$`, 'm').exec(roadmap);
  if (!heading) fail(`selected roadmap outcome ${envelope.selectedRoadmapOutcome} is absent from ${roadmapPath}.`);
  const afterHeading = heading.index + heading[0].length;
  const remaining = roadmap.slice(afterHeading);
  const nextHeading = /^### OUT-[0-9]+:/m.exec(remaining);
  const section = nextHeading ? remaining.slice(0, nextHeading.index) : remaining;
  if (!/^\*\*Readiness:\*\*[ \t]*Ready for Brainstorming[ \t]*$/m.test(section)) fail(`selected roadmap outcome ${envelope.selectedRoadmapOutcome} is not Ready for Brainstorming.`);
  const promptMatch = section.match(/^\*\*Brainstorming Prompt:\*\*[ \t]*(.*(?:\n(?!\*\*[^\n]+:\*\*|#{1,6} ).*)*)/m);
  const prompt = promptMatch?.[1].trim();
  if (prompt !== envelope.canonicalBrainstormingPrompt) fail('canonical Brainstorming prompt differs from ROADMAP.md.');
}

async function validateDependencies({ root, record, revisionField, policy, envelope, legacy }) {
  const { sourceBoth, foundationBoth } = validateRecordShape(record, revisionField);
  if (record.phase === 'brainstorming' && envelope.foundationApplicationReceipt !== 'none') {
    fail('Brainstorming requires Foundation Application Receipt none.');
  }
  const artifactPath = await physicalFile(record.artifactPath, root, 'phase artifact');
  await requireIgnored(root, artifactPath, 'phase artifact');
  const artifactArgs = {
    path: artifactPath,
    artifactType: record.artifactType,
    expectedRevision: record[revisionField],
  };
  let artifact;
  if (record.artifactType === 'Agentic Foundation') {
    const { validateApprovedFoundation } = await import('./foundations.mjs');
    artifact = await validateApprovedFoundation({
      root,
      manifestPath: artifactPath,
      expectedRevision: record[revisionField],
      ...(legacy ? {} : { policy }),
    });
  } else {
    artifact = await readValidatedArtifactSnapshot({ ...artifactArgs, policy });
  }

  let sourceSpec = null;
  if (sourceBoth) {
    assertRevision(record.sourceSpecRevision, 'sourceSpecRevision');
    const sourcePath = await physicalFile(record.sourceSpecPath, root, 'source Design Spec');
    await requireIgnored(root, sourcePath, 'source Design Spec');
    sourceSpec = await readValidatedArtifactSnapshot({ path: sourcePath, artifactType: 'Design Spec', expectedRevision: record.sourceSpecRevision, policy });
  }

  let foundation = null;
  if (foundationBoth) {
    const manifestPath = await physicalFile(record.foundationManifestPath, root, 'Foundation manifest');
    await requireIgnored(root, manifestPath, 'Foundation manifest');
    if (record.phase === 'brainstorming') {
      if (manifestPath !== artifactPath || record.foundationRevision !== record[revisionField]) {
        fail('Brainstorming requires artifact and Foundation path/revision equality.');
      }
      foundation = artifact;
    } else {
      const receipt = envelope.foundationApplicationReceipt;
      if (receipt === 'none') fail(`Foundation-backed ${record.phase} requires a Foundation Application Receipt.`);
      const receiptPath = await physicalFile(receipt, root, 'Foundation Application Receipt');
      await requireIgnored(root, receiptPath, 'Foundation Application Receipt');
      const specPath = record.phase === 'planning' ? artifactPath : record.sourceSpecPath;
      const specRevision = record.phase === 'planning' ? record[revisionField] : record.sourceSpecRevision;
      const controllingText = artifact.text;
      const baseLabel = record.phase === 'planning' ? 'Base Agentic Foundation' : 'Foundation Base Revision';
      const baseRevision = exactField(controllingText, baseLabel, `${record.artifactType} traceability`);
      assertRevision(baseRevision, baseLabel);
      const { validateApprovedFoundation } = await import('./foundations.mjs');
      foundation = await validateApprovedFoundation({
        root,
        manifestPath,
        expectedRevision: record.foundationRevision,
        receiptPath,
        specPath,
        expectedSpecRevision: specRevision,
        expectedBaseRevision: baseRevision,
        ...(legacy ? {} : { policy }),
      });
    }
  } else if (envelope.foundationApplicationReceipt !== 'none') {
    fail('generic handoff must use Foundation Application Receipt none.');
  }

  if (record.phase === 'implementation') {
    validateImplementationBinding(artifact, sourceSpec, {
      foundationManifestPath: record.foundationManifestPath,
      foundationBaseRevision: foundationBoth ? foundation.baseRevision : 'none',
      foundationResultRevision: record.foundationRevision,
      foundationApplicationReceipt: envelope.foundationApplicationReceipt,
    });
  } else if (record.phase === 'planning') {
    const spec = artifact.text;
    const expectedManifest = foundationBoth ? record.foundationManifestPath : 'none';
    const expectedBase = foundationBoth ? foundation.baseRevision : 'none';
    if (exactField(spec, 'Foundation Manifest', 'Design Spec traceability') !== expectedManifest) fail('Design Spec Foundation Manifest differs from the handoff binding.');
    if (exactField(spec, 'Base Agentic Foundation', 'Design Spec traceability') !== expectedBase) fail('Design Spec Base Agentic Foundation differs from the handoff binding.');
  }
  const publicMetadata = (snapshot) => {
    if (!snapshot) return null;
    const { bytes, text, ...metadata } = snapshot;
    if (legacy) delete metadata.policy;
    return metadata;
  };
  return { artifact: publicMetadata(artifact), sourceSpec: publicMetadata(sourceSpec), foundation };
}

async function loadEnvelope(envelope, envelopePath) {
  if ((envelope === undefined) === (envelopePath === undefined)) fail('provide exactly one of envelope or envelopePath.');
  if (envelope !== undefined) return envelope;
  try {
    return JSON.parse(await readFile(envelopePath, 'utf8'));
  } catch (error) {
    fail(`unable to read strict JSON envelope ${envelopePath}: ${error.message}.`);
  }
}

export async function validatePhaseHandoff({
  root = process.cwd(),
  envelope,
  envelopePath,
  mode = 'prepare',
  expectedEnvelopeRevision,
  legacyFoundationApplicationReceipt,
  legacySelectedRoadmapOutcome,
  legacyCanonicalBrainstormingPrompt,
} = {}) {
  if (!['prepare', 'receive'].includes(mode)) fail(`mode must be prepare or receive; received ${mode}.`);
  const input = await loadEnvelope(envelope, envelopePath);
  const legacy = input?.schema !== V2_SCHEMA;
  let record;
  let policy;
  let normalizedEnvelope;
  if (legacy) {
    assertExactKeys(input, V1_RECORD_KEYS, 'v1 handoff record');
    record = input;
    policy = 'Review-gated';
    normalizedEnvelope = {
      foundationApplicationReceipt: legacyFoundationApplicationReceipt ?? 'none',
      selectedRoadmapOutcome: legacySelectedRoadmapOutcome ?? 'none',
      canonicalBrainstormingPrompt: legacyCanonicalBrainstormingPrompt ?? 'none',
    };
  } else {
    if ([legacyFoundationApplicationReceipt, legacySelectedRoadmapOutcome, legacyCanonicalBrainstormingPrompt].some((value) => value !== undefined)) {
      fail('legacy external-binding arguments are not accepted for a v2 envelope.');
    }
    assertExactKeys(input, V2_ENVELOPE_KEYS, 'v2 handoff envelope');
    assertExactKeys(input.record, V2_RECORD_KEYS, 'v2 handoff record');
    policy = resolveApprovalPolicy(input.policy);
    assertBoundedText(input.goal, 'goal', { max: 2000 });
    assertRevision(input.constraintSourceRevision, 'constraintSourceRevision');
    record = input.record;
    normalizedEnvelope = input;
  }

  const revision = envelopeRevision(input);
  if (mode === 'receive') {
    assertRevision(expectedEnvelopeRevision, 'expectedEnvelopeRevision');
    if (revision !== expectedEnvelopeRevision) fail(`envelope revision ${revision} differs from expected envelope revision ${expectedEnvelopeRevision}.`);
  } else if (expectedEnvelopeRevision !== undefined) {
    fail('expectedEnvelopeRevision is accepted only in receive mode.');
  }

  const checkout = await checkoutEvidence(root, record);
  if (!legacy) {
    const constraintPath = await physicalFile(input.constraintSourcePath, checkout.physicalRoot, 'constraint source');
    const constraintRevision = rawRevision(await readFile(constraintPath));
    if (constraintRevision !== input.constraintSourceRevision) fail(`constraint source revision ${constraintRevision} differs from recorded ${input.constraintSourceRevision}.`);
    if (envelopePath) {
      const physicalEnvelope = await physicalFile(envelopePath, checkout.physicalRoot, 'handoff envelope');
      await requireIgnored(checkout.physicalRoot, physicalEnvelope, 'handoff envelope');
    }
  }

  let dependencies;
  try {
    dependencies = await validateDependencies({
      root: checkout.physicalRoot,
      record,
      revisionField: legacy ? 'approvedRevision' : 'artifactRevision',
      policy,
      envelope: normalizedEnvelope,
      legacy,
    });
  } catch (error) {
    if (legacy) fail(`v1 accepts only genuinely Approved artifacts and dependencies. ${error.message}`);
    throw error;
  }
  if (legacy && dependencies.artifact.status !== 'Approved') fail('v1 receivers accept only genuinely Approved phase artifacts.');
  await validateRoadmapBindings(record, normalizedEnvelope);

  const hostEvidenceRequired = new Set();
  await validatePlugin(record, hostEvidenceRequired);
  if (record.worktreeIdentity === 'codex-managed-worktree') hostEvidenceRequired.add('codex-managed-worktree-identity');
  if (mode === 'receive') hostEvidenceRequired.add('fresh-user-owned-session');

  return {
    schema: legacy ? 'superpowers-architecture-phase-handoff-v1' : V2_SCHEMA,
    mode,
    policy,
    goal: legacy ? null : input.goal,
    envelopeRevision: revision,
    record,
    artifact: dependencies.artifact,
    sourceSpec: dependencies.sourceSpec,
    foundation: dependencies.foundation,
    checkout,
    hostEvidenceRequired: [...hostEvidenceRequired],
    launchAuthorized: hostEvidenceRequired.size === 0,
  };
}
