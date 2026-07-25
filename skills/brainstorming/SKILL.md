---
name: brainstorming
description: Use before make/build/create/implement requests for apps, sites, tools, components, UI, APIs, workflows, feature work, architecture changes, behavior changes, or unclear requirements; writes a local design spec before planning or coding
metadata:
  priority: 100
---

# Brainstorming

<HARD-GATE>
Do not write implementation code, scaffold production files, create
implementation plans, or invoke implementation skills until the user has
approved the exact written Design Spec revision. When an Agentic Foundation is
present, do not proceed until the same approval also names the exact prospective
Foundation revision and the shared Foundation operation has applied and
validated that one Design Change Set.
</HARD-GATE>

## Priority

Use this skill before frontend, app-builder, design, framework,
implementation, or coding skills for generic app/site/tool/component prompts
such as `Let's make a react todo list`.

Only skip this skill when the user explicitly provides an Approved
Implementation Plan path, explicitly asks to bypass design/spec work, or asks
for a narrow mechanical edit that already has complete requirements.

## Inputs and Foundation Mode

Start from the user prompt. If it contains a Jira ticket key or URL and
Atlassian tools are available, read the ticket and relevant comments read-only.
If tools are unavailable, ask the user to paste the ticket content or continue
from the prompt. Never comment on or update Jira unless the user explicitly
asks.

Determine whether this is a Foundation-backed roadmap outcome or a generic
established-project workflow:

- A Foundation-backed invocation must supply a consistent pair: an absolute
  `WAYFINDING.md` path and an exact Approved lowercase `sha256:` Foundation
  revision. It must also identify one ready roadmap outcome and carry the exact
  canonical Brainstorming prompt when the invocation came from Wayfinder.
- Literal `none` is valid only as the complete path/revision pair for a generic
  established-project workflow with no Foundation. If only one value is
  `none`, the path is not absolute, the revision is incomplete, or a Foundation
  appears to exist but no exact pair was supplied, stop and request the exact
  values. Never infer approval from a filename or conversation memory.

For a Foundation-backed invocation, resolve the sibling `using-superpowers`
operation module and run:

```text
foundation validate --root <checkout-root> --manifest <absolute-WAYFINDING.md> --expected-revision <exact-approved-sha256>
```

Run this exact `foundation validate` before any Foundation or codebase
inspection. If it fails, Node.js or the operation module is unavailable, the
manifest is Draft, or the revision differs, stop with the expected and actual
values and the full-package installation guidance. Do not calculate or
canonicalize a Foundation revision independently.

## Explore Project Context

### Foundation-backed workflow

Only after exact validation succeeds:

1. Read the Approved Foundation through the Root Router in root `AGENTS.md` and
   follow its declared reading order.
2. Re-read `WAYFINDING.md`, `PROJECT-BLUEPRINT.md`, `ROADMAP.md`, relevant
   current-truth owners, and the immutable Decision Ledger entries selected by
   the Router.
3. Confirm the requested stable outcome identity exists, is `Ready for
   Brainstorming`, still links the named Blueprint requirements, has all
   decision prerequisites satisfied, and has the same exact canonical
   Brainstorming prompt as the handoff. Stop on any mismatch.
4. Inspect the codebase, related modules, interfaces, tests, and prior local
   specs only after the Foundation checks above.

Design exactly one ready roadmap outcome. Ordinary decisions needed to make
that one outcome coherent remain in Brainstorming and graduate through the
Design Change Set. Return to `wayfinder` instead of widening the spec when
discovery invalidates the project-wide destination, affects several roadmap
outcomes, changes the release boundary, makes project-wide architecture
unclear, reveals project-level fog, or requires roadmap reorientation.
Project-wide destination, release-boundary, architecture, or fog uncertainty
always returns to `wayfinder`.

### Generic established-project workflow

When the manifest and revision are both literal `none`, preserve the generic
single-spec behavior:

- inspect repository instructions, related modules, interfaces, tests, and
  prior patterns;
- read root `CONTEXT.md` if it exists as project context, but do not create it;
- search local `docs/superpowers/specs/` and
  `docs/superpowers/architecture-reviews/` if present; and
- keep task-specific and durable-impact reasoning in the Design Spec.

