#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import {
  approveArtifact,
  draftArtifact,
  refreshArtifactRevision,
  validateApprovedArtifact,
} from './lib/artifacts.mjs';

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

export async function runSpa(argv) {
  const [group, command, ...args] = argv;
  if (group === 'artifact') return runArtifact(command, args);
  fail(`Unknown command group ${group ?? '(missing)'}.`);
}

async function main() {
  try {
    const result = await runSpa(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
