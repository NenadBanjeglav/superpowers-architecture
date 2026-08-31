---
name: executing-plans
description: Use when executing a policy-accepted written Implementation Plan linearly in the current or fresh phase session
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

## Execution Loop

For each incomplete task in order:

1. Re-read its exact task text, global constraints, and architecture binding.
2. Confirm its plan/spec/Foundation identities still match entry evidence.
3. Implement through `test-driven-development` when code behavior changes:
   establish a meaningful red check, make the smallest coherent change, then
   refactor with tests green.
4. Keep modules, interfaces, seams/adapters, data flow, depth, locality,
   leverage, and test surface aligned with the policy-accepted artifacts.
5. Run focused verification, then the task's broader checks.
6. Inspect the diff and staged paths. Keep `docs/superpowers/**` and local root
   instructions unstaged unless the user explicitly requested them.
7. Run a task-scoped advisory review. Resolve Critical/Important and
   Architecture Conformance findings before moving on.
8. Commit the coherent task when repository instructions and the authorized
   workflow call for commits. Record its base/head/review result in ignored
   progress.

Continue through all tasks. Under Autonomous, in-scope code, test,
documentation, design, plan, and review repairs are agent-owned. Do not ask
whether to continue.

## Design Discoveries

If implementation reveals a necessary change to a bound module, interface,
seam, adapter, data flow, or test surface:

1. stop only the divergent work;
2. run the controlling spec and dependent plan through Draft;
3. record the in-scope design correction and any durable documentation impact;
4. refresh and run advisory review;
5. under Autonomous, resolve findings, return artifacts to Ready, validate, and
   resume;
6. under Review-gated, present the changed readable package and resume only
   after clear approval of the new revision.

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
`finishing-a-development-branch`. Run final verification and whole-branch
review, report actual evidence and installed-runtime limits, and keep external
push/merge/PR/deploy/publish/discard actions separate unless already authorized.
