---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
---

# Using Git Worktrees

## Overview

Ensure work happens in an isolated workspace. Prefer your platform's native worktree tools. Fall back to manual git worktrees only when no native tool is available.

**Core principle:** Detect existing isolation first. Then use native tools. Then fall back to git. Never fight the harness.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Step 0: Detect Existing Isolation

**Before creating anything, check if you are already in an isolated workspace.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git submodules. Before concluding "already in a worktree," verify you are not in a submodule:

```bash
# If this returns a path, you're in a submodule, not a worktree — treat as normal repo
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** You are already in a linked worktree. Skip to Step 2 (Project Setup). Do NOT create another worktree.

Report with branch state:
- On a branch: "Already in isolated workspace at `<path>` on branch `<name>`."
- Detached HEAD: "Already in isolated workspace at `<path>` (detached HEAD, externally managed). Branch creation needed at finish time."

**If `GIT_DIR == GIT_COMMON` (or in a submodule):** You are in a normal repo checkout.

Record the resolved identity for later phase handoff:

- `main-checkout` for a normal checkout on a branch;
- `linked-worktree` when Git and common directories differ and the repository is not a submodule;
- `codex-managed-worktree` only when the active Codex host explicitly identifies the current workspace that way; or
- `detached` when no branch is checked out, together with the exact `git rev-parse HEAD` commit.

For a submodule, use the submodule root and remote as the repository boundary and do not infer `linked-worktree` from the relocated Git directory.

Resolve the effective **Approval Policy**, but keep it independent from workspace
choice. Honor any durable worktree or Phase Mode preference without asking. A
recorded `same-checkout` handoff forbids moving this phase to another worktree.

When no preference exists, choose an isolated worktree for substantial feature
work when it can be created safely and no ignored same-checkout artifact would
be lost; explain the chosen path before creation. Ask one concise workspace
question only when no safe default exists and the location materially affects
user state. Reversible worktree creation within the authorized goal is not a
document-approval gate.

## Step 1: Create Isolated Workspace

**You have two mechanisms. Try them in this order.**

### 1a. Native Worktree Tools (preferred)

Do you already have a native way to create a worktree? It might be a host
worktree operation or advertised worktree flag. If you do, use it and skip to
Step 2.

Native tools handle directory placement, branch creation, and cleanup automatically. Using `git worktree add` when you have a native tool creates phantom state your harness can't see or manage.

Only proceed to Step 1b if you have no native worktree tool available.

### 1b. Git Worktree Fallback

**Only use this if Step 1a does not apply** — you have no native worktree tool available. Create a worktree manually using git.

#### Directory Selection

Follow this priority order. Explicit user preference always beats observed filesystem state.

1. **Check your instructions for a declared worktree directory preference.** If the user has already specified one, use it without asking.

2. **Check for an existing project-local worktree directory:**
   ```bash
   ls -d .worktrees 2>/dev/null     # Preferred (hidden)
   ls -d worktrees 2>/dev/null      # Alternative
   ```
   If found, use it. If both exist, `.worktrees` wins.

3. **If there is no other guidance available**, default to `.worktrees/` at the project root.

## Ignore Safety

Before creating a project-local worktree directory, verify it is ignored.

If it is not ignored, do not edit `.gitignore`. Ask only when no safe external
or in-place choice follows from existing instructions. The material choices are:

1. add the ignore rule themselves,
2. allow you to edit `.gitignore`, or
3. choose a different worktree location.

Do not edit or commit `.gitignore` automatically.

If `docs/superpowers/**` exists and is tracked or unignored, warn the user before implementation. Do not modify `.gitignore` automatically.

#### Create the Worktree

```bash
# Determine path based on chosen location
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Sandbox fallback:** If `git worktree add` fails with a permission error (sandbox denial), tell the user the sandbox blocked worktree creation and you're working in the current directory instead. Then run setup and baseline tests in place.

## Step 2: Prepare Workspace

Preparation and baseline verification are separate interfaces. Detection is
read-only and never grants permission to guess a package manager, mutate a
lockfile, or run a competing installer.

### Prepare workspace

1. Read the applicable `AGENTS.md` chain and project documentation for an
   explicit preparation command. An applicable explicit command wins.
2. If no explicit command exists, run the shared `workspace detect --root
   <checkout-root>` operation through the active host launcher. It inspects
   manager declarations, lockfiles, and tool configuration without writing or
   executing anything.
3. If the result is `ambiguous`, show every `evidence` entry and ask the user
   which manager/command governs. Run nothing while ambiguity remains.
4. If the result is `none`, explain that no preparation evidence was found and
   do not invent a command.
5. If the result is `ready`, explain the selected evidence, manager, and exact
   `prepareCommand` before executing it. A user-approved resolution to an
   ambiguity is equally valid, but must be stated explicitly.

Manager declarations beat same-ecosystem lockfiles. Strong Python lock evidence
beats a standalone `requirements.txt`. `pyproject.toml` alone never selects
Poetry. Multiple equal-priority managers or multiple ecosystems are ambiguous.

| Unambiguous evidence | Preparation command |
| --- | --- |
| npm declaration or `package-lock.json` | `npm ci` |
| pnpm declaration or `pnpm-lock.yaml` | `pnpm install --frozen-lockfile` |
| Yarn declaration or `yarn.lock` | `yarn install --immutable` |
| Bun declaration, `bun.lock`, or `bun.lockb` | `bun install --frozen-lockfile` |
| `uv.lock` | `uv sync --frozen` |
| `poetry.lock` | `poetry install` |
| `requirements.txt` without stronger Python evidence | `python -m pip install -r requirements.txt` |
| `Cargo.lock` | `cargo fetch` |
| `go.sum` | `go mod download` |

If Node.js or the shared operation module is unavailable, stop and print the
full-package installation guidance. Do not fall back to filename guessing.

## Step 3: Verify Baseline

### Verify baseline

1. Resolve the verification command independently from the applicable
   `AGENTS.md` chain and project documentation. The detector intentionally
   returns `verifyCommand: null`; a package manager does not prove the project's
   test command.
2. Run the resolved verification after preparation, or explain why preparation
   was not needed.
3. If no verification command is documented after inspecting the project's
   declared scripts and test configuration, report that evidence gap and
   continue with task-specific checks; do not invent a command.
4. If the baseline fails, report it and use `systematic-debugging` to determine
   whether the failure is pre-existing or task-relevant. Under Autonomous,
   investigate and repair in-scope failures without a routine permission prompt.
   Do not reinterpret a preparation command as a test.

**If tests pass:** Report ready.

## Phase Handoff Affinity

When this workspace later enters automated fresh-session mode, pass the exact
checkout path and recorded worktree identity to `prepare handoff`. The
`same-checkout` policy means an adapter must target this existing checkout; it
must not create a replacement worktree or copy ignored `docs/superpowers/**`
artifacts elsewhere. Detached work stays at the recorded commit, and a dirty
tree is disclosed and preserved rather than staged, stashed, or discarded.

If the runtime cannot target this exact main checkout, linked worktree,
Codex-managed worktree, detached checkout, or submodule boundary, automatic
handoff is unsafe. Print the complete canonical fallback prompt and stop.

### Report

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Already in linked worktree | Skip creation (Step 0) |
| In a submodule | Treat as normal repo (Step 0 guard) |
| Native worktree tool available | Use it (Step 1a) |
| No native tool | Git worktree fallback (Step 1b) |
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check instruction file, then default `.worktrees/` |
| Directory not ignored | Use a safe external fallback; ask only if no safe placement remains |
| Permission error on create | Sandbox fallback, work in place |
| Tests fail during baseline | Diagnose; repair in-scope failures under Autonomous and record unrelated pre-existing failures |
| Detection returns `none` | Explain no evidence; run no installer |
| Detection returns `ambiguous` | Show evidence and ask; run nothing |

## Common Mistakes

### Fighting the harness

- **Problem:** Using `git worktree add` when the platform already provides isolation
- **Fix:** Step 0 detects existing isolation. Step 1a defers to native tools.

### Skipping detection

- **Problem:** Creating a nested worktree inside an existing one
- **Fix:** Always run Step 0 before creating anything

### Skipping ignore verification

- **Problem:** Worktree contents get tracked, pollute git status
- **Fix:** Always use `git check-ignore` before creating project-local worktree

### Assuming directory location

- **Problem:** Creates inconsistency, violates project conventions
- **Fix:** Follow priority: explicit instructions > existing project-local directory > default

### Proceeding with failing tests

- **Problem:** Can't distinguish new bugs from pre-existing issues
- **Fix:** Diagnose and classify the failures. Under Autonomous, repair in-scope
  failures; continue only when evidence isolates and records an unrelated
  pre-existing failure alongside task-specific checks.

### Guessing from shallow filenames

- **Problem:** `package.json` triggers npm despite pnpm/Yarn/Bun evidence, or `pyproject.toml` triggers Poetry without a Poetry lock
- **Fix:** Use the ranked read-only detector and stop on ambiguity

## Red Flags

**Never:**
- Create a worktree when Step 0 detects existing isolation
- Use `git worktree add` when you have a native worktree tool (e.g., `EnterWorktree`). This is the #1 mistake — if you have it, use it.
- Skip Step 1a by jumping straight to Step 1b's git commands
- Create worktree without verifying it's ignored (project-local)
- Skip baseline test verification
- Proceed with failing tests without diagnosing, classifying, and recording them
- Run a preparation command when evidence is ambiguous or absent
- Infer Poetry from `pyproject.toml` alone
- Mutate lockfiles during manager detection

**Always:**
- Run Step 0 detection first
- Prefer native tools over git fallback
- Follow directory priority: explicit instructions > existing project-local directory > default
- Verify directory is ignored for project-local
- Read instructions first, then rank declarations and lockfile evidence
- Explain the selected evidence and command before workspace preparation
- Verify clean test baseline
