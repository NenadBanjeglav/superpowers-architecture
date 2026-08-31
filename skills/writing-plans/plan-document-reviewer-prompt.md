# Plan Document Reviewer Prompt Template

Use this template to dispatch an isolated advisory document reviewer through
the host-neutral dispatch action.

**Purpose:** Verify the Draft plan is complete, binds the exact policy-accepted source
spec and exact Foundation base/result/application-receipt evidence, and has
actionable task decomposition. The reviewer cannot approve it.

**Dispatch after:** The complete plan is written and `artifact refresh` has
recorded its exact Draft revision.

Render the bounded prompt below to `[PROMPT_FILE]`, then issue exactly one
request shape. For a generic plan, issue:

```json
{
  "role": "document-reviewer",
  "contextPolicy": "isolated",
  "capabilityTier": "balanced",
  "promptPath": "[PROMPT_FILE]",
  "artifactPaths": [
    "[ABSOLUTE_PLAN_FILE_PATH]",
    "[ABSOLUTE_SPEC_FILE_PATH]",
    "[CONFORMANCE_RUBRIC_FILE]"
  ],
  "workspacePolicy": "read-only-review"
}
```

For a Foundation-backed plan, issue:

```json
{
  "role": "document-reviewer",
  "contextPolicy": "isolated",
  "capabilityTier": "balanced",
  "promptPath": "[PROMPT_FILE]",
  "artifactPaths": [
    "[ABSOLUTE_PLAN_FILE_PATH]",
    "[ABSOLUTE_SPEC_FILE_PATH]",
    "[ABSOLUTE_FOUNDATION_MANIFEST]",
    "[ABSOLUTE_FOUNDATION_APPLICATION_RECEIPT]",
    "[CONFORMANCE_RUBRIC_FILE]"
  ],
  "workspacePolicy": "read-only-review"
}
```

Literal `none` is valid in optional prompt data fields for a generic review,
but never include literal `none` or an absent optional artifact in
`artifactPaths`.

```text
You are an advisory plan document reviewer. Verify this Draft plan is complete
and ready for progression under its Approval Policy. You cannot approve or
mutate it.

Plan to review: [ABSOLUTE_PLAN_FILE_PATH]
Spec for reference: [ABSOLUTE_SPEC_FILE_PATH]
Foundation manifest: [ABSOLUTE_FOUNDATION_MANIFEST_OR_NONE]
Foundation Base Revision: [FOUNDATION_BASE_REVISION_OR_NONE]
Foundation Result Revision: [FOUNDATION_RESULT_REVISION_OR_NONE]
Foundation Application Receipt: [ABSOLUTE_FOUNDATION_APPLICATION_RECEIPT_OR_NONE]
Architecture rubric: [CONFORMANCE_RUBRIC_FILE]
Approval Policy: [APPROVAL_POLICY]

## What to Check

| Category | What to Look For |
|---|---|
| Completeness | No TODOs, placeholders, incomplete tasks, or missing steps |
| Spec Alignment | Every source-spec requirement is covered without scope creep |
| Task Decomposition | Tasks have clear boundaries, exact context, and actionable steps |
| Buildability | An engineer can follow the plan without relying on conversation memory or prior tasks |
| Lifecycle | Artifact Type is Implementation Plan; Status is Draft; Revision is complete; Approved Revision and Approved At are none |
| Source Binding | Spec path and exact policy-accepted Spec Revision match the supplied source artifact |
| Foundation Binding | All four fields are literal none or the manifest/base/result/receipt binding exactly matches the source spec and supplied physical application receipt |
| Receipt-backed Result Evidence | Planning validation evidence records successful receipt-backed Foundation validation of the exact spec base, receipt, and result before codebase inspection |
| Foundation Context | Planning evidence, every task, and Architecture Conformance input carry the same exact Foundation base, result, and receipt identity |
| Architecture Conformance | Every task names and checks the bound modules, interfaces, seams/adapters, data flow, depth/locality/leverage intent, and test surface through the shared rubric |
| Future Handoff | Static Draft review verifies the documented post-readiness v2 envelope, fifteen-field record, external receipt, source-spec, goal, policy, and constraint bindings without requiring a future digest |
| Git Hygiene | No task stages docs/superpowers unless the user explicitly requested it |

Only flag issues that could cause an incorrect or blocked implementation.
Minor wording and style preferences are not issues.

Return only `Ready for progression`, `Ready for user review`, or `Issues found`.
Use progression only for Autonomous and user review only for Review-gated.
Never write Approved or mutate lifecycle metadata; reviewers are advisory and
never approve an artifact.

## Output Format

## Plan Review

**Status:** Ready for progression | Ready for user review | Issues found

**Issues (if any):**
- [Task X, Step Y]: [specific issue] - [why it matters]

**Recommendations (advisory):**
- [suggestion]
```

`[CONFORMANCE_RUBRIC_FILE]` is the absolute path to
`codebase-design/ARCHITECTURE-CONFORMANCE.md`.
