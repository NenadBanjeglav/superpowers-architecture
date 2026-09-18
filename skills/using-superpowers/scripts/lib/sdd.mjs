import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';

import { readValidatedArtifactSnapshot } from './artifacts.mjs';
import { resolveApprovalPolicy } from './policy.mjs';
import { physicalFile, maskMarkdownFences, validateImplementationBinding } from './bindings.mjs';

const TASK_NUMBER = /^[1-9][0-9]*$/;
const PROGRESS_LINE = /^Task ([1-9][0-9]*): complete \(commits ([0-9a-f]{4,64})\.\.([0-9a-f]{4,64}), review (clean)\)$/;
const LOCK_RETRY_MS = 10;
const LOCK_TIMEOUT_MS = 5000;
const REVISION = /^sha256:[0-9a-f]{64}$/;
const SDD_BINDING_KEYS = Object.freeze([
  'schema',
  'policy',
  'planPath',
  'planRevision',
  'specPath',
  'specRevision',
  'foundationManifestPath',
  'foundationBaseRevision',
  'foundationResultRevision',
  'foundationApplicationReceipt',
]);

function fail(message) {
  throw new Error(message);
}

function normalizeLf(text) {
  return text.replace(/\r\n?/g, '\n');
}

function resolveFrom(cwd, path) {
  return isAbsolute(path) ? resolve(path) : resolve(cwd, path);
}

function runGit(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.error) {
    fail(`Unable to run git ${args[0] ?? ''}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = normalizeLf(result.stderr || result.stdout || '').trim();
    fail(`git ${args.join(' ')} failed in ${cwd}${detail ? `: ${detail}` : '.'}`);
  }
  return normalizeLf(result.stdout);
}

function requireTaskNumber(value) {
  const text = typeof value === 'number' ? String(value) : value;
  if (typeof text !== 'string' || !TASK_NUMBER.test(text)) {
    fail(`Task number must be a positive integer; received ${JSON.stringify(value)}.`);
  }
  const number = Number(text);
  if (!Number.isSafeInteger(number)) {
    fail(`Task number must be a positive integer; received ${JSON.stringify(value)}.`);
  }
  return number;
}

function requireRevision(value, label) {
  if (typeof value !== 'string' || value.length === 0 || /[\r\n\0]/.test(value)) {
    fail(`${label} must be a nonempty Git revision without control characters.`);
  }
  return value;
}

function resolveCommit(cwd, revision, label) {
  requireRevision(revision, label);
  return runGit(cwd, ['rev-parse', '--verify', `${revision}^{commit}`]).trim();
}

function trimSection(text) {
  return normalizeLf(text).replace(/\n+$/g, '');
}

function assertExactKeys(value, keys, subject) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${subject} must be an object.`);
  const actual = Object.keys(value);
  if (actual.length !== keys.length || actual.some((key, index) => key !== keys[index])) {
    fail(`${subject} must contain exactly these fields in this order: ${keys.join(', ')}.`);
  }
}

function assertRevision(value, subject) {
  if (!REVISION.test(value ?? '')) fail(`${subject} must be a complete lowercase sha256 revision.`);
}

async function readBinding(bindingPath) {
  let binding;
  try {
    binding = JSON.parse(await readFile(bindingPath, 'utf8'));
  } catch (error) {
    fail(`Unable to read SDD binding ${bindingPath}: ${error.message}`);
  }
  assertExactKeys(binding, SDD_BINDING_KEYS, 'SDD binding');
  if (binding.schema !== 'superpowers-architecture-sdd-binding-v2') fail(`Unsupported SDD binding schema ${binding.schema ?? 'missing'}.`);
  return binding;
}

