---
name: writing-plans
description: Use to turn an exact policy-accepted Design Spec into a reviewed implementation plan.
---

# Writing Plans

Write an implementation plan that another capable engineer can execute without
conversation memory. The plan binds the exact current Design Spec, optional
Foundation application evidence, Approval Policy, Phase Mode, architecture, and
acceptance criteria.

Read `using-superpowers`, applicable instructions,
[artifact-lifecycle.md](../using-superpowers/references/artifact-lifecycle.md),
and [Architecture Conformance](../codebase-design/ARCHITECTURE-CONFORMANCE.md).
Read Foundation lifecycle only after establishing a complete non-none binding;
read phase-handoff only when receiving or preparing an automated fresh session.

Use [product-evolution.md](../using-superpowers/references/product-evolution.md)
for current selection, retirement, task evolution context, budgets and sunset.

## Entry Validation

1. Resolve **Approval Policy**. Autonomous accepts Ready or Approved;
   Review-gated accepts Approved only. Draft is never a planning input.
2. Resolve the independent durable **Phase Mode**.
3. Run `artifact validate` with explicit policy for the exact Design Spec path,
   type, and revision.
4. Read the spec from disk and require exactly one complete pair:
   `Foundation Manifest` plus `Base Agentic Foundation`, or literal `none`
   for both.
5. For Foundation-backed work, require the physical v2 Foundation Application
   Receipt from the phase envelope or same-session binding. Run receipt-backed
   policy-aware `foundation validate` for exact spec/base/receipt/result before
   codebase inspection.
6. Confirm the spec, plan area, candidate, receipt, and other generated working
   files are ignored in this exact checkout.
7. Read applicable AGENTS.md files along every path likely to change, then inspect
   source, tests, build/config, and relevant history.

A v1 receiver cannot consume Ready. Missing or stale source evidence is a
capability/dependency error, not a reason to invent approval.

At entry, resume, compaction, or rebind compare the exact input with the existing
authoritative work/outcome selection. Ready alone and filename dates do not
select a successor. Ambiguous selection or stale bindings stop affected work.

## Plan Location and Lifecycle

Write:

`docs/superpowers/plans/YYYY-MM-DD-<topic>-plan.md`

Keep it local, ignored, and unstaged. Edit existing Drafts only. For a
Ready/Approved plan, preserve its bytes and create a distinct dated Draft
successor without overwriting a path. Initialize with `artifact draft` and run
`artifact refresh` after writing; never type a revision manually. A plan-only
successor names its predecessor and retains the exact accepted source spec.

Use [plan-template.md](references/plan-template.md) for the exact header,
validation evidence, global constraints, interfaces/test harness, and task shape.
Every task retains its exact spec and optional Foundation bindings, architecture,
meaningful verification, review, and DOX effects.

## Review and Repair

Dispatch the isolated
[plan reviewer](plan-document-reviewer-prompt.md) when available; otherwise run
the same deterministic checklist. The reviewer receives policy, exact plan/spec,
optional Foundation/receipt, and Architecture Conformance.

Allowed verdicts are:

- `Ready for progression` under Autonomous;
- `Ready for user review` under Review-gated; or
- `Issues found`.

Resolve every issue internally. Ordinary task decomposition, missing tests,
architecture clarity, path errors, and stale bindings are agent-owned repairs.
If a finding exposes an actual goal/constraint change or consequential product
choice, ask only about that decision, then update the controlling Design Spec
by creating and reviewing a Draft successor before writing a compatible
successor plan. Do not edit either accepted predecessor.

Under Autonomous, run `artifact ready` on the exact reviewed plan revision and
validate it with `--policy Autonomous`. Under Review-gated, present one readable
plan package and, after clear approval, bind that response internally and run
`artifact approve`. The reviewer never approves lifecycle state.

## Implementation Binding

Before implementation, select the complete compatible accepted spec/plan pair
in the existing work/outcome owner at a quiescent boundary after applicable
review and Foundation application. Stop divergent workers first and regenerate
task/review inputs; compare selection again on resume or possible owner change.
Use the Foundation lifecycle's receipt-safe selection sequence when applicable.

New SDD consumers create one ignored JSON binding:

```json
{
  "schema": "superpowers-architecture-sdd-binding-v2",
  "policy": "Autonomous",
  "planPath": "<absolute plan>",
  "planRevision": "<exact revision>",
  "specPath": "<absolute spec>",
  "specRevision": "<exact revision>",
  "foundationManifestPath": "none",
  "foundationBaseRevision": "none",
  "foundationResultRevision": "none",
  "foundationApplicationReceipt": "none"
}
```

Use the exact Foundation values when present. Pass this binding to shared
`sdd task-brief` and `sdd review-package`; both reject stale dependencies and
embed the validated context. Legacy positional calls remain available only for
legacy controllers.

For automated fresh-session mode, prepare a v2 implementation envelope. The
plan is the phase artifact; the source-spec pair is mandatory; Foundation
manifest/result and receipt remain exact when applicable. Bind the authorized
goal and constraint source, run `handoff prepare`, and launch only when the
runtime proves a genuinely fresh user-owned task in this exact checkout. Inspect
the target's acknowledgement and `handoff receive`.

For same-session mode, validate and re-read the exact plan, source spec,
Foundation/receipt, applicable instructions, and relevant code from disk. Then
invoke `subagent-driven-development` or `executing-plans` according to task
shape. Do not ask whether to continue when the policy and goal already authorize
implementation.
