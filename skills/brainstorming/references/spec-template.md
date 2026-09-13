# Design Spec Shape

Read when writing a Design Spec, including generic work.

Use this shape:

```markdown
# <Title> Design Spec

**Source:** <request, roadmap outcome, and authoritative constraint source>
**Date:** YYYY-MM-DD
**Artifact Type:** Design Spec
**Status:** Draft
**Revision:** none
**Approved Revision:** none
**Approved At:** none
**Approval Policy:** Autonomous | Review-gated
**Workflow Policy Version:** 2
**Phase Mode:** Automated fresh-session mode | Same-session mode

## Problem
## Goal
## Non-Goals
## Design Understanding
### Language
### Architecture
### Key Decisions
### Open Risks
## Foundation Traceability
**Foundation Manifest:** <absolute WAYFINDING.md path or none>
**Base Agentic Foundation:** <exact revision or none>
**Roadmap Outcome:** <OUT-NNN or none>
**Blueprint Requirements:** <identities or none>
**Prior Decisions:** <identities or none>
## Durable Documentation Impact
## Foundation Candidate Declaration
## User-Facing Behavior
## Implementation Shape
## Testing Strategy
## Acceptance Criteria
```

Every design decision receives a stable `DDI-NNN` row and exactly one
classification:

- **Task-local:** authoritative in this Design Spec;
- **Project-durable:** updates a focused Foundation current-truth owner and
  appends immutable Decision Ledger evidence;
- **Operating-contract:** updates the exact AGENTS.md owner and affected parent
  Child DOX indexes;
- **No impact:** requires no durable change.

Each row gives a concrete classification reason, owner, and candidate action
identity or `none`. Task-local and No impact rows use `none`.

The fenced declaration is exact JSON:

```json
{
  "schema": "superpowers-architecture-foundation-declaration-v1",
  "actions": []
}
```

For durable changes, use unique sorted `FCA-NNN` actions with normalized paths,
`upsert|delete`, and sorted nonempty decision references. Project-durable
decisions include both their current-truth owner and a
`docs/agentic/DECISIONS.md` upsert. Operating-contract changes include their
exact AGENTS.md owner and affected indexes. Managed-file or reading-order
changes include the manifest/router consequence. Empty declarations include
the exact unfenced sentence `No durable documentation changes`.