async function validateSddBinding({ cwd, bindingPath, expectedPlanPath }) {
  if (!bindingPath) return null;
  const root = await realpath(runGit(cwd, ['rev-parse', '--show-toplevel']).trim());
  const physicalBinding = await physicalFile(resolveFrom(cwd, bindingPath), root, 'SDD binding');
  const binding = await readBinding(physicalBinding);
  const policy = resolveApprovalPolicy(binding.policy);
  assertRevision(binding.planRevision, 'SDD planRevision');
  assertRevision(binding.specRevision, 'SDD specRevision');
  const planPath = await physicalFile(binding.planPath, root, 'SDD Implementation Plan');
  const specPath = await physicalFile(binding.specPath, root, 'SDD Design Spec');
  if (expectedPlanPath && planPath !== expectedPlanPath) fail(`SDD binding planPath ${planPath} differs from requested plan ${expectedPlanPath}.`);
  const plan = await readValidatedArtifactSnapshot({ path: planPath, artifactType: 'Implementation Plan', expectedRevision: binding.planRevision, policy });
  const spec = await readValidatedArtifactSnapshot({ path: specPath, artifactType: 'Design Spec', expectedRevision: binding.specRevision, policy });
  const planText = plan.text;
  validateImplementationBinding(plan, spec, binding);
  const foundationAll = binding.foundationManifestPath !== 'none';
  let foundation = null;
  if (foundationAll) {
    assertRevision(binding.foundationBaseRevision, 'SDD foundationBaseRevision');
    assertRevision(binding.foundationResultRevision, 'SDD foundationResultRevision');
    const manifestPath = await physicalFile(binding.foundationManifestPath, root, 'SDD Foundation manifest');
    const receiptPath = await physicalFile(binding.foundationApplicationReceipt, root, 'SDD Foundation Application Receipt');
    const { validateApprovedFoundation } = await import('./foundations.mjs');
    foundation = await validateApprovedFoundation({
      root,
      manifestPath,
      expectedRevision: binding.foundationResultRevision,
      receiptPath,
      specPath,
      expectedSpecRevision: binding.specRevision,
      expectedBaseRevision: binding.foundationBaseRevision,
      policy,
    });
  }
  return { path: physicalBinding, root, binding, policy, plan, planText, spec, foundation };
}

function renderBindingContext(validated) {
  if (!validated) return '';
  return [
    '## Bound Workflow Context',
    '',
    `Approval Policy: ${validated.policy}`,
    '',
    '```json',
    JSON.stringify(validated.binding, null, 2),
    '```',
    '',
  ].join('\n');
}

function findTaskLines(text, taskNumber) {
  const lines = normalizeLf(text).split('\n');
  const selected = [];
  let started = false;
  let fence = null;

  for (const line of lines) {
    if (fence) {
      if (started) selected.push(line);
      const closing = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
      if (closing && closing[1][0] === fence.character && closing[1].length >= fence.length) {
        fence = null;
      }
      continue;
    }

    const opening = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (opening) {
      fence = { character: opening[1][0], length: opening[1].length };
      if (started) selected.push(line);
      continue;
    }

    const heading = line.match(/^#{1,6}[ \t]+Task[ \t]+([0-9]+)(?:[^0-9]|$)/);
    if (heading) {
      if (started) break;
      if (Number(heading[1]) === taskNumber) {
        started = true;
        selected.push(line);
      }
      continue;
    }

    if (started) selected.push(line);
  }

  return selected;
}

function parseProgressText(text, path) {
  const entries = [];
  const unparsedLines = [];
  const tasks = new Set();
  const lines = normalizeLf(text).replace(/^\uFEFF/, '').split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === '') continue;
    const match = line.match(PROGRESS_LINE);
    if (!match) {
      unparsedLines.push(line);
      continue;
    }
    const task = Number(match[1]);
    if (tasks.has(task)) {
      fail(`Duplicate progress entry for Task ${task} in ${path}.`);
    }
    tasks.add(task);
    entries.push({ task, base: match[2], head: match[3], review: match[4] });
  }

  return { entries: entries.sort((left, right) => left.task - right.task), unparsedLines };
}

function formatProgress(entries) {
  if (entries.length === 0) return '';
  return `${entries
    .sort((left, right) => left.task - right.task)
    .map(({ task, base, head, review }) => `Task ${task}: complete (commits ${base}..${head}, review ${review})`)
    .join('\n')}\n`;
}

async function acquireProgressLock(lockPath) {
  const startedAt = Date.now();
  while (true) {
    try {
      await mkdir(lockPath);
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (Date.now() - startedAt >= LOCK_TIMEOUT_MS) {
        fail(`Timed out waiting for progress lock ${lockPath}. Remove it only after confirming no SDD writer is active.`);
      }
      await new Promise((resolveDelay) => setTimeout(resolveDelay, LOCK_RETRY_MS));
    }
  }
}

