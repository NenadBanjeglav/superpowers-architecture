import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';

const TASK_NUMBER = /^[1-9][0-9]*$/;
const PROGRESS_LINE = /^Task ([1-9][0-9]*): complete \(commits ([0-9a-f]{4,64})\.\.([0-9a-f]{4,64}), review (clean)\)$/;
const LOCK_RETRY_MS = 10;
const LOCK_TIMEOUT_MS = 5000;

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
}) {
  const task = requireTaskNumber(taskNumber);
  if (typeof planFile !== 'string' || planFile.length === 0) {
    fail('Plan file is required.');
  }
  const planPath = resolveFrom(cwd, planFile);
  let planText;
  try {
    planText = await readFile(planPath, 'utf8');
  } catch (error) {
    fail(`Unable to read plan file ${planPath}: ${error.message}`);
  }

  const lines = findTaskLines(planText, task);
  if (lines.length === 0) {
    fail(`Task ${task} was not found in ${planPath}; fenced headings are ignored.`);
  }

  const outputPath = outFile
    ? resolveFrom(cwd, outFile)
    : join(await resolveSddWorkspace({ cwd }), `task-${task}-brief.md`);
  if (outputPath === planPath) fail('Task brief output must not overwrite the implementation plan.');
  await mkdir(dirname(outputPath), { recursive: true });
  const output = lines.join('\n').endsWith('\n') ? lines.join('\n') : `${lines.join('\n')}\n`;
  await writeFile(outputPath, output, 'utf8');
  return { path: outputPath, lineCount: lines.length };
}

export async function createReviewPackage({
  cwd = process.cwd(),
  baseRevision,
  headRevision,
  outFile,
}) {
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
  return { path: outputPath, commitCount, byteCount: Buffer.byteLength(output, 'utf8') };
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
