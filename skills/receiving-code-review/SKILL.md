---
name: receiving-code-review
description: Use to evaluate review feedback against code and requirements before making corrections.
---

# Receiving Code Review

Resolve the effective Approval Policy before applying corrections.
Read the complete feedback, then verify each finding against the cited code,
tests, exact policy-accepted artifacts, and project constraints. Check actual
usage, compatibility, and the reason for the current implementation before
accepting a suggested change.

Resolve ambiguity from repository evidence. Continue independent clear repairs
when they cannot conflict; ask one focused question only for an unresolved
consequential decision or required missing input. Do not add unused features
merely because a reviewer suggests them.

Address Critical/Important issues and every Architecture Conformance violation
before progression. Group coupled fixes, run their covering checks, and provide
the changed range and evidence for re-review. Record Minor findings for final
triage. Follow `requesting-code-review` for review ownership and coverage.

Under Autonomous, in-scope code, documentation, test, and design corrections
are agent-owned. A changed controlling spec and dependent plan return through
Draft, refresh, and internal review to Ready. Under Review-gated, obtain genuine
approval of changed authoritative content. Reviewer opinion never approves an
artifact or permits weaker acceptance criteria.

If a finding is wrong, explain the technical reason with file/test evidence.
If new evidence disproves your response, correct it and continue. Report the
actual fix or remaining issue plainly.

Reply to others only when communication is explicitly authorized. When replying
to an inline review, use its existing comment thread through the available
runtime adapter.
