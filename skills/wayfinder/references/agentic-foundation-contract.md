# Agentic Foundation Document Contract

This reference is the single detailed shape and ownership contract for
downstream Agentic Foundation documents created or reconciled by Wayfinder.
Shared skills point here instead of copying these shapes. The host-neutral
lifecycle implementation remains separately owned by
[agentic-foundation-lifecycle.md](../../using-superpowers/references/agentic-foundation-lifecycle.md).

## Foundation Boundary

The Agentic Foundation is root `AGENTS.md`, root `CONTEXT.md`, and the exact
manifest-selected authoritative files under `docs/agentic/`. It is local to a
deliberate downstream project. Never create this bundle in the Superpowers
Architecture plugin repository as a side effect of maintaining the plugin.

Always create this lean core:

- Root `AGENTS.md`
- Root `CONTEXT.md`
- `docs/agentic/AGENTS.md`
- `docs/agentic/WAYFINDING.md`
- `docs/agentic/PROJECT-BLUEPRINT.md`
- `docs/agentic/PRODUCT.md`
- `docs/agentic/DOMAIN.md`
- `docs/agentic/ARCHITECTURE.md`
- `docs/agentic/DECISIONS.md`
- `docs/agentic/ROADMAP.md`
- `docs/agentic/VERIFICATION.md`

Add an optional `SECURITY.md`, `DATA.md`, `STYLE.md`, or `OPERATIONS.md` only
when that concern is durable enough to need a focused owner. Record its
justification in `WAYFINDING.md`. An empty placeholder is not justified.

## Ownership And Non-Duplication

| Document | Sole authoritative responsibility |
| --- | --- |
| Root `AGENTS.md` | Entry point, reading router, operating rules, Approval Policy and version, permissions, verification summary, durable Phase Mode, Child DOX Index |
| Root `CONTEXT.md` | Compact project identity and current-state dashboard |
| `docs/agentic/AGENTS.md` | Local maintenance, reconciliation, verification, and ownership contract |
| `WAYFINDING.md` | Foundation lifecycle manifest and resumable navigation state |
| `PROJECT-BLUEPRINT.md` | Living project-wide requirements baseline and roadmap traceability |
| `PRODUCT.md` | Product model, user workflows, UX principles, and product rules |
| `DOMAIN.md` | Canonical language, definitions, invariants, and relationships |
| `ARCHITECTURE.md` | Project-wide technology and architecture current truth |
| `DECISIONS.md` | Replaceable current index plus immutable decision ledger entries |
| `ROADMAP.md` | Ordered bounded outcome identities and Brainstorming entry points |
| `VERIFICATION.md` | Quality policy, test strategy, commands, and evidence expectations |
| Optional `SECURITY.md` | Authentication, authorization, threats, privacy, secrets, recovery, and audit |
| Optional `DATA.md` | Data ownership, conceptual schema, lifecycle, retention, migration, backup, and compliance |
| Optional `STYLE.md` | Visual language, interaction principles, accessibility, voice, and project-specific style |
| Optional `OPERATIONS.md` | Environments, deployment, observability, incidents, support, and maintenance |

Current truth must live in one owning document and must not duplicate across
the Root Router, dashboard, Wayfinding Map, Blueprint, ledger, or roadmap.
Navigation documents point to owners. The Blueprint may link an architectural
constraint but does not restate it. The roadmap links requirements but does not
copy them. The current-decision index links immutable ledger entries but does
not replace the current-truth owner.

Replace stale current truth in its owner. Ledger entries are immutable and
never rewritten or deleted to erase history; a new decision entry supersedes
an earlier one. Root `AGENTS.md` and child `AGENTS.md` files contain operating
contracts, not product or architecture knowledge.

## Stable Identity Grammar

Use identities that remain stable across edits:

- Blueprint requirements: `REQ-<AREA>-<NNN>`, where `AREA` is a short uppercase
  category and `NNN` is a zero-padded sequence, for example `REQ-FUNC-001` or
  `REQ-SEC-003`.
- Decisions: `DEC-<NNNN>`, for example `DEC-0001`.
- Roadmap outcomes: `OUT-<NNN>`, for example `OUT-001`.

