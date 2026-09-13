---
name: verification-before-completion
description: Use before claiming completion, a fix, or passing checks; bind each claim to current evidence.
---

# Verification Before Completion

Bind completion claims to the exact work and observed evidence. Resolve Approval
Policy and current policy-accepted spec/plan and optional Foundation dependencies.
This is an evidence gate; it does not introduce a human approval gate.

## Evidence Contract

1. Identify the observation that establishes each claim: behavioral test, build,
   lint, acceptance check, review, or actual installed-host exercise.
2. Run the applicable command or inspect a current result covering these exact
   inputs. Read the complete relevant output and exit status; account for
   failures, warnings, and skips.
3. Compare the evidence with the bounded goal, every acceptance criterion, and
   [Architecture Conformance](../codebase-design/ARCHITECTURE-CONFORMANCE.md).
4. Repair in-scope failures and rerun affected checks. Report unresolved gaps
   precisely; never weaken requirements to make a check pass.

Follow [workflow-policy.md](../using-superpowers/references/workflow-policy.md)
for evidence freshness: validate authoritative inputs on first use after a fresh,
resumed, or compacted context; after input/dependency or branch/checkout changes;
after a possible external writer; and under correctness-critical mutation locks.

Within one uninterrupted controller context, reuse a recorded result while its
inputs and coverage remain unchanged. A new message or nested skill invocation
alone does not invalidate it. Run required integrated checks at their planned
boundary; repeat or broaden testing only for changes, failures, drift, or a
specific unresolved concern.

A linter result is not build evidence. A passing regression without an observed
red check does not establish test sensitivity. A worker's success summary needs
comparison with the actual diff, requirements, and reported test output; that
does not require rerunning an unchanged suite.

Source inspection cannot establish installed startup, isolation, plugin affinity,
fresh-session identity, or publication. Verify each on the actual applicable
surface. State unavailable evidence as unavailable.

## Closeout

Record commands/results and the source/artifact identity they cover. Keep detailed
evidence in ignored working records and give the user a concise account of what
passed and what remains. `finishing-a-development-branch` owns full closeout.
