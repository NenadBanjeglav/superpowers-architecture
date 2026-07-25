# Plan Document Reviewer Prompt Template

Use this template to dispatch an isolated advisory document reviewer through
the host-neutral dispatch action.

**Purpose:** Verify the Draft plan is complete, binds the exact Approved source
spec and exact Approved Foundation, and has actionable task decomposition. The
reviewer cannot approve it.

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
and ready for user review. You cannot approve or mutate it.

Plan to review: [ABSOLUTE_PLAN_FILE_PATH]
Spec for reference: [ABSOLUTE_SPEC_FILE_PATH]
Foundation manifest: [ABSOLUTE_FOUNDATION_MANIFEST_OR_NONE]
Exact Approved Foundation revision: [FOUNDATION_REVISION_OR_NONE]
Architecture rubric: [CONFORMANCE_RUBRIC_FILE]

## What to Check

| Category | What to Look For |
|---|---|
| Completeness | No TODOs, placeholders, incomplete tasks, or missing steps |
| Spec Alignment | Every source-spec requirement is covered without scope creep |
| Task Decomposition | Tasks have clear boundaries, exact context, and actionable steps |
| Buildability | An engineer can follow the plan without relying on conversation memory or prior tasks |
| Lifecycle | Artifact Type is Implementation Plan; Status is Draft; Revision is complete; Approved Revision and Approved At are none |
| Source Binding | Spec path and exact Approved Spec Revision match the supplied source artifact |
| Foundation Binding | Plan path/revision fields are both none or exactly match the source spec Foundation binding; a non-none manifest validates as the exact Approved Foundation |
| Foundation Context | Planning evidence, every task, Architecture Conformance input, and implementation handoff carry the same exact Foundation identity |
| Architecture Conformance | Every task names and checks the Approved modules, interfaces, seams/adapters, data flow, depth/locality/leverage intent, and test surface through the shared rubric |
| Handoff | The canonical implementation prompt contains exactly the shared fifteen-field record including foundationManifestPath and foundationRevision |
| Git Hygiene | No task stages docs/superpowers unless the user explicitly requested it |

Only flag issues that could cause an incorrect or blocked implementation.
Minor wording and style preferences are not issues.

Return only `Ready for user review` or `Issues found`. Never write Approved or
mutate lifecycle metadata; reviewers are advisory and only the user can
approve the exact artifact revision.

## Output Format

## Plan Review

**Status:** Ready for user review | Issues found

**Issues (if any):**
- [Task X, Step Y]: [specific issue] - [why it matters]

**Recommendations (advisory):**
- [suggestion]
```

`[CONFORMANCE_RUBRIC_FILE]` is the absolute path to
`codebase-design/ARCHITECTURE-CONFORMANCE.md`.
