---
name: executing-plans
description: Use to execute an exact policy-accepted Implementation Plan linearly in the current phase.
---

# Executing Plans

Execute one exact plan task at a time. Do not pause for routine approval or
progress check-ins.

## Entry

1. Resolve **Approval Policy** and Phase Mode from the received v2 envelope or
   authoritative same-session instructions.
2. Validate the Implementation Plan with `artifact validate --policy
   <Autonomous|Review-gated>`. Autonomous accepts Ready or Approved;
   Review-gated accepts Approved. Draft never executes.
3. Validate the source Design Spec at the plan's exact `Spec` and `Spec
   Revision` with the same policy.
4. Require all four Foundation fields to be exact values or all literal `none`.
   For Foundation-backed work, run receipt-backed policy-aware `foundation
   validate` before codebase inspection.
5. Require plan/spec/Foundation/receipt paths to be physical, readable, ignored
   when under `docs/superpowers/`, and inside this exact checkout.
6. Read applicable AGENTS.md files, the complete plan, the exact spec,
   Architecture Conformance, relevant source/tests, and ignored progress state.
7. Use `using-git-worktrees` only when the existing workspace policy permits
   it. A same-checkout handoff must remain in the recorded checkout.

Missing or stale evidence stops the affected operation with expected/actual
values. Do not fabricate approval, use conversation memory, or switch checkout.

Read [product-evolution.md](../using-superpowers/references/product-evolution.md)
and the existing authoritative current work/outcome
owner. At entry, resume, compaction, rebind, or possible owner change, compare
its selected exact spec/plan pair with task bindings. A valid but retired plan,
ambiguous successors, or partial pair stops affected progression. Dates and
Ready status do not select work. Carry Add/Replace/Remove/Defer intent, current
consumer/stage evidence, retained and retired contracts, test categories,
budget slice and sunset obligations in each task's context.

## Execution Loop

For each incomplete task in order:

1. Re-read its exact task text, global constraints, and architecture binding.
2. Confirm its plan/spec/Foundation identities still match entry evidence;
   reuse unchanged checks and revalidate on the canonical freshness triggers.
3. Implement through `test-driven-development` when code behavior changes:
   establish a meaningful red check, make the smallest coherent change, then
   refactor with tests green.
4. Keep modules, interfaces, seams/adapters, data flow, depth, locality,
   leverage, and test surface aligned with the policy-accepted artifacts.
5. Run focused verification, then the task's broader checks.
6. Inspect the diff and staged paths. Keep `docs/superpowers/**` and local root
   instructions unstaged unless the user explicitly requested them.
7. Use `requesting-code-review` for task-scoped advisory review and complete
   range coverage. Record the base before task work; resolve Critical/Important,
   cannot-verify, and Architecture Conformance findings before moving on.
8. Commit the coherent task when repository instructions and the authorized
   workflow call for commits. Record its base/head/review result in ignored
   progress.

Continue through all tasks. Under Autonomous, in-scope code, test,
documentation, design, plan, and review repairs are agent-owned. Do not ask
whether to continue.

## Design Discoveries

Stop affected divergent work before an unplanned schema, abstraction, adapter,
cache/replay mechanism, compatibility path, budget breach, or material unexpected
test-duration increase. Compare deletion/direct implementation first, then choose
**Simplify**, **Replace**, **Defer**, or **Revise** using product-evolution.md.
Record evidence and consequences; compare timings with commands, inputs,
environment and cache conditions. One diagnostic rerun may investigate noise.

Ready/Approved specs/plans remain unchanged. If contract, plan or budget changes,
author distinct Draft successors, refresh and review. Autonomous progresses to
Ready; Review-gated requires real approval of the successor. A design change
needs both successor spec and plan; a plan-only change retains its exact spec.
At a quiescent boundary select the compatible accepted pair in the existing
owner, regenerate task/review inputs, and revalidate before resuming. Finish
only nondivergent work or stop workers before selection changes. Reuse evidence
only after checking successor contracts and exact diff coverage.

Ask the user only when the discovery changes the authorized goal, acceptance
criteria, safety boundary, consequential product behavior, or external-action
authority. Never weaken constraints to make implementation fit the old plan.

## Blockers

Investigate and repair ordinary failures with `systematic-debugging`. Stop the
affected task only for a blocker you cannot resolve safely, missing access/input,
an unresolved consequential choice, or an unauthorized external/destructive
action. Complete independent tasks that do not depend on the blocker.

Do not turn repeated technical failure into an automatic human approval gate.

## Completion

After all tasks and reviews are clean, use
`finishing-a-development-branch`. It confirms final verification and the one
whole-branch review owned by `requesting-code-review`, reusing exact unchanged
evidence. Report actual evidence and installed-runtime limits, and keep external
push/merge/PR/deploy/publish/discard actions separate unless already authorized.
