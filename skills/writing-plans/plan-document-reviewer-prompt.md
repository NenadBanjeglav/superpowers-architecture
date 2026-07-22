# Plan Document Reviewer Prompt Template

Use this template to dispatch an isolated advisory document reviewer through the host-neutral dispatch action.

**Purpose:** Verify the Draft plan is complete, binds the Approved source spec, and has proper task decomposition. The reviewer cannot approve it.

**Dispatch after:** The complete plan is written and `artifact refresh` has recorded its exact revision.

Render the bounded prompt below to `[PROMPT_FILE]`, then issue:

```json
{
  "role": "document-reviewer",
  "contextPolicy": "isolated",
  "capabilityTier": "balanced",
  "promptPath": "[PROMPT_FILE]",
  "artifactPaths": ["[ABSOLUTE_PLAN_FILE_PATH]", "[ABSOLUTE_SPEC_FILE_PATH]"],
  "workspacePolicy": "read-only-review"
}
```

```text
    You are an advisory plan document reviewer. Verify this Draft plan is complete and ready for user review. You cannot approve it.

    Plan to review: [ABSOLUTE_PLAN_FILE_PATH]
    Spec for reference: [ABSOLUTE_SPEC_FILE_PATH]

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Completeness | TODOs, placeholders, incomplete tasks, missing steps |
    | Spec Alignment | Plan covers spec requirements without major scope creep |
    | Task Decomposition | Tasks have clear boundaries and actionable steps |
    | Buildability | An engineer can follow the plan without getting stuck |
    | Lifecycle | Artifact Type is Implementation Plan; Status is Draft; Revision is a complete sha256 digest; Approved Revision and Approved At are none |
    | Source Binding | Spec path and exact Approved Spec Revision are present and match the supplied source artifact |
    | Architecture | Tasks preserve the spec's modules, interfaces, seams, adapters, data flow, and test surface |

    ## Calibration

    Only flag issues that would cause real implementation problems. Minor wording, stylistic preferences, and nice-to-have suggestions are not issues.

    Return Ready for user review unless there are serious gaps, contradictions, placeholders, or unbuildable steps. Never write Approved; only the user can approve the exact artifact revision.

    ## Output Format

    ## Plan Review

    **Status:** Ready for user review | Issues found

    **Issues (if any):**
    - [Task X, Step Y]: [specific issue] - [why it matters for implementation]

    **Recommendations (advisory):**
    - [suggestions for improvement]
```

**Reviewer returns:** `Ready for user review` or `Issues found`, plus issues and advisory recommendations. It never returns `Approved`.
