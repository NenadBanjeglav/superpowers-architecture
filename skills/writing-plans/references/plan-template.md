# Implementation Plan Shape

Read when writing a plan. Preserve all exact bindings even for generic work.

Use this header:

```markdown
# <Title> Implementation Plan

> **For agentic workers:** Execute tasks in order, use TDD where required, and
> preserve the exact policy/dependency bindings below.

**Spec:** <absolute Design Spec path>
**Spec Revision:** <exact policy-accepted revision>
**Foundation Manifest:** <absolute WAYFINDING.md path or none>
**Foundation Base Revision:** <exact base revision or none>
**Foundation Result Revision:** <exact result revision or none>
**Foundation Application Receipt:** <absolute APPLIED.json path or none>
**Artifact Type:** Implementation Plan
**Status:** Draft
**Revision:** none
**Approved Revision:** none
**Approved At:** none
**Goal:** <one bounded sentence>
**Approval Policy:** Autonomous | Review-gated
**Workflow Policy Version:** 2
**Phase Mode:** Automated fresh-session mode | Same-session mode
**Architecture:** <module/interface/seam/data-flow summary>
**Tech Stack:** <exact technologies>
```

A generic plan uses literal `none` for all four Foundation fields. A
Foundation-backed plan copies all four exact values; base and result may differ.

## Plan Content

Start with:

### Planning Validation Evidence

Record concise actual evidence: source lifecycle result, Foundation receipt
validation when applicable, checkout/branch identity, ignored local state,
instructions read, and relevant source/tests inspected. Do not dump repetitive
hash inventories.

### Global Constraints

Copy the goal, acceptance criteria, business/safety/privacy/security/data
constraints, external-action boundaries, no-publish/deploy rules, compatibility
requirements, and architecture invariants that every task must preserve.

Apply [product-evolution.md](../../using-superpowers/references/product-evolution.md)
to the selected current contract. Name the authoritative selection owner and
predecessor artifacts (absolute path, type, exact revision, affected scope), or
reasoned `none`. A plan-only successor retains its accepted source spec; a design
revision needs a compatible successor spec/plan pair. Include the accepted
budget's baseline, metric scope, thresholds, measurement commands and reviewer.

### Interfaces and Verification Harness

Name the public operations, APIs, schemas, file paths, commands, local ignored
fixtures, and meaningful behavioral checks used across tasks. This repository
uses temporary or ignored manual verification unless its own instructions say
otherwise.

### Tasks

Each task is a coherent implementation and review boundary:

```markdown
## Task N: <Outcome>

**Context:** Spec <absolute path> at <revision>. Foundation Manifest: <path or
none>. Foundation Base Revision: <revision or none>. Foundation Result
Revision: <revision or none>. Foundation Application Receipt: <path or none>.

**Files:** Create/modify/test exact paths.

**Architecture binding:** modules, interfaces, seams/adapters, data flow,
depth/locality/leverage intent, and test surface for this task.

**Evolution binding:** current consumer/evidence and scoped durability/reset
authority; retained and explicitly retired contracts; task budget slice with
measurement/checkpoint; primary test categories and active contracts; sunset
owner, supported versions, expiry/milestone and cleanup task, or reasoned none.

### Add

- <Required additions, or none with reason.>

### Replace

- <Old and replacement behavior with accepted retirement mapping, or reasoned none.>

### Remove

- <Obsolete code/tests/fixtures/docs/formats with retained coverage, or reasoned none.>

### Defer

- <Future-only mechanisms and why no present consumer justifies them, or reasoned none.>

### Steps and verification

- [ ] Establish meaningful red evidence where TDD applies; otherwise record
      the owning TDD policy's justified exception and relevant verification
      (for example scenario/structural review for Markdown-only changes).
- [ ] Implement the smallest coherent change.
- [ ] Run focused checks, then applicable broader verification.
- [ ] Inspect staged paths; keep docs/superpowers/** unstaged.
- [ ] Run Architecture Conformance and isolated advisory review.
- [ ] Resolve findings and record the task commit/range in ignored progress.
```

Use exact function/interface names, commands, expected observations, edge cases,
migration behavior, and recovery checks. Do not paste large speculative code
blocks. Group coupled files and sequential tasks; do not invent one task per
tiny edit.

Every task repeats the exact spec/Foundation binding so an isolated worker does
not depend on prior task context. Include documentation/DOX effects where the
implementation changes contracts or ownership. End with integrated verification,
whole-branch review, and local Git closeout. External publication remains
separate.

The extracted task text must contain enough evolution, affected-contract,
budget, test-category and sunset context to act without global-plan memory.
Use exact source links for detail; do not add fields to SDD binding JSON or a
semantic parser. Intent sections are not deletion quotas. Include a concrete
cleanup task for each temporary mechanism, covering production paths, tests,
fixtures, docs and formats; expiration requires reviewed removal or renewal.
