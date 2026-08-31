---
name: using-superpowers
description: Use when starting a conversation to resolve workflow policy, migrate legacy Superpowers gates at a safe boundary, and route project-wide work to wayfinder or bounded work to brainstorming before planning or implementation
metadata:
  priority: 100
---

# Using Superpowers Architecture

Superpowers Architecture is an architecture-first workflow. Apply this skill
before choosing another workflow skill.

## Route the Work

- Use `wayfinder` for greenfield inception, a missing Agentic Foundation,
  project-wide reorientation, destination or release-boundary changes,
  project-wide architecture, or fog spanning several roadmap outcomes.
- Use `brainstorming` for one bounded roadmap outcome, feature, app, site,
  tool, component, UI, API, workflow, behavior, or bounded architecture change.
- Return from bounded discovery to `wayfinder` when it invalidates the project
  destination or affects several roadmap outcomes.
- Use `systematic-debugging` before proposing a fix for a bug, failing test,
  regression, broken build, or unexpected behavior.
- Use `writing-plans` only from an exact policy-accepted Design Spec.
- Use `subagent-driven-development` for mostly independent plan tasks or
  `executing-plans` for linear execution, only from an exact policy-accepted
  Implementation Plan.
- Use `verification-before-completion` before a completion claim unless
  `finishing-a-development-branch` supplies the stricter closeout.

Host-specific tool names and runtime capabilities live in `references/`.
Shared skills use the host-neutral dispatch request in
`references/dispatch-contract.md`. Fresh phase sessions use
`references/phase-handoff.md`; they are never subagent dispatches.

## Resolve Workflow Policy on Entry

Read the applicable instruction chain before phase checks.

**Approval Policy** defaults to `Autonomous` for new and existing projects.
`Review-gated` applies only after a new explicit user instruction under
Workflow Policy Version 2. Legacy gate prose, old Approved artifacts, and Phase
Mode do not opt into Review-gated.

If an existing project's active Superpowers instructions still require legacy
document approval:

1. identify only the active workflow-gate clauses and affected current
   Foundation/spec/plan bindings;
2. preserve the goal, acceptance criteria, business and safety constraints,
   external-action authority, Phase Mode, user work, and immutable decision
   history;
3. prepare complete replacement document bytes and review the narrow diff;
4. at a safe boundary with no competing writer, invoke `workflow migrate`
   from `references/workflow-policy.md`; and
5. validate the migrated policy and affected artifacts, then resume useful work.

Do not ask for migration approval or scan unrelated dormant projects. Startup
only directs this entry check; it never runs a broad migration itself.

## Lifecycle and Progression

Design Specs, Implementation Plans, and Agentic Foundations use truthful states:

- **Draft:** incomplete or changed content; never executable.
- **Ready:** applicable checks and blocking advisory findings are resolved for
  the exact revision; human approval fields remain `none`.
- **Approved:** a human explicitly approved the exact revision.

Always pass the effective Approval Policy to shared lifecycle consumers.
Autonomous accepts Ready or Approved. Review-gated accepts Approved only.
Omitted-policy operations retain strict v1 compatibility.

Managed changes return the artifact through Draft, refresh, advisory review, and
then Ready or Approved according to policy. Under Autonomous, the controller
owns in-scope design, plan, review, test, and documentation repairs and
continues when Ready. Under Review-gated, present one readable package and bind
a clear user response internally; never ask the user to type a digest.

Ask the user only for an unresolved consequential product choice, a goal or
constraint change, missing input/access that blocks further safe work, or an
external action beyond existing authority. Complete independent safe work
first. Never weaken requirements, acceptance criteria, privacy, security, data
safety, or publication/deployment boundaries to keep moving.

Validate an authoritative input once on first use in a fresh, resumed, or
compacted context; after its bytes or dependencies change; after a
branch/checkout change or possible external writer; and inside a critical
mutation lock. Reuse unchanged evidence within one uninterrupted controller
context.

## Phase Flow

1. `wayfinder` establishes or resumes the documentation-only Agentic
   Foundation, Project Blueprint, traceable roadmap, Approval Policy, and
   independent Phase Mode.
