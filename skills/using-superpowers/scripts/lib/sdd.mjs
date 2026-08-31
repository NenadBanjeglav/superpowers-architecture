import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  mkdir,
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

function maskMarkdownFences(text) {
  const lines = normalizeLf(text).split('\n');
  let fence = null;
  return lines.map((line) => {
    if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
      if (close && close[1][0] === fence.character && close[1].length >= fence.length) fence = null;
      return '';
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (open) {
      fence = { character: open[1][0], length: open[1].length };
      return '';
    }
    return line;
  }).join('\n');
}

function exactField(text, label, subject) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...maskMarkdownFences(text).matchAll(new RegExp(`^\\*\\*${escaped}:\\*\\*[ \\t]*(.*?)[ \\t]*$`, 'gm'))];
  if (matches.length !== 1 || matches[0][1].length === 0) fail(`${subject} must contain exactly one nonempty ${label} field outside fenced blocks.`);
  return matches[0][1].replace(/^`|`$/g, '');
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

async function physicalFile(root, path, subject) {
  if (typeof path !== 'string' || !isAbsolute(path)) fail(`${subject} must be an absolute path.`);
  let physical;
  try {
    physical = await realpath(path);
    if (!(await stat(physical)).isFile()) fail(`${subject} must be a regular file: ${path}.`);
  } catch (error) {
    if (error.message?.startsWith(`${subject} must`)) throw error;
    fail(`Unable to read ${subject} ${path}: ${error.message}`);
  }
  if (physical !== resolve(path)) fail(`${subject} must use its physical path; received ${path}, resolved ${physical}.`);
  const relativePath = physical.slice(root.length);
  if (physical !== root && !relativePath.startsWith('\\') && !relativePath.startsWith('/')) fail(`${subject} must stay inside checkout ${root}.`);
  return physical;
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
  const root = resolve(runGit(cwd, ['rev-parse', '--show-toplevel']).trim());
  const physicalBinding = await physicalFile(root, resolveFrom(cwd, bindingPath), 'SDD binding');
  const binding = await readBinding(physicalBinding);
  const policy = resolveApprovalPolicy(binding.policy);
  assertRevision(binding.planRevision, 'SDD planRevision');
  assertRevision(binding.specRevision, 'SDD specRevision');
  const planPath = await physicalFile(root, binding.planPath, 'SDD Implementation Plan');
  const specPath = await physicalFile(root, binding.specPath, 'SDD Design Spec');
  if (expectedPlanPath && planPath !== expectedPlanPath) fail(`SDD binding planPath ${planPath} differs from requested plan ${expectedPlanPath}.`);
  const plan = await readValidatedArtifactSnapshot({ path: planPath, artifactType: 'Implementation Plan', expectedRevision: binding.planRevision, policy });
  const spec = await readValidatedArtifactSnapshot({ path: specPath, artifactType: 'Design Spec', expectedRevision: binding.specRevision, policy });
  const planText = plan.text;
  if (exactField(planText, 'Spec', 'bound Implementation Plan') !== specPath) fail('Bound Implementation Plan Spec path differs from the SDD binding.');
  if (exactField(planText, 'Spec Revision', 'bound Implementation Plan') !== binding.specRevision) fail('Bound Implementation Plan Spec Revision differs from the SDD binding.');

  const foundationValues = [
    binding.foundationManifestPath,
    binding.foundationBaseRevision,
    binding.foundationResultRevision,
    binding.foundationApplicationReceipt,
  ];
  const foundationNone = foundationValues.every((value) => value === 'none');
  const foundationAll = foundationValues.every((value) => value !== 'none');
  if (!foundationNone && !foundationAll) fail('SDD Foundation binding must provide all four exact values or literal none for all four.');
  const expected = foundationNone ? {
    'Foundation Manifest': 'none',
    'Foundation Base Revision': 'none',
    'Foundation Result Revision': 'none',
    'Foundation Application Receipt': 'none',
  } : {
    'Foundation Manifest': binding.foundationManifestPath,
    'Foundation Base Revision': binding.foundationBaseRevision,
    'Foundation Result Revision': binding.foundationResultRevision,
    'Foundation Application Receipt': binding.foundationApplicationReceipt,
  };
  for (const [label, value] of Object.entries(expected)) {
    if (exactField(planText, label, 'bound Implementation Plan') !== value) fail(`Bound Implementation Plan ${label} differs from the SDD binding.`);
  }
  let foundation = null;
  if (foundationAll) {
    assertRevision(binding.foundationBaseRevision, 'SDD foundationBaseRevision');
    assertRevision(binding.foundationResultRevision, 'SDD foundationResultRevision');
    const manifestPath = await physicalFile(root, binding.foundationManifestPath, 'SDD Foundation manifest');
    const receiptPath = await physicalFile(root, binding.foundationApplicationReceipt, 'SDD Foundation Application Receipt');
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
  return { path: physicalBinding, binding, policy, plan, planText, spec, foundation };
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

export async function resolveSddWorkspace({ cwd = process.cwd() } = {}) {
  const root = runGit(cwd, ['rev-parse', '--show-toplevel']).trim();
  const workspace = resolve(root, '.superpowers', 'sdd');
  await mkdir(workspace, { recursive: true });
  await writeFile(join(workspace, '.gitignore'), '*\n', 'utf8');
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
  if (outputPath === planPath) fail('Task brief output must not overwrite the implementation plan.');
  if (validatedBinding && outputPath === validatedBinding.path) fail('Task brief output must not overwrite the SDD binding.');
  await mkdir(dirname(outputPath), { recursive: true });
  const taskText = lines.join('\n').endsWith('\n') ? lines.join('\n') : `${lines.join('\n')}\n`;
  const output = `${renderBindingContext(validatedBinding)}${taskText}`;
  await writeFile(outputPath, output, 'utf8');
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
  if (validatedBinding && outputPath === validatedBinding.path) fail('Review-package output must not overwrite the SDD binding.');
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

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output, 'utf8');
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
  let temporaryPath;

  await acquireProgressLock(lockPath);
  try {
    const current = await readProgress({ cwd });
    if (current.unparsedLines.length > 0) {
      fail(`Legacy or unrecognized progress entries exist in ${path}; refusing to replace the ledger. Read and reconcile that recovery state first.`);
    }
    const entries = current.entries.filter(({ task: existingTask }) => existingTask !== taskNumber);
    entries.push(entry);
    temporaryPath = `${path}.tmp-${process.pid}-${randomUUID()}`;
    await writeFile(temporaryPath, formatProgress(entries), { encoding: 'utf8', flag: 'wx' });
    await rename(temporaryPath, path);
    temporaryPath = undefined;
    return { path, entry, entries: entries.sort((left, right) => left.task - right.task) };
  } finally {
    if (temporaryPath) await rm(temporaryPath, { force: true });
    await rm(lockPath, { recursive: true, force: true });
  }
}
