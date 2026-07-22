import { readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const COMMANDS = {
  npm: 'npm ci',
  pnpm: 'pnpm install --frozen-lockfile',
  yarn: 'yarn install --immutable',
  bun: 'bun install --frozen-lockfile',
  uv: 'uv sync --frozen',
  poetry: 'poetry install',
  pip: 'python -m pip install -r requirements.txt',
  cargo: 'cargo fetch',
  go: 'go mod download',
};

async function fileExists(path) {
  try {
    return (await stat(path)).isFile();
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function candidate(ecosystem, manager, source, priority, supported = true) {
  return { ecosystem, manager, source, priority, supported };
}

async function packageManagerCandidate(root) {
  const packagePath = join(root, 'package.json');
  if (!(await fileExists(packagePath))) return null;
  let manifest;
  try {
    manifest = JSON.parse(await readFile(packagePath, 'utf8'));
  } catch (error) {
    return candidate('node', null, `package.json is not valid JSON: ${error.message}`, 100, false);
  }
  if (!Object.hasOwn(manifest, 'packageManager')) return null;
  if (typeof manifest.packageManager !== 'string') {
    return candidate('node', null, 'package.json#packageManager is not a string', 100, false);
  }
  const match = manifest.packageManager.match(/^([A-Za-z0-9_-]+)@.+$/);
  if (!match || !Object.hasOwn(COMMANDS, match[1]) || !['npm', 'pnpm', 'yarn', 'bun'].includes(match[1])) {
    return candidate('node', null, `package.json#packageManager=${manifest.packageManager} is unsupported`, 100, false);
  }
  return candidate('node', match[1], `package.json#packageManager=${manifest.packageManager}`, 100);
}

async function collectCandidates(root) {
  const candidates = [];
  const declaration = await packageManagerCandidate(root);
  if (declaration) candidates.push(declaration);

  const files = [
    ['package-lock.json', 'node', 'npm', 80],
    ['pnpm-lock.yaml', 'node', 'pnpm', 80],
    ['yarn.lock', 'node', 'yarn', 80],
    ['bun.lock', 'node', 'bun', 80],
    ['bun.lockb', 'node', 'bun', 80],
    ['uv.lock', 'python', 'uv', 80],
    ['poetry.lock', 'python', 'poetry', 80],
    ['requirements.txt', 'python', 'pip', 40],
    ['Cargo.lock', 'rust', 'cargo', 80],
    ['go.sum', 'go', 'go', 80],
  ];
  for (const [name, ecosystem, manager, priority] of files) {
    if (await fileExists(join(root, name))) {
      candidates.push(candidate(ecosystem, manager, `${name} -> ${manager}`, priority));
    }
  }
  return candidates;
}

function ambiguous(ecosystem, evidence) {
  return {
    status: 'ambiguous',
    ecosystem,
    manager: null,
    evidence,
    prepareCommand: null,
    verifyCommand: null,
  };
}

export async function detectWorkspaceEvidence(root) {
  if (typeof root !== 'string' || root.length === 0) {
    throw new Error('Workspace detection requires a root path.');
  }
  const absoluteRoot = resolve(root);
  const rootStat = await stat(absoluteRoot);
  if (!rootStat.isDirectory()) throw new Error(`Workspace root is not a directory: ${absoluteRoot}`);

  const candidates = await collectCandidates(absoluteRoot);
  const evidence = candidates.map(({ source }) => source);
  if (candidates.length === 0) {
    return {
      status: 'none',
      ecosystem: null,
      manager: null,
      evidence: [],
      prepareCommand: null,
      verifyCommand: null,
    };
  }

  const winners = [];
  for (const ecosystem of [...new Set(candidates.map(({ ecosystem: value }) => value))]) {
    const ecosystemCandidates = candidates.filter((item) => item.ecosystem === ecosystem);
    const highestPriority = Math.max(...ecosystemCandidates.map(({ priority }) => priority));
    const highest = ecosystemCandidates.filter(({ priority }) => priority === highestPriority);
    if (highest.some(({ supported }) => !supported)) return ambiguous(ecosystem, evidence);
    const managers = [...new Set(highest.map(({ manager }) => manager))];
    if (managers.length !== 1) return ambiguous(ecosystem, evidence);
    winners.push({ ecosystem, manager: managers[0] });
  }

  if (winners.length !== 1) return ambiguous(null, evidence);
  const [{ ecosystem, manager }] = winners;
  return {
    status: 'ready',
    ecosystem,
    manager,
    evidence,
    prepareCommand: COMMANDS[manager],
    verifyCommand: null,
  };
}
