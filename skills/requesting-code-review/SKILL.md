---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch a code reviewer through the host-neutral dispatch contract to catch issues before they cascade. Request `contextPolicy: isolated`, a bounded prompt path, the requirements and diff artifacts, and `workspacePolicy: read-only-review`. The runtime adapter must verify that parent conversation turns were not inherited or disclose reduced isolation before review.

Resolve **Approval Policy** and give the reviewer exact policy-accepted
spec/plan/Foundation identities. Autonomous accepts Ready or Approved;
Review-gated accepts Approved. Review is advisory and never creates approval.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before finishing verification, and before merge only when merge was explicitly requested

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code reviewer:**

Render [code-reviewer.md](code-reviewer.md) to a bounded prompt file, then dispatch `role: final-reviewer`, `contextPolicy: isolated`, `capabilityTier: strongest-available`, the prompt and artifact paths, and `workspacePolicy: read-only-review`. Explicit user model choices win; the adapter maps tiers only to active-host advertised capabilities.

**Placeholders:**
- `{DESCRIPTION}` - Brief summary of what you built
- `{REQUIREMENTS_FILE}` - Absolute path to the policy-accepted plan or bounded requirements file
- `{DIFF_FILE}` - Absolute path to the review package
- `{CURRENT_SPEC_FILE}` / `{CURRENT_SPEC_REVISION}` - Exact policy-accepted Design Spec identity
- `{CURRENT_PLAN_FILE}` / `{CURRENT_PLAN_REVISION}` - Exact policy-accepted Implementation Plan identity
- `{CONFORMANCE_RUBRIC_FILE}` - Absolute shared Architecture Conformance rubric path
- `{ARCHITECTURE_BINDING}` - Bound modules, interfaces, seams/adapters, data flow, depth/locality/leverage intent, and test surface
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit

**3. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Treat any Architecture Conformance `violation` as blocking. Under Autonomous,
  repair in-scope design changes through Draft and internal review to Ready;
  Review-gated returns changed artifacts to readable user review.
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code reviewer subagent]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/superpowers/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent returns]:
  Strengths: Clean architecture, interface-level behavior tests
  Architecture Conformance: Modules/interfaces preserved; no violations
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready for finishing verification

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each task or at natural checkpoints
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification

See template at: [code-reviewer.md](code-reviewer.md)