Do not create or update lowercase `context.md`, create ADRs, or offer a visual
companion.

## Phase Mode Selection

For a Foundation-backed workflow, use the durable Phase Mode recorded by
Wayfinder in the Root Router. Do not ask again.

For a generic workflow, read root `AGENTS.md` and optional root `CONTEXT.md`
for a durable preference. If none exists, ask:

```text
Do you want approvals in this workflow to start each next phase in a fresh
session automatically, or should I continue through planning and implementation
in this same session after each approval?

Recommendation: Use automated fresh sessions for larger or
architecture-sensitive work because each phase starts with clean context from
the approved artifact. Use same-session mode only when speed matters more than
context isolation.
```

Record the selected Phase Mode in the spec. If root `AGENTS.md` exists and the
user asks to make the preference durable, propose the exact update and wait for
approval before editing it. Do not create root `AGENTS.md` from Brainstorming.

## Adaptive Architecture Grilling

Ask one concise question at a time until the design is decision-complete. Every
question must be immediately followed by a concrete recommendation:

```text
<one concise question>

Recommendation: <the recommended answer and a short reason.>
```

For terse or generic prompts, ask at least one design question before writing
the spec. Increase rigor when language, module ownership, interfaces, seams,
adapters, data flow, depth/locality/leverage intent, test surface, or acceptance
criteria are unclear.

Use the `codebase-design` vocabulary:

- **Module**: anything with an interface and implementation.
- **Interface**: everything callers must know to use the module correctly.
- **Seam**: where an interface lives and behavior can be altered without
  editing in place.
- **Adapter**: a concrete thing satisfying an interface at a seam.
- **Depth**: leverage at the interface.
- **Leverage**: capability callers get from the interface.
- **Locality**: change and verification concentrated in one place.
- **Test surface**: the interface through which behavior should be verified.

Prefer deep modules with small interfaces, clear seams, explicit adapters, and
tests through the public interface.

## Required Spec Shape

Every new Design Spec, Foundation-backed or generic, must include:

```markdown
# <Feature Name> Design Spec

**Source:** <user prompt, pasted spec, or ticket reference>
**Date:** <YYYY-MM-DD>
**Artifact Type:** Design Spec
**Status:** Draft
**Revision:** none
**Approved Revision:** none
**Approved At:** none

## Problem

## Goal

## Non-Goals

## Design Understanding

### Language

**<Preferred Term>**:
<One or two sentence definition.>
_Avoid_: <rejected synonyms>

### Phase Mode

**Selected Mode:** <Automated fresh-session mode or same-session mode>
**Reason:** <one sentence>
**Durability:** <Durable in root AGENTS.md or workflow-chain-local>

### Architecture

- **Modules involved:**
- **Interfaces:**
- **Seams:**
- **Adapters:**
- **Data flow:**
- **Depth, locality, and leverage:**
- **Test surface:**

### Key Decisions

### Open Risks

## Foundation Traceability

**Foundation Manifest:** <absolute WAYFINDING.md path or none>
**Agentic Foundation:** <exact Approved sha256 revision or none>
**Roadmap Outcome:** <stable identity and title or none>
**Blueprint Requirements:** <stable identities or none>
**Prior Decisions:** <stable identities or none>

## Durable Documentation Impact

| Decision | Classification | Owning document | Candidate action |
|---|---|---|---|

## User-Facing Behavior

## Implementation Shape

## Testing Strategy

## Acceptance Criteria
```

The template describes the contract. The written spec must replace every angle-bracket token with a concrete value.
No angle-bracket token, `TODO`, `TBD`, or other placeholder may remain. Use literal `none` for every
Foundation Traceability value in a generic workflow.

## Durable Documentation Impact

Every design decision must be classified exactly once:

- `Task-local`: the Design Spec remains the owner; state why no Foundation
  candidate is needed.
- `Project-durable`: name the one current-truth owning document, the immutable
  Decision Ledger addition or supersession identity, and the complete candidate
  action.
- `Operating-contract`: name the root or child `AGENTS.md` owner and the
  complete candidate action.
- `No impact`: give an explicit reason.

The table must cover actual decisions rather than repeat section headings.
Owning-document locality matters: current truth changes in one owner, ledger
history is append-only, and navigation documents receive pointers rather than
copied detail.

