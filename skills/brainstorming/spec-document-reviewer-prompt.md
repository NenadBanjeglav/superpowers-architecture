# Spec and Design Change Set Reviewer Prompt Template

Use this template to dispatch an isolated advisory document reviewer through
the host-neutral dispatch action.

**Purpose:** Verify that the exact Draft Design Spec is complete and ready for
user review. For a Foundation-backed spec, also verify that the exact candidate
and operation-owned readable review form one coherent prospective Foundation.
The reviewer cannot approve either artifact.

**Dispatch after:** The spec has been refreshed and, when Foundation-backed,
`foundation preview` has produced the exact prospective revision and readable
`DESIGN-CHANGE-SET.md`.

Render the bounded prompt below to `[PROMPT_FILE]`, then issue exactly one
request shape. For a generic spec, issue:

```json
{
  "role": "document-reviewer",
  "contextPolicy": "isolated",
  "capabilityTier": "balanced",
  "promptPath": "[PROMPT_FILE]",
  "artifactPaths": [
    "[ABSOLUTE_SPEC_FILE_PATH]",
    "[CONFORMANCE_RUBRIC_FILE]"
  ],
  "workspacePolicy": "read-only-review"
}
```

For a Foundation-backed spec, issue:

```json
{
  "role": "document-reviewer",
  "contextPolicy": "isolated",
  "capabilityTier": "balanced",
  "promptPath": "[PROMPT_FILE]",
  "artifactPaths": [
    "[ABSOLUTE_SPEC_FILE_PATH]",
    "[CONFORMANCE_RUBRIC_FILE]",
    "[ABSOLUTE_FOUNDATION_MANIFEST]",
    "[ABSOLUTE_CANDIDATE_JSON]",
    "[ABSOLUTE_DESIGN_CHANGE_SET_REPORT]"
  ],
  "workspacePolicy": "read-only-review"
}
```

Literal `none` is valid in optional prompt data fields for a generic review,
but never include literal `none` or an absent optional artifact in
`artifactPaths`.

```text
You are an advisory spec and Design Change Set document reviewer. Verify the
Draft spec and, when supplied, its exact prospective Foundation are complete
and ready for one user review. You cannot approve or mutate them.

Spec to review: [ABSOLUTE_SPEC_FILE_PATH]
Architecture rubric: [CONFORMANCE_RUBRIC_FILE]
Foundation manifest: [ABSOLUTE_FOUNDATION_MANIFEST_OR_NONE]
Approved base Foundation revision: [BASE_FOUNDATION_REVISION_OR_NONE]
Candidate declaration: [ABSOLUTE_CANDIDATE_JSON_OR_NONE]
Readable review: [ABSOLUTE_DESIGN_CHANGE_SET_REPORT_OR_NONE]
Prospective Foundation revision: [PROSPECTIVE_FOUNDATION_REVISION_OR_NONE]

## What to Check

| Category | What to Look For |
|---|---|
| Completeness | No TODOs, placeholders, TBD markers, or incomplete sections |
| Consistency | No internal contradictions or conflicting requirements |
| Scope | One coherent roadmap outcome or one coherent generic planning unit |
| Lifecycle | Artifact Type is Design Spec; Status is Draft; Revision is complete; Approved Revision and Approved At are none |
| Source and Phase Mode | Source, one supported Phase Mode, reason, and durability are concrete |
| Architecture Conformance | Modules, interfaces, seams/adapters, data flow, depth/locality/leverage intent, and test surface are decision-complete under the shared rubric |
| Foundation Traceability | Manifest/revision are a consistent absolute-path/exact-revision pair or both none; a Foundation-backed spec has one ready outcome, complete Blueprint traceability, and relevant prior decisions |
| Decision Classification | Every decision is exactly Task-local, Project-durable, Operating-contract, or No impact and has a concrete classification reason |
| Owning-document Locality | Every durable or operating-contract decision names the one authoritative owner and preserves immutable ledger history and pointer-based navigation |
| Declared/Candidate Equality | Every Candidate action follows the normalized action grammar; the normalized union has exact set equality with candidate.json; complete upsert files exist; there are no missing, extra, undeclared, duplicate, or no-op candidates |
| Candidate Coherence | The prospective manifest and complete candidate files remain a coherent Agentic Foundation and an empty candidate preserves the base revision |
| Readable Review | The operation-owned readable report covers every affected-file action and exposes review paths or normalized diffs |
| Prospective Identity | The report, candidate, exact Draft spec, exact Approved base, and prospective Foundation revision have consistent bindings |
| Single Gate | The package requires one approval naming the exact spec and prospective Foundation revisions, with no second review gate |

For a generic spec whose Foundation fields are both none, treat the
Foundation-specific rows as satisfied only when the impact table still
classifies every decision and no candidate is claimed.

Only flag issues that could cause an incorrect plan or an incomplete,
misleading, or unappliable Design Change Set. Minor wording preferences are not
issues.

Return only `Ready for user review` or `Issues found`. Never write Approved or
mutate lifecycle metadata; reviewers are advisory and only the user can
approve the exact artifact revision or combined Design Change Set.

## Output Format

## Spec Review

**Status:** Ready for user review | Issues found

**Issues (if any):**
- [Section or candidate path]: [specific issue] - [why it matters]

**Recommendations (advisory):**
- [suggestion]
```

`[CONFORMANCE_RUBRIC_FILE]` is the absolute path to
`codebase-design/ARCHITECTURE-CONFORMANCE.md`.
