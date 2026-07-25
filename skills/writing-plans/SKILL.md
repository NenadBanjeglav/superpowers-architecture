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
reading any Foundation file or inspecting the codebase. The spec supplies the
`Foundation Manifest` and `Base Agentic Foundation` identity. The phase prompt
or same-session apply result must additionally supply the `Foundation Result
Revision` and physical `Foundation Application Receipt`.

Treat these as one four-field binding:

- `Foundation Manifest`
- `Foundation Base Revision`
- `Foundation Result Revision`
- `Foundation Application Receipt`

All four must be literal `none` for a generic workflow. Otherwise the manifest
must be an absolute physical `WAYFINDING.md` path in this checkout, both
revisions must be complete lowercase `sha256:` identities, and the receipt must
be the absolute physical candidate-root `APPLIED.json` path. Reject a half-none
binding, relative path, malformed revision, duplicated traceability field,
non-ignored receipt, or mismatch among the spec, phase input, and receipt.

For a Foundation-backed workflow, run the receipt-backed shared operation:

```text
foundation validate --root <checkout-root> --manifest <absolute-WAYFINDING.md> --expected-revision <exact-result-sha256> --receipt <absolute-candidate-root-APPLIED.json> --spec-path <absolute-approved-spec-path> --expected-spec-revision <exact-approved-spec-sha256> --expected-base-revision <exact-base-sha256>
```

Before this command, run `git check-ignore --quiet` for the source spec and
receipt (and for the plan once it exists). A non-ignored receipt is an affinity
failure. Only after the exact source spec and receipt-backed Foundation validate
may you read both artifacts in full. Inspect the codebase fresh after those
validations. Follow the Root Router reading order for a Foundation-backed
project. Stop and report expected and actual identities on any missing,
inconsistent, unproven, or drifted Foundation value. Planning consumes the
physical application receipt; it never canonicalizes a Foundation or
reimplements candidate policy.

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
the exact Approved source spec path/revision and all four Foundation fields:
Foundation Manifest, Foundation Base Revision, Foundation Result Revision, and
Foundation Application Receipt. Use literal `none` for all four in a generic
workflow. A Draft plan cannot embed or require its own future digest. Do not
make a later task infer source-spec or Foundation identity from an earlier task
or conversation.

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
Approved source spec and non-none Foundation identities. The check blocks on
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

**Foundation Base Revision:** <exact Approved sha256 revision or none>

**Foundation Result Revision:** <exact Approved sha256 revision or none>

**Foundation Application Receipt:** <absolute APPLIED.json path or none>

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
- Foundation Manifest: `<absolute WAYFINDING.md path or none>`
- Foundation Base Revision: `<exact Approved sha256 revision or none>`
- Foundation Result Revision: `<exact Approved sha256 revision or none>`
- Foundation Application Receipt: `<absolute APPLIED.json path or none>`
- Validation order and results: `<exact artifact/receipt-backed Foundation commands and results>`
```

The template shows the required shape. At plan-writing time replace every angle-bracket token with a concrete value.
No angle-bracket token, `TODO`, `TBD`, or placeholder may remain. All four
Foundation fields must be literal `none` or carry the exact consistent
manifest/base/result/receipt binding validated before planning.

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
- the exact Foundation manifest, base revision, result revision, and
  application receipt, or literal `none` for all four;
- the absolute shared Architecture Conformance rubric.

The reviewer performs a static review of the Draft plan and verifies the plan's
Foundation binding against the source spec and supplied receipt identity. It
does not require a future Approved plan digest or a rendered implementation
handoff. It may return only `Ready for user review` or `Issues found`; it cannot
approve. If isolation is unavailable, run the exact Self-Review below. Resolve
issues before presenting the plan. Any content edit must run `artifact draft`
first and `artifact refresh` afterward, followed by another advisory review or
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
- Revalidate the Approved plan, source spec, and every non-none receipt-backed
  Foundation binding before handoff.
- In automated fresh-session mode, run the host-neutral `prepare handoff`
  preflight from `using-superpowers/references/phase-handoff.md`, build the
  canonical fifteen-field implementation prompt. Render the canonical implementation prompt
  only after exact approval and append the external receipt binding shown below.
  Verify the rendered implementation handoff before using the runtime adapter,
  and continue only if every affinity field can be preserved.
- In same-session mode, invoke `subagent-driven-development` for mostly
  independent tasks or `executing-plans` for linear tasks. The controller must
  independently revalidate the plan, spec, and receipt-backed Foundation from
  disk.

Only after exact plan approval may the handoff inject the exact Approved plan path and revision into the
implementation dispatch prompt or task brief. This post-approval dispatch
binding is external to the Draft plan's task contexts.

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
- Foundation Base Revision: <exact Approved base sha256 digest or none>
- Foundation Result Revision: <exact Approved result sha256 digest or none>
- Foundation Application Receipt: <absolute candidate-root APPLIED.json path or none>
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

Foundation Application Receipt: <absolute candidate-root APPLIED.json path or none>

Before invoking <implementation-skill>, acknowledge all fifteen handoff fields
with the exact received values, then separately acknowledge the Foundation
Application Receipt external binding. Independently re-run repository,
checkout, branch, worktree, plan, source-spec, receipt-backed Foundation,
ignored-file, and plugin-source checks from disk. Stop on any missing,
inconsistent, unproven, or drifted value.

Validate the Approved plan and referenced Approved source spec at their exact
revisions. Parse and compare all four plan/source-spec/handoff Foundation
fields. For a non-none binding, run `git check-ignore --quiet` on the receipt
and use the receipt-backed `foundation validate` operation with the result,
receipt, source spec, source-spec revision, and base revision before inspecting
the codebase. Read all validated artifacts and the codebase fresh. Commit
public work per task, but never commit docs/superpowers/** unless explicitly
asked.
```

## Self-Review

Before handing off the plan:

1. Confirm lifecycle metadata says `Artifact Type: Implementation Plan`,
   `Status: Draft`, and the plan binds the exact Approved source spec path and
   revision.
2. Confirm all four Foundation fields are literal `none` or exactly match the
   Approved source spec and application receipt, and the planning validation
   evidence records the successful receipt-backed Foundation validation.
3. Confirm every spec requirement has a task.
4. Search for placeholder language and remove it.
5. Verify file paths, function names, command names, and commit messages are
   consistent.
6. Verify every task repeats the exact Approved source spec and all four
   Foundation fields without a future plan digest, names the Approved
   modules/interfaces/seams/adapters/data flow/depth/locality/leverage/test
   surface, and runs the shared conformance check.
7. Verify the advisory review received the exact Foundation base, result, and
   receipt binding.
8. Verify the implementation handoff has exactly fifteen JSON fields and the
   Foundation Application Receipt is an external binding outside that record.
9. Verify no task commits `docs/superpowers/**`.
