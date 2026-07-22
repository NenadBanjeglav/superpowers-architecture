# Spec Document Reviewer Prompt Template

Use this template to dispatch an isolated advisory document reviewer through the host-neutral dispatch action.

**Purpose:** Verify the Draft spec is complete, consistent, lifecycle-valid, and ready for user review. The reviewer cannot approve it.

**Dispatch after:** The spec is written under `docs/superpowers/specs/` and `artifact refresh` has recorded its exact revision.

Render the bounded prompt below to `[PROMPT_FILE]`, then issue:

```json
{
  "role": "document-reviewer",
  "contextPolicy": "isolated",
  "capabilityTier": "balanced",
  "promptPath": "[PROMPT_FILE]",
  "artifactPaths": ["[ABSOLUTE_SPEC_FILE_PATH]", "[CONFORMANCE_RUBRIC_FILE]"],
  "workspacePolicy": "read-only-review"
}
```

```text
    You are an advisory spec document reviewer. Verify this Draft spec is complete and ready for user review. You cannot approve it.

    Spec to review: [ABSOLUTE_SPEC_FILE_PATH]
    Architecture rubric: [CONFORMANCE_RUBRIC_FILE]

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Completeness | TODOs, placeholders, TBD markers, incomplete sections |
    | Consistency | Internal contradictions or conflicting requirements |
    | Clarity | Requirements ambiguous enough to cause the wrong plan |
    | Scope | One coherent planning unit, not multiple independent subsystems |
    | YAGNI | Unrequested features or over-engineering |
    | Lifecycle | Artifact Type is Design Spec; Status is Draft; Revision is a complete sha256 digest; Approved Revision and Approved At are none |
    | Source Binding | Source is present and identifies the user prompt, supplied document, or ticket that governs the spec |
    | Phase Mode | One supported Phase Mode, reason, and durability are recorded |
    | Architecture Conformance | Modules, interfaces, seams, adapters, data flow, depth/locality/leverage intent, and test surface are decision-complete enough for the shared rubric |

    ## Calibration

    Only flag issues that would cause real problems during implementation planning. Minor wording and stylistic preferences are not issues.

    Return only Ready for user review or Issues found. Never write Approved or mutate lifecycle metadata; reviewers are advisory and only the user can approve the exact artifact revision.

    ## Output Format

    ## Spec Review

    **Status:** Ready for user review | Issues found

    **Issues (if any):**
    - [Section X]: [specific issue] - [why it matters for planning]

    **Recommendations (advisory):**
    - [suggestions for improvement]
```

**Reviewer returns:** `Ready for user review` or `Issues found`, plus issues and advisory recommendations. It never returns `Approved`.

`[CONFORMANCE_RUBRIC_FILE]` is the absolute path to `codebase-design/ARCHITECTURE-CONFORMANCE.md`.
