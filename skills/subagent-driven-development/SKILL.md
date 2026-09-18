---
name: subagent-driven-development
description: Use to execute a policy-accepted plan with sequential isolated implementers and task reviews.
---

# Subagent-Driven Development

Execute mostly independent plan tasks with one isolated implementer per task,
task review, and a final whole-branch review. Use `executing-plans` for tightly
coupled work or unavailable subagents. Continue authorized work without routine
permission check-ins.

## Validate and Resume

Resolve Approval Policy and independent Phase Mode through `using-superpowers`.
Use [artifact-lifecycle.md](../using-superpowers/references/artifact-lifecycle.md)
and the shared core to validate the exact Implementation Plan, then its exact
`Spec` and `Spec Revision` as a Design Spec with explicit policy. Autonomous
accepts Ready or Approved; Review-gated accepts Approved. Draft never executes.

Read plan header bindings and the spec's Foundation traceability. All four plan
Foundation fields must be literal `none` for generic work, with the spec's
manifest/base also `none`. Otherwise require the same physical absolute
WAYFINDING.md, exact lowercase base/result revisions, and physical ignored
candidate-root APPLIED.json. The spec base must equal the plan base; result
may differ. Reject half-none, missing, duplicated, wrong-type, edited, or stale
bindings before further inspection.

Only for non-none Foundation bindings, read
[agentic-foundation-lifecycle.md](../using-superpowers/references/agentic-foundation-lifecycle.md)
and run receipt-backed `foundation validate` with explicit policy, root,
manifest, result, receipt, spec path/revision, and base revision.
Then reread accepted inputs, applicable AGENTS.md, relevant code/tests, and
[Architecture Conformance](../codebase-design/ARCHITECTURE-CONFORMANCE.md)
from disk. Apply canonical evidence freshness; a nested skill alone causes no
rerun.

Use `using-git-worktrees` to verify the workspace without violating same-checkout
affinity. Read progress through the shared operation. Verify completed entries
against Git and resume at the first incomplete task. Reconcile unparsed legacy
entries before writing progress or dispatching; never overwrite unknown recovery
state or repeat a completed task because conversation context was lost.

Read [product-evolution.md](../using-superpowers/references/product-evolution.md)
and the existing authoritative current work/outcome
owner. At entry, resume, compaction, rebind, or possible owner change, compare
its selected exact spec/plan pair with task bindings. A valid but retired plan,
ambiguous successors, or partial pair stops affected progression. Dates and
Ready status do not select work. Carry Add/Replace/Remove/Defer intent, current
consumer/stage evidence, retained and retired contracts, test categories,
budget slice and sunset obligations in each task's context.

## Task Loop

1. Inspect the plan for conflicts before the first task. Bind the task's exact
   requirements, global constraints, architecture, and v2 SDD input.
2. Record the task base commit before dispatch. Generate its bound task brief
   through the shared operation; provide its path, required interfaces from prior
   tasks, exact bindings, and a report path.
3. Use [implementer-prompt.md](implementer-prompt.md) and
   [dispatch-contract.md](../using-superpowers/references/dispatch-contract.md).
   Request isolated context; writers use the current checkout sequentially.
   Preserve the explicit user model for every role/tier. The runtime reference
   owns concrete identifiers and capability discovery.
4. The implementer uses TDD, verifies, self-reviews, and reports status plus exact
   changes and evidence. Resolve concerns before review.
5. Generate the full base-to-head bound review package. Use
   [task-reviewer-prompt.md](task-reviewer-prompt.md) for isolated read-only
   review of spec compliance, conformance, and quality. Require all verdicts.
6. Follow `requesting-code-review` for coverage, adjudication, and re-review.
   Resolve Critical/Important findings and every conformance violation before
   progression. Resolve each cannot-verify item with controller evidence or a
   repair. Track Minor findings for final triage.
7. Inspect staged paths before commits; keep `docs/superpowers/**` and local-only
   instructions unstaged unless explicitly requested. Record the completed
   task's base/head and clean review through the shared progress operation.

Do not pass accumulated controller history, pre-judge findings, or run multiple
writers in one checkout. Read-only restrictions must be enforced by the host or
explicitly prompt-enforced with post-dispatch state verification. If independent
isolation cannot be established, disclose it and use the owning workflow's
deterministic fallback.

## Repairs and Blockers

- DONE: inspect changes/evidence, then review.
- DONE_WITH_CONCERNS: resolve correctness/scope concerns; retain other observations
  for review.
- NEEDS_CONTEXT: supply the missing requirements or focused repository evidence.
- BLOCKED: diagnose what failed, improve context or decomposition, and retry only
  with a changed approach. Preserve the explicit user model.

Stop affected divergent work before an unplanned schema, abstraction, adapter,
cache/replay mechanism, compatibility path, budget breach, or material unexpected
test-duration increase. Use product-evolution.md's checkpoint: compare deletion
and direct implementation, then choose **Simplify**, **Replace**, **Defer**, or
**Revise** with evidence and consequences. Compare timing inputs/environment;
one diagnostic rerun may investigate noise, never select the best repeated time.

Preserve Ready/Approved bytes. Changed contract/plan/budget needs distinct Draft
successors, refresh, review and policy acceptance: Ready under Autonomous, real
successor approval under Review-gated. A design change needs both compatible
successor spec and plan; a plan-only change retains its exact spec. Finish only
nondivergent work or stop workers before changing selection at a quiescent
controller boundary. Update the existing owner, regenerate SDD bindings and
worker/review inputs, and revalidate. Check successor contracts and exact diff
before reusing task evidence. Ask only for a consequential goal/constraint
choice, required unavailable input/access, or action beyond authority.

Fix dispatches carry covering tests and append command/output evidence to the
same report. Re-review the changed coverage. One bounded fix dispatch may handle
the complete final-review findings list.

## Operations and Completion

Read [controller-details.md](references/controller-details.md) when generating
briefs, review packages, or progress. These operations belong to the shared Node
core; launchers only invoke it. Missing Node.js 20+ or a sibling core module fails
closed with full-plugin recovery guidance; do not manually reconstruct outputs.

After all tasks, request one final whole-branch review through
`requesting-code-review`, including the Minor findings ledger, then use
`finishing-a-development-branch`. Finishing may reuse that exact unchanged review.
External actions require existing user authorization.