2. It reviews the exact Foundation. Autonomous resolves issues, records Ready,
   and progresses. Review-gated presents one readable Foundation package and
   progresses only after clear human approval.
3. `brainstorming` designs one bounded outcome, classifies durable
   documentation impact, previews any prospective Foundation change, and runs
   one advisory review.
4. Autonomous resolves findings, records the Design Spec Ready, applies any
   reviewed policy-bound Foundation change, validates the result, and progresses
   to Planning. Review-gated uses one combined readable package and clear human
   approval before apply/progression.
5. `writing-plans` validates the exact current spec/Foundation/receipt, writes
   one implementation plan, reviews it, and records Ready or Approved according
   to policy.
6. The selected implementation controller validates the exact plan/spec and
   optional Foundation receipt, then implements, reviews, repairs, and verifies
   the bounded goal.
7. `finishing-a-development-branch` runs final evidence and summarizes local
   state. Push, merge, PR creation, deployment, publication, spending,
   communication with others, destructive actions, and discarding work remain
   separately authorized.

## Phase Mode

Approval Policy and Phase Mode are independent.

**Automated fresh-session mode** progresses a policy-accepted artifact through
the v2 envelope in `references/phase-handoff.md` when the user request or
durable Phase Mode authorizes task creation and the runtime proves exact
checkout, plugin, ignored-state, constraint, and fresh-session affinity.

**Same-session mode** continues after re-reading applicable instructions,
policy-accepted artifacts, Foundation evidence, and relevant code from disk.
It does not repeat valid unchanged checks only because the skill name changed.

If automated launch is unavailable or unsafe, follow the recorded Phase Mode's
fallback. Never copy ignored state, choose another checkout, fabricate
freshness, or turn a runtime limitation into a document-approval request. A v1
receiver accepts genuinely Approved inputs only and must reject Ready.

<!-- STARTUP-CONTRACT:START -->
1. Route through the applicable skill, announce it, and read the local instruction chain before acting.
2. Approval Policy defaults to Autonomous for new and existing work; Review-gated requires a new explicit opt-in, and legacy gates are migrated narrowly with workflow migrate at a safe boundary.
3. Draft never progresses; Autonomous accepts internally reviewed Ready or Approved artifacts, while Review-gated accepts Approved only and preserves real human provenance.
4. Keep the authorized goal, acceptance criteria, safety constraints, external-action boundaries, and immutable history; repair in-scope design, plan, code, review, and tests without repeated human approval.
5. Phase Mode is independent: fresh mode requires a genuinely fresh user-owned same-checkout session with verified v2 bindings, while same-session mode rereads changed inputs; never substitute a fork or subagent.
6. Report missing capabilities and installed-host evidence honestly; never pretend migration, validation, isolation, checkout/plugin affinity, startup injection, or publication succeeded.
<!-- STARTUP-CONTRACT:END -->

## Shared Operations

`using-superpowers/scripts/spa.mjs` owns portable lifecycle, Foundation,
workflow migration, phase handoff, startup rendering, workspace detection, and
SDD operations. Runtime wrappers only locate Node.js and invoke that core.

Use:

- `references/workflow-policy.md` for policy precedence, migration, and
  revalidation rules;
- `references/artifact-lifecycle.md` for spec/plan Draft, Ready, Approved;
- `references/agentic-foundation-lifecycle.md` for Foundation transactions and
  v1/v2 receipts; and
- `references/phase-handoff.md` for the v2 envelope and strict v1 boundary.

Node.js 20 or newer is required for correctness-critical operations. Missing
Node or a missing sibling module fails closed with the reference's complete
installation guidance.

## Local Working State

These downstream paths are local working state:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/superpowers/architecture-reviews/`
- `docs/superpowers/foundation-candidates/`
- `docs/superpowers/workflow-migrations/`
- `docs/superpowers/verification/`

Do not stage or commit them unless the user explicitly asks.

## Repository Constraints

Do not create plugin-root `CONTEXT.md`, lowercase `context.md`, ADRs, Matt
issue/PRD/triage flows, or visual companions. `wayfinder` may create uppercase
root `CONTEXT.md` and `docs/agentic/` only in a deliberate downstream
project. Shared skills use bare canonical identities and keep host/runtime
syntax in adapters.
