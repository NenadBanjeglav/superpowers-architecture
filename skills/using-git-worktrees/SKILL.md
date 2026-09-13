---
name: using-git-worktrees
description: Use before implementation to verify workspace isolation, prepare dependencies, and check the baseline.
---

# Using Git Worktrees

Read applicable instructions and preserve durable workspace and Phase Mode
preferences. Approval Policy is independent of workspace choice. A same-checkout
handoff forbids moving the phase or copying ignored artifacts elsewhere.

## Identify the Workspace

Resolve the physical repository root, Git directory, common Git directory,
branch, and HEAD. Check the superproject path before interpreting different Git
and common directories as a linked worktree: a submodule uses its own root and
remote. An existing linked worktree needs no replacement. Record main-checkout,
linked-worktree, or detached identity; use a runtime-managed identity only when
the host explicitly proves it. Preserve externally managed detached state.

When no preference exists, choose safe isolation for substantial work only if
ignored same-checkout inputs remain available. Explain the chosen path before
creation. Prefer an available native worktree mechanism; otherwise use Git.

For a Git fallback, choose the declared directory, then existing `.worktrees/`,
then existing `worktrees/`, otherwise `.worktrees/`. Verify project-local
placement is ignored before creation. Do not automatically edit or commit
`.gitignore`. Use a safe external or in-place fallback; ask only when no safe
choice remains. Report tracked/unignored local Superpowers artifacts before
implementation and preserve them.

On sandbox denial, report the denial and use the current checkout when its
policy permits. Do not create nested worktrees, stash changes, or discard work
to satisfy isolation.

## Prepare Dependencies

1. Read applicable AGENTS.md and project docs for an explicit preparation command.
2. Otherwise use the shared `workspace detect --root <checkout-root>`
   operation. Detection is read-only; no installer or lockfile mutation.
3. For `ambiguous`, show all evidence and run nothing until the governing
   manager/command is resolved. For `none`, report the absence and invent no
   installer. For `ready`, explain the evidence, manager, and exact
   `prepareCommand` before execution.

Declarations outrank same-ecosystem lockfiles. Strong Python locks outrank a
standalone requirements.txt; pyproject.toml alone does not select Poetry.
Equal-priority managers or multiple ecosystems are ambiguous. Missing Node.js
or the shared core fails closed with full-plugin installation guidance.

## Verify the Baseline

Resolve verification independently from instructions, documented commands,
declared scripts, and test configuration. The detector's `verifyCommand: null`
is intentional: preparation is not a test.

Run the established verification after preparation, or explain why preparation
was unnecessary. If no baseline command exists, report that gap and use
task-specific checks. Diagnose failures with `systematic-debugging`; repair
in-scope failures under Autonomous, and identify unrelated pre-existing failures
with evidence before continuing. Record commands and actual results.

For a later fresh-session handoff, read
[phase-handoff.md](../using-superpowers/references/phase-handoff.md). Bind this
exact checkout/worktree identity, preserve detached commit and dirty state, and
require runtime proof of the target. If targeting fails, provide the unchanged
canonical fallback prompt; do not launch into a substitute checkout.