Never renumber, reuse, or silently repurpose an identity. Mark removed
requirements or outcomes as superseded or withdrawn and link their replacement.
All references use the literal identity, not only a title.

## Foundation Lifecycle Metadata

`docs/agentic/WAYFINDING.md` owns the only active lifecycle metadata:

```markdown
**Artifact Type:** Agentic Foundation
**Status:** Draft | Ready | Approved
**Revision:** sha256:<64 lowercase hexadecimal characters>
**Approved Revision:** none | sha256:<64 lowercase hexadecimal characters>
**Approved At:** none | ISO-8601 timestamp
```

These five unfenced lines occur exactly once. No other Foundation document
repeats the active revision. Draft and Ready use `Approved Revision: none` and
`Approved At: none`; Approved uses one identical complete lowercase SHA-256
revision in both revision fields. Ready means exact internal checks passed; it
never claims human approval.

All lifecycle transitions and canonical bytes are owned by the shared
Foundation operation described in the lifecycle reference. Do not implement or
calculate revisions in Wayfinder, document templates, or runtime adapters.

## Managed Manifest Grammar

`WAYFINDING.md` contains exactly one unfenced `## Foundation Files` section.
Its body contains only blank lines and backticked Markdown bullets:

```markdown
## Foundation Files

- `AGENTS.md`
- `CONTEXT.md`
- `docs/agentic/AGENTS.md`
- `docs/agentic/WAYFINDING.md`
- `docs/agentic/PROJECT-BLUEPRINT.md`
- `docs/agentic/PRODUCT.md`
- `docs/agentic/DOMAIN.md`
- `docs/agentic/ARCHITECTURE.md`
- `docs/agentic/DECISIONS.md`
- `docs/agentic/ROADMAP.md`
- `docs/agentic/VERIFICATION.md`
```

Append only justified optional documents. Managed paths are unique, normalized, forward-slash, repository-relative UTF-8 strings. Reject absolute paths,
backslashes, traversal, duplicates, missing or non-regular files, and symlink
or junction escapes. The manifest-selected file set is the complete
authoritative bundle.

## Root Router Shape

Root `AGENTS.md` remains concise and operational:

```markdown
# AGENTS.md

## Purpose

## Reading Order

## Ownership

## Local Contracts

## Work Guidance

## Workflow Policy

**Workflow Policy Version:** 2
**Approval Policy:** Autonomous | Review-gated

## Phase Mode

**Selected Mode:** Automated fresh-session mode | Same-session mode
**Reason:** <durable reason>

## Permissions

## Verification

## Child DOX Index
```

`Reading Order` begins with the Root Router and compact dashboard, then routes
by task to the minimum owning documents. `Ownership` names each direct child
contract. `Workflow Policy` records version 2, defaults new and existing work
to Autonomous, treats Review-gated as a new explicit opt-in, and routes
Wayfinder for project-wide reorientation and Brainstorming for one bounded
outcome. It requires Foundation reconciliation and rejects Draft progression.
`Permissions` states allowed mutations and
publication limits. `Verification` summarizes where exact commands are owned
without copying the full command catalog.

## Root CONTEXT.md Shape

Root `CONTEXT.md` is a compact dashboard, not a knowledge store:

```markdown
# <Project Name> Context

## Project Identity

## Foundation Manifest

## Current Focus

## Active Risks

## Roadmap Position

## Reading Links
```

`Foundation Manifest` points to `docs/agentic/WAYFINDING.md` without repeating
its revision. Keep the file short enough to scan at session start. It does not
contain decision history, detailed requirements, architecture, implementation
logs, or completed-work diaries.

## docs/agentic/AGENTS.md Shape

```markdown
# AGENTS.md

## Purpose

## Ownership

## Local Contracts

## Work Guidance

## Verification

## Child DOX Index
```

It maps each document to its sole responsibility, requires current-truth and
ledger reconciliation, requires the managed Foundation lifecycle for edits,
defines optional-document justification, and keeps its Child DOX Index current.
It does not copy project content.

## WAYFINDING.md Shape

