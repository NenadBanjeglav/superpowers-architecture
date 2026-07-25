import { createHash, randomUUID } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  open,
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
const FOUNDATION_DECLARATION_SCHEMA =
  'superpowers-architecture-foundation-declaration-v1';
const DURABLE_IMPACT_ID = /^DDI-[0-9]{3}$/;
const FOUNDATION_CANDIDATE_ACTION_ID = /^FCA-[0-9]{3}$/;
const FOUNDATION_DECLARATION_SECTION = '## Foundation Candidate Declaration';
const DURABLE_IMPACT_SECTION = '## Durable Documentation Impact';
const OPERATION_LOCK_SCHEMA =
  'superpowers-architecture-foundation-operation-lock-v1';
const TRANSACTION_SCHEMA = 'superpowers-architecture-foundation-transaction-v1';
const OPERATION_LOCK_FILE = '.foundation-operation.lock.json';
const CANDIDATE_PARENT_RELATIVE_PATH = 'docs/superpowers/foundation-candidates';
const DESIGN_SPEC_PARENT_RELATIVE_PATH = 'docs/superpowers/specs';
const REVIEW_FILE = 'DESIGN-CHANGE-SET.md';
const APPLIED_FILE = 'APPLIED.json';
const TRANSACTION_DIRECTORY = '.transaction';
const ADDITION_MODE = 0o644;
const OPERATION_NONCE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
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

function immutable(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) immutable(child);
    Object.freeze(value);
  }
  return value;
}

function markdownSection(normalized, heading, subject) {
  const masked = maskMarkdownFences(normalized);
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...masked.matchAll(new RegExp(`^${escaped}[ \\t]*$`, 'gm'))];
  if (matches.length !== 1) {
    throw foundationError(
      subject,
      `exactly one unfenced ${heading} section`,
      `${matches.length} sections`,
      `Recovery: write exactly one ${heading} section in the Design Spec.`,
    );
  }
  const start = matches[0].index + matches[0][0].length;
  const following = masked.slice(start).match(/^##[ \t]+.+$/m);
  const end = following ? start + following.index : normalized.length;
  return normalized.slice(start, end);
}

function parseMarkdownTableRow(line, subject) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
    throw foundationError(
      subject,
      'a pipe-delimited Markdown table row',
      line,
      'Recovery: restore the exact four-column Durable Documentation Impact table.',
    );
  }
  const cells = [];
  let current = '';
  let escaped = false;
  for (const character of trimmed.slice(1, -1)) {
    if (escaped) {
      current += character;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === '|') {
      cells.push(current.trim());
      current = '';
    } else {
      current += character;
    }
  }
  if (escaped) current += '\\';
  cells.push(current.trim());
  return cells;
}

function exactUnfencedField(normalized, label, subject) {
  const masked = maskMarkdownFences(normalized);
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [
    ...masked.matchAll(
      new RegExp(`^\\*\\*${escaped}:\\*\\*[ \\t]*(.*?)[ \\t]*$`, 'gm'),
    ),
  ];
  if (matches.length !== 1) {
    throw foundationError(
      subject,
      `exactly one unfenced ${label} field`,
      `${matches.length} fields`,
      `Recovery: restore the exact ${label} field in the Design Spec.`,
    );
  }
  return matches[0][1];
}

function comparePathActions(left, right) {
  const pathOrder = Buffer.compare(
    Buffer.from(left.path, 'utf8'),
    Buffer.from(right.path, 'utf8'),
  );
  return pathOrder || left.action.localeCompare(right.action);
}

function samePathActions(left, right) {
  return (
    left.length === right.length &&
    left.every(
      (entry, index) =>
        entry.path === right[index].path &&
        entry.action === right[index].action,
    )
  );
}

function parseFoundationCandidateDeclaration(specBytes) {
  const normalized = decodeStrictUtf8(
    specBytes,
    'Foundation Candidate Declaration Design Spec',
  );
  const impactSection = markdownSection(
    normalized,
    DURABLE_IMPACT_SECTION,
    'Durable Documentation Impact',
  );
  const declarationSection = markdownSection(
    normalized,
    FOUNDATION_DECLARATION_SECTION,
    'Foundation Candidate Declaration',
  );
  const impactMasked = maskMarkdownFences(impactSection);
  const impactLines = impactMasked.split('\n');
  const headerIndexes = [];
  for (let index = 0; index < impactLines.length; index += 1) {
    if (
      impactLines[index].trim() ===
      '| Decision | Classification | Owning document | Candidate action |'
    ) {
      headerIndexes.push(index);
    }
  }
  if (headerIndexes.length !== 1) {
    throw foundationError(
      'Durable Documentation Impact table',
      'exactly one four-column header',
      `${headerIndexes.length} headers`,
      'Recovery: restore exactly one Decision, Classification, Owning document, Candidate action table.',
    );
  }
  const headerIndex = headerIndexes[0];
  if (
    !/^\|\s*:?-{3,}:?\s*\|\s*:?-{3,}:?\s*\|\s*:?-{3,}:?\s*\|\s*:?-{3,}:?\s*\|$/.test(
      impactLines[headerIndex + 1]?.trim() ?? '',
    )
  ) {
    throw foundationError(
      'Durable Documentation Impact table',
      'one four-column Markdown separator after the header',
      impactLines[headerIndex + 1] ?? 'missing',
      'Recovery: restore the exact four-column table separator.',
    );
  }
  const decisionRows = [];
  for (let index = headerIndex + 2; index < impactLines.length; index += 1) {
    const line = impactLines[index];
    if (line.trim() === '') {
      if (decisionRows.length > 0) break;
      continue;
    }
    if (!line.trim().startsWith('|')) break;
    decisionRows.push(parseMarkdownTableRow(
      line,
      `Durable Documentation Impact row ${index - headerIndex - 1}`,
    ));
  }
  if (decisionRows.length === 0) {
    throw foundationError(
      'Durable Documentation Impact table',
      'at least one classified decision row',
      'no rows',
      'Recovery: classify every design decision with a stable DDI-NNN identity.',
    );
  }

  const decisions = [];
  const decisionById = new Map();
  for (const cells of decisionRows) {
    if (cells.length !== 4) {
      throw foundationError(
        'Durable Documentation Impact row',
        'exactly four Markdown cells',
        `${cells.length} cells`,
        'Recovery: restore Decision, Classification, Owning document, and Candidate action cells.',
      );
    }
    const decisionMatch = cells[0].match(
      /^(DDI-[0-9]{3}): (.+); Classification reason: (.+)$/,
    );
    if (
      !decisionMatch ||
      decisionMatch[2].trim() === '' ||
      decisionMatch[3].trim() === ''
    ) {
      throw foundationError(
        'Durable Documentation Impact Decision cell',
        'DDI-NNN: <decision>; Classification reason: <concrete reason>',
        cells[0],
        'Recovery: use one stable decision identity and concrete classification reason.',
      );
    }
    const id = decisionMatch[1];
    if (!DURABLE_IMPACT_ID.test(id) || decisionById.has(id)) {
      throw foundationError(
        'Durable Documentation Impact decision identity',
        'a unique DDI-NNN identity',
        `duplicate or malformed ${id}`,
        'Recovery: assign each decision one unique stable DDI-NNN identity.',
      );
    }
    const classification = cells[1];
    if (
      ![
        'Task-local',
        'Project-durable',
        'Operating-contract',
        'No impact',
      ].includes(classification)
    ) {
      throw foundationError(
        `Durable Documentation Impact ${id} classification`,
        'Task-local, Project-durable, Operating-contract, or No impact',
        classification,
        'Recovery: use exactly one documented classification.',
      );
    }
    const owningDocument = cells[2];
    if (classification === 'Task-local' && owningDocument !== 'Design Spec') {
      throw foundationError(
        `Durable Documentation Impact ${id} owner`,
        'Design Spec for Task-local',
        owningDocument,
        'Recovery: use Design Spec as the exact Task-local owner.',
      );
    }
    if (classification === 'No impact' && owningDocument !== 'none') {
      throw foundationError(
        `Durable Documentation Impact ${id} owner`,
        'none for No impact',
        owningDocument,
        'Recovery: use literal none as the exact No impact owner.',
      );
    }
    if (classification === 'Project-durable') {
      assertNormalizedRecordPath(
        owningDocument,
        `Durable Documentation Impact ${id} current-truth owner`,
      );
    }
    if (classification === 'Operating-contract') {
      assertNormalizedRecordPath(
        owningDocument,
        `Durable Documentation Impact ${id} operating-contract owner`,
      );
      if (
        owningDocument !== 'AGENTS.md' &&
        !owningDocument.endsWith('/AGENTS.md')
      ) {
        throw foundationError(
          `Durable Documentation Impact ${id} operating-contract owner`,
          'root AGENTS.md or a normalized child AGENTS.md path',
          owningDocument,
          'Recovery: bind the operating decision to its exact AGENTS.md owner.',
        );
      }
    }
    let actionRefs;
    if (classification === 'Task-local' || classification === 'No impact') {
      if (cells[3] !== 'none') {
        throw foundationError(
          `Durable Documentation Impact ${id} Candidate action`,
          'literal none for Task-local or No impact',
          cells[3],
          'Recovery: remove every action reference from non-durable decisions.',
        );
      }
      actionRefs = [];
    } else {
      actionRefs = cells[3].split(', ');
      if (
        actionRefs.length === 0 ||
        actionRefs.join(', ') !== cells[3] ||
        actionRefs.some((value) => !FOUNDATION_CANDIDATE_ACTION_ID.test(value)) ||
        new Set(actionRefs).size !== actionRefs.length
      ) {
        throw foundationError(
          `Durable Documentation Impact ${id} Candidate action`,
          'a comma-and-space-separated unique FCA-NNN identity list',
          cells[3],
          'Recovery: reference stable action identities only; never put a path in this cell.',
        );
      }
    }
    const decision = {
      id,
      classification,
      owningDocument,
      actionRefs,
    };
    decisions.push(decision);
    decisionById.set(id, decision);
  }

  const fences = [
    ...declarationSection.matchAll(
      /^ {0,3}```json[ \t]*\n([\s\S]*?)^ {0,3}```[ \t]*$/gm,
    ),
  ];
  if (fences.length !== 1) {
    throw foundationError(
      'Foundation Candidate Declaration',
      'exactly one fenced json object',
      `${fences.length} json fences`,
      'Recovery: write one ```json fenced Foundation Candidate Declaration object.',
    );
  }
  let record;
  try {
    record = JSON.parse(fences[0][1]);
  } catch (error) {
    throw foundationError(
      'Foundation Candidate Declaration JSON',
      'valid JSON',
      error.message,
      'Recovery: repair the declaration JSON syntax and refresh the Design Spec.',
    );
  }
  assertExactKeys(
    record,
    ['schema', 'actions'],
    'Foundation Candidate Declaration',
  );
  if (record.schema !== FOUNDATION_DECLARATION_SCHEMA) {
    throw foundationError(
      'Foundation Candidate Declaration schema',
      FOUNDATION_DECLARATION_SCHEMA,
      record.schema ?? 'missing',
      'Recovery: use the exact documented declaration schema.',
    );
  }
  if (!Array.isArray(record.actions)) {
    throw foundationError(
      'Foundation Candidate Declaration actions',
      'an array',
      typeof record.actions,
      'Recovery: write a sorted declaration actions array.',
    );
  }
  const actions = [];
  const actionById = new Map();
  const actionPaths = new Set();
  for (const entry of record.actions) {
    assertExactKeys(
      entry,
      ['id', 'action', 'path', 'decisionRefs'],
      'Foundation Candidate Declaration action',
    );
    if (
      !FOUNDATION_CANDIDATE_ACTION_ID.test(entry.id ?? '') ||
      actionById.has(entry.id)
    ) {
      throw foundationError(
        'Foundation Candidate Declaration action identity',
        'a unique FCA-NNN identity',
        `duplicate or malformed ${entry.id ?? 'missing'}`,
        'Recovery: assign every declaration action one unique stable FCA-NNN identity.',
      );
    }
    if (!['upsert', 'delete'].includes(entry.action)) {
      throw foundationError(
        `Foundation Candidate Declaration ${entry.id} action`,
        'upsert or delete',
        entry.action ?? 'missing',
        'Recovery: use exactly one supported Foundation candidate action.',
      );
    }
    assertNormalizedRecordPath(
      entry.path,
      `Foundation Candidate Declaration ${entry.id} path`,
    );
    if (actionPaths.has(entry.path)) {
      throw foundationError(
        'Foundation Candidate Declaration path',
        'one unique non-conflicting action per path',
        `duplicate or conflicting ${entry.path}`,
        'Recovery: combine all decision references into one action for that path.',
      );
    }
    if (
      !Array.isArray(entry.decisionRefs) ||
      entry.decisionRefs.length === 0 ||
      entry.decisionRefs.some((id) => !DURABLE_IMPACT_ID.test(id)) ||
      new Set(entry.decisionRefs).size !== entry.decisionRefs.length ||
      [...entry.decisionRefs].sort().some(
        (id, index) => id !== entry.decisionRefs[index],
      )
    ) {
      throw foundationError(
        `Foundation Candidate Declaration ${entry.id} decisionRefs`,
        'a sorted, unique, non-empty DDI-NNN array',
        JSON.stringify(entry.decisionRefs),
        'Recovery: bind the action to every exact decision identity it implements.',
      );
    }
    const action = {
      id: entry.id,
      action: entry.action,
      path: entry.path,
      decisionRefs: [...entry.decisionRefs],
    };
    actions.push(action);
    actionById.set(action.id, action);
    actionPaths.add(action.path);
  }
  const sortedActions = [...actions].sort(comparePathActions);
  if (
    actions.some(
      (action, index) =>
        action.id !== sortedActions[index].id ||
        action.path !== sortedActions[index].path ||
        action.action !== sortedActions[index].action,
    )
  ) {
    throw foundationError(
      'Foundation Candidate Declaration action order',
      'unsigned UTF-8 path order and then action',
      'unsorted actions',
      'Recovery: sort declaration actions by path bytes and then action.',
    );
  }

  for (const action of actions) {
    for (const decisionId of action.decisionRefs) {
      const decision = decisionById.get(decisionId);
      if (!decision) {
        throw foundationError(
          `Foundation Candidate Declaration ${action.id} decision reference`,
          'an existing Durable Documentation Impact identity',
          `unknown ${decisionId}`,
          'Recovery: remove the unknown reference or add its complete impact row.',
        );
      }
      if (!decision.actionRefs.includes(action.id)) {
        throw foundationError(
          `Foundation Candidate Declaration ${action.id} binding`,
          `a reciprocal ${decisionId} Candidate action reference`,
          'missing',
          'Recovery: make the impact table and JSON declaration references exactly reciprocal.',
        );
      }
    }
  }
  for (const decision of decisions) {
    for (const actionId of decision.actionRefs) {
      const action = actionById.get(actionId);
      if (!action) {
        throw foundationError(
          `Durable Documentation Impact ${decision.id} Candidate action`,
          'an existing declaration action identity',
          `unknown ${actionId}`,
          'Recovery: declare the referenced FCA-NNN action in JSON.',
        );
      }
      if (!action.decisionRefs.includes(decision.id)) {
        throw foundationError(
          `Durable Documentation Impact ${decision.id} binding`,
          `a reciprocal reference from ${actionId}`,
          'missing',
          'Recovery: make the impact table and JSON declaration references exactly reciprocal.',
        );
      }
    }
  }

  const noChangeCount = impactMasked
    .split('\n')
    .filter((line) => line === 'No durable documentation changes')
    .length;
  if (actions.length === 0 && noChangeCount !== 1) {
    throw foundationError(
      'empty Foundation Candidate Declaration',
      'exactly one unfenced No durable documentation changes sentence',
      `${noChangeCount} sentences`,
      'Recovery: add the exact sentence once in Durable Documentation Impact.',
    );
  }
  if (actions.length > 0 && noChangeCount !== 0) {
    throw foundationError(
      'non-empty Foundation Candidate Declaration',
      'no No durable documentation changes sentence',
      `${noChangeCount} sentences`,
      'Recovery: remove the no-change sentence when declaration actions are present.',
    );
  }

  return immutable({
    decisions,
    actions,
    projection: actions.map(({ path, action }) => ({ path, action })),
  });
}

