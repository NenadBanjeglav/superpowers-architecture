---
name: writing-plans
description: Use when an exact policy-accepted local Design Spec exists and a concrete implementation plan is needed before implementation
---

# Writing Plans

Write an implementation plan that another capable engineer can execute without
conversation memory. The plan binds the exact current Design Spec, optional
Foundation application evidence, Approval Policy, Phase Mode, architecture, and
acceptance criteria.

Read `using-superpowers`, applicable instructions, the artifact and Foundation
lifecycle references, phase-handoff contract, and Architecture Conformance
before inspecting implementation files.

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

## Plan Location and Lifecycle

Write:

`docs/superpowers/plans/YYYY-MM-DD-<topic>-plan.md`

Keep it local, ignored, and unstaged. For an existing plan, run `artifact
draft` before edits. After the complete plan is written, run `artifact
refresh`; never type a revision manually.

Use this header:

```markdown
# <Title> Implementation Plan

> **For agentic workers:** Execute tasks in order, use TDD where required, and
> preserve the exact policy/dependency bindings below.

**Spec:** <absolute Design Spec path>
**Spec Revision:** <exact policy-accepted revision>
**Foundation Manifest:** <absolute WAYFINDING.md path or none>
**Foundation Base Revision:** <exact base revision or none>
**Foundation Result Revision:** <exact result revision or none>
**Foundation Application Receipt:** <absolute APPLIED.json path or none>
**Artifact Type:** Implementation Plan
**Status:** Draft
**Revision:** none
**Approved Revision:** none
**Approved At:** none
**Goal:** <one bounded sentence>
**Approval Policy:** Autonomous | Review-gated
**Workflow Policy Version:** 2
**Phase Mode:** Automated fresh-session mode | Same-session mode
**Architecture:** <module/interface/seam/data-flow summary>
**Tech Stack:** <exact technologies>
```

A generic plan uses literal `none` for all four Foundation fields. A
Foundation-backed plan copies all four exact values; base and result may differ.

## Plan Content

Start with:

### Planning Validation Evidence

Record concise actual evidence: source lifecycle result, Foundation receipt
validation when applicable, checkout/branch identity, ignored local state,
instructions read, and relevant source/tests inspected. Do not dump repetitive
hash inventories.

### Global Constraints

Copy the goal, acceptance criteria, business/safety/privacy/security/data
constraints, external-action boundaries, no-publish/deploy rules, compatibility
requirements, and architecture invariants that every task must preserve.

### Interfaces and Verification Harness

Name the public operations, APIs, schemas, file paths, commands, local ignored
fixtures, and meaningful behavioral checks used across tasks. This repository
uses temporary or ignored manual verification unless its own instructions say
otherwise.

### Tasks

Each task is a coherent implementation and review boundary:

```markdown
## Task N: <Outcome>

**Context:** Spec <absolute path> at <revision>. Foundation Manifest: <path or
none>. Foundation Base Revision: <revision or none>. Foundation Result
Revision: <revision or none>. Foundation Application Receipt: <path or none>.

**Files:** Create/modify/test exact paths.

**Architecture binding:** modules, interfaces, seams/adapters, data flow,
depth/locality/leverage intent, and test surface for this task.

- [ ] Write a meaningful failing behavioral test or other justified red check.
- [ ] Implement the smallest coherent change.
- [ ] Run focused checks, then applicable broader verification.
- [ ] Inspect staged paths; keep docs/superpowers/** unstaged.
- [ ] Run Architecture Conformance and isolated advisory review.
- [ ] Resolve findings and record the task commit/range in ignored progress.
```

Use exact function/interface names, commands, expected observations, edge cases,
migration behavior, and recovery checks. Do not paste large speculative code
blocks. Group coupled files and sequential tasks; do not invent one task per
tiny edit.

Every task repeats the exact spec/Foundation binding so an isolated worker does
not depend on prior task context. Include documentation/DOX effects where the
implementation changes contracts or ownership. End with integrated verification,
whole-branch review, and local Git closeout. External publication remains
separate.

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
through its policy lifecycle before regenerating the plan.

Under Autonomous, run `artifact ready` on the exact reviewed plan revision and
validate it with `--policy Autonomous`. Under Review-gated, present one readable
plan package and, after clear approval, bind that response internally and run
`artifact approve`. The reviewer never approves lifecycle state.

## Implementation Binding

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
