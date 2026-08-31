# Spec and Design Change Set Reviewer Prompt Template

Use this template to dispatch an isolated advisory document reviewer through
the host-neutral dispatch action.

**Purpose:** Verify that the exact Draft Design Spec is complete and ready for
progression under its Approval Policy. For a Foundation-backed spec, also verify that the exact candidate
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
and ready for progression under the supplied Approval Policy. You cannot
approve or mutate them.

Spec to review: [ABSOLUTE_SPEC_FILE_PATH]
Architecture rubric: [CONFORMANCE_RUBRIC_FILE]
Foundation manifest: [ABSOLUTE_FOUNDATION_MANIFEST_OR_NONE]
Approved base Foundation revision: [BASE_FOUNDATION_REVISION_OR_NONE]
Candidate declaration: [ABSOLUTE_CANDIDATE_JSON_OR_NONE]
Readable review: [ABSOLUTE_DESIGN_CHANGE_SET_REPORT_OR_NONE]
Prospective Foundation revision: [PROSPECTIVE_FOUNDATION_REVISION_OR_NONE]
Approval Policy: [APPROVAL_POLICY]

## What to Check

| Category | What to Look For |
|---|---|
| Completeness | No TODOs, placeholders, TBD markers, or incomplete sections |
| Consistency | No internal contradictions or conflicting requirements |
| Scope | One coherent roadmap outcome or one coherent generic planning unit |
| Lifecycle | Artifact Type is Design Spec; Status is Draft; Revision is complete; Approved Revision and Approved At are none |
| Source, Policy, and Phase Mode | Source, Workflow Policy Version 2, Approval Policy, one supported Phase Mode, reason, and durability are concrete and independent |
| Architecture Conformance | Modules, interfaces, seams/adapters, data flow, depth/locality/leverage intent, and test surface are decision-complete under the shared rubric |
| Foundation Traceability | Foundation Manifest and Base Agentic Foundation are a consistent absolute-path/exact-revision pair or both none; a Foundation-backed spec has one ready outcome, complete Blueprint traceability, and relevant prior decisions |
| Decision Classification | Every decision has one unique stable DDI-NNN identity, exactly one Task-local, Project-durable, Operating-contract, or No impact classification, and a concrete classification reason |
| Structured Declaration | The fenced JSON uses the exact declaration schema and keys, FCA-NNN identities and paths are unique, action order is unsigned UTF-8 path then action, paths are normalized escape-safe JSON strings, and decision references are sorted, unique, non-empty, and reciprocal |
| Owning-document Locality | Every Project-durable decision references its exact current-truth owner and a Decision Ledger upsert, and every Operating-contract decision references its exact AGENTS.md owner and every affected parent Child DOX Index |
| Navigation Consequences | Managed-file additions/deletions include the manifest action, reading-order changes include the applicable router action, and no Task-local or No impact decision references an action |
| Declared/Candidate Equality | Candidate action cells contain FCA-NNN identities and never paths, the declaration's path/action projection has exact candidate equality with candidate.json, complete upsert files exist, and there are no missing, extra, undeclared, duplicate, conflicting, unreferenced, or no-op candidates |
| Candidate Coherence | The prospective manifest and complete candidate files remain a coherent Agentic Foundation and an empty candidate preserves the base revision |
| Empty Declaration | An empty actions array has exactly one unfenced `No durable documentation changes` sentence; a non-empty declaration requires that sentence to be absent |
| Readable Review | The operation-owned readable report covers every affected-file action and exposes review paths or normalized diffs |
| Prospective Identity | The report, candidate, exact Draft spec, exact Approved base, and prospective Foundation revision have consistent bindings |
| Policy progression | Autonomous resolves findings then progresses the exact reviewed bindings to Ready; Review-gated presents one readable combined package and binds a clear user response internally |

For a generic spec whose Foundation fields are both none, treat the
Foundation-specific rows as satisfied only when the impact table still
classifies every decision and no candidate is claimed.

Only flag issues that could cause an incorrect plan or an incomplete,
misleading, or unappliable Design Change Set. Minor wording preferences are not
issues.

Return only `Ready for progression`, `Ready for user review`, or `Issues found`.
Use progression only for Autonomous and user review only for Review-gated.
Never write Approved or mutate lifecycle metadata; reviewers are advisory and
never approve an artifact or Design Change Set.

## Output Format

## Spec Review

**Status:** Ready for progression | Ready for user review | Issues found

**Issues (if any):**
- [Section or candidate path]: [specific issue] - [why it matters]

**Recommendations (advisory):**
- [suggestion]
```

`[CONFORMANCE_RUBRIC_FILE]` is the absolute path to
`codebase-design/ARCHITECTURE-CONFORMANCE.md`.
