# Architecture Conformance

Use this rubric when planning, implementing, testing, or reviewing work. Bind
the exact effective **Approval Policy** and exact current Design Spec,
Implementation Plan, optional Agentic Foundation, and application receipt before
judging the implementation.

Autonomous accepts Ready or Approved artifacts. Review-gated accepts Approved
artifacts only. Draft never authorizes downstream work.

## Result Shape

- **Modules:** preserved | changed with policy-accepted revision | violation
- **Interfaces:** preserved | changed with policy-accepted revision | violation
- **Seams and adapters:** justified production/test adapters at bound seams; no leaked host/runtime policy
- **Data flow:** matches the bound source-to-sink sequence
- **Depth, locality, leverage:** complexity remains hidden behind the intended interface; no pass-through decomposition
- **Test surface:** observable behavior is tested through the intended module interface; internal helpers are directly tested only when they expose an independent behavioral contract
- **Constraints and scope:** goal, acceptance criteria, business/safety/privacy/security/data limits, and external-action authority are preserved
- **Design progression:** Autonomous correction recorded through Draft and internal review to Ready | Review-gated change newly human-approved | no design change | violation

Any `violation` is blocking. Passing tests do not excuse a violated interface,
leaked adapter concern, weakened acceptance criterion, or widened scope.

## Review Method

1. Identify the exact policy, spec/plan paths and revisions, Foundation
   base/result/receipt when present, bounded goal, and authoritative constraint
   source.
2. Copy the binding modules, interfaces, seams/adapters, data flow,
   depth/locality/leverage intent, public test surface, acceptance criteria, and
   non-negotiable constraints into the review input.
3. Compare implementation and tests to every result line.
4. Cite preserved behavior or the exact policy-accepted revision that records a
   change. Report a blocking violation with file/line evidence when neither is
   true.
5. Distinguish an in-scope technical correction from a goal/constraint change.
   Under Autonomous, return the controlling artifact through Draft, record the
   correction, review it internally, mark the exact revision Ready, update the
   dependent plan, and resume. Under Review-gated, present the changed readable
   artifact and require new clear human approval.
6. Ask the user only when the change alters the authorized goal, acceptance
   criteria, safety boundary, consequential product behavior, or external-action
   authority. Do not send ordinary architecture or test repairs to a human gate.

Conversation agreement, comments, implementation reports, reviewer verdicts,
and passing tests do not replace artifact lifecycle evidence.

## Adapter and Test Guidance

Test observable behavior through the module interface. Use real
local-substitutable adapters where practical. Use in-memory or mock adapters
only at justified remote/external seams. Assert that a test double was called
only when that interaction is itself the interface contract.

A private helper is not automatically a test surface. Test it directly only
when it exposes an independent behavioral contract; otherwise exercise behavior
through the owning module interface so implementation refactors do not break
callers or tests.