When a Foundation-backed spec has no project-durable or operating-contract
changes, write the literal sentence `No durable documentation changes`, explain
why each decision remains task-local or has no impact, and prepare an empty
candidate. Its prospective Foundation revision must equal the Approved base Foundation revision.

## Writing the Draft

Write the Draft spec to:

`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`

These files are ignored local developer working state. Do not commit them. If
`docs/superpowers/**` is not ignored, warn the user but do not edit
`.gitignore` automatically.

Resolve the sibling operation module and run:

```text
artifact refresh --path <absolute-spec-path> --type "Design Spec"
```

Missing Node.js or a missing operation module fails closed. Do not calculate a
digest independently.

## Foundation Candidate Preparation

For a Foundation-backed spec, prepare the candidate only after the complete
Draft spec has been refreshed:

1. Re-run `foundation validate` for the exact Approved base revision.
2. Create the ignored, non-authoritative candidate root at
   `docs/superpowers/foundation-candidates/<design-spec-stem>/`.
3. Write `candidate.json` with the exact schema from
   `using-superpowers/references/agentic-foundation-lifecycle.md`. Its sorted
   change list must equal the spec's declared complete candidate actions.
4. Write complete candidate versions of every declared `upsert` under
   `files/<repository-relative-path>`. A deletion has no candidate file.
   Reject an undeclared candidate, a missing candidate, an extra file, a
   duplicate action, or a declared no-op.
5. For `No durable documentation changes`, write an empty `changes` array and
   an empty `files/` tree.
6. Run the public operation:

```text
foundation preview --root <checkout-root> --manifest <absolute-WAYFINDING.md> --candidate-root <absolute-candidate-root> --spec-path <absolute-spec-path> --expected-spec-revision <exact-draft-spec-sha256> --expected-base-revision <exact-approved-foundation-sha256>
```

The preview must be non-authoritative: do not edit authoritative Foundation
files before approval. Capture the exact prospective Foundation revision and
the operation-owned readable affected-file review in
`DESIGN-CHANGE-SET.md`. For an empty candidate, require the prospective
Foundation revision to equal the base.

Lifecycle canonicalization, candidate validation, readable diff generation,
application, rollback, recovery, and approval remain behind the shared
Foundation operation seam. Do not reproduce that policy in Brainstorming.

## Advisory Design Change Set Review

For a Foundation-backed spec, dispatch the isolated advisory document reviewer
with:

- the absolute Draft spec path and exact refreshed revision;
- the absolute Approved `WAYFINDING.md` path and exact base revision;
- the complete candidate root and `candidate.json`;
- the operation-owned readable `DESIGN-CHANGE-SET.md` review path and exact
  prospective Foundation revision; and
- the absolute shared Architecture Conformance rubric.

The reviewer uses isolated context, balanced capability, and a read-only
workspace. It may return only `Ready for user review` or `Issues found` and
cannot approve or mutate either artifact. If isolated review is unavailable,
run the deterministic checks from
`spec-document-reviewer-prompt.md`. Resolve every issue, then refresh and
preview again because any spec or candidate edit changes the reviewed
identities.

For a generic workflow, dispatch the same advisory role with the spec and
rubric only, preserving the existing single-artifact review.

## One Combined Design Change Set Gate

For a Foundation-backed spec, the sequence is exact:

1. Refresh the Draft Design Spec.
2. Revalidate the exact Approved base Foundation.
3. Create all declared complete candidates.
4. Run `foundation preview`.
5. Run the isolated Design Change Set review.
6. Present one readable review package naming the exact Design Spec path and
   revision, exact Approved base Foundation revision, exact prospective
   Foundation revision, candidate root, affected-file actions, and readable
   review path.
7. Stop for one exact approval that explicitly names both the exact Design
   Spec revision and exact prospective Foundation revision.

There is no second human Foundation review gate. A requested content change,
base drift, spec drift, candidate drift, missing or extra candidate, or
prospective digest mismatch returns to the same combined review gate with new
exact revisions.

Use this gate text:

```text
Draft Design Change Set is ready:
- Design Spec: `<absolute path>` at `<exact sha256 revision>`
- Approved base Foundation: `<exact sha256 revision>`
- Prospective Foundation: `<exact sha256 revision>`
- Candidate root: `<absolute path>`
- Readable affected-file review: `<absolute DESIGN-CHANGE-SET.md path>`

Please review that exact Design Spec revision and exact prospective Foundation
revision. One approval must name both revisions. After that exact approval I
will apply only this reviewed change set, validate both Approved results, and
start or continue planning according to the recorded Phase Mode.
```

After the user gives that one exact approval, run:

```text
foundation apply --root <checkout-root> --manifest <absolute-WAYFINDING.md> --candidate-root <absolute-candidate-root> --spec-path <absolute-spec-path> --expected-spec-revision <exact-reviewed-spec-sha256> --expected-base-revision <exact-approved-base-sha256> --expected-result-revision <exact-reviewed-prospective-sha256>
```

Then validate both exact Approved artifacts from disk:

```text
artifact validate --path <absolute-spec-path> --type "Design Spec" --expected-revision <exact-reviewed-spec-sha256>
foundation validate --root <checkout-root> --manifest <absolute-WAYFINDING.md> --expected-revision <exact-reviewed-prospective-sha256>
```

Any failure or drift stops planning and returns to the same combined review
gate. Successful apply is the single authority for approving the spec and
resulting Foundation; do not add a second `artifact approve` or Foundation
approval gate.

## Generic Written Spec Review Gate

When Foundation Manifest and Agentic Foundation are both literal `none`,
preserve the single-artifact lifecycle:

1. Refresh the Draft spec.
2. Run the advisory spec review or deterministic fallback.
3. Present its exact path and revision and stop.
4. After explicit approval, run
   `artifact approve --path <path> --type "Design Spec" --expected-revision <reviewed-sha256>`.
5. Validate the exact Approved spec before planning.

If the user requests changes, run `artifact draft` before editing,
`artifact refresh` afterward, and repeat review with the new digest.

## Planning Handoff

Planning may start only after the exact Approved Design Spec validates and, for
a Foundation-backed workflow, the exact resulting Approved Foundation
validates.

In automated fresh-session mode, run the host-neutral `prepare handoff`
preflight from `using-superpowers/references/phase-handoff.md`. Use the runtime
adapter only when it preserves all fifteen handoff fields and report the new
session identity or complete safe fallback prompt before stopping.

In same-session mode, invoke `writing-plans`, revalidate both artifacts, re-read
them and the codebase from disk, and stop at the written-plan review gate.

Canonical planning prompt:

```text
Use the writing-plans skill to create an implementation plan from:
<absolute-spec-path>

Approved artifact:
- Type: Design Spec
- Revision: <exact approved spec sha256 digest>
- Foundation Manifest: <absolute WAYFINDING.md path or none>
- Foundation Revision: <exact resulting approved Foundation sha256 digest or none>
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
  "phase": "planning",
  "repositoryRemote": "<canonical remote>",
  "checkoutRoot": "<absolute checkout root>",
  "branch": "<branch or detached commit>",
  "worktreeIdentity": "<main-checkout | linked-worktree | codex-managed-worktree | detached>",
  "artifactPath": "<absolute-spec-path>",
  "artifactType": "Design Spec",
  "approvedRevision": "<exact approved spec sha256 digest>",
  "sourceSpecPath": "none",
  "sourceSpecRevision": "none",
  "foundationManifestPath": "<absolute WAYFINDING.md path or none>",
  "foundationRevision": "<exact resulting approved Foundation sha256 digest or none>",
  "pluginSource": "<installed | local-plugin-dir | skills-install>",
  "pluginRoot": "<verified absolute path or none>",
  "workspacePolicy": "same-checkout"
}

Before invoking writing-plans, acknowledge all fifteen handoff fields with the
exact received values. Independently re-run repository, checkout, branch,
worktree, artifact, Foundation, ignored-file, and plugin-source checks from
disk. Validate the Approved Design Spec and every non-none Agentic Foundation
at the recorded exact revisions before inspecting the codebase. Stop on any
missing, inconsistent, unproven, or drifted value.

Read the Approved spec, resulting Approved Foundation, and codebase fresh. Save
the Draft plan under docs/superpowers/plans/, refresh and review its exact
revision, and stop at the written-plan review gate. Do not stage or commit
docs/superpowers/** unless explicitly asked.
```