```markdown
# <Project Name> Wayfinding

**Artifact Type:** Agentic Foundation
**Status:** Draft | Ready | Approved
**Revision:** sha256:<64 lowercase hexadecimal characters>
**Approved Revision:** none | sha256:<64 lowercase hexadecimal characters>
**Approved At:** none | ISO-8601 timestamp

## Foundation Files

## Destination

## Readiness Checklist

## Frontier

## Fog

## Out of Scope

## Decision Pointers

## Optional Document Justification
```

Destination is observable Foundation state, not an implementation target.
Frontier contains precise answerable decisions. Fog contains relevant but not
yet askable uncertainty. Out of Scope records explicit exclusions. Decision
Pointers contain stable identities and links only. Phase Mode points to its
durable record in root `AGENTS.md`; it does not duplicate the selected value.

## PROJECT-BLUEPRINT.md Shape

```markdown
# <Project Name> Project Blueprint

## Vision And Problem

## Target Users

## Primary Journeys

## Goals

## Non-Goals

## Success Measures

## Release Boundaries

## Requirements

### Global Functional Requirements

### Accessibility Requirements

### Performance Requirements

### Security And Privacy Requirements

### Reliability Requirements

### Operational Requirements

## Project-Level UX And Visual Principles

## Technology And Architecture Constraints

## Risks And Deferred Areas

## Roadmap Traceability
```

Every requirement has a stable `REQ-<AREA>-<NNN>` identity, concise statement,
acceptance evidence at project level, owner link, and status. Constraints point
to their current-truth owner. Roadmap Traceability maps every outcome identity
to the requirements it advances.

The Blueprint is a living project-wide baseline. It does not contain detailed
feature behavior, exact implementation steps, file lists, or an exhaustive
future feature specification. Those belong to later Brainstorming Design Specs.

## PRODUCT.md Shape

```markdown
# Product

## Product Model

## Users And Roles

## Primary Workflows

## Product Rules

## UX Principles

## Product-Level Non-Goals

## Open Product Risks
```

PRODUCT owns current product truth and project-level experience rules. Link
Blueprint requirements and decisions by identity.

## DOMAIN.md Shape

```markdown
# Domain

## Canonical Language

## Definitions

## Invariants

## Relationships

## Rejected Synonyms

## Open Domain Risks
```

Use one canonical term per concept. Record rejected synonyms when ambiguity is
likely. Domain invariants are product truth, not implementation assertions.

## ARCHITECTURE.md Shape

```markdown
# Architecture

## Technology Stack

## Constraints

## Modules

## Interfaces

## Seams

## Adapters

## Data Flow

## Depth, Locality, And Leverage

## Integration Shape

## Test Surface

## Open Architecture Risks
```

This is the sole project-wide architecture current-truth owner. Use the
`codebase-design` vocabulary exactly. Modules hide complexity behind small
interfaces; adapters sit only at justified seams; data flow is source-to-sink;
the test surface exercises observable module interfaces. Feature Design
Understanding remains in later Design Specs.

## DECISIONS.md Shape

```markdown
# Decisions

## Current Decision Index

| Area | Current decision | Current-truth owner | Supersedes |
| --- | --- | --- | --- |

## Immutable Decision Ledger

### DEC-0001: <Decision title>

**Area:** <governed area>
**Decision:** <concise statement>
**Rationale:** <why>
**Alternatives:** <considered choices>
**Evidence:** <primary-source URLs and verification dates, or not required>
**Current Truth:** <owning document and section>
**Blueprint Requirements:** <identities or none>
**Roadmap Outcomes:** <identities or none>
**Supersedes:** <decision identity or none>
```

The Current Decision Index is the only place that records whether a decision is
current or superseded; the index is replaceable. Ledger entries are append-only
and immutable. When a decision changes, append a new immutable entry whose
`**Supersedes:** <decision identity or none>` field names the prior identity,
then update the current index and current-truth owner.
The earlier entry remains byte-for-byte unchanged.

## ROADMAP.md Shape

```markdown
# Roadmap

## Outcome Order

### OUT-001: <Bounded outcome title>

**Intent:** <observable outcome>
**Blueprint Requirements:** <stable identities>
**Decision Prerequisites:** <stable identities or none>
**Dependencies:** <outcome identities or none>
**Readiness:** Ready for Brainstorming | Blocked
**State:** Proposed | Ready | Designing | Planned | Implementing | Complete | Superseded
**Brainstorming Prompt:** Use the brainstorming skill to design roadmap outcome
OUT-001 from <absolute WAYFINDING.md path> at Agentic Foundation revision
<exact policy-accepted revision>.
```