function declarationActionFor(declaration, decision, path, action) {
  return declaration.actions.find(
    (entry) =>
      entry.path === path &&
      (action === undefined || entry.action === action) &&
      entry.decisionRefs.includes(decision.id) &&
      decision.actionRefs.includes(entry.id),
  );
}

function closestManagedParentAgents(path, managedPaths) {
  let directory = posix.dirname(posix.dirname(path));
  while (directory !== '.' && directory !== '/') {
    const candidate = `${directory}/AGENTS.md`;
    if (managedPaths.has(candidate)) {
      return candidate;
    }
    directory = posix.dirname(directory);
  }
  return managedPaths.has('AGENTS.md') ? 'AGENTS.md' : null;
}

function validateDeclarationAgainstCandidate(
  declaration,
  candidateChanges,
  baseLoaded,
  prospectiveFoundation,
) {
  const candidateProjection = sortChangedFiles(candidateChanges).map(
    ({ path, action }) => ({ path, action }),
  );
  if (!samePathActions(declaration.projection, candidateProjection)) {
    throw foundationError(
      'Foundation declaration candidate projection',
      'exact path/action equality with candidate.json',
      JSON.stringify(candidateProjection),
      'Recovery: make the structured declaration and candidate.json changes exactly equal.',
    );
  }
  const basePaths = new Set(baseLoaded.records.map(({ path }) => path));
  const prospectivePaths = new Set(prospectiveFoundation.prospectiveFiles.keys());
  for (const decision of declaration.decisions) {
    const decisionActionIds = new Set(decision.actionRefs);
    const decisionActions = declaration.actions.filter(
      (action) =>
        decisionActionIds.has(action.id) &&
        action.decisionRefs.includes(decision.id),
    );
    const managedFileSetChanges = decisionActions.filter(
      (action) =>
        basePaths.has(action.path) !== prospectivePaths.has(action.path),
    );
    if (decision.classification === 'Project-durable') {
      if (
        !declarationActionFor(
          declaration,
          decision,
          decision.owningDocument,
        )
      ) {
        throw foundationError(
          `Project-durable ${decision.id} owning document`,
          `an exact action for ${decision.owningDocument}`,
          'missing owner action',
          'Recovery: bind the decision to its exact current-truth owner action.',
        );
      }
      if (
        !declarationActionFor(
          declaration,
          decision,
          'docs/agentic/DECISIONS.md',
          'upsert',
        )
      ) {
        throw foundationError(
          `Project-durable ${decision.id} Decision Ledger`,
          'docs/agentic/DECISIONS.md upsert',
          'missing',
          'Recovery: bind every durable decision to its immutable Decision Ledger upsert.',
        );
      }
    }
    if (decision.classification === 'Operating-contract') {
      const ownerAction = declarationActionFor(
        declaration,
        decision,
        decision.owningDocument,
      );
      if (!ownerAction) {
        throw foundationError(
          `Operating-contract ${decision.id} owner`,
          `an exact action for ${decision.owningDocument}`,
          'missing',
          'Recovery: bind the decision to its exact AGENTS.md owner action.',
        );
      }
      const changedBoundaries = managedFileSetChanges.filter(
        ({ path }) => path === 'AGENTS.md' || path.endsWith('/AGENTS.md'),
      );
      for (const boundary of changedBoundaries) {
        const boundaryWasManaged = basePaths.has(boundary.path);
        const parentAgents = closestManagedParentAgents(
          boundary.path,
          boundaryWasManaged ? basePaths : prospectivePaths,
        );
        if (
          parentAgents &&
          !declarationActionFor(
            declaration,
            decision,
            parentAgents,
            'upsert',
          )
        ) {
          throw foundationError(
            `Operating-contract ${decision.id} parent Child DOX Index`,
            `${parentAgents} upsert`,
            'missing',
            'Recovery: declare every affected parent AGENTS.md Child DOX Index update.',
          );
        }
      }
    }
    if (
      ['Project-durable', 'Operating-contract'].includes(
        decision.classification,
      ) &&
      managedFileSetChanges.length > 0 &&
      !declarationActionFor(
        declaration,
        decision,
        MANIFEST_RELATIVE_PATH,
        'upsert',
      )
    ) {
      throw foundationError(
        `${decision.id} managed Foundation file set`,
        `${MANIFEST_RELATIVE_PATH} upsert`,
        'missing manifest action',
        'Recovery: bind every managed-document add or delete to the manifest update.',
      );
    }
  }
  return declaration;
}

