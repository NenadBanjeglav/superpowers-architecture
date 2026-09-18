# Retained Project Export Upgrade Design Spec

**Source:** Illustrative bounded project-export upgrade request
**Date:** 2026-09-16
**Artifact Type:** Design Spec
**Status:** Draft
**Revision:** sha256:0475f58122d5c8e6e238e5a5c6cc6b9c0d74c94ea0da5ee179467d5fa63aed83
**Approved Revision:** none
**Approved At:** none
**Approval Policy:** Autonomous
**Workflow Policy Version:** 2
**Phase Mode:** Same-session mode

All consumers, observations and authority here are stipulated fictional inputs,
not claims about this plugin or actual deployments. A real design must inspect
its own evidence. This Draft does not authorize implementation.

## Problem

The pre-beta app needs export v2 while users retain v1 files. Deleting v1 import
based on a stage label would strand their projects.

## Goal

Read retained v1 projects during a bounded conversion window; write only v2.

## Non-Goals

No generic version framework, adapter registry, replay service, background data
reset, indefinite support, v1 writer, or conversion of unrelated formats.

## Current Consumers

E1, scenario support inventory and owner interview on 2026-09-16: existing
pre-beta users reopen retained exports through the current importer. E2, file
inspection and recovery exercise that day: user-authored content exists in v1
exports and is absent from the seed. E3, the owner's support notice: v1 import
is promised through the conversion-completion milestone below. Evidence covers
only project exports; other datasets/interfaces remain unknown and out of scope.

## Evolution Policy

Exports are durable despite the pre-beta label. The owner authorizes separate
v2 exports and nondestructive conversion, not resetting originals. Preserve the
original, atomically write a new v2 copy, reopen it and compare project content.
If conversion fails, the prior app can still read the original; exercise that
recovery before rollout. Reset/reseed was rejected because E2 shows it loses
unique content. One conversion inside the existing importer is simpler than a
version framework. Reassess on new consumers/data, changed environment,
conflicting evidence, stage promotion and release; unknowns grant no reset right.

## Compatibility Justification

| Required evidence | Scoped decision |
| --- | --- |
| Real consumer | E1: current users reopen retained exports |
| Durable data | E2: unique user-authored content in v1 files |
| Support window | E3: v1 import through conversion completion, reviewed by the owner before every release |
| Removal condition | All inventoried users have verified v2 copies and the owner has resolved the E3 promise; accept a cleanup successor before removal |
| Reset insufficiency | E2: seed lacks unique content; recovery needs preserved originals |

Supported reads are v1 and v2; writes are v2 only. Missing completion evidence
blocks removal. A milestone alone never authorizes blind deletion of live support.

## Complexity Budget

Scope: existing importer/writer. Limits: 100 added production lines, +60 net,
no new behavioral module/package/import edge, two supported format versions,
one temporary v1 path, two concepts (project export and conversion window).
The plan collects actual base, `git diff --numstat`, module/import/format
inventory and focused/full suite commands before execution. No measurement is
claimed here. Identical inputs/environment are required for runtime comparisons;
increases over max(20%, 5 seconds) focused or max(20%, 30 seconds) full checkpoint.
The task reviewer validates every metric; unavailable values need resolution.

## Deletion Plan

Concrete plan task: `Remove v1 import after verified conversion`, accountable
owner: scenario product maintainer. E1/E2/E3 justify introducing this temporary
v1 read path. The removal milestone is Compatibility Justification's condition.
Cleanup covers its production branch, v1 compatibility/migration tests, fixtures,
support docs and supported-format listing, retaining v2 and original-file safety
coverage. Expired support requires reviewed removal or renewal with fresh
evidence and a successor before relying on it; never blindly delete live data.

## Predecessor Artifacts

None: first design in this scenario, with no invented accepted history. The
cleanup successor must bind this spec's actual accepted path/type/revision/scope.

## Retired Requirements

None: the E3 support promise remains active. Only an evidenced cleanup successor
may retire it. Omission does not remove an obligation.

## Deleted Compatibility Contracts

None now: retain v1 reads through the window. V1 writing is not promised in E3
and is replaced with current-only v2 exports.

## Obsolete Tests and Fixtures

Replace v1-write expectations with v2 product coverage. Keep representative v1
read fixtures/tests until the accepted cleanup successor; invalid-file and
original-file preservation coverage remain active.

## Replacement Behavior

V1 `{ "version": 1, "title": "Draft", "notes": "Text" }` and v2
`{ "version": 2, "project": { "title": "Draft", "notes": "Text" } }` import
to identical content. New exports use v2. Malformed or unknown-version files
fail without modifying input files or replacing the currently open project.

## Design Understanding

### Language

Export means a user-owned file; conversion creates a separate current-format copy.

### Architecture

The existing import module hides parsing and the v1 conversion behind
`importProject`; the writer owns v2 output. Data flows file to validated project
to UI. Local files justify no new seam/adapter. Depth hides format details;
locality keeps conversion with its consumer; leverage and the test surface use
public-interface fixtures shared with recovery checks.

### Key Decisions

DDI-001 binds scoped compatibility/recovery; DDI-002 binds budget, verification
and cleanup. Same-session mode uses exact disk rereads. After acceptance,
existing ignored task progress selects the exact spec and compatible plan;
a date or Ready status alone never selects work.

### Open Risks

Incomplete inventory or unresolved E3 promises block sunset. No evidence
supports changing an uninspected dataset or interface.

## Foundation Traceability

**Foundation Manifest:** none
**Base Agentic Foundation:** none
**Roadmap Outcome:** none
**Blueprint Requirements:** none
**Prior Decisions:** none

## Durable Documentation Impact

| Decision | Classification | Owning document | Candidate action |
| --- | --- | --- | --- |
| DDI-001: Preserve exports in a bounded window; Classification reason: standalone export change | Task-local | Design Spec | none |
| DDI-002: Bind budget/verification/cleanup; Classification reason: bounded implementation obligations | Task-local | Design Spec | none |

No durable documentation changes

## Foundation Candidate Declaration

```json
{
  "schema": "superpowers-architecture-foundation-declaration-v1",
  "actions": []
}
```

## User-Facing Behavior

Users reopen existing projects and save separate v2 copies without losing originals.

## Implementation Shape

Add one v1 conversion inside the existing importer, replace writer output with
v2, remove obsolete v1-write coverage, and defer speculative version registries.

## Testing Strategy

Product behavior: meaningful red/green v2 export/reopen checks. External
compatibility contract: v1 import preserves content under E3 through the window.
Temporary migration test: conversion verifies a separate copy, tied to cleanup.
Safety/security invariant: malformed/unknown input preserves originals and the
open project. Replace private-helper assertions with interface coverage.

## Acceptance Criteria

1. Both formats import correctly; new writes use only v2.
2. Failure preserves originals/open project; recovery is exercised.
3. Evidence, window, accountable owner and concrete cleanup task exist.
4. Measured budget and retained-contract verification pass before closeout.
