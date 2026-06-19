---
name: writing-plans
description: Use when an approved local design spec exists and an exact implementation plan is needed before code changes
---

# Writing Plans

Write comprehensive implementation plans assuming the engineer has zero context for the codebase. Document exact files, interfaces, tests, commands, expected outputs, and commit boundaries. Use DRY, YAGNI, TDD, manual verification, and grouped commits.

## Required Input

Start only from an approved local spec path. Read the spec from disk and inspect the codebase fresh. Do not rely on prior conversation context.

If no spec path is provided, ask for it. Do not infer the feature from memory.

## Save Plans To

`docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

Plans are local developer working state. Do not commit them. If `docs/superpowers/**` is not ignored, warn the user but do not edit `.gitignore` automatically.

## Scope Check

If the approved spec covers multiple independent subsystems, suggest splitting it into separate implementation plans before writing a single oversized plan. Each plan must produce working, testable software on its own.

## File Structure

Before defining tasks, map out files to create, modify, inspect, or remove. Each file should have a clear responsibility. Follow existing codebase patterns over new abstractions.

## Task Granularity

Each step is one concrete action:

- write or inspect a specific file
- run a specific command
- make a specific code change
- run a specific test or manual check
- commit a grouped change

## Commit Hygiene

Task commit steps may commit code, tests, migrations, public docs, plugin metadata, and release assets.

Never include `docs/superpowers/**` in `git add` examples unless the user explicitly requests committing local Superpowers docs.

## Plan Header

Every plan must start with:

```markdown
# <Feature Name> Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `<path-to-approved-spec>`

**Goal:** <one sentence>

**Architecture:** <2-3 sentences using Design Understanding from the spec>

**Tech Stack:** <key technologies/libraries>

---
```

## No Placeholders

Do not write vague instructions such as empty marker tokens, future-work notes, broad error-handling requests, broad validation requests, test requests without exact test code, or cross-task references that require reading another task first.

If a step changes code, show the code. If a step validates behavior, show the exact command and expected result.

## Written Plan Review Gate

After writing the plan, ask:

```text
Plan written to `<path>`. Please review it before implementation. I will not start implementation until you approve this written plan.
```

If the user requests changes, update the plan and repeat the review gate.

## Terminal State

After the user approves the written plan, stop. Do not invoke implementation skills in the same session.

Print:

```text
Start a fresh session in the same checkout and say:

Use subagent-driven-development to implement:
<absolute-or-repo-relative-plan-path>

Read the plan, referenced spec, and codebase fresh. Use worktree isolation if I request it or if one is already active. Commit code per task, but never commit docs/superpowers/** unless I explicitly ask.
```

## Self-Review

Before handing off the plan:

1. Check every spec requirement has a task.
2. Search for placeholder language and remove it.
3. Verify file paths, function names, command names, and commit messages are consistent across tasks.
4. Verify no task commits `docs/superpowers/**`.
