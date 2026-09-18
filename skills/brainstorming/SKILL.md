---
name: brainstorming
description: Use to design one bounded outcome before planning or implementation.
---

# Brainstorming

Brainstorming turns one bounded goal into one architecture-aware Design Spec.
It owns feature-level design and any prospective Foundation change caused by
that design. It does not implement code.

Read `using-superpowers`, applicable instructions,
[artifact-lifecycle.md](../using-superpowers/references/artifact-lifecycle.md),
and [Architecture Conformance](../codebase-design/ARCHITECTURE-CONFORMANCE.md)
before writing. Read workflow migration details only for active legacy gates,
Foundation lifecycle for non-none Foundation inputs, and phase-handoff details
only when receiving or preparing a fresh-session envelope.

Read [product-evolution.md](../using-superpowers/references/product-evolution.md)
for maturity evidence, successor selection, retirement, budgets, and sunset.

## Entry

1. Resolve **Approval Policy** from the applicable version-2 owner. Autonomous
   is the default for new and existing work; Review-gated requires a new
   explicit opt-in. Migrate active legacy gate clauses through `workflow
   migrate` before they block this phase.
2. Resolve the durable **Phase Mode** independently. Preserve an existing
   choice. Ask only if none exists and the choice materially matters.
3. Determine whether this is:
   - a Foundation-backed ready `OUT-NNN` outcome received through a valid v2
     handoff or same-session reread; or
   - one generic bounded design unit with no Foundation.
4. Validate the exact source input once with explicit policy. For a handoff,
   require the full v2 envelope and receiver checks. A v1 receiver rejects Ready.
5. Read relevant code, tests, docs, and instructions from disk. For a
   Foundation-backed outcome, read Root Router, manifest-selected owners,
   Blueprint requirements, prior decisions, roadmap section, and canonical
   prompt.
6. If discovery reveals project-wide reorientation, release-boundary change, or
   several affected outcomes, return to `wayfinder`.

At entry, resume, compaction, and rebind compare the authoritative work/outcome
owner with exact inputs. Ready status or a newer filename does not select work.
Stop affected progression on ambiguous successors or stale task bindings.

## Understand the Design

Ask one concise question at a time only when the answer is not available on disk
and materially affects the outcome. Put the question first, then provide one
concrete recommendation and a short reason.

Resolve:

- observable goal and acceptance criteria;
- non-goals and scope boundary;
- user-facing behavior and failure behavior;
- preferred language and rejected synonyms;
- modules, interfaces, seams, adapters, data flow, depth, locality, leverage,
  and public test surface;
- business, safety, privacy, security, data, and external-action constraints;
- current consumers, scoped durability/reset authority, and evidenced evolution
  and compatibility needs under the shared policy;
- relevant prior decisions and Blueprint requirement identities; and
- durable documentation impact.

When several materially different designs remain, compare two or three concise
options and recommend one. Ask the user only when the choice changes the
authorized goal, product behavior, risk boundary, or another consequential
constraint. Under Autonomous, ordinary architecture and technical choices
within the bounded goal are agent-owned and recorded in the spec.

Always compare the simplest reversible alternative with justified durable
alternatives. For disposable data, include direct replacement and reseeding
with actual authority and recovery steps. Record sources, observation dates,
limits, non-goals, deletion opportunities, budget, and any sunset obligations.
For generic work, keep these facts in the spec and applicable authority owner;
do not manufacture a Foundation. Link Foundation owners instead of copying them.

Do not offer a visual companion. Do not create ADR, PRD, issue, or triage flows.

## Write the Design Spec

Save the local artifact under
`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`. Keep it ignored and
unstaged.

Use [spec-template.md](references/spec-template.md) for the exact header,
required sections, DDI classifications, and candidate declaration.

## Lifecycle and Foundation Candidate

Drafts may be edited and refreshed. A Ready/Approved spec is immutable: create
a distinct dated successor without overwriting any path, initialize it with
`artifact draft`, and refresh after writing. Never type a revision manually.
Use the template's predecessor bindings and explicit retirement mappings;
carry the complete active bounded contract and retain unrelated obligations.

For a generic spec:

1. refresh the exact Draft revision;
2. review with [spec-document-reviewer-prompt.md](spec-document-reviewer-prompt.md)
   in isolated read-only context when available, otherwise its deterministic
   checklist; reviewers report policy-aware readiness or issues and never approve;
3. resolve issues through Draft and refresh;
4. under Autonomous, run `artifact ready`;
5. under Review-gated, present one readable package and after clear approval run
   `artifact approve`.

For non-none Foundation work, follow
[foundation-design.md](references/foundation-design.md) for combined review,
exact candidate application, v2 receipts, and empty-candidate preservation.

## Progress to Planning

Before Planning, validate:

- the exact Design Spec with explicit Approval Policy;
- for Foundation-backed work, the exact base, v2 Application Receipt, resulting
  Foundation, declaration/actions, and lifecycle states;
- every acceptance criterion, constraint, architecture binding, and Foundation
  traceability field; and
- ignored local state and exact checkout affinity.

After review and applicable Foundation application, select the exact accepted
spec in the existing authoritative work/outcome owner at a quiescent boundary.
Follow the shared selection contract; stop divergent workers before selection
changes. Planning may start with that spec alone, but resumed implementation
requires a compatible accepted successor plan and regenerated task bindings.

For automated fresh-session mode, prepare the v2 Planning envelope. The Design
Spec is the phase artifact; the source-spec pair is `none`. Carry Foundation
manifest/result and receipt outside the record when applicable. The bounded goal
and authoritative constraint source remain in the envelope. Launch only through
a runtime that proves genuine fresh user-owned same-checkout identity, then
inspect acknowledgement and `handoff receive`.

For same-session mode, re-read the policy-accepted spec, applicable Foundation
and receipt, instructions, and relevant code from disk, then invoke
`writing-plans`. Reuse unchanged entry evidence; revalidate mutations.
