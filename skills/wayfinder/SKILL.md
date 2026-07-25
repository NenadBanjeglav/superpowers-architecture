---
name: wayfinder
description: Use for greenfield project inception or project-wide reorientation to establish or resume an exact Agentic Foundation and Blueprint-traceable roadmap before feature Brainstorming
metadata:
  priority: 110
---

# Wayfinder

<HARD-GATE>
Wayfinder is documentation-only. Do not scaffold production code, framework or
package-manager files, source directories, databases, CI, deployment
configuration, implementation plans, feature Design Specs, ADRs, PRDs, issue
or triage flows, visual companions, or lowercase context.md.
</HARD-GATE>

Wayfinder is the sole project-inception and project-wide reorientation module.
Its interface is one-question-at-a-time discovery, a resumable `WAYFINDING.md`,
exact Agentic Foundation review, and a Blueprint-traceable roadmap-outcome
handoff to `brainstorming`.

Use Wayfinder for a deliberate greenfield downstream project, a missing project
foundation, or uncertainty broad enough to change the project destination,
release boundary, project-wide architecture, or several roadmap outcomes.
Bounded feature design and ordinary durable decisions for one roadmap outcome
remain in `brainstorming`.

## Architecture Boundaries

Keep these seams explicit:

- the **project-inception seam** from Wayfinder's exact Approved Foundation to
  one bounded Brainstorming outcome;
- the **root-routing seam** from root `AGENTS.md` to the minimum authoritative
  document set;
- the **current-truth/ledger seam** between replace-in-place current truth and
  immutable decision evidence;
- the **Blueprint/spec seam** between project-wide requirements and later
  feature Design Understanding;
- the **lifecycle seam** between human-readable Foundation documents and the
  shared canonical operation core; and
- the **runtime seam** between this host-neutral policy and concrete fresh
  session capabilities.

Foundation document, primary-source research, roadmap, lifecycle, and runtime
adapters sit only at those seams. Data flows from inspected downstream state
and explicit user decisions through Draft current-truth owners, immutable
ledger entries, the Project Blueprint, and traceable roadmap outcomes to one
exact Approved Agentic Foundation and one same-checkout Brainstorming phase.
Do not add a parallel truth store, lifecycle implementation, or host-specific
branch inside Wayfinder.

## Repository Boundary

Wayfinder writes only in the user's deliberate downstream project checkout. The
Superpowers Architecture plugin repository is a skill source, not a downstream
target: do not create its root `CONTEXT.md` or a `docs/agentic/` Foundation
there. If the current checkout is this plugin repository and the user is
maintaining the plugin, follow its local instructions instead of running
Wayfinder as project inception.

Before asking a question or writing:

Read root `AGENTS.md` and every applicable child instruction file before
editing.

1. Resolve the exact checkout root and read the applicable instruction chain,
   beginning with root `AGENTS.md` and continuing through every child
   `AGENTS.md` that owns an inspected or proposed path.
2. Inspect existing project files, current documentation, source and test
   boundaries, Git state, and verification commands without mutating them.
3. Confirm that the user intends this checkout to be the downstream project.
4. Read
   [agentic-foundation-contract.md](references/agentic-foundation-contract.md)
   and use it as the only detailed downstream document-shape contract.
5. Read
   [agentic-foundation-lifecycle.md](../using-superpowers/references/agentic-foundation-lifecycle.md)
   before any Foundation lifecycle transition.

## Establish Or Resume The Foundation

Treat `docs/agentic/WAYFINDING.md` as the resumable map and lifecycle manifest.
Do not depend on conversation memory.

- If no manifest exists, create the lean core document set from the Foundation
  contract, initialize all lifecycle metadata as Draft, and run `foundation draft`.
- If an Approved manifest exists, run `foundation validate` with its exact
  recorded revision before reading it as current truth. For project-wide
  reorientation, run `foundation draft` on the exact validated bundle before
  editing.
- If a Draft manifest exists, verify its managed file set and run `foundation
  refresh` to establish the exact current Draft revision before resuming.
- If lifecycle metadata, managed paths, checkout identity, or canonical bytes
  are invalid or ambiguous, stop and repair the Foundation contract state. Do
  not guess a revision or copy one from chat.

The lean core is root `AGENTS.md`, root `CONTEXT.md`, and the required
`docs/agentic/` files named by the Foundation contract. Create an optional
security, data, style, or operations document only when the project has a
durable concern that needs that owner. Record the justification in
`WAYFINDING.md`; absence of a concern is not a reason to create an empty file.

## Wayfinding State

Keep these navigation fields current in `WAYFINDING.md`:

- **Destination:** the observable Agentic Foundation state this effort must
  reach.
- **Readiness:** the checklist that must pass before exact Foundation review.
- **Frontier:** precise in-scope decisions that are answerable now.
- **Fog:** in-scope areas known to matter but not yet precise enough to ask.
- **Out of Scope:** explicit exclusions from this inception or reorientation.
- **Decision Pointers:** identities and links to the immutable Decision Ledger,
  never copied decision detail.

Advance only the current Frontier. When an answer makes fog precise, promote it
to the Frontier. When a decision exposes a prerequisite, order that prerequisite
first. A simple project may reach readiness in one session; a larger one resumes
from these fields and the authoritative documents.

## One-Question Discovery