async function pathState(path) {
  try { return await lstat(path); } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function assertOutputSafe(path, protectedPaths = []) {
  // Inspect every ancestor, including an existing symlink/junction above a new file.
  for (let directory = dirname(path); ; directory = dirname(directory)) {
    const state = await pathState(directory);
    if (state && (state.isSymbolicLink() || !state.isDirectory())) fail(`Output ancestor must be a physical directory: ${directory}.`);
    if (dirname(directory) === directory) break;
  }
  const state = await pathState(path);
  if (!state) return null;
  if (state.isSymbolicLink() || !state.isFile() || state.nlink > 1) fail(`Output must be an unlinked regular file: ${path}.`);
  const physical = await realpath(path);
  for (const { path: input, subject } of protectedPaths) {
    const inputState = await stat(input);
    if (physical === await realpath(input) || (state.dev === inputState.dev && state.ino === inputState.ino)) {
      fail(`Output must not overwrite ${subject}: ${input}.`);
    }
  }
  const text = maskMarkdownFences(await readFile(path, 'utf8'));
  if (/^\s*\*\*(?:Artifact Type|Status|Revision|Approved Revision|Approved At):/m.test(text)) {
    fail(`Output must not overwrite a managed or malformed lifecycle artifact: ${path}.`);
  }
  return state;
}

function protectedInputs(validated, extra = []) {
  if (!validated) return extra.map((path) => ({ path, subject: 'protected input' }));
  const { root, path, plan, spec, foundation } = validated;
  return [...new Set([...extra, path, plan.path, spec.path, ...(foundation ? [
    foundation.manifestPath, foundation.applicationReceiptPath,
    ...foundation.files.map((file) => resolve(root, file)),
  ] : [])])].map((input) => ({ path: input, subject: input === path ? 'the SDD binding' : 'protected input' }));
}

async function writeGeneratedOutput(path, output, protectedPaths = []) {
  await assertOutputSafe(path, protectedPaths);
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp-${process.pid}-${randomUUID()}`;
  let created = false;
  try {
    const file = await open(temporaryPath, 'wx');
    created = true;
    try { await file.writeFile(output, 'utf8'); } finally { await file.close(); }
    await assertOutputSafe(path, protectedPaths);
    await rename(temporaryPath, path);
  } finally {
    if (created) await rm(temporaryPath, { force: true });
  }
}

export async function resolveSddWorkspace({ cwd = process.cwd() } = {}) {
  const root = await realpath(runGit(cwd, ['rev-parse', '--show-toplevel']).trim());
  const workspace = resolve(root, '.superpowers', 'sdd');
  const metadata = join(workspace, '.gitignore');
  const existing = await assertOutputSafe(metadata);
  if (existing) {
    if (normalizeLf(await readFile(metadata, 'utf8')) !== '*\n') fail(`Incompatible SDD workspace metadata at ${metadata}; preserve and reconcile it before retrying.`);
    return workspace;
  }
  await mkdir(workspace, { recursive: true });
  await assertOutputSafe(metadata);
  try { await writeFile(metadata, '*\n', { encoding: 'utf8', flag: 'wx' }); } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    // Another cooperative caller may have initialized the same workspace.
    await assertOutputSafe(metadata);
    if (normalizeLf(await readFile(metadata, 'utf8')) !== '*\n') fail(`Incompatible SDD workspace metadata at ${metadata}.`);
  }
  return workspace;
}

export async function extractTaskBrief({
  cwd = process.cwd(),
  planFile,
  taskNumber,
  outFile,
  bindingPath,
}) {
  const task = requireTaskNumber(taskNumber);
  if (typeof planFile !== 'string' || planFile.length === 0) {
    fail('Plan file is required.');
  }
  const planPath = resolveFrom(cwd, planFile);
  const validatedBinding = await validateSddBinding({ cwd, bindingPath, expectedPlanPath: planPath });
  let planText = validatedBinding?.planText;
  if (planText === undefined) {
    try {
      planText = await readFile(planPath, 'utf8');
    } catch (error) {
      fail(`Unable to read plan file ${planPath}: ${error.message}`);
    }
  }

  const lines = findTaskLines(planText, task);
  if (lines.length === 0) {
    fail(`Task ${task} was not found in ${planPath}; fenced headings are ignored.`);
  }

  const outputPath = outFile
    ? resolveFrom(cwd, outFile)
    : join(await resolveSddWorkspace({ cwd }), `task-${task}-brief.md`);
  const taskText = lines.join('\n').endsWith('\n') ? lines.join('\n') : `${lines.join('\n')}\n`;
  const output = `${renderBindingContext(validatedBinding)}${taskText}`;
  await writeGeneratedOutput(outputPath, output, protectedInputs(validatedBinding, [planPath]));
  return { path: outputPath, lineCount: lines.length, bound: Boolean(validatedBinding), policy: validatedBinding?.policy ?? null };
}

export async function createReviewPackage({
  cwd = process.cwd(),
  baseRevision,
  headRevision,
  outFile,
  bindingPath,
}) {
  const validatedBinding = await validateSddBinding({ cwd, bindingPath });
  if (outFile) await assertOutputSafe(resolveFrom(cwd, outFile), protectedInputs(validatedBinding));
  const base = resolveCommit(cwd, baseRevision, 'Base revision');
  const head = resolveCommit(cwd, headRevision, 'Head revision');
  const range = `${base}..${head}`;
  const baseShort = runGit(cwd, ['rev-parse', '--short', base]).trim();
  const headShort = runGit(cwd, ['rev-parse', '--short', head]).trim();
  const commitText = trimSection(runGit(cwd, ['log', '--oneline', range]));
  const statText = trimSection(runGit(cwd, ['diff', '--stat', range]));
  const diffText = trimSection(runGit(cwd, ['diff', '-U10', range]));
  const commitCount = Number(runGit(cwd, ['rev-list', '--count', range]).trim());
  const outputPath = outFile
    ? resolveFrom(cwd, outFile)
    : join(await resolveSddWorkspace({ cwd }), `review-${baseShort}..${headShort}.diff`);
  const output = [
    `# Review package: ${base}..${head}`,
    '',
    ...(validatedBinding ? [renderBindingContext(validatedBinding).trimEnd(), ''] : []),
    '## Commits',
    commitText,
    '',
    '## Files changed',
    statText,
    '',
    '## Diff',
    diffText,
    '',
  ].join('\n');

  await writeGeneratedOutput(outputPath, output, protectedInputs(validatedBinding));
  return { path: outputPath, commitCount, byteCount: Buffer.byteLength(output, 'utf8'), bound: Boolean(validatedBinding), policy: validatedBinding?.policy ?? null };
}

