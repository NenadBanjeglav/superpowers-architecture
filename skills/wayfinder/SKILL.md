---
name: wayfinder
description: Use for greenfield project inception or project-wide reorientation to establish or resume the Agentic Foundation, Project Blueprint, traceable roadmap, Approval Policy, and Phase Mode before bounded design
---

# Wayfinder

Wayfinder owns project-level direction and the documentation-only Agentic
Foundation. It does not design one feature, write an implementation plan, or
scaffold production code.

Read `using-superpowers`, the applicable instruction chain, the complete
[Agentic Foundation contract](references/agentic-foundation-contract.md), the
[Foundation lifecycle](../using-superpowers/references/agentic-foundation-lifecycle.md),
the [workflow policy](../using-superpowers/references/workflow-policy.md), and
the shared Architecture Conformance rubric before editing.

## Entry

1. Resolve the physical repository root, branch/worktree identity, applicable
   instructions, and ignored local working-state rules.
2. Resolve **Approval Policy**. Workflow Policy Version 2 defaults new and
   existing projects to Autonomous. Review-gated requires a new explicit user
   opt-in. If active legacy gate clauses exist, migrate them narrowly through
   the shared `workflow migrate` operation before they block this phase.
3. Discover an existing root `CONTEXT.md`, `docs/agentic/WAYFINDING.md`, and
   every manifest-selected Foundation document. Never create these inside the
   Superpowers Architecture plugin repository itself.
4. Determine whether this is new inception, Foundation resumption, or
   project-wide reorientation. If the request is one bounded outcome in an
   established project, route to `brainstorming`.
5. Preserve a durable **Phase Mode** already recorded in the Root Router. Ask
   about it only when no preference exists and the difference materially
   affects progression. Recommend automated fresh-session mode when the runtime
   can prove exact same-checkout affinity; otherwise recommend same-session
   mode and say why.

## Discovery

Ask one concise question at a time. Put the question first, then give one
concrete recommendation and a short reason. Prefer targeted repository
inspection over asking for facts available on disk.

Resolve enough to make these project-wide facts coherent:

- destination and observable success;
- users, journeys, scope, and explicit out-of-scope boundaries;
- release boundary and non-negotiable business, privacy, security, data, and
  external-action constraints;
- modules, interfaces, seams, adapters, data flow, depth, locality, leverage,
  and test surface;
- current facts, assumptions, sources, Frontier, Fog, and Out of Scope;
- stable Project Blueprint requirements and roadmap outcomes;
- one bounded outcome whose prerequisites are met and whose readiness is
  `Ready for Brainstorming`.

Do not turn discovery into a questionnaire. Do not invent decisions to eliminate
uncertainty. A consequential unresolved direction choice is a valid user
question; ordinary documentation and architecture repairs are agent-owned under
Autonomous.

## Foundation Shape

Follow the Foundation contract exactly. The minimum Foundation is:

- root `CONTEXT.md` as the concise Root Router;
- `docs/agentic/WAYFINDING.md` as the only lifecycle manifest;
- the compact dashboard and manifest-selected current-truth documents;
- `PROJECT-BLUEPRINT.md` with stable requirement identities;
- `ROADMAP.md` with stable `OUT-NNN` identities, prerequisites,
  dependencies, readiness, state, and exact Brainstorming prompts;
- `DECISIONS.md` with an append-only immutable Decision Ledger and a mutable
  Current Decision Index; and
- verification and evidence owners required by the contract.

Use optional documents only when they have durable ownership. Current truth has
one owner. Durable decision changes append a new ledger entry naming
`Supersedes`; never edit an earlier entry. Update parent and child AGENTS.md
Child DOX indexes when ownership changes.

The Foundation remains documentation-only. Do not create framework files,
package-manager files, production source, feature specs, implementation plans,
ADRs, PRDs, issue/triage flows, visual companions, or lowercase `context.md`.

## Managed Edit and Review

Use the shared Foundation operations; never calculate or rewrite a bundle
revision manually.

1. Run `foundation draft` before managed edits. For a new Foundation, create
   the exact contract shape and initialize Draft metadata through the operation.
2. Edit complete current-truth documents, Root Router, manifest, Blueprint,
   roadmap, decision evidence, and affected AGENTS.md owners.
3. Run `foundation refresh` and record its exact revision.
4. Render a readable Foundation review package covering the changed owners,
   Blueprint/roadmap traceability, Architecture Conformance, policy, Phase Mode,
   and remaining uncertainty.
5. Dispatch the isolated
   [Foundation reviewer](foundation-document-reviewer-prompt.md) when the runtime
   can realize read-only isolation. Otherwise run the same deterministic checks
   yourself.
6. Resolve every `Issues found` result. In-scope corrections return through
   Draft and refresh, then review again. Do not ask the user to approve technical
   repairs or migration.
7. Under Autonomous, run `foundation ready` on the exact internally reviewed
   revision and validate with `--policy Autonomous`.
8. Under Review-gated, present one readable package. After a clear user response
   approving that displayed revision, bind it internally and run
   `foundation approve`; never ask the user to type a hash.

Reviewer output is advisory and never changes lifecycle state.

## Readiness Checks

Before progression confirm:

- the manifest selects every owned Foundation document and no unrelated file;
- lifecycle metadata and computed bundle revision agree;
- one destination, release boundary, and success definition are concrete;
- Blueprint requirements and roadmap traceability are complete;
- at least one outcome is `Ready for Brainstorming`;
- the selected outcome's canonical prompt names its identity, physical
  `WAYFINDING.md` path, and exact policy-accepted Foundation revision;
- Frontier, Fog, Out of Scope, permissions, and external-action limits are
  visible;
- module/interface/seam/adapter/data-flow/test-surface decisions conform;
- current truth and immutable decision history have correct owners;
- Approval Policy Version 2 and Phase Mode are durable and independent; and
- local generated files are ignored and unstaged.

## Progress to Brainstorming

Choose one ready roadmap outcome. Do not widen it.

For automated fresh-session mode, create the exact v2 envelope from
[phase-handoff.md](../using-superpowers/references/phase-handoff.md). Use the
policy-accepted Foundation as both phase artifact and Foundation; bind the
selected outcome identity and exact canonical prompt outside the fifteen-field
record. Run `handoff prepare`, require runtime proof of same-checkout,
plugin, ignored-state, and genuinely fresh user-owned session identity, then
inspect target acknowledgement and `handoff receive`. A v1 receiver cannot
receive a Ready Foundation.

For same-session mode, validate the exact Foundation with explicit policy and
re-read Root Router, manifest-selected documents, the chosen roadmap section,
applicable instructions, and relevant repository files. Then invoke
`brainstorming` directly with the exact outcome identity and canonical prompt.

If a fresh-session capability is missing, follow the durable fallback rather
than inventing a substitute. Never describe a fork or subagent as a fresh phase.