Ask one concise question at a time. Put the question first and immediately
follow it with a concrete recommendation and a short reason:

```text
<one concise question>

Recommendation: <one concrete choice and the short reason it fits the current
project evidence.>
```

Wait for the user's answer before treating the decision as resolved. Cover only
what the Destination and current readiness gaps require: project identity,
users, journeys, goals, non-goals, success, scope, domain language, project-wide
requirements, release boundaries, technology, architecture, style,
authentication, security, data, integrations, deployment, operations,
verification, risks, and roadmap orientation.

Use `codebase-design` vocabulary consistently: module, interface, seam, adapter,
depth, leverage, locality, and test surface.

## Research And Decision Persistence

Before recommending a version-sensitive, security-sensitive, costly, or
difficult-to-reverse choice, research current primary sources. Prefer official
documentation, standards, vendor security material, and original research over
aggregators. Record the source URLs, the verification date, and any material
version or scope limits in the immutable decision ledger entry.

Every resolved durable decision performs one atomic documentation update:

1. Update exactly one current-truth owner and remove stale contradictory truth
   there.
2. Append one immutable decision ledger entry with its stable identity,
   decision, area, rationale, alternatives, evidence, current-truth link,
   Blueprint or roadmap links, and supersession link when applicable.
3. Regenerate only the replaceable current-decision index.
4. Update Wayfinding navigation pointers and Frontier/Fog state without copying
   the decision detail.

Never rewrite or delete an immutable decision ledger entry to erase history.
Supersede it with a new entry. Do not duplicate current truth in the Root
Router, dashboard, Wayfinding Map, Blueprint, or ledger.

Create stable Blueprint requirement identities and stable roadmap outcome
identities using the Foundation contract. Never renumber or reuse an identity.
Every roadmap outcome links the requirements it advances, its decision
prerequisites and dependencies, its readiness, and one canonical
`brainstorming` prompt.

## Phase Mode

Ask once which progression mode the project should use after exact artifact
approval. Recommend Automated fresh-session mode for clean context from exact
Approved artifacts, unless the runtime cannot prove same-checkout and plugin
affinity.

Record the selected Phase Mode durably in root `AGENTS.md` using the exact
Foundation contract shape:

- **Automated fresh-session mode:** approval prepares a verified fifteen-field
  same-checkout handoff to a genuinely new user-owned session.
- **Same-session mode:** approval continues only after exact validation and a
  same-session disk re-read.

Follow this durable selection at later gates. Do not silently change it because
a runtime adapter is unavailable; use the canonical fallback required by the
phase-handoff contract.

## Readiness, Refresh, And Advisory Review

Before presenting the Foundation:

1. Complete every item in the Foundation contract's Readiness Checklist.
2. Verify Root Router links, Child DOX indexes, Foundation file selection,
   Blueprint requirement links, decision evidence, roadmap dependencies, and
   at least one outcome marked Ready for Brainstorming.
3. Confirm no Frontier decision or Fog blocks that ready outcome and all
   remaining non-blocking uncertainty is visible.
4. Run `foundation refresh` and capture the exact Draft Foundation revision.
5. Dispatch the host-neutral Foundation document reviewer defined in
   [foundation-document-reviewer-prompt.md](foundation-document-reviewer-prompt.md)
   with the contract, shared Architecture Conformance rubric, manifest, and
   every selected Foundation file.
6. If it reports `Issues found`, repair the Draft documents, refresh the
   revision, and review again. Continue only when it reports `Ready for user review`.

## Exact Foundation Review Gate

Present the exact absolute manifest path, exact Draft Foundation revision,
managed file list, readable changes, ready roadmap outcome, and Phase Mode.
Then stop for user review.

Do not run `foundation approve`, start `brainstorming`, create a feature Design
Spec, write an implementation plan, or scaffold production files before the
user explicitly approves that exact Foundation revision. Advisory review is not
approval. Any edit changes the reviewed bundle and requires refresh and renewed
review.

## After Exact Approval

After explicit approval of the exact revision, run `foundation approve` only
after the refresh check below succeeds.

After the user explicitly approves the exact Draft Foundation revision:

1. Re-run `foundation refresh` and require the same revision.
2. Run `foundation approve` with that exact revision.
3. Run `foundation validate` from disk with that exact Approved revision.
4. Recheck checkout, manifest, roadmap outcome, and durable Phase Mode.

For Automated fresh-session mode, prepare the immutable fifteen-field
same-checkout `brainstorming` record from
[phase-handoff.md](../using-superpowers/references/phase-handoff.md). The
Approved `WAYFINDING.md` is both the handoff artifact and Foundation manifest;
the same exact Foundation revision fills both revision fields. Use the
runtime-specific adapter only after shared preflight succeeds. If exact checkout
or plugin affinity is uncertain, print the complete canonical fallback and
stop.

For Same-session mode, revalidate the exact Approved Foundation, then re-read
root `AGENTS.md`, root `CONTEXT.md`, the manifest-selected Foundation documents,
the ready roadmap outcome, and relevant downstream files from disk. Only then
invoke `brainstorming` for that one bounded roadmap outcome in the same session.

Wayfinder is complete when one exact Agentic Foundation is Approved and the
selected handoff or safe fallback has been prepared. It does not perform
feature design, planning, or implementation.
