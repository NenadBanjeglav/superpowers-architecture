# Architecture Conformance

Use this rubric when planning, implementing, testing, or reviewing work. Bind
the exact effective **Approval Policy** and exact current Design Spec,
Implementation Plan, optional Agentic Foundation, and application receipt before
judging the implementation.

Autonomous accepts Ready or Approved artifacts. Review-gated accepts Approved
artifacts only. Draft never authorizes downstream work.

Read [product-evolution.md](../using-superpowers/references/product-evolution.md)
and the authoritative current work/outcome owner. Compare its exact selection
with task bindings at entry, resume, compaction, rebind, or possible owner change.
Ready status and dates do not select work. For document review, judge the
proposed post-acceptance selection; a Draft proposal is not execution authority.

## Result Shape

- **Modules:** preserved | changed with policy-accepted revision | violation
- **Interfaces:** preserved | changed with policy-accepted revision | violation
- **Seams and adapters:** justified production/test adapters at bound seams; no leaked host/runtime policy
- **Data flow:** matches the bound source-to-sink sequence
- **Depth, locality, leverage:** complexity remains hidden behind the intended interface; no pass-through decomposition
- **Test surface:** observable behavior is tested through the intended module interface; internal helpers are directly tested only when they expose an independent behavioral contract
- **Constraints and scope:** goal, acceptance criteria, business/safety/privacy/security/data limits, and external-action authority are preserved
- **Design progression:** accepted history unchanged; correction uses distinct policy-accepted successors and fresh exact bindings | no design change | violation
- **Stage appropriateness:** evidenced maturity, scoped durability/reset authority, and reassessment triggers fit this change
- **Consumer/compatibility:** present consumers justify mechanisms; new/prolonged compatibility meets the shared evidence gate; unresolved stateless promises block the affected decision
- **Subtraction:** explicit successor retirement maps deletions/replacements to authority and evidence; omitted and unrelated obligations remain binding
- **Test categories:** new/touched durable tests name primary category and active contract; retained product/safety coverage survives retirement
- **Sunset:** temporary mechanisms have complete ownership, expiration and cleanup; expired support has reviewed removal or evidenced successor renewal
- **Complexity budget:** actual scoped measurements meet accepted thresholds; unavailable metrics are not zero or a pass

For each evolution line report `satisfied`, `violation`, or `cannot verify`,
with evidence or reasoned non-applicability. Required missing evidence blocks
affected progression. Answer all five subtraction questions: what can this
delete; which assumptions are obsolete; which tests protect obsolete formats;
does this fit the current stage; would we build this mechanism today from an
empty codebase? An evidenced no-deletion outcome is valid.

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
   Stop affected divergent work; compare Simplify, Replace, Defer, and Revise.
   Preserve Ready/Approved spec/plan bytes. Changed contracts or budgets need
   distinct Draft successors, refresh and review; Autonomous marks Ready,
   Review-gated requires genuine successor approval. A design correction needs
   both compatible successors; a plan-only correction retains its exact spec.
   Select at a quiescent boundary, regenerate worker/review inputs, and revalidate
   before resuming. Foundation current truth keeps its managed receipt workflow.
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