Outcome order expresses dependency order, not implementation steps. Each
outcome is bounded enough for one coherent Design Spec and links every relevant
Blueprint requirement. Never put exact file changes or implementation tasks in
the roadmap.

## VERIFICATION.md Shape

```markdown
# Verification

## Quality Policy

## Test Strategy

## Required Commands

## Evidence Rules

## Architecture Conformance

## Security And Privacy Verification

## Release Verification

## Operational Verification
```

Commands must be runnable or explicitly marked unresolved. Evidence identifies
what was run, where, at what revision, and with what result. Baseline
preparation and verification are resolved independently.

## Optional SECURITY.md Shape

Create only when authentication, authorization, sensitive data, secrets,
privacy, recovery, audit, or a meaningful threat model needs a focused owner:

```markdown
# Security

## Assets And Threats

## Authentication

## Authorization

## Privacy

## Secrets

## Recovery

## Audit

## Security Verification
```

## Optional DATA.md Shape

Create only when durable data ownership or lifecycle decisions exist:

```markdown
# Data

## Ownership

## Conceptual Model

## Lifecycle And Retention

## Migration

## Backup And Recovery

## Compliance

## Data Verification
```

## Optional STYLE.md Shape

Create only when durable product presentation or project-specific style needs a
focused owner:

```markdown
# Style

## Visual Language

## Interaction Principles

## Accessibility

## Content Voice

## Project-Specific Code Style

## Style Verification
```

## Optional OPERATIONS.md Shape

Create only when environments, deployment, observability, incidents, support,
or maintenance needs a focused owner:

```markdown
# Operations

## Environments

## Deployment

## Observability

## Incident Expectations

## Support

## Maintenance

## Operations Verification
```

## Readiness Checklist

Wayfinder may progress the Foundation according to Approval Policy only when
all are true:

- [ ] Destination and project identity are clear.
- [ ] Users, goals, non-goals, primary journeys, and success measures are
      defined.
- [ ] The Blueprint contains project-wide requirements and release boundaries.
- [ ] Canonical domain language and invariants exist.
- [ ] Technology and architecture choices are sufficient for the first ready
      roadmap outcome.
- [ ] Style, authentication, data, security, integration, deployment,
      operations, and verification concerns are resolved, explicitly deferred,
      or explicitly not applicable.
- [ ] Architecture defines modules, interfaces, seams, adapters, data flow,
      depth intent, locality and leverage expectations, and test surface.
- [ ] Every meaningful resolved decision has one current-truth owner and one
      immutable ledger entry.
- [ ] Root Router links and every Child DOX Index resolve to real files.
- [ ] Roadmap outcomes link Blueprint requirements, dependencies, and decision
      prerequisites.
- [ ] At least one bounded outcome is Ready for Brainstorming.
- [ ] No Frontier decision or Fog blocks that ready outcome.
- [ ] Remaining non-blocking uncertainty is visible.
- [ ] Optional documents have explicit justification and appear in the
      manifest; unjustified optional documents are absent.
- [ ] Phase Mode is recorded durably in root `AGENTS.md`.
- [ ] Workflow Policy Version 2 and Approval Policy are recorded durably in root `AGENTS.md`.
- [ ] Advisory Foundation review reports `Ready for progression` under Autonomous or `Ready for user review` under Review-gated.

## Managed Edit And Application Rules

Wayfinder edits an authoritative Foundation only through Draft, refresh,
advisory review, policy-selected Ready or Approved progression, and validate.
Later Brainstorming writes
complete non-authoritative candidates and applies them only through the shared
combined Design Change Set operation.

Candidate application requires the **Quiescent Application Window** and all
lock, transaction, recovery, exact-owned-state, and excluded-adversary rules in
the lifecycle reference. This document does not duplicate that correctness
policy. A different prospective revision, base drift, candidate drift, or
observable filesystem hazard returns to review or fails closed.
