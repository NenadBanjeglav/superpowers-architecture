# Disposable Preview Preferences Design Spec

**Source:** Illustrative bounded local-preview request
**Date:** 2026-09-16
**Artifact Type:** Design Spec
**Status:** Draft
**Revision:** sha256:41c609132c30de351b90fd2c07d4e1e6bc2be2acf5c6a24cee175ef35ec79ef0
**Approved Revision:** none
**Approved At:** none
**Approval Policy:** Autonomous
**Workflow Policy Version:** 2
**Phase Mode:** Same-session mode

This fictional exercise stipulates the observations and authority below. They
are not claims about this plugin's users or runtime. A real project must inspect
and cite its own evidence; this Draft cannot authorize implementation.

## Problem

The preview stores `{ "themeName": "light" }` (v1). Keeping its old reader would
complicate the new current-only `{ "theme": "light" }` representation.

## Goal

Keep theme selection working while replacing the disposable preference file.

## Non-Goals

No accounts, sync, migration, external API, reusable storage adapter, or reset
outside `preview/preferences.json` in the local preview environment.

## Current Consumers

E1, the scenario owner's demonstration and filesystem/deployment inspection on
2026-09-16, identifies a pre-beta local preview, no real users or external callers,
and one theme-picker caller. Only the named file holds preferences. These facts
cover this preview environment; they say nothing about other deployments.

## Evolution Policy

E1 identifies generated disposable fixtures only. E2, the owner's instruction
on the same date, authorizes resetting only that file from the checked-in light
seed. Stop the preview, replace the file, restart and select both themes. If this
fails, restore the old build and reseed its v1 file. No user data needs recovery.

Direct replacement/reseed is the simplest reversible alternative. A dual reader
has no present consumer. Reassess before release/stage promotion and when new
users, retained data, callers, environment changes or conflicting evidence appear.
Unknown facts never authorize another reset.

## Compatibility Justification

None: no durable data or external format promise exists within E1's boundary.
No compatibility mechanism is proposed; hypothetical future sync is deferred.

## Complexity Budget

Scope: preference module. Limits: 30 added production lines, zero net growth,
no new module/import edge, one current schema, zero compatibility paths and one
concept (theme preference). The plan must collect actual baseline/source and
commands before execution; this fictional design claims no measured result.
Use `git diff --numstat`, module/import/format inventory, focused preference
checks and the full existing preview suite on identical inputs/environment.
Runtime increases over max(20%, 5 seconds) focused or max(20%, 30 seconds) full
checkpoint. The task reviewer checks measurements; unavailable is not zero.

## Deletion Plan

Problem defines the v1 representation; E1/E2 authorize removing that reader and
generated fixture. Replace v1 round-trip expectations with picker save/reload
coverage. No temporary mechanism is introduced, so no sunset task is needed.

## Predecessor Artifacts

None: first design in this scenario; no accepted history is invented. A real
successor names exact predecessor paths, types, canonical revisions and scope.

## Retired Requirements

None: no prior accepted requirement exists. Theme selection and scoped authority
remain binding; omission does not retire an obligation.

## Deleted Compatibility Contracts

Remove the unpromised v1 reader using Deletion Plan's evidence and authority;
no live external compatibility promise is retired.

## Obsolete Tests and Fixtures

Remove only the v1 fixture/round-trip expectation; retain invalid-value and
persistence coverage. Deletion Plan maps the evidence and replacement checks.

## Replacement Behavior

Load/save accepts `light` and `dark` in the current `theme` field. Invalid values
report an error without overwriting saved state. Reset happens once under E2,
not as silent runtime migration.

## Design Understanding

### Language

Theme means light or dark; preference means the saved selection.

### Architecture

The preference module hides validation/persistence behind load/save. Data flows
from picker through that interface to the local file. No new seam/adapter is
justified. Depth hides persistence; locality keeps one owner; leverage and test
surface come from exercising load/save rather than private helpers.

### Key Decisions

DDI-001 selects direct replacement; DDI-002 scopes recovery and verification.
Same-session mode continues with exact disk rereads. After acceptance, existing
ignored task progress selects the exact spec and compatible plan. Ready status
alone never selects work; this Draft is not execution authority.

### Open Risks

First real user data invalidates E1/E2's disposable-data decision; stop and redesign.

## Foundation Traceability

**Foundation Manifest:** none
**Base Agentic Foundation:** none
**Roadmap Outcome:** none
**Blueprint Requirements:** none
**Prior Decisions:** none

## Durable Documentation Impact

| Decision | Classification | Owning document | Candidate action |
| --- | --- | --- | --- |
| DDI-001: Replace disposable v1; Classification reason: bounded preview behavior | Task-local | Design Spec | none |
| DDI-002: Scope reset/recovery; Classification reason: only this exercise's file | Task-local | Design Spec | none |

No durable documentation changes

## Foundation Candidate Declaration

```json
{
  "schema": "superpowers-architecture-foundation-declaration-v1",
  "actions": []
}
```

## User-Facing Behavior

The picker preserves the selected theme across reloads after reseeding.

## Implementation Shape

Replace the representation, remove the old reader/fixture, and keep load/save
and picker callers. Add no speculative abstraction or compatibility path.

## Testing Strategy

Product behavior: meaningful red/green save/reload checks for both themes.
Safety/security invariant: invalid input does not overwrite saved state and
reset touches only the authorized file. Inspect removed v1 references; no
private helper-call assertions. No external-compatibility or migration test applies.

## Acceptance Criteria

1. Both themes persist; invalid input preserves saved state.
2. Only the authorized file is reseeded with demonstrated recovery.
3. V1 reader/fixture removal preserves active behavioral coverage.
4. Measured implementation fits budget or accepts a reviewed successor.