export async function readProgress({ cwd = process.cwd() } = {}) {
  const workspace = await resolveSddWorkspace({ cwd });
  const path = join(workspace, 'progress.md');
  let text = '';
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const parsed = parseProgressText(text, path);
  return { path, ...parsed };
}

export async function markProgressComplete({
  cwd = process.cwd(),
  task,
  baseRevision,
  headRevision,
  review,
}) {
  const taskNumber = requireTaskNumber(task);
  if (review !== 'clean') fail('Review must be exactly "clean" before a task can be marked complete.');
  const base = resolveCommit(cwd, baseRevision, 'Base revision');
  const head = resolveCommit(cwd, headRevision, 'Head revision');
  const entry = {
    task: taskNumber,
    base: runGit(cwd, ['rev-parse', '--short', base]).trim(),
    head: runGit(cwd, ['rev-parse', '--short', head]).trim(),
    review,
  };
  const workspace = await resolveSddWorkspace({ cwd });
  const path = join(workspace, 'progress.md');
  const lockPath = `${path}.lock`;
  await acquireProgressLock(lockPath);
  try {
    const current = await readProgress({ cwd });
    if (current.unparsedLines.length > 0) {
      fail(`Legacy or unrecognized progress entries exist in ${path}; refusing to replace the ledger. Read and reconcile that recovery state first.`);
    }
    const entries = current.entries.filter(({ task: existingTask }) => existingTask !== taskNumber);
    entries.push(entry);
    await writeGeneratedOutput(path, formatProgress(entries));
    return { path, entry, entries: entries.sort((left, right) => left.task - right.task) };
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}