function validateDeclarationAgainstReceipt(declaration, receiptActions) {
  const normalizedReceiptActions = sortChangedFiles(receiptActions).map(
    ({ path, action }) => ({ path, action }),
  );
  if (!samePathActions(declaration.projection, normalizedReceiptActions)) {
    throw foundationError(
      'Foundation declaration Application Receipt projection',
      'exact path/action equality with APPLIED.json actions',
      JSON.stringify(normalizedReceiptActions),
      'Recovery: preserve the exact applied receipt and Approved Design Spec declaration.',
    );
  }
  return declaration;
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

function validateReceiptActions(actions) {
  if (!Array.isArray(actions)) {
    throw foundationError(
      'Foundation Application Receipt actions',
      'a sorted array',
      typeof actions,
      'Recovery: restore the exact operation-owned APPLIED.json receipt.',
    );
  }
  const normalized = [];
  const paths = new Set();
  for (const entry of actions) {
    assertExactKeys(
      entry,
      ['path', 'action'],
      'Foundation Application Receipt action',
    );
    assertNormalizedRecordPath(
      entry.path,
      'Foundation Application Receipt action path',
    );
    if (!['upsert', 'delete'].includes(entry.action)) {
      throw foundationError(
        `Foundation Application Receipt action ${entry.path}`,
        'upsert or delete',
        entry.action ?? 'missing',
        'Recovery: restore the exact operation-owned APPLIED.json receipt.',
      );
    }
    if (paths.has(entry.path)) {
      throw foundationError(
        'Foundation Application Receipt actions',
        'one unique action per path',
        `duplicate ${entry.path}`,
        'Recovery: restore the exact operation-owned APPLIED.json receipt.',
      );
    }
    paths.add(entry.path);
    normalized.push({ path: entry.path, action: entry.action });
  }
  const sorted = [...normalized].sort(comparePathActions);
  if (!samePathActions(normalized, sorted)) {
    throw foundationError(
      'Foundation Application Receipt action order',
      'unsigned UTF-8 path order and then action',
      'unsorted actions',
      'Recovery: restore the exact operation-owned APPLIED.json receipt.',
    );
  }
  return normalized;
}

export async function validateFoundationApplicationReceipt({
  root,
  manifestPath,
  expectedRevision,
  receiptPath,
  specPath,
  expectedSpecRevision,
  expectedBaseRevision,
  approvedFoundation,
}) {
  assertCompleteRevision(
    'Foundation Application Receipt expected Design Spec revision',
    expectedSpecRevision,
  );
  assertCompleteRevision(
    'Foundation Application Receipt expected base revision',
    expectedBaseRevision,
  );
  const approvedSpec = await validateApprovedArtifact({
    path: specPath,
    artifactType: 'Design Spec',
    expectedRevision: expectedSpecRevision,
  });
  if (typeof receiptPath !== 'string' || !isAbsolute(receiptPath)) {
    throw foundationError(
      'Foundation Application Receipt path',
      'the deterministic absolute APPLIED.json path',
      receiptPath ?? 'missing',
      'Recovery: pass the physical absolute APPLIED.json path returned by foundation apply.',
    );
  }
  const candidateRoot = dirname(receiptPath);
  const location = await validateCandidateLocation({
    root,
    manifestPath,
    candidateRoot,
    specPath,
  });
  const expectedReceiptPath = join(candidateRoot, APPLIED_FILE);
  if (receiptPath !== expectedReceiptPath) {
    throw foundationError(
      'Foundation Application Receipt path',
      `the deterministic path ${expectedReceiptPath}`,
      receiptPath,
      'Recovery: use only the operation-owned candidate-root APPLIED.json receipt.',
    );
  }
  const receipt = await readStrictJsonFile(
    receiptPath,
    'Foundation Application Receipt APPLIED.json',
    location.candidateRealPath,
  );
  assertExactKeys(
    receipt,
    [
      'schema',
      'operationNonce',
      'specPath',
      'specRevision',
      'manifestPath',
      'baseRevision',
      'resultRevision',
      'approvedAt',
      'actions',
    ],
    'Foundation Application Receipt',
  );
  if (receipt.schema !== APPLIED_SCHEMA) {
    throw foundationError(
      'Foundation Application Receipt schema',
      APPLIED_SCHEMA,
      receipt.schema ?? 'missing',
      'Recovery: restore the exact operation-owned APPLIED.json receipt.',
    );
  }
  assertOperationNonce(
    receipt.operationNonce,
    'Foundation Application Receipt operation nonce',
  );
  if (receipt.specPath !== location.designSpecPath) {
    throw foundationError(
      'Foundation Application Receipt Design Spec path',
      location.designSpecPath,
      receipt.specPath ?? 'missing',
      'Recovery: use the receipt installed for this exact Design Spec.',
    );
  }
  if (receipt.specRevision !== expectedSpecRevision) {
    throw foundationError(
      'Foundation Application Receipt Design Spec revision',
      expectedSpecRevision,
      receipt.specRevision ?? 'missing',
      'Recovery: use the receipt installed for this exact Approved Design Spec.',
    );
  }
  if (receipt.manifestPath !== MANIFEST_RELATIVE_PATH) {
    throw foundationError(
      'Foundation Application Receipt manifest path',
      MANIFEST_RELATIVE_PATH,
      receipt.manifestPath ?? 'missing',
      'Recovery: use the receipt installed for this exact Foundation manifest.',
    );
  }
  if (receipt.baseRevision !== expectedBaseRevision) {
    throw foundationError(
      'Foundation Application Receipt base revision',
      expectedBaseRevision,
      receipt.baseRevision ?? 'missing',
      'Recovery: use the receipt installed from the exact Approved base Foundation.',
    );
  }
  if (receipt.resultRevision !== expectedRevision) {
    throw foundationError(
      'Foundation Application Receipt result revision',
      expectedRevision,
      receipt.resultRevision ?? 'missing',
      'Recovery: use the receipt installed for the exact Approved resulting Foundation.',
    );
  }
  if (!isIso8601Timestamp(receipt.approvedAt)) {
    throw foundationError(
      'Foundation Application Receipt timestamp',
      'an ISO-8601 timestamp',
      receipt.approvedAt ?? 'missing',
      'Recovery: restore the operation-owned common approval timestamp.',
    );
  }
  if (
    receipt.approvedAt !== approvedSpec.approvedAt ||
    receipt.approvedAt !== approvedFoundation.approvedAt
  ) {
    throw foundationError(
      'Foundation Application Receipt common approval timestamp',
      `Design Spec and Foundation Approved At ${receipt.approvedAt}`,
      `spec ${approvedSpec.approvedAt}; Foundation ${approvedFoundation.approvedAt}`,
      'Recovery: preserve the exact commonly approved spec, result, and receipt.',
    );
  }
  const specBytes = await readFile(specPath);
  const normalizedSpec = decodeStrictUtf8(
    specBytes,
    'Foundation Application Receipt Design Spec',
  );
  const tracedManifest = exactUnfencedField(
    normalizedSpec,
    'Foundation Manifest',
    'Foundation Application Receipt Design Spec traceability',
  );
  if (tracedManifest !== manifestPath) {
    throw foundationError(
      'Foundation Application Receipt Design Spec manifest',
      manifestPath,
      tracedManifest,
      'Recovery: preserve the exact reviewed Foundation Manifest traceability.',
    );
  }
  const tracedBase = exactUnfencedField(
    normalizedSpec,
    'Base Agentic Foundation',
    'Foundation Application Receipt Design Spec traceability',
  );
  if (tracedBase !== expectedBaseRevision) {
    throw foundationError(
      'Foundation Application Receipt Design Spec base',
      expectedBaseRevision,
      tracedBase,
      'Recovery: preserve the exact reviewed Approved base Foundation traceability.',
    );
  }
  const actions = validateReceiptActions(receipt.actions);
  const declaration = parseFoundationCandidateDeclaration(specBytes);
  validateDeclarationAgainstReceipt(declaration, actions);

  return {
    ...approvedFoundation,
    applicationReceiptPath: receiptPath,
    baseRevision: expectedBaseRevision,
    resultRevision: expectedRevision,
    specPath,
    specRevision: expectedSpecRevision,
    approvedAt: receipt.approvedAt,
    actions,
  };
}

export async function validateApprovedFoundation({
  root,
  manifestPath,
  expectedRevision,
  receiptPath,
  specPath,
  expectedSpecRevision,
  expectedBaseRevision,
}) {
  assertSupportedNode();
  assertCompleteRevision(`manifest ${manifestPath}`, expectedRevision);
  const receiptOptions = [
    receiptPath,
    specPath,
    expectedSpecRevision,
    expectedBaseRevision,
  ];
  const receiptMode = receiptOptions.some((value) => value !== undefined);
  if (receiptMode && !receiptOptions.every((value) => value !== undefined)) {
    throw foundationError(
      'validate receipt mode',
      'receiptPath, specPath, expectedSpecRevision, and expectedBaseRevision together',
      'partial receipt option group',
      'Recovery: supply all four receipt bindings or omit all four for result-only validation.',
    );
  }
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

  const approvedFoundation = foundationResult(
    { root, manifestPath, files: loaded.files },
    loaded.current,
  );
  if (!receiptMode) return approvedFoundation;
  return validateFoundationApplicationReceipt({
    root,
    manifestPath,
    expectedRevision,
    receiptPath,
    specPath,
    expectedSpecRevision,
    expectedBaseRevision,
    approvedFoundation,
  });
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

  const candidateParent = dirname(candidateRoot);
  const candidateParentStat = await lstat(candidateParent);
  if (candidateParentStat.isSymbolicLink() || !candidateParentStat.isDirectory()) {
    throw foundationError(
      'candidate parent',
      'a physical non-symbolic-link directory',
      candidateParentStat.isSymbolicLink() ? 'symbolic link or junction' : 'non-directory',
      'Recovery: restore the physical Foundation candidate parent inside this checkout.',
    );
  }
  const candidateParentRealPath = await realpath(candidateParent);
  if (!isContained(rootRealPath, candidateParentRealPath)) {
    throw foundationError(
      'candidate parent',
      'a real path contained by the checkout root',
      `outside root at ${candidateParentRealPath}`,
      'Recovery: remove the junction escape and restore the candidate parent inside this checkout.',
    );
  }

  return {
    candidateRealPath,
    candidateParentRealPath,
    designSpecPath,
    lockPath: join(candidateParentRealPath, OPERATION_LOCK_FILE),
    rootRealPath,
  };
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

async function rejectOperationLock(lockPath) {
  if (await pathState(lockPath)) {
    throw foundationError(
      'candidate operation lock',
      'no apply or recovery window during preview',
      `operation lock exists at ${lockPath}`,
      'Recovery: let the live foundation apply finish, or rerun the exact foundation apply binding to recover a dead owner.',
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
    files.set(relativePath, { content });
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
  const stagedReviewPath = await stagePreviewReviewFile(
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
}, {
  allowOperationState = false,
  location: providedLocation,
  writeReview = true,
} = {}) {
  assertSupportedNode();
  assertCompleteRevision('candidate expected Design Spec revision', expectedSpecRevision);
  assertCompleteRevision('candidate expected base revision', expectedBaseRevision);
  const location = providedLocation ?? await validateCandidateLocation({
    root,
    manifestPath,
    candidateRoot,
    specPath,
  });
  if (!allowOperationState) {
    await rejectAppliedCandidate(candidateRoot);
    await rejectOperationLock(location.lockPath);
    await rejectTransaction(candidateRoot);
  }

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
  const declaration = parseFoundationCandidateDeclaration(
    await readFile(specPath),
  );
  const prospective = materializeProspectiveFoundation(
    baseLoaded,
    changes,
    candidateFiles,
    manifestPath,
  );
  validateDeclarationAgainstCandidate(
    declaration,
    changes,
    baseLoaded,
    prospective,
  );
  const reviewPath = writeReview
    ? await writeDesignChangeSet({
        candidateRoot,
        specPath,
        specRevision: expectedSpecRevision,
        manifestPath,
        baseRevision: expectedBaseRevision,
        prospectiveRevision: prospective.prospectiveRevision,
        changedFiles,
        baseFiles: prospective.baseFiles,
        prospectiveFiles: prospective.prospectiveFiles,
      })
    : join(candidateRoot, REVIEW_FILE);

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
    declaration,
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

async function stagePreviewReviewFile(targetPath, content, mode, physicalRoot) {
  await validatePhysicalTargetPath(
    physicalRoot,
    targetPath,
    `staging target ${targetPath}`,
  );
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const stagedPath = join(
      dirname(targetPath),
      `.${basename(targetPath)}.spa-foundation-preview-${randomUUID()}.tmp`,
    );
    try {
      const handle = await open(stagedPath, 'wx', (mode ?? ADDITION_MODE) & 0o777);
      try {
        await handle.writeFile(content);
        await handle.sync();
      } finally {
        await handle.close();
      }
      return stagedPath;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  throw foundationError(
    `staging ${targetPath}`,
    'an available sibling temporary filename',
    'twenty collisions',
    'Recovery: remove the exact reported preview staging collision and retry.',
  );
}

async function realReplacePath({ targetPath, stagedPath, action }) {
  if (action === 'delete') {
    await rm(targetPath);
    return;
  }
  await rename(stagedPath, targetPath);
}

function sha256Digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function assertOperationNonce(value, subject = 'operation nonce') {
  if (!OPERATION_NONCE.test(value ?? '')) {
    throw foundationError(
      subject,
      'a lowercase RFC 4122 version-4 operation nonce',
      value ?? 'missing',
      'Recovery: preserve the operation evidence and retry only with its exact generated nonce.',
    );
  }
}

async function writeExclusiveSynced(path, content, mode) {
  const handle = await open(path, 'wx', mode & 0o777);
  try {
    await handle.writeFile(content);
    await handle.sync();
  } finally {
    await handle.close();
  }
}

function journalTemporaryPath(transactionRoot, operationNonce) {
  return join(transactionRoot, `.journal.${operationNonce}.tmp`);
}

async function writeTransactionJournal(transactionRoot, journal) {
  const journalPath = join(transactionRoot, 'journal.json');
  const stagedPath = journalTemporaryPath(transactionRoot, journal.operationNonce);
  await validatePhysicalTargetPath(
    transactionRoot,
    journalPath,
    'candidate transaction journal target',
  );
  await validatePhysicalTargetPath(
    transactionRoot,
    stagedPath,
    'candidate transaction journal temporary path',
  );
  try {
    await writeExclusiveSynced(
      stagedPath,
      `${JSON.stringify(journal, null, 2)}\n`,
      0o600,
    );
    await realReplacePath({
      targetPath: journalPath,
      stagedPath: stagedPath,
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

function lockBindings(args, location, operationNonce, ownerPid, acquiredAt) {
  return {
    schema: OPERATION_LOCK_SCHEMA,
    operationNonce,
    ownerPid,
    root: args.root,
    manifestPath: args.manifestPath,
    specPath: args.specPath,
    candidateRoot: args.candidateRoot,
    expectedBaseRevision: args.expectedBaseRevision,
    expectedSpecRevision: args.expectedSpecRevision,
    expectedResultRevision: args.expectedResultRevision,
    acquiredAt,
  };
}

function validateOperationLock(
  lock,
  args,
  location,
  expectedNonce,
  { validateBindings = true } = {},
) {
  assertExactKeys(
    lock,
    [
      'schema',
      'operationNonce',
      'ownerPid',
      'root',
      'manifestPath',
      'specPath',
      'candidateRoot',
      'expectedBaseRevision',
      'expectedSpecRevision',
      'expectedResultRevision',
      'acquiredAt',
    ],
    'candidate operation lock',
  );
  if (lock.schema !== OPERATION_LOCK_SCHEMA) {
    throw foundationError(
      'candidate operation lock schema',
      OPERATION_LOCK_SCHEMA,
      lock.schema ?? 'missing',
      'Recovery: preserve the lock and retry only with the operation core that created it.',
    );
  }
  assertOperationNonce(lock.operationNonce, 'candidate operation lock nonce');
  if (expectedNonce && lock.operationNonce !== expectedNonce) {
    throw foundationError(
      'candidate operation lock nonce binding',
      expectedNonce,
      lock.operationNonce,
      'Recovery: preserve both lock and transaction evidence; their ownership is cross-wired.',
    );
  }
  if (!Number.isInteger(lock.ownerPid) || lock.ownerPid <= 0) {
    throw foundationError(
      'candidate operation lock owner',
      'a positive integer process identifier',
      lock.ownerPid ?? 'missing',
      'Recovery: preserve the invalid lock for inspection rather than guessing its liveness.',
    );
  }
  if (!isIso8601Timestamp(lock.acquiredAt)) {
    throw foundationError(
      'candidate operation lock acquiredAt',
      'an ISO-8601 timestamp',
      lock.acquiredAt ?? 'missing',
      'Recovery: preserve the invalid lock for inspection.',
    );
  }
  if (validateBindings) {
    const bindings = [
      ['root', args.root, lock.root],
      ['manifest', args.manifestPath, lock.manifestPath],
      ['Design Spec', args.specPath, lock.specPath],
      ['candidate root', args.candidateRoot, lock.candidateRoot],
      ['base revision', args.expectedBaseRevision, lock.expectedBaseRevision],
      ['Design Spec revision', args.expectedSpecRevision, lock.expectedSpecRevision],
      ['result revision', args.expectedResultRevision, lock.expectedResultRevision],
    ];
    for (const [subject, expected, actual] of bindings) {
      if (actual !== expected) {
        throw foundationError(
          `candidate operation lock ${subject} binding`,
          expected,
          actual ?? 'missing',
          'Recovery: retry only from the exact checkout, candidate, and reviewed revisions that own this lock.',
        );
      }
    }
  }
  if (location.lockPath !== join(location.candidateParentRealPath, OPERATION_LOCK_FILE)) {
    throw foundationError(
      'candidate operation lock path',
      `the physical candidate-parent lock ${join(location.candidateParentRealPath, OPERATION_LOCK_FILE)}`,
      location.lockPath,
      'Recovery: resolve the lock only from the validated physical candidate parent.',
    );
  }
  return lock;
}

function operationOwnerIsLive(ownerPid) {
  try {
    process.kill(ownerPid, 0);
    return true;
  } catch (error) {
    if (error.code === 'EPERM') return true;
    if (error.code === 'ESRCH') return false;
    throw foundationError(
      'candidate operation lock liveness',
      'a process probe resolving to live, EPERM, or ESRCH',
      error.code ?? error.message,
      'Recovery: preserve the lock until owner liveness can be established exactly.',
    );
  }
}

async function readOperationLock(
  args,
  location,
  expectedNonce,
  options,
) {
  return validateOperationLock(
    await readStrictJsonFile(
      location.lockPath,
      'candidate operation lock',
      location.candidateParentRealPath,
    ),
    args,
    location,
    expectedNonce,
    options,
  );
}

async function acquireOperationLock(args, location) {
  const operationNonce = randomUUID();
  const lock = lockBindings(
    args,
    location,
    operationNonce,
    process.pid,
    new Date().toISOString(),
  );
  try {
    await writeExclusiveSynced(
      location.lockPath,
      `${JSON.stringify(lock, null, 2)}\n`,
      0o600,
    );
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
    const present = await readOperationLock(
      args,
      location,
      undefined,
      { validateBindings: false },
    );
    if (operationOwnerIsLive(present.ownerPid)) {
      throw foundationError(
        'candidate operation lock',
        'no live Foundation writer in this checkout',
        `live owner pid ${present.ownerPid}`,
        'Recovery: wait for the cooperating Foundation writer to finish, then rerun the exact apply.',
      );
    }
    validateOperationLock(present, args, location);
    throw foundationError(
      'candidate operation lock',
      'a recovered matching dead operation before new acquisition',
      `dead owner pid ${present.ownerPid}`,
      'Recovery: rerun the exact apply so validated stale-operation recovery can finish before a new transaction starts.',
    );
  }
  return lock;
}

async function assertCurrentOperationLock(args, location, expectedLock) {
  const current = await readOperationLock(
    args,
    location,
    expectedLock.operationNonce,
  );
  if (
    current.ownerPid !== expectedLock.ownerPid ||
    current.acquiredAt !== expectedLock.acquiredAt
  ) {
    throw foundationError(
      'candidate operation lock ownership',
      `owner ${expectedLock.ownerPid} acquired at ${expectedLock.acquiredAt}`,
      `owner ${current.ownerPid} acquired at ${current.acquiredAt}`,
      'Recovery: preserve the replaced lock and transaction; this operation no longer owns cleanup.',
    );
  }
  return current;
}

async function releaseOperationLock(args, location, expectedLock) {
  await assertCurrentOperationLock(args, location, expectedLock);
  await validatePhysicalTargetPath(
    location.candidateParentRealPath,
    location.lockPath,
    'candidate operation lock release',
  );
  await rm(location.lockPath);
}

function sortedOperationTargetPaths(args, operation) {
  const unique = new Set([
    args.specPath,
    ...operation.changedFiles.map(({ path }) =>
      join(args.root, ...path.split('/'))),
    args.manifestPath,
  ]);
  return [...unique].sort((left, right) =>
    Buffer.compare(
      Buffer.from(portableRelativePath(args.root, left, 'transaction target identity'), 'utf8'),
      Buffer.from(portableRelativePath(args.root, right, 'transaction target identity'), 'utf8'),
    ));
}

function deterministicBackupPath(root, targetPath, index) {
  const identity = createHash('sha256')
    .update(Buffer.from(portableRelativePath(root, targetPath, 'transaction backup target'), 'utf8'))
    .digest('hex');
  return `backups/${String(index).padStart(4, '0')}-${identity}.bin`;
}

function deterministicStagedPath(targetPath, operationNonce, ordinal, purpose) {
  return join(
    dirname(targetPath),
    `.${basename(targetPath)}.spa-foundation-${operationNonce}-${String(ordinal).padStart(4, '0')}-${purpose}.tmp`,
  );
}

function expectedMutationPaths(args, operation) {
  return [
    operation.location.designSpecPath,
    ...operation.changedFiles
      .filter(({ path }) => path !== MANIFEST_RELATIVE_PATH)
      .map(({ path }) => path),
    MANIFEST_RELATIVE_PATH,
  ];
}

function stagedPurposeTargets(args, operation) {
  const result = new Map([
    ['approved-spec', new Set([args.specPath])],
    ['approved-manifest', new Set([args.manifestPath])],
    ['applied-marker', new Set([join(args.candidateRoot, APPLIED_FILE)])],
    ['restore', new Set(sortedOperationTargetPaths(args, operation))],
  ]);
  result.set(
    'candidate-upsert',
    new Set(
      operation.changedFiles
        .filter(({ path, action }) =>
          path !== MANIFEST_RELATIVE_PATH && action === 'upsert')
        .map(({ path }) => join(args.root, ...path.split('/'))),
    ),
  );
  return result;
}

function validateCreatedDirectories(createdDirectories, args, entries) {
  if (!Array.isArray(createdDirectories)) {
    throw foundationError(
      'candidate transaction created directories',
      'an array of exact directory ownership records',
      typeof createdDirectories,
      'Recovery: restore the original operation-owned directory ledger.',
    );
  }
  const allowed = new Set();
  for (const entry of entries.filter(({ existed }) => !existed)) {
    let current = dirname(entry.targetPath);
    while (current !== args.root && isContained(args.root, current)) {
      allowed.add(current);
      current = dirname(current);
    }
  }
  const seen = new Set();
  for (const record of createdDirectories) {
    assertExactKeys(
      record,
      ['path', 'state'],
      'candidate transaction created-directory record',
    );
    if (
      typeof record.path !== 'string' ||
      !isAbsolute(record.path) ||
      !allowed.has(record.path)
    ) {
      throw foundationError(
        'candidate transaction created directory',
        'an exact missing-target ancestor inside the checkout',
        record.path ?? 'missing',
        'Recovery: restore the original exact directory ledger.',
      );
    }
    if (!['planned', 'created'].includes(record.state)) {
      throw foundationError(
        `candidate transaction created directory ${record.path}`,
        'state planned or created',
        record.state ?? 'missing',
        'Recovery: restore the original directory state.',
      );
    }
    if (seen.has(record.path)) {
      throw foundationError(
        'candidate transaction created directory',
        'unique exact paths',
        `duplicate ${record.path}`,
        'Recovery: restore the original directory ledger.',
      );
    }
    seen.add(record.path);
  }
}

async function validateTransactionJournalOwned(
  journal,
  args,
  operation,
  location,
  transactionRoot,
  lock,
  { allowIncompleteBackups = false } = {},
) {
  assertExactKeys(
    journal,
    [
      'schema',
      'operationNonce',
      'lockPath',
      'root',
      'manifestPath',
      'specPath',
      'candidateRoot',
      'expectedBaseRevision',
      'expectedSpecRevision',
      'expectedResultRevision',
      'additionMode',
      'state',
      'entries',
      'stagedPaths',
      'createdDirectories',
    ],
    'candidate transaction journal',
  );
  if (journal.schema !== TRANSACTION_SCHEMA) {
    throw foundationError(
      'candidate transaction schema',
      TRANSACTION_SCHEMA,
      journal.schema ?? 'missing',
      'Recovery: preserve the transaction and restore the operation core that created it.',
    );
  }
  assertOperationNonce(journal.operationNonce, 'candidate transaction nonce');
  if (journal.operationNonce !== lock.operationNonce) {
    throw foundationError(
      'candidate transaction nonce binding',
      lock.operationNonce,
      journal.operationNonce,
      'Recovery: preserve the cross-wired lock and transaction without mutation.',
    );
  }
  if (journal.lockPath !== location.lockPath) {
    throw foundationError(
      'candidate transaction lock path binding',
      location.lockPath,
      journal.lockPath ?? 'missing',
      'Recovery: preserve the transaction; its lock ownership is uncertain.',
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
        'Recovery: retry only with the exact operation bindings that own this transaction.',
      );
    }
  }
  if (!Number.isInteger(journal.additionMode) || journal.additionMode !== ADDITION_MODE) {
    throw foundationError(
      'candidate transaction additionMode',
      `the implementation-owned integer ${ADDITION_MODE}`,
      journal.additionMode ?? 'missing',
      'Recovery: restore the immutable additionMode before staging, apply, or recovery.',
    );
  }
  if (
    !['preparing', 'prepared', 'staged', 'validating', 'recording-applied'].includes(journal.state) &&
    !/^replacing:\d+:.+$/.test(journal.state ?? '')
  ) {
    throw foundationError(
      'candidate transaction state',
      'preparing, prepared, staged, replacing:<index>:<path>, validating, or recording-applied',
      journal.state ?? 'missing',
      'Recovery: restore the exact durable transaction state.',
    );
  }
  if (/^replacing:/.test(journal.state)) {
    const match = journal.state.match(/^replacing:(\d+):(.+)$/);
    const index = Number(match[1]);
    const paths = expectedMutationPaths(args, operation);
    if (!Number.isInteger(index) || paths[index] !== match[2]) {
      throw foundationError(
        'candidate transaction replacement state',
        `one exact mutation index/path from ${JSON.stringify(paths)}`,
        journal.state,
        'Recovery: restore the exact replacement state before retrying.',
      );
    }
  }
  if (!Array.isArray(journal.entries)) {
    throw foundationError(
      'candidate transaction entries',
      'an array of exact deterministic backup entries',
      typeof journal.entries,
      'Recovery: restore the original transaction entries.',
    );
  }
  const expectedTargets = sortedOperationTargetPaths(args, operation);
  if (journal.entries.length !== expectedTargets.length) {
    throw foundationError(
      'candidate transaction target set',
      `the exact ${expectedTargets.length} candidate-derived targets`,
      `${journal.entries.length} entries`,
      'Recovery: preserve the altered transaction without rollback.',
    );
  }
  const seenBackupPaths = new Set();
  const transactionRealPath = await realpath(transactionRoot);
  for (let index = 0; index < journal.entries.length; index += 1) {
    const entry = journal.entries[index];
    assertExactKeys(
      entry,
      [
        'index',
        'targetPath',
        'backupPath',
        'backupDigest',
        'existed',
        'mode',
      ],
      `candidate transaction entry ${index}`,
    );
    if (entry.index !== index || entry.targetPath !== expectedTargets[index]) {
      throw foundationError(
        `candidate transaction entry ${index}`,
        `index ${index} and target ${expectedTargets[index]}`,
        `index ${entry.index}; target ${entry.targetPath}`,
        'Recovery: preserve the reordered or cross-wired transaction.',
      );
    }
    if (typeof entry.existed !== 'boolean') {
      throw foundationError(
        `candidate transaction entry ${index} existed`,
        'a boolean',
        typeof entry.existed,
        'Recovery: restore the exact transaction entry.',
      );
    }
    if (!entry.existed) {
      if (
        entry.backupPath !== null ||
        entry.backupDigest !== null ||
        entry.mode !== null
      ) {
        throw foundationError(
          `candidate transaction entry ${index}`,
          'null backupPath, backupDigest, and mode for an originally missing target',
          JSON.stringify(entry),
          'Recovery: restore the missing-target entry exactly.',
        );
      }
      continue;
    }
    const expectedBackupPath = deterministicBackupPath(
      args.root,
      entry.targetPath,
      index,
    );
    if (entry.backupPath !== expectedBackupPath) {
      throw foundationError(
        `candidate transaction entry ${index} backup path`,
        expectedBackupPath,
        entry.backupPath ?? 'missing',
        'Recovery: preserve the cross-wired backup set.',
      );
    }
    if (seenBackupPaths.has(entry.backupPath)) {
      throw foundationError(
        'candidate transaction backup paths',
        'unique deterministic paths',
        `duplicate ${entry.backupPath}`,
        'Recovery: preserve the duplicate backup evidence.',
      );
    }
    seenBackupPaths.add(entry.backupPath);
    assertCompleteRevision(
      `candidate transaction entry ${index} backup digest`,
      entry.backupDigest,
    );
    if (!Number.isInteger(entry.mode)) {
      throw foundationError(
        `candidate transaction entry ${index} mode`,
        'an integer authoritative pre-apply mode',
        entry.mode ?? 'missing',
        'Recovery: restore the authoritative mode record.',
      );
    }
    const backupPath = join(transactionRoot, ...entry.backupPath.split('/'));
    const backupStat = await pathState(backupPath);
    if (!backupStat) {
      if (allowIncompleteBackups) continue;
      throw foundationError(
        `candidate transaction backup ${entry.backupPath}`,
        'an existing regular file',
        'missing',
        'Recovery: restore the exact content-identified backup before rollback.',
      );
    }
    if (backupStat.isSymbolicLink() || !backupStat.isFile()) {
      throw foundationError(
        `candidate transaction backup ${entry.backupPath}`,
        'a non-symbolic-link regular file',
        backupStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
        'Recovery: restore the exact backup file.',
      );
    }
    const backupRealPath = await realpath(backupPath);
    if (!isContained(transactionRealPath, backupRealPath)) {
      throw foundationError(
        `candidate transaction backup ${entry.backupPath}`,
        'a physical file inside the transaction',
        `outside at ${backupRealPath}`,
        'Recovery: restore the contained backup file.',
      );
    }
    const actualDigest = sha256Digest(await readFile(backupPath));
    if (actualDigest !== entry.backupDigest) {
      throw foundationError(
        `candidate transaction backup ${entry.backupPath} digest`,
        entry.backupDigest,
        actualDigest,
        'Recovery: preserve the corrupt backup and do not mutate authoritative files.',
      );
    }
  }

  if (!Array.isArray(journal.stagedPaths)) {
    throw foundationError(
      'candidate transaction staged paths',
      'an array of exact staged ownership records',
      typeof journal.stagedPaths,
      'Recovery: restore the original staged-path ledger.',
    );
  }
  const purposeTargets = stagedPurposeTargets(args, operation);
  const seenStaged = new Set();
  const seenSemanticBindings = new Set();
  for (let ordinal = 0; ordinal < journal.stagedPaths.length; ordinal += 1) {
    const record = journal.stagedPaths[ordinal];
    assertExactKeys(
      record,
      ['path', 'targetPath', 'purpose', 'ordinal'],
      `candidate transaction staged path ${ordinal}`,
    );
    if (record.ordinal !== ordinal) {
      throw foundationError(
        `candidate transaction staged path ${ordinal}`,
        `deterministic ordinal ${ordinal}`,
        record.ordinal ?? 'missing',
        'Recovery: restore the original staged-path order.',
      );
    }
    const allowedTargets = purposeTargets.get(record.purpose);
    if (!allowedTargets?.has(record.targetPath)) {
      throw foundationError(
        `candidate transaction staged path ${ordinal} purpose/target binding`,
        'an exact approved-spec, candidate-upsert, approved-manifest, applied-marker, or restore binding',
        `${record.purpose ?? 'missing'} -> ${record.targetPath ?? 'missing'}`,
        'Recovery: preserve the forged staged record.',
      );
    }
    const expectedPath = deterministicStagedPath(
      record.targetPath,
      journal.operationNonce,
      ordinal,
      record.purpose,
    );
    if (record.path !== expectedPath) {
      throw foundationError(
        `candidate transaction staged path ${ordinal} nonce binding`,
        expectedPath,
        record.path ?? 'missing',
        'Recovery: preserve the forged staged sibling.',
      );
    }
    if (seenStaged.has(record.path)) {
      throw foundationError(
        'candidate transaction staged paths',
        'unique exact paths',
        `duplicate ${record.path}`,
        'Recovery: restore the unique staged-path ledger.',
      );
    }
    seenStaged.add(record.path);
    const semanticBinding = `${record.purpose}\u0000${record.targetPath}`;
    if (seenSemanticBindings.has(semanticBinding)) {
      throw foundationError(
        'candidate transaction staged semantic bindings',
        'one exact reservation for each purpose and target path',
        `duplicate ${record.purpose} -> ${record.targetPath}`,
        'Recovery: preserve the transaction and remove the cross-wired duplicate only through a newly reviewed operation.',
      );
    }
    seenSemanticBindings.add(semanticBinding);
  }
  validateCreatedDirectories(journal.createdDirectories, args, journal.entries);
  if (
    journal.state === 'preparing' &&
    (journal.stagedPaths.length > 0 || journal.createdDirectories.length > 0)
  ) {
    throw foundationError(
      'candidate preparing transaction ledgers',
      'empty stagedPaths and createdDirectories before prepared state',
      `${journal.stagedPaths.length} staged paths and ${journal.createdDirectories.length} created directories`,
      'Recovery: preserve the impossible transaction state; preparing cannot authorize staged-file or directory cleanup.',
    );
  }
  return journal;
}

async function cleanupExactStagedPaths(journal, args) {
  for (const record of journal.stagedPaths) {
    await validatePhysicalTargetPath(
      args.root,
      record.path,
      `transaction staged cleanup ${record.path}`,
    );
    const stagedStat = await pathState(record.path);
    if (!stagedStat) continue;
    if (stagedStat.isSymbolicLink() || !stagedStat.isFile()) {
      throw foundationError(
        `transaction staged cleanup ${record.path}`,
        'a missing path or exact regular staged file',
        stagedStat.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
        'Recovery: preserve the unexpected staged entry for inspection.',
      );
    }
    await rm(record.path);
  }
}

async function cleanupCreatedDirectories(journal, args) {
  for (const record of [...journal.createdDirectories].reverse()) {
    if (record.state !== 'created') continue;
    await validatePhysicalTargetPath(
      args.root,
      join(record.path, '.ownership-probe'),
      `transaction created-directory cleanup ${record.path}`,
    );
    const directoryStat = await pathState(record.path);
    if (!directoryStat) continue;
    if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
      throw foundationError(
        `transaction created-directory cleanup ${record.path}`,
        'a missing path or exact physical directory',
        directoryStat.isSymbolicLink() ? 'symbolic link or junction' : 'non-directory',
        'Recovery: preserve the unexpected entry and operation evidence.',
      );
    }
    const entries = await readdir(record.path);
    if (entries.length > 0) {
      throw foundationError(
        `transaction created-directory cleanup ${record.path}`,
        'the exact recorded operation-created directory with no unexpected content',
        `unexpected entries ${entries.join(', ')}`,
        'Recovery: preserve the directory and its content; remove nothing by emptiness inference.',
      );
    }
    await rmdir(record.path);
  }
}

async function validateTransactionRoot(transactionRoot, candidateRealPath) {
  const transactionStat = await pathState(transactionRoot);
  if (!transactionStat || transactionStat.isSymbolicLink() || !transactionStat.isDirectory()) {
    throw foundationError(
      'candidate transaction',
      'a physical operation-owned transaction directory',
      !transactionStat
        ? 'missing'
        : transactionStat.isSymbolicLink()
          ? 'symbolic link or junction'
          : 'non-directory',
      'Recovery: preserve the candidate and restore the physical transaction directory.',
    );
  }
  const transactionRealPath = await realpath(transactionRoot);
  if (!isContained(candidateRealPath, transactionRealPath)) {
    throw foundationError(
      'candidate transaction',
      'a real path contained by the candidate root',
      `outside at ${transactionRealPath}`,
      'Recovery: restore the transaction inside the candidate root.',
    );
  }
  return transactionRealPath;
}

async function removeOwnedTransactionDirectory(
  transactionRoot,
  journal,
  candidateRealPath,
  { allowIncompleteBackups = false } = {},
) {
  const transactionRealPath = await validateTransactionRoot(
    transactionRoot,
    candidateRealPath,
  );
  const expectedTopTypes = new Map([
    ['journal.json', 'file'],
    [`.journal.${journal.operationNonce}.tmp`, 'file'],
    ['approved-spec.md', 'file'],
    ['backups', 'directory'],
  ]);
  const topEntries = await readdir(transactionRoot, { withFileTypes: true });
  for (const entry of topEntries) {
    const expectedType = expectedTopTypes.get(entry.name);
    if (!expectedType) {
      throw foundationError(
        'candidate transaction cleanup',
        'only exact nonce-bound journal, approved-spec, and backup state',
        `unexpected ${entry.name}`,
        'Recovery: preserve the transaction; recursive cleanup is not authorized.',
      );
    }
    const entryPath = join(transactionRoot, entry.name);
    const entryStat = await lstat(entryPath);
    const actualType = entryStat.isSymbolicLink()
      ? 'symbolic link'
      : entryStat.isFile()
        ? 'file'
        : entryStat.isDirectory()
          ? 'directory'
          : 'non-regular entry';
    if (
      entryStat.isSymbolicLink() ||
      (expectedType === 'file' && !entryStat.isFile()) ||
      (expectedType === 'directory' && !entryStat.isDirectory())
    ) {
      throw foundationError(
        `candidate transaction cleanup ${entry.name}`,
        `an exact physical ${expectedType}`,
        actualType,
        'Recovery: preserve the wrong-type transaction entry and its nested content.',
      );
    }
    const entryRealPath = await realpath(entryPath);
    if (!isContained(transactionRealPath, entryRealPath)) {
      throw foundationError(
        `candidate transaction cleanup ${entry.name}`,
        'a physical entry contained by the exact transaction root',
        `outside at ${entryRealPath}`,
        'Recovery: preserve the escaping transaction entry and do not recursively remove it.',
      );
    }
  }
  if (!topEntries.some(({ name }) => name === 'journal.json')) {
    throw foundationError(
      'candidate transaction cleanup journal',
      'the exact regular journal.json ownership record',
      'missing',
      'Recovery: preserve the transaction because recursive cleanup lacks its durable authority.',
    );
  }
  const backupsRoot = join(transactionRoot, 'backups');
  const backupStat = await pathState(backupsRoot);
  if (backupStat) {
    if (backupStat.isSymbolicLink() || !backupStat.isDirectory()) {
      throw foundationError(
        'candidate transaction backup cleanup',
        'a physical backups directory',
        backupStat.isSymbolicLink() ? 'symbolic link' : 'non-directory',
        'Recovery: preserve the transaction.',
      );
    }
    const expected = new Set(
      journal.entries
        .filter(({ existed }) => existed)
        .map(({ backupPath }) => basename(backupPath)),
    );
    for (const entry of await readdir(backupsRoot, { withFileTypes: true })) {
      const backupPath = join(backupsRoot, entry.name);
      const backupEntryStat = await lstat(backupPath);
      const backupRealPath = backupEntryStat.isSymbolicLink()
        ? null
        : await realpath(backupPath);
      if (
        backupEntryStat.isSymbolicLink() ||
        !backupEntryStat.isFile() ||
        !backupRealPath ||
        !isContained(transactionRealPath, backupRealPath) ||
        !expected.has(entry.name)
      ) {
        throw foundationError(
          'candidate transaction backup cleanup',
          'only exact content-identified backup files',
          `unexpected ${entry.name}`,
          'Recovery: preserve the transaction and unexpected backup state.',
        );
      }
      expected.delete(entry.name);
    }
    if (!allowIncompleteBackups && expected.size > 0) {
      throw foundationError(
        'candidate transaction backup cleanup',
        'every exact recorded backup',
        `missing ${[...expected].join(', ')}`,
        'Recovery: preserve the incomplete transaction.',
      );
    }
  } else if (
    !allowIncompleteBackups &&
    journal.entries.some(({ existed }) => existed)
  ) {
    throw foundationError(
      'candidate transaction backup cleanup',
      'the exact backups directory',
      'missing',
      'Recovery: preserve the incomplete transaction.',
    );
  }
  if (!isContained(candidateRealPath, transactionRealPath)) {
    throw foundationError(
      'candidate transaction recursive cleanup',
      'physical containment by the candidate root',
      transactionRealPath,
      'Recovery: preserve the transaction.',
    );
  }
  await rm(transactionRoot, { recursive: true });
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
function transactionEntryOwned(transaction, targetPath) {
  const entry = transaction.journal.entries.find(
    (candidate) => candidate.targetPath === targetPath,
  );
  if (!entry) {
    throw foundationError(
      'candidate transaction target binding',
      `an exact entry for ${targetPath}`,
      'missing',
      'Recovery: preserve the transaction and retry only from the exact candidate.',
    );
  }
  return entry;
}

async function createOwnedTransaction(context, args, operation, location, lock) {
  const transactionRoot = join(args.candidateRoot, TRANSACTION_DIRECTORY);
  await validatePhysicalTargetPath(
    args.candidateRoot,
    transactionRoot,
    'candidate transaction directory',
  );
  if (await pathState(transactionRoot)) {
    throw foundationError(
      'candidate transaction directory',
      'no existing transaction after lock acquisition',
      `present at ${transactionRoot}`,
      'Recovery: preserve the unexpected transaction and rerun exact stale recovery.',
    );
  }
  const targetPaths = sortedOperationTargetPaths(args, operation);
  const source = [];
  for (const targetPath of targetPaths) {
    await validatePhysicalTargetPath(
      args.root,
      targetPath,
      `transaction target ${targetPath}`,
    );
    const targetStat = await validateRegularTargetIfPresent(
      targetPath,
      `transaction target ${targetPath}`,
    );
    source.push({
      targetPath,
      targetStat,
      bytes: targetStat ? await readFile(targetPath) : null,
    });
  }

  await mkdir(transactionRoot);
  const entries = source.map(({ targetPath, targetStat, bytes }, index) => ({
    index,
    targetPath,
    backupPath: targetStat
      ? deterministicBackupPath(args.root, targetPath, index)
      : null,
    backupDigest: targetStat ? sha256Digest(bytes) : null,
    existed: Boolean(targetStat),
    mode: targetStat ? targetStat.mode : null,
  }));
  const journal = {
    schema: TRANSACTION_SCHEMA,
    operationNonce: lock.operationNonce,
    lockPath: location.lockPath,
    root: args.root,
    manifestPath: args.manifestPath,
    specPath: args.specPath,
    candidateRoot: args.candidateRoot,
    expectedBaseRevision: args.expectedBaseRevision,
    expectedSpecRevision: args.expectedSpecRevision,
    expectedResultRevision: args.expectedResultRevision,
    additionMode: ADDITION_MODE,
    state: 'preparing',
    entries,
    stagedPaths: [],
    createdDirectories: [],
  };
  await writeTransactionJournal(transactionRoot, journal);

  const backupsRoot = join(transactionRoot, 'backups');
  await mkdir(backupsRoot);
  for (let index = 0; index < source.length; index += 1) {
    if (!entries[index].existed) continue;
    const backupPath = join(
      transactionRoot,
      ...entries[index].backupPath.split('/'),
    );
    await writeExclusiveSynced(backupPath, source[index].bytes, 0o600);
  }
  await validateTransactionJournalOwned(
    journal,
    args,
    operation,
    location,
    transactionRoot,
    lock,
  );
  journal.state = 'prepared';
  await writeTransactionJournal(transactionRoot, journal);
  return {
    args,
    context,
    journal,
    location,
    lock,
    operation,
    transactionRoot,
  };
}

async function ensureOperationDirectories(transaction, targetPath) {
  const { args, journal, transactionRoot } = transaction;
  await validatePhysicalTargetPath(
    args.root,
    targetPath,
    `operation directory target ${targetPath}`,
  );
  const missing = [];
  let current = dirname(targetPath);
  while (current !== args.root && isContained(args.root, current)) {
    const currentStat = await pathState(current);
    if (currentStat) {
      if (currentStat.isSymbolicLink() || !currentStat.isDirectory()) {
        throw foundationError(
          `operation directory ${current}`,
          'a physical directory',
          currentStat.isSymbolicLink() ? 'symbolic link or junction' : 'non-directory',
          'Recovery: restore the physical authoritative ancestor before retrying.',
        );
      }
      break;
    }
    missing.push(current);
    current = dirname(current);
  }
  for (const directoryPath of missing.reverse()) {
    const existing = journal.createdDirectories.find(
      ({ path }) => path === directoryPath,
    );
    if (existing) {
      throw foundationError(
        'candidate transaction created-directory reservation',
        'a new unique directory path',
        `duplicate ${directoryPath}`,
        'Recovery: preserve the duplicate ledger and stop.',
      );
    }
    const record = { path: directoryPath, state: 'planned' };
    journal.createdDirectories.push(record);
    await writeTransactionJournal(transactionRoot, journal);
    await mkdir(directoryPath);
    record.state = 'created';
    await writeTransactionJournal(transactionRoot, journal);
  }
}

async function reserveAndWriteOwnedStage(
  transaction,
  targetPath,
  purpose,
  content,
  mode,
) {
  await ensureOperationDirectories(transaction, targetPath);
  const existing = transaction.journal.stagedPaths.find(
    (record) =>
      record.targetPath === targetPath &&
      record.purpose === purpose,
  );
  if (existing) {
    if (purpose !== 'restore') {
      throw foundationError(
        'candidate staged semantic reservation',
        'a new unique purpose and target binding',
        `existing ${purpose} -> ${targetPath}`,
        'Recovery: preserve the duplicate operation state rather than creating a second semantic reservation.',
      );
    }
    await validatePhysicalTargetPath(
      transaction.args.root,
      existing.path,
      `candidate restore staged path ${existing.path}`,
    );
    const existingState = await pathState(existing.path);
    if (
      existingState &&
      (existingState.isSymbolicLink() || !existingState.isFile())
    ) {
      throw foundationError(
        `candidate restore staged path ${existing.path}`,
        'a missing path or exact regular operation-owned staged file',
        existingState.isSymbolicLink() ? 'symbolic link' : 'non-regular file',
        'Recovery: preserve the unexpected exact staged entry for inspection.',
      );
    }
    if (existingState) await rm(existing.path);
    await writeExclusiveSynced(existing.path, content, mode);
    return existing.path;
  }
  const ordinal = transaction.journal.stagedPaths.length;
  const stagedPath = deterministicStagedPath(
    targetPath,
    transaction.journal.operationNonce,
    ordinal,
    purpose,
  );
  const record = {
    path: stagedPath,
    targetPath,
    purpose,
    ordinal,
  };
  transaction.journal.stagedPaths.push(record);
  await writeTransactionJournal(
    transaction.transactionRoot,
    transaction.journal,
  );
  await validatePhysicalTargetPath(
    transaction.args.root,
    stagedPath,
    `candidate staged path ${stagedPath}`,
  );
  await writeExclusiveSynced(stagedPath, content, mode);
  return stagedPath;
}

async function buildOwnedMutations(context, approvedAt, transaction) {
  const mutations = [];
  const specEntry = transactionEntryOwned(transaction, context.specPath);
  const transactionSpecPath = join(
    transaction.transactionRoot,
    'approved-spec.md',
  );
  await writeExclusiveSynced(
    transactionSpecPath,
    await readFile(context.specPath),
    0o600,
  );
  await approveArtifact({
    path: transactionSpecPath,
    artifactType: 'Design Spec',
    expectedRevision: context.expectedSpecRevision,
    approvedAt,
  });
  mutations.push({
    path: context.designSpecPath,
    action: 'upsert',
    targetPath: context.specPath,
    stagedPath: await reserveAndWriteOwnedStage(
      transaction,
      context.specPath,
      'approved-spec',
      await readFile(transactionSpecPath),
      specEntry.mode,
    ),
    mode: specEntry.mode,
  });

  for (const change of context.changedFiles) {
    if (change.path === MANIFEST_RELATIVE_PATH) continue;
    const targetPath = join(context.root, ...change.path.split('/'));
    const targetEntry = transactionEntryOwned(transaction, targetPath);
    if (change.action === 'delete') {
      mutations.push({
        ...change,
        targetPath,
        stagedPath: null,
        mode: null,
      });
      continue;
    }
    const mode = targetEntry.existed
      ? targetEntry.mode
      : transaction.journal.additionMode;
    mutations.push({
      ...change,
      targetPath,
      stagedPath: await reserveAndWriteOwnedStage(
        transaction,
        targetPath,
        'candidate-upsert',
        context.candidateFiles.get(change.path).content,
        mode,
      ),
      mode,
    });
  }

  const manifestEntry = transactionEntryOwned(
    transaction,
    context.manifestPath,
  );
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
  mutations.push({
    path: MANIFEST_RELATIVE_PATH,
    action: 'upsert',
    targetPath: context.manifestPath,
    stagedPath: await reserveAndWriteOwnedStage(
      transaction,
      context.manifestPath,
      'approved-manifest',
      approvedManifest,
      manifestEntry.mode,
    ),
    mode: manifestEntry.mode,
  });
  transaction.journal.state = 'staged';
  await writeTransactionJournal(
    transaction.transactionRoot,
    transaction.journal,
  );
  return mutations;
}

async function restoreOwnedTransaction(transaction) {
  const {
    args,
    journal,
    location,
    lock,
    operation,
    transactionRoot,
  } = transaction;
  await assertCurrentOperationLock(args, location, lock);
  await validateTransactionJournalOwned(
    journal,
    args,
    operation,
    location,
    transactionRoot,
    lock,
  );
  for (const entry of [...journal.entries].reverse()) {
    await validatePhysicalTargetPath(
      args.root,
      entry.targetPath,
      `transaction restore target ${entry.targetPath}`,
    );
    await validateRegularTargetIfPresent(
      entry.targetPath,
      `transaction restore target ${entry.targetPath}`,
    );
    if (!entry.existed) {
      await rm(entry.targetPath, { force: true });
      continue;
    }
    const backupPath = join(
      transactionRoot,
      ...entry.backupPath.split('/'),
    );
    const stagedPath = await reserveAndWriteOwnedStage(
      transaction,
      entry.targetPath,
      'restore',
      await readFile(backupPath),
      entry.mode,
    );
    await validatePhysicalTargetPath(
      args.root,
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
  }
  await cleanupExactStagedPaths(journal, args);
  await cleanupCreatedDirectories(journal, args);
  await validateRestoredState(args);
  await assertCurrentOperationLock(args, location, lock);
  await validateTransactionJournalOwned(
    journal,
    args,
    operation,
    location,
    transactionRoot,
    lock,
  );
}

async function validateTerminalAppliedStateOwned(
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
      'Recovery: preserve the uncertain marker and transaction.',
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
      'operationNonce',
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
      'Recovery: preserve the terminal transaction.',
    );
  }
  if (applied.operationNonce !== journal.operationNonce) {
    throw foundationError(
      'candidate applied marker nonce binding',
      journal.operationNonce,
      applied.operationNonce ?? 'missing',
      'Recovery: preserve the cross-wired marker and transaction.',
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
        'Recovery: preserve the terminal state and exact evidence.',
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
      'Recovery: preserve the terminal state and restore its exact sorted actions.',
    );
  }
  if (!isIso8601Timestamp(applied.approvedAt)) {
    throw foundationError(
      'candidate applied marker timestamp',
      'an ISO-8601 timestamp',
      applied.approvedAt ?? 'missing',
      'Recovery: preserve the invalid terminal marker.',
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
      `one common ${applied.approvedAt} timestamp`,
      `Design Spec ${spec.approvedAt}; Foundation ${foundation.approvedAt}`,
      'Recovery: preserve the terminal state; its artifacts do not match.',
    );
  }
  return true;
}

async function cleanupPreJournalTransaction(
  args,
  location,
  lock,
  transactionRoot,
) {
  await validateRestoredState(args);
  const transactionRealPath = await validateTransactionRoot(
    transactionRoot,
    location.candidateRealPath,
  );
  const allowed = new Set([`.journal.${lock.operationNonce}.tmp`]);
  for (const entry of await readdir(transactionRoot, { withFileTypes: true })) {
    if (
      !allowed.has(entry.name) ||
      entry.isSymbolicLink() ||
      !entry.isFile()
    ) {
      throw foundationError(
        'candidate pre-journal transaction cleanup',
        'only the exact nonce-bound journal temporary file',
        `unexpected ${entry.name}`,
        'Recovery: preserve the uncertain transaction state.',
      );
    }
  }
  if (!isContained(location.candidateRealPath, transactionRealPath)) {
    throw foundationError(
      'candidate pre-journal transaction cleanup',
      'physical containment by the candidate root',
      transactionRealPath,
      'Recovery: preserve the transaction.',
    );
  }
  await rm(transactionRoot, { recursive: true });
}

async function recoverOwnedOperation(args, operation, location, lock) {
  const transactionRoot = join(args.candidateRoot, TRANSACTION_DIRECTORY);
  const transactionStat = await pathState(transactionRoot);
  if (!transactionStat) {
    await validateRestoredState(args);
    await releaseOperationLock(args, location, lock);
    return 'restored';
  }
  const transactionRealPath = await validateTransactionRoot(
    transactionRoot,
    location.candidateRealPath,
  );
  const journalPath = join(transactionRoot, 'journal.json');
  if (!(await pathState(journalPath))) {
    await cleanupPreJournalTransaction(
      args,
      location,
      lock,
      transactionRoot,
    );
    await releaseOperationLock(args, location, lock);
    return 'restored';
  }
  const journal = await readStrictJsonFile(
    journalPath,
    'candidate transaction journal',
    transactionRealPath,
  );
  const allowIncompleteBackups = journal.state === 'preparing';
  await validateTransactionJournalOwned(
    journal,
    args,
    operation,
    location,
    transactionRoot,
    lock,
    { allowIncompleteBackups },
  );
  const transaction = {
    args,
    journal,
    location,
    lock,
    operation,
    transactionRoot,
  };
  if (journal.state === 'preparing') {
    await validateRestoredState(args);
    await cleanupExactStagedPaths(journal, args);
    await cleanupCreatedDirectories(journal, args);
    await assertCurrentOperationLock(args, location, lock);
    await validateTransactionJournalOwned(
      journal,
      args,
      operation,
      location,
      transactionRoot,
      lock,
      { allowIncompleteBackups: true },
    );
    await removeOwnedTransactionDirectory(
      transactionRoot,
      journal,
      location.candidateRealPath,
      { allowIncompleteBackups: true },
    );
    await releaseOperationLock(args, location, lock);
    return 'restored';
  }
  if (
    await validateTerminalAppliedStateOwned(
      args,
      operation,
      journal,
      location.candidateRealPath,
    )
  ) {
    await cleanupExactStagedPaths(journal, args);
    await assertCurrentOperationLock(args, location, lock);
    await validateTransactionJournalOwned(
      journal,
      args,
      operation,
      location,
      transactionRoot,
      lock,
    );
    await removeOwnedTransactionDirectory(
      transactionRoot,
      journal,
      location.candidateRealPath,
    );
    await releaseOperationLock(args, location, lock);
    return 'applied';
  }
  await restoreOwnedTransaction(transaction);
  await removeOwnedTransactionDirectory(
    transactionRoot,
    journal,
    location.candidateRealPath,
  );
  await releaseOperationLock(args, location, lock);
  return 'restored';
}

async function recoverExistingOwnedOperation(args, operation, location) {
  const lockStat = await pathState(location.lockPath);
  const transactionStat = await pathState(
    join(args.candidateRoot, TRANSACTION_DIRECTORY),
  );
  if (!lockStat) {
    if (transactionStat) {
      throw foundationError(
        'candidate transaction ownership',
        'a matching checkout-scoped operation lock',
        'transaction exists without its lock',
        'Recovery: preserve the orphan transaction; ownership cannot be inferred.',
      );
    }
    return false;
  }
  const lock = await readOperationLock(
    args,
    location,
    undefined,
    { validateBindings: false },
  );
  if (operationOwnerIsLive(lock.ownerPid)) {
    throw foundationError(
      'candidate operation lock',
      'no live Foundation writer in this checkout',
      `live owner pid ${lock.ownerPid}`,
      'Recovery: wait for the cooperating writer; a live owner is never stale.',
    );
  }
  validateOperationLock(lock, args, location);
  return recoverOwnedOperation(args, operation, location, lock);
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
  if (
    !adapters ||
    typeof adapters !== 'object' ||
    Array.isArray(adapters) ||
    Object.keys(adapters).some((key) => key !== 'replacePath')
  ) {
    throw foundationError(
      'Foundation apply adapter',
      'an optional object containing only the approved replacePath test seam',
      adapters && typeof adapters === 'object'
        ? `keys ${Object.keys(adapters).sort().join(', ') || '(none)'}`
        : adapters === null
          ? 'null'
          : typeof adapters,
      'Recovery: remove unapproved adapters; the production clock and local filesystem own all other apply behavior.',
    );
  }
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
  const operation = {
    ...await readBoundCandidateOperation(args, location),
    location,
  };
  await recoverExistingOwnedOperation(args, operation, location);
  await rejectAppliedCandidate(candidateRoot);

  const reviewedContext = await prepareFoundationChangeSet(
    args,
    { location },
  );
  if (reviewedContext.prospectiveRevision !== expectedResultRevision) {
    throw foundationError(
      'candidate prospective revision',
      `reviewed result ${expectedResultRevision}`,
      reviewedContext.prospectiveRevision,
      'Recovery: rerun foundation preview and return the changed Design Change Set to user review.',
    );
  }

  const approvedAt = new Date().toISOString();
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

  let lock;
  let transaction;
  try {
    lock = await acquireOperationLock(args, location);
    await rejectTransaction(candidateRoot);
    await assertCurrentOperationLock(args, location, lock);
    const context = await prepareFoundationChangeSet(
      args,
      {
        allowOperationState: true,
        location,
        writeReview: false,
      },
    );
    if (context.prospectiveRevision !== expectedResultRevision) {
      throw foundationError(
        'candidate prospective revision under operation lock',
        expectedResultRevision,
        context.prospectiveRevision,
        'Recovery: release only after exact base/spec revalidation, then return the changed result to review.',
      );
    }
    const lockedOperation = {
      ...await readBoundCandidateOperation(args, location),
      location,
    };
    transaction = await createOwnedTransaction(
      context,
      args,
      lockedOperation,
      location,
      lock,
    );
    const mutations = await buildOwnedMutations(
      context,
      approvedAt,
      transaction,
    );
    await assertCurrentOperationLock(args, location, lock);
    const stagedContext = await prepareFoundationChangeSet(
      args,
      {
        allowOperationState: true,
        location,
        writeReview: false,
      },
    );
    if (stagedContext.prospectiveRevision !== expectedResultRevision) {
      throw foundationError(
        'candidate staged prospective revision',
        expectedResultRevision,
        stagedContext.prospectiveRevision,
        'Recovery: restore the exact base and return candidate drift to review.',
      );
    }

    for (let index = 0; index < mutations.length; index += 1) {
      const mutation = mutations[index];
      transaction.journal.state = `replacing:${index}:${mutation.path}`;
      await writeTransactionJournal(transaction.transactionRoot, transaction.journal);
      await assertCurrentOperationLock(args, location, lock);
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
    await assertCurrentOperationLock(args, location, lock);
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
    const receiptDeclaration = parseFoundationCandidateDeclaration(
      await readFile(specPath),
    );
    const receiptOperation = await readBoundCandidateOperation(args, location);
    const receiptProspective = materializeProspectiveFoundation(
      context.baseLoaded,
      receiptOperation.changes,
      receiptOperation.candidateFiles,
      manifestPath,
    );
    if (receiptProspective.prospectiveRevision !== expectedResultRevision) {
      throw foundationError(
        'pre-receipt prospective revision',
        expectedResultRevision,
        receiptProspective.prospectiveRevision,
        'Recovery: restore the exact reviewed declaration and candidate state before receipt installation.',
      );
    }
    validateDeclarationAgainstCandidate(
      receiptDeclaration,
      receiptOperation.changes,
      context.baseLoaded,
      receiptProspective,
    );

    transaction.journal.state = 'recording-applied';
    await writeTransactionJournal(transaction.transactionRoot, transaction.journal);
    await assertCurrentOperationLock(args, location, lock);
    const appliedPath = join(candidateRoot, APPLIED_FILE);
    const applied = {
      schema: APPLIED_SCHEMA,
      operationNonce: lock.operationNonce,
      specPath: context.designSpecPath,
      specRevision: expectedSpecRevision,
      manifestPath: MANIFEST_RELATIVE_PATH,
      baseRevision: expectedBaseRevision,
      resultRevision: expectedResultRevision,
      approvedAt,
      actions: context.changedFiles,
    };
    const stagedAppliedPath = await reserveAndWriteOwnedStage(
      transaction,
      appliedPath,
      'applied-marker',
      `${JSON.stringify(applied, null, 2)}\n`,
      0o600,
    );
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
    await validateTerminalAppliedStateOwned(
      args,
      lockedOperation,
      transaction.journal,
      location.candidateRealPath,
    );
    await assertCurrentOperationLock(args, location, lock);
    await validateTransactionJournalOwned(
      transaction.journal,
      args,
      lockedOperation,
      location,
      transaction.transactionRoot,
      lock,
    );
    await cleanupExactStagedPaths(transaction.journal, args);
    await removeOwnedTransactionDirectory(
      transaction.transactionRoot,
      transaction.journal,
      location.candidateRealPath,
    );
    await releaseOperationLock(args, location, lock);

    return {
      ...publicChangeSetResult(context),
      approvedAt,
      appliedPath,
    };
  } catch (operationError) {
    if (!lock) throw operationError;
    try {
      const recovery = await recoverOwnedOperation(
        args,
        transaction?.operation ?? operation,
        location,
        lock,
      );
      if (recovery === 'applied') {
        throw new Error(
          `Foundation Design Change Set apply failed after terminal installation: ${operationError.message} Recovery finalized the exact Approved result and cleaned its operation state.`,
          { cause: operationError },
        );
      }
      throw new Error(
        `Foundation Design Change Set apply failed: ${operationError.message} Recovery succeeded; the exact Approved base Foundation and Draft Design Spec were restored.`,
        { cause: operationError },
      );
    } catch (recoveryError) {
      if (recoveryError.cause === operationError) throw recoveryError;
      throw new Error(
        `Foundation Design Change Set apply failed: ${operationError.message} Recovery failed: ${recoveryError.message}. Preserve ${join(candidateRoot, TRANSACTION_DIRECTORY)} and the exact operation lock for deterministic retry.`,
        { cause: operationError },
      );
    }
  }
}
