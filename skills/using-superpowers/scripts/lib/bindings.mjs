import { realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export async function physicalFile(path, root, subject) {
  if (typeof path !== 'string' || !isAbsolute(path)) throw new Error(`${subject} must be an absolute path.`);
  let physical;
  try {
    physical = await realpath(path);
    if (!(await stat(physical)).isFile()) throw new Error('not a regular file');
  } catch (error) {
    throw new Error(`${subject} is not a readable physical file at ${path}: ${error.code ?? error.message}.`);
  }
  if (physical !== resolve(path)) throw new Error(`${subject} must use its physical path; received ${path}, resolved ${physical}.`);
  const rel = relative(root, physical);
  if (isAbsolute(rel) || rel === '..' || rel.startsWith(`..${sep}`)) throw new Error(`${subject} must stay inside checkout ${root}; received ${physical}.`);
  return physical;
}

export function maskMarkdownFences(text) {
  let fence = null;
  return text.replace(/\r\n?/g, '\n').split('\n').map((line) => {
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

export function exactField(text, label, subject) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...maskMarkdownFences(text).matchAll(new RegExp(`^\\*\\*${escaped}:\\*\\*[ \\t]*(.*?)[ \\t]*$`, 'gm'))];
  if (matches.length !== 1 || matches[0][1].length === 0) throw new Error(`${subject} must contain exactly one nonempty ${label} field outside fenced blocks.`);
  return matches[0][1].replace(/^`|`$/g, '');
}

// Compare the payloads already validated by the lifecycle owner, not fresh reads.
// Receipt/result validation remains owned by foundations.mjs.
export function validateImplementationBinding(plan, spec, binding) {
  const expected = {
    'Spec': spec.path,
    'Spec Revision': spec.revision,
    'Foundation Manifest': binding.foundationManifestPath,
    'Foundation Base Revision': binding.foundationBaseRevision,
    'Foundation Result Revision': binding.foundationResultRevision,
    'Foundation Application Receipt': binding.foundationApplicationReceipt,
  };
  const foundationValues = Object.values(expected).slice(2);
  if (!foundationValues.every((value) => typeof value === 'string' && value.length > 0)
      || (!foundationValues.every((value) => value === 'none') && foundationValues.some((value) => value === 'none'))) {
    throw new Error('Foundation binding must provide all four exact values or literal none for all four.');
  }
  for (const [label, value] of Object.entries(expected)) {
    if (exactField(plan.text, label, 'Implementation Plan') !== value) throw new Error(`Implementation Plan ${label === 'Spec' ? 'Spec path' : label} differs from the binding.`);
  }
  for (const [label, value] of [['Foundation Manifest', binding.foundationManifestPath], ['Base Agentic Foundation', binding.foundationBaseRevision]]) {
    if (exactField(spec.text, label, 'Design Spec') !== value) throw new Error(`Design Spec ${label} differs from the Foundation binding.`);
  }
}
