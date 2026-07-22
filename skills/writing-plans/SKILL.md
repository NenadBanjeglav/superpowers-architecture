---
name: writing-plans
description: Use when an approved local design spec exists and an exact implementation plan is needed before code changes
---

# Writing Plans

Write comprehensive implementation plans assuming the engineer has zero context for the codebase. Document exact files, interfaces, tests, commands, expected outputs, and commit boundaries. Use DRY, YAGNI, TDD, manual verification, and grouped commits.

## Required Input

Start only from an approved local Design Spec path and its exact expected `sha256:` revision. Before inspecting the codebase, resolve the sibling `using-superpowers` operation module and run `artifact validate --path <spec> --type "Design Spec" --expected-revision <digest>`.

If validation fails, Node.js or the operation module is unavailable, the artifact is Draft, or the digest differs, stop. Do not calculate approval independently or rely on prior conversation context. Read the validated spec from disk and inspect the codebase fresh.

If no spec path or expected revision is provided, ask for it. Do not infer the feature or approval from memory.

## Phase Mode Input

Read the approved spec's `### Phase Mode` section. If the spec has no phase-mode section, read root `AGENTS.md` for a durable Superpowers Architecture phase-mode preference.

If neither the spec nor root `AGENTS.md` records a Phase Mode, ask the user which mode governs this workflow before writing the plan:

```text
Should approval of this implementation plan start implementation in a fresh session automatically, or should implementation continue in this same session after approval?

Recommendation: Use the same mode selected during brainstorming. If no mode was selected, use automated fresh sessions for architecture-sensitive work because implementation starts from the approved plan with clean context.
```

Record the selected Phase Mode in the implementation plan header.

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

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `<path-to-approved-spec>`

**Spec Revision:** `<exact approved sha256 digest>`

**Artifact Type:** Implementation Plan

**Status:** Draft

**Revision:** none

**Approved Revision:** none

**Approved At:** none

**Goal:** <one sentence>

**Phase Mode:** <selected phase mode and durability>

**Architecture:** <2-3 sentences using Design Understanding from the spec>

**Tech Stack:** <key technologies/libraries>

---
```

## No Placeholders

Do not write vague instructions such as empty marker tokens, future-work notes, broad error-handling requests, broad validation requests, test requests without exact test code, or cross-task references that require reading another task first.

If a step changes code, show the code. If a step validates behavior, show the exact command and expected result.

## Written Plan Review Gate

After writing the complete Draft plan, run `artifact refresh --path <plan> --type "Implementation Plan"`. Then dispatch an isolated advisory document reviewer with the absolute plan path, absolute source spec path, isolated context, balanced capability, and read-only workspace policy.

The reviewer may return only `Ready for user review` or `Issues found`; it cannot approve. If isolation is unavailable, run the exact Self-Review checklist below. Resolve issues before presenting the plan. Any content edit must run `artifact draft` first and `artifact refresh` afterward, followed by another advisory review or deterministic self-review.

After writing the plan, ask one of these based on the selected Phase Mode.

Automated fresh-session mode:

```text
Draft plan written to `<path>` at `<sha256 revision>`. Please review that exact revision before implementation. After you explicitly approve it, I will record approval in the artifact and start implementation in a fresh session using the selected automated fresh-session mode.
```

Same-session mode:

```text
Draft plan written to `<path>` at `<sha256 revision>`. Please review that exact revision before implementation. After you explicitly approve it, I will record approval in the artifact and continue to implementation in this same session using the selected same-session mode.
```

If the user requests changes, run `artifact draft` before editing, update the plan, run `artifact refresh`, repeat advisory review or deterministic self-review, and repeat the review gate with the new digest.

## Terminal State

After writing and reviewing the Draft plan, stop. Do not invoke implementation skills until the user explicitly approves the reported exact revision.

After approval:

- Run `artifact approve --path <plan> --type "Implementation Plan" --expected-revision <reviewed sha256>` before any implementation handoff. If approval fails, stop and require renewed review.
- In automated fresh-session mode, build the canonical implementation prompt from the approved artifact, use the runtime adapter when available, report the spawned session identity or fallback prompt, then stop.
- In same-session mode, invoke `subagent-driven-development` when tasks are mostly independent or `executing-plans` when they are linear; revalidate the Approved plan and its referenced Approved source spec, re-read both artifacts and the codebase from disk, and implement from the plan.

Canonical implementation prompt:

Print the prompt that matches the approved plan shape:

- Use `subagent-driven-development` for mostly independent tasks where fresh subagents can work task-by-task.
- Use `executing-plans` for tightly coupled, linear, or no-subagent execution.

Prompt:

```text
Use <implementation-skill> to implement:
<absolute-plan-path>

Approved artifact:
- Type: Implementation Plan
- Revision: <exact approved plan sha256 digest>
- Source spec: <absolute spec path>
- Source spec revision: <exact approved spec sha256 digest>
- Repository remote: <canonical remote>
- Checkout root: <absolute checkout root>
- Branch: <branch or detached commit>
- Workspace policy: same-checkout
- Plugin source: <installed | local-plugin-dir | skills-install>
- Phase Mode: <selected mode>

Validate the Approved plan and referenced Approved source spec at those exact revisions before acting. Read both artifacts and the codebase fresh. Commit public work per task, but never commit docs/superpowers/** unless I explicitly ask.
```

## Self-Review

Before handing off the plan:

1. Check lifecycle metadata says `Artifact Type: Implementation Plan`, `Status: Draft`, and the plan binds the exact Approved source spec path and revision.
2. Check every spec requirement has a task.
3. Search for placeholder language and remove it.
4. Verify file paths, function names, command names, and commit messages are consistent across tasks.
5. Verify architecture decisions and test surface from the source spec are carried into tasks.
6. Verify no task commits `docs/superpowers/**`.
