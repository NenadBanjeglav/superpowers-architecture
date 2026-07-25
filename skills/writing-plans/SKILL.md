---
name: writing-plans
description: Use when an approved local design spec exists and an exact implementation plan is needed before code changes
---

# Writing Plans

Write comprehensive implementation plans assuming the engineer has zero
context for the codebase. Document exact files, interfaces, tests, commands,
expected outputs, and grouped commit boundaries. Use DRY, YAGNI, strict TDD,
manual verification, and the shared Architecture Conformance rubric.

## Required Input and Validation Order

Start only from an Approved local Design Spec path and its exact expected
`sha256:` revision. Before inspecting the codebase, resolve the sibling
`using-superpowers` operation module and run:

```text
artifact validate --path <absolute-spec-path> --type "Design Spec" --expected-revision <exact-approved-sha256>
```

If validation fails, Node.js or the operation module is unavailable, the
artifact is Draft, or the digest differs, stop. Do not calculate approval
independently or rely on conversation memory.

Parse Foundation Traceability from the validated Approved source spec before
reading any Foundation file or inspecting the codebase:

- `Foundation Manifest` and `Agentic Foundation` must be a consistent pair.
- Both `none` means a generic workflow with no Foundation.
- Otherwise the manifest must be an absolute physical `WAYFINDING.md` path in
  this checkout and the revision must be one complete lowercase `sha256:`
  identity.
- Reject a half-none pair, relative path, malformed revision, mismatch with the
  handoff record, or duplicated traceability field.

For a non-none pair, run the shared operation:

```text
foundation validate --root <checkout-root> --manifest <absolute-WAYFINDING.md> --expected-revision <exact-approved-foundation-sha256>
```

Only after the exact source spec and every non-none Foundation validate may you
read both artifacts in full. Inspect the codebase fresh after those validations.
Follow the Root Router reading order for a Foundation-backed project. Stop and
report expected and actual identities on any missing, inconsistent, unproven,
or drifted value. Planning validates lifecycle state; it never reimplements
artifact canonicalization or Foundation candidate policy.

If no spec path or expected revision is provided, ask for it. Do not infer the
feature or approval from memory.

## Phase Mode Input

Read the validated spec's `### Phase Mode` section. If absent, read root
`AGENTS.md` for a durable preference.

If neither records a Phase Mode, ask:

```text
Should approval of this implementation plan start implementation in a fresh
session automatically, or should implementation continue in this same session
after approval?

Recommendation: Use the same mode selected during brainstorming. If no mode was
selected, use automated fresh sessions for architecture-sensitive work because
implementation starts from the approved plan with clean context.
```

Record the selected Phase Mode in the plan header.

## Save Plans To

`docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

Plans are local developer working state. Do not commit them. If
`docs/superpowers/**` is not ignored, warn the user but do not edit
`.gitignore` automatically.

## Scope and File Structure

If the Approved spec covers multiple independent subsystems, suggest splitting
it before writing one oversized plan. Each plan must produce working, testable
software on its own.

Map every file to create, modify, inspect, or remove and give each a clear
responsibility. Follow established codebase patterns over new abstractions.

## Task Granularity and Context

Each step is one concrete action:

- write or inspect a specific file;
- run a specific command;
- make a specific code change;
- run a specific test or manual check; or
- commit one grouped change.

Every implementation task must be self-contained. Its context block must repeat
the exact Approved plan path/revision, exact Approved source spec path/revision,
and the exact Foundation Manifest/Foundation Revision pair, including literal
`none` for a generic workflow. Do not make a later task infer Foundation
identity from an earlier task or conversation.

## Architecture Binding Per Task

Read `codebase-design/ARCHITECTURE-CONFORMANCE.md`. Every implementation task
must name the exact Approved Design Understanding it preserves:

- modules;
- interfaces;
- seams and production/test adapters;
- source-to-sink data flow;
- depth, locality, and leverage intent; and
- intended test surface.

Include an explicit Architecture Conformance check in each task with the exact
Approved spec, plan, and non-none Foundation identities. The check blocks on
any `violation`. If a task requires a different module, interface, seam,
adapter, data flow, or test surface, do not encode it as implementation
discretion. Return the controlling artifact to Draft and user review first.

## Commit Hygiene

Task commit steps may commit code, tests, migrations, public docs, plugin
metadata, and release assets.

Never include `docs/superpowers/**` in `git add` examples unless the user
explicitly requests committing local Superpowers docs.

## Plan Header

Every plan must start with:

```markdown
# <Feature Name> Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `<path-to-approved-spec>`

**Spec Revision:** `<exact approved sha256 digest>`

**Foundation Manifest:** <absolute WAYFINDING.md path or none>

**Foundation Revision:** <exact Approved sha256 revision or none>

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

## Planning Validation Evidence

- Approved source spec: `<absolute path>` at `<exact Approved revision>`
- Agentic Foundation: `<absolute WAYFINDING.md path>` at `<exact Approved revision>`, or `none`
- Validation order and results: `<exact artifact/Foundation commands and results>`
```

The template shows the required shape. At plan-writing time replace every angle-bracket token with a concrete value.
No angle-bracket token, `TODO`, `TBD`, or placeholder may remain. `Foundation Manifest` and `Foundation
Revision` must both be `none` or both carry the exact consistent absolute
path/revision pair parsed from the source spec. The plan must not substitute
the base Foundation revision when the Approved source spec names the resulting
prospective revision.

## No Placeholders

Do not write vague future-work markers, broad error-handling or validation
requests, tests without exact code and commands, or cross-task references that
require reading another task first.

If a step changes code, show the code. If a step validates behavior, show the
exact command and expected result.

## Advisory Plan Review

After writing the complete Draft plan, run:

```text
artifact refresh --path <absolute-plan-path> --type "Implementation Plan"
```

Then dispatch one host-neutral advisory plan review with isolated context,
balanced capability, and read-only workspace policy. Supply:

- the absolute plan path and exact Draft revision;
- the absolute Approved source spec path and exact revision;
- the exact Foundation manifest path and Approved revision, or literal `none`;
- the absolute shared Architecture Conformance rubric.

The reviewer verifies the plan's Foundation binding against the source spec and
may return only `Ready for user review` or `Issues found`; it cannot approve.
If isolation is unavailable, run the exact Self-Review below. Resolve issues
before presenting the plan. Any content edit must run `artifact draft` first
and `artifact refresh` afterward, followed by another advisory review or
deterministic self-review.

Use the review-gate message selected by Phase Mode:

```text
Draft plan written to `<path>` at `<sha256 revision>`. Please review that exact
revision before implementation. After you explicitly approve it, I will record
approval in the artifact and <start implementation in a fresh session |
continue to implementation in this same session> using the selected Phase
Mode.
```

If the user requests changes, draft, edit, refresh, re-review, and present the
new exact digest.

## Terminal State

After writing and reviewing the Draft plan, stop. Do not invoke implementation
skills until the user explicitly approves the reported exact revision.

After approval:

- Run
  `artifact approve --path <plan> --type "Implementation Plan" --expected-revision <reviewed-sha256>`.
  If approval fails, stop and require renewed review.
- Revalidate the Approved plan, source spec, and every non-none Foundation
  before handoff.
- In automated fresh-session mode, run the host-neutral `prepare handoff`
  preflight from `using-superpowers/references/phase-handoff.md`, build the
  canonical fifteen-field implementation prompt, and use the runtime adapter
  only if every affinity field can be preserved.
- In same-session mode, invoke `subagent-driven-development` for mostly
  independent tasks or `executing-plans` for linear tasks. The controller must
  independently revalidate the plan, spec, and Foundation from disk.

## Canonical Fifteen-Field Implementation Prompt

```text
Use <implementation-skill> to implement:
<absolute-plan-path>

Approved artifact:
- Type: Implementation Plan
- Revision: <exact approved plan sha256 digest>
- Source spec: <absolute spec path>
- Source spec revision: <exact approved spec sha256 digest>
- Foundation Manifest: <absolute WAYFINDING.md path or none>
- Foundation Revision: <exact approved Foundation sha256 digest or none>
- Repository remote: <canonical remote>
- Checkout root: <absolute checkout root>
- Branch: <branch or detached commit>
- Worktree identity: <main-checkout | linked-worktree | codex-managed-worktree | detached>
- Workspace policy: same-checkout
- Plugin source: <installed | local-plugin-dir | skills-install>
- Plugin root: <verified absolute path or none>
- Phase Mode: <selected mode>

Handoff record:
{
  "phase": "implementation",
  "repositoryRemote": "<canonical remote>",
  "checkoutRoot": "<absolute checkout root>",
  "branch": "<branch or detached commit>",
  "worktreeIdentity": "<main-checkout | linked-worktree | codex-managed-worktree | detached>",
  "artifactPath": "<absolute-plan-path>",
  "artifactType": "Implementation Plan",
  "approvedRevision": "<exact approved plan sha256 digest>",
  "sourceSpecPath": "<absolute spec path>",
  "sourceSpecRevision": "<exact approved spec sha256 digest>",
  "foundationManifestPath": "<absolute WAYFINDING.md path or none>",
  "foundationRevision": "<exact approved Foundation sha256 digest or none>",
  "pluginSource": "<installed | local-plugin-dir | skills-install>",
  "pluginRoot": "<verified absolute path or none>",
  "workspacePolicy": "same-checkout"
}

Before invoking <implementation-skill>, acknowledge all fifteen handoff fields
with the exact received values. Independently re-run repository, checkout,
branch, worktree, plan, source-spec, Foundation, ignored-file, and plugin-source
checks from disk. Stop on any missing, inconsistent, unproven, or drifted
value.

Validate the Approved plan and referenced Approved source spec at their exact
revisions. Parse and compare the plan/source-spec Foundation fields; validate
every non-none Foundation through the shared `foundation validate` operation
before inspecting the codebase. Read all validated artifacts and the codebase
fresh. Commit public work per task, but never commit docs/superpowers/** unless
explicitly asked.
```

## Self-Review

Before handing off the plan:

1. Confirm lifecycle metadata says `Artifact Type: Implementation Plan`,
   `Status: Draft`, and the plan binds the exact Approved source spec path and
   revision.
2. Confirm the Foundation fields are both `none` or exactly match the Approved
   source spec, and the planning validation evidence records the successful
   exact Foundation validation.
3. Confirm every spec requirement has a task.
4. Search for placeholder language and remove it.
5. Verify file paths, function names, command names, and commit messages are
   consistent.
6. Verify every task repeats the exact artifact and Foundation context, names
   the Approved modules/interfaces/seams/adapters/data flow/depth/locality/
   leverage/test surface, and runs the shared conformance check.
7. Verify the advisory review received the exact Foundation identity.
8. Verify the implementation handoff has exactly fifteen fields.
9. Verify no task commits `docs/superpowers/**`.
