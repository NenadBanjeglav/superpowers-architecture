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
## Current Consumers
## Evolution Policy
## Compatibility Justification
## Complexity Budget
## Deletion Plan
## Predecessor Artifacts
## Retired Requirements
## Deleted Compatibility Contracts
## Obsolete Tests and Fixtures
## Replacement Behavior
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

Apply [product-evolution.md](../../using-superpowers/references/product-evolution.md).
These sections hold scope-specific decisions and links to exact current owners,
not copied project truth. Reasoned `none` is valid; an unknown fact is not none.

- **Current Consumers:** maturity, users and actual callers/workflows; evidence
  source, observation boundary/date, and limitations for each fact.
- **Evolution Policy:** scoped durability, schema policy, reset authorizer,
  environment/datasets, recovery procedure, and evidence invalidation triggers.
  Compare the simplest reversible option and justified alternatives; do not
  substitute a stage label for data evidence or authority.
- **Compatibility Justification:** apply the shared five-item gate to every
  proposed/prolonged mechanism, with versions and sources; resolve any stateless
  external promise explicitly. Future-only mechanisms belong in Defer.
- **Complexity Budget:** metric scope, baseline command/source/environment,
  thresholds and reviewer for the shared policy's metrics. Unavailable values
  need a reason and resolution; they are not zero or passing evidence.
- **Deletion Plan:** exact obsolete paths/contracts to remove, retained coverage,
  and temporary mechanism owner, reason/evidence, versions, expiry/milestone,
  test category and concrete cleanup task. State why no deletion is needed if so.
- **Predecessor Artifacts:** a table of absolute path, type, exact canonical
  revision, and affected scope, or `none` with reason for a first design.
- **Retired Requirements**, **Deleted Compatibility Contracts**, **Obsolete
  Tests and Fixtures**, and **Replacement Behavior:** use the shared retirement
  mapping (identity/section and predecessor revision, evidence, authority,
  replacement/absence, affected code/tests/fixtures, verification). Cross-reference
  one complete mapping rather than repeat it. First designs may map existing
  code behavior using its observed source revision without inventing a predecessor
  artifact. Omission never retires a requirement. Retain the complete active
  bounded contract and name the authoritative current-selection owner.

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

Use the exact header `| Decision | Classification | Owning document | Candidate action |`.
Task-local rows use the exact owner `Design Spec`; No impact rows use `none`.

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
