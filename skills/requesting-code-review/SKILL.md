---
name: requesting-code-review
description: Use for a task review or final whole-branch review against exact requirements and changes.
---

# Requesting Code Review

This skill owns review coverage for implementation controllers and finishing:
one task-scoped review per completed task, then one final whole-branch review.
An unchanged exact final review may be reused during finishing. Re-review the
affected coverage after fixes, source drift, or changed requirements.

## Prepare the Review

Record the task base before work starts and its actual final head. Review the
complete range, including every task commit. For the final review, use the
verified branch-start/merge base and current head; do not assume a moving local
main ref is the correct baseline. Include any uncommitted changes explicitly
as an immutable patch with a digest; no change may escape review coverage.

Bind Approval Policy, exact policy-accepted spec/plan paths and revisions, all
four Foundation base/result/manifest/receipt fields (all `none` for generic
work), global constraints, task or whole-branch architecture, and
[Architecture Conformance](../codebase-design/ARCHITECTURE-CONFORMANCE.md).

Use the bound shared SDD review-package operation when reviewing committed
ranges in that workflow. Hand reviewers file paths for the requirements, diff,
test report, and bindings rather than controller history.

For task reviews use
[task-reviewer-prompt.md](../subagent-driven-development/task-reviewer-prompt.md);
for final review use [code-reviewer.md](code-reviewer.md). Dispatch through
[dispatch-contract.md](../using-superpowers/references/dispatch-contract.md)
with isolated context and read-only review. The runtime reference maps actual
capabilities, honors the explicit user model, and reports isolation enforcement.
If independent review is unavailable, disclose it and perform the owning
workflow's deterministic checklist; never label self-review independent.

## Review and Repair

Require spec compliance, every Architecture Conformance result, and code quality.
Reviewers judge the actual diff and may inspect related code for a named risk.
Do not pre-rate findings, tell reviewers what not to flag, or request an unchanged
suite rerun without a specific unanswered concern.

Resolve Critical/Important findings and all conformance violations before
progression. Resolve each cannot-verify item with concrete controller evidence
or a repair and re-review. Track Minor findings for final triage; do not silently
discard them.

Use `receiving-code-review` for technical adjudication. Under Autonomous,
in-scope artifact corrections return through Draft and internal review to Ready;
Review-gated requires new approval only for changed authoritative content.
Review is advisory and never creates approval.

Record the review's exact range or patch digest, artifact bindings, verdict,
findings, and resolution evidence in ignored progress. Finishing confirms that
this coverage still matches the work before relying on it.
