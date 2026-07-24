#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import {
  approveArtifact,
  draftArtifact,
  refreshArtifactRevision,
  validateApprovedArtifact,
} from './lib/artifacts.mjs';
import {
  approveFoundation,
  draftFoundation,
  refreshFoundationRevision,
  validateApprovedFoundation,
} from './lib/foundations.mjs';
import {
  createReviewPackage,
  extractTaskBrief,
  markProgressComplete,
  readProgress,
  resolveSddWorkspace,
} from './lib/sdd.mjs';
import { renderStartupContext } from './lib/startup.mjs';
import { detectWorkspaceEvidence } from './lib/workspace.mjs';

const COMPLETE_REVISION = /^sha256:[0-9a-f]{64}$/;

function fail(message) {
  throw new Error(message);
}

function parseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (!name?.startsWith('--') || value === undefined || value.startsWith('--')) {
      fail(`Expected --name VALUE pairs; received ${args.join(' ') || 'no options'}.`);
    }
    if (Object.hasOwn(options, name)) {
      fail(`Duplicate option ${name}.`);
    }
    options[name] = value;
  }
  return options;
}

function requireOnly(options, required, optional = []) {
  const allowed = new Set([...required, ...optional]);
  for (const name of Object.keys(options)) {
    if (!allowed.has(name)) fail(`Unknown option ${name}.`);
  }
  for (const name of required) {
    if (!options[name]) fail(`Missing required option ${name}.`);
  }
}

function requireCompleteRevision(revision) {
  if (!COMPLETE_REVISION.test(revision ?? '')) {
    fail('Expected --expected-revision sha256:<64 lowercase hex characters>; abbreviated or missing revisions are not accepted.');
  }
}

async function runArtifact(command, args) {
  const options = parseOptions(args);
  if (command === 'draft') {
    requireOnly(options, ['--path', '--type']);
    return draftArtifact({ path: options['--path'], artifactType: options['--type'] });
  }
  if (command === 'refresh') {
    requireOnly(options, ['--path', '--type']);
    return refreshArtifactRevision({ path: options['--path'], artifactType: options['--type'] });
  }
  if (command === 'approve') {
    requireOnly(options, ['--path', '--type', '--expected-revision']);
    requireCompleteRevision(options['--expected-revision']);
    return approveArtifact({
      path: options['--path'],
      artifactType: options['--type'],
      expectedRevision: options['--expected-revision'],
    });
  }
  if (command === 'validate') {
    requireOnly(options, ['--path', '--type', '--expected-revision']);
    requireCompleteRevision(options['--expected-revision']);
    return validateApprovedArtifact({
      path: options['--path'],
      artifactType: options['--type'],
      expectedRevision: options['--expected-revision'],
    });
  }
  fail(`Unknown artifact command ${command ?? '(missing)'}.`);
}

async function runFoundation(command, args) {
  const options = parseOptions(args);
  if (command === 'draft') {
    requireOnly(options, ['--root', '--manifest']);
    return draftFoundation({
      root: options['--root'],
      manifestPath: options['--manifest'],
    });
  }
  if (command === 'refresh') {
    requireOnly(options, ['--root', '--manifest']);
    return refreshFoundationRevision({
      root: options['--root'],
      manifestPath: options['--manifest'],
    });
  }
  if (command === 'approve') {
    requireOnly(options, ['--root', '--manifest', '--expected-revision']);
    requireCompleteRevision(options['--expected-revision']);
    return approveFoundation({
      root: options['--root'],
      manifestPath: options['--manifest'],
      expectedRevision: options['--expected-revision'],
    });
  }
  if (command === 'validate') {
    requireOnly(options, ['--root', '--manifest', '--expected-revision']);
    requireCompleteRevision(options['--expected-revision']);
    return validateApprovedFoundation({
      root: options['--root'],
      manifestPath: options['--manifest'],
      expectedRevision: options['--expected-revision'],
    });
  }
  fail(`Unknown foundation command ${command ?? '(missing)'}.`);
}

function requireArgumentCount(command, args, minimum, maximum = minimum) {
  if (args.length < minimum || args.length > maximum) {
    const expected = minimum === maximum ? `${minimum}` : `${minimum} or ${maximum}`;
    fail(`${command} expects ${expected} positional argument(s); received ${args.length}.`);
  }
}

async function runSdd(command, args) {
  if (command === 'workspace') {
    requireArgumentCount('sdd workspace', args, 0);
    return resolveSddWorkspace();
  }
  if (command === 'task-brief') {
    requireArgumentCount('sdd task-brief', args, 2, 3);
    return extractTaskBrief({ planFile: args[0], taskNumber: args[1], outFile: args[2] });
  }
  if (command === 'review-package') {
    requireArgumentCount('sdd review-package', args, 2, 3);
    return createReviewPackage({ baseRevision: args[0], headRevision: args[1], outFile: args[2] });
  }
  if (command === 'progress') {
    const [operation, ...operationArgs] = args;
    if (operation === 'read') {
      requireArgumentCount('sdd progress read', operationArgs, 0);
      return readProgress();
    }
    if (operation === 'complete') {
      const options = parseOptions(operationArgs);
      requireOnly(options, ['--task', '--base', '--head', '--review']);
      return markProgressComplete({
        task: options['--task'],
        baseRevision: options['--base'],
        headRevision: options['--head'],
        review: options['--review'],
      });
    }
    fail(`Unknown sdd progress command ${operation ?? '(missing)'}.`);
  }
  fail(`Unknown sdd command ${command ?? '(missing)'}.`);
}

async function runStartup(command, args) {
  if (command !== 'render') fail(`Unknown startup command ${command ?? '(missing)'}.`);
  const options = parseOptions(args);
  requireOnly(options, ['--host', '--plugin-root'], ['--degraded-reason']);
  return renderStartupContext({
    host: options['--host'],
    pluginRoot: options['--plugin-root'],
    degradedReason: options['--degraded-reason'],
  });
}

async function runWorkspace(command, args) {
  if (command !== 'detect') fail(`Unknown workspace command ${command ?? '(missing)'}.`);
  const options = parseOptions(args);
  requireOnly(options, ['--root']);
  return detectWorkspaceEvidence(options['--root']);
}

export async function runSpa(argv) {
  const [group, command, ...args] = argv;
  if (group === 'artifact') return runArtifact(command, args);
  if (group === 'foundation') return runFoundation(command, args);
  if (group === 'sdd') return runSdd(command, args);
  if (group === 'startup') return runStartup(command, args);
  if (group === 'workspace') return runWorkspace(command, args);
  fail(`Unknown command group ${group ?? '(missing)'}.`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const result = await runSpa(args);
    if (args[0] === 'startup' && args[1] === 'render') {
      process.stdout.write(result);
    } else if (args[0] === 'sdd' && args[1] === 'workspace') {
      process.stdout.write(`${result}\n`);
    } else {
      process.stdout.write(`${JSON.stringify(result)}\n`);
    }
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
