import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

const START_MARKER = '<!-- STARTUP-CONTRACT:START -->';
const END_MARKER = '<!-- STARTUP-CONTRACT:END -->';
const NODE_DEGRADED_CONTEXT = 'Superpowers Architecture degraded mode: Node.js is unavailable. Manually load and follow using-superpowers before any action. Correctness-critical helpers and phase handoffs must stop until Node.js is installed.';

function fail(message) {
  throw new Error(message);
}

function extractStartupContract(skillText, skillPath) {
  const startParts = skillText.split(START_MARKER);
  const endParts = skillText.split(END_MARKER);
  if (startParts.length !== 2 || endParts.length !== 2) {
    fail(`Expected exactly one startup contract marker pair in ${skillPath}.`);
  }
  const start = skillText.indexOf(START_MARKER) + START_MARKER.length;
  const end = skillText.indexOf(END_MARKER);
  if (end <= start) fail(`Startup contract markers are reversed or empty in ${skillPath}.`);
  const contract = skillText.slice(start, end).trim();
  if (!contract) fail(`Startup contract is empty in ${skillPath}.`);
  return contract;
}

function buildEnvelope(additionalContext) {
  return `${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext,
    },
  })}\n`;
}

export async function renderStartupContext({ host, pluginRoot, degradedReason } = {}) {
  if (host !== 'codex') fail(`Startup host must be codex; received ${JSON.stringify(host)}.`);
  if (degradedReason) {
    const additionalContext = degradedReason === 'Node.js is unavailable.'
      ? NODE_DEGRADED_CONTEXT
      : `Superpowers Architecture degraded mode: ${degradedReason} Manually load and follow using-superpowers before any action. Correctness-critical helpers and phase handoffs must stop until the missing capability is restored.`;
    return buildEnvelope(additionalContext);
  }
  if (typeof pluginRoot !== 'string' || !isAbsolute(pluginRoot)) {
    fail('Startup rendering requires an absolute plugin root path.');
  }
  const root = resolve(pluginRoot);
  const skillPath = resolve(root, 'skills', 'using-superpowers', 'SKILL.md');
  const skillText = await readFile(skillPath, 'utf8');
  const contract = extractStartupContract(skillText, skillPath);
  return buildEnvelope(`Superpowers Architecture startup contract for Codex:\n\n${contract}`);
}
