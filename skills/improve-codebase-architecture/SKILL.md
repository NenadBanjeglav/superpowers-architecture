---
name: improve-codebase-architecture
description: Use for a read-only architecture review of shallow modules, weak seams, or poor locality.
---

# Improve Codebase Architecture

Produce a read-only architecture review. Do not refactor code while using this
skill.

Read applicable instructions, resolve the effective **Approval Policy**, inspect
the repository's public module behavior and tests, and apply
`codebase-design` vocabulary consistently: module, interface, seam, adapter,
depth, leverage, locality, and test surface.

Read [product-evolution.md](../using-superpowers/references/product-evolution.md)
and [Architecture Conformance](../codebase-design/ARCHITECTURE-CONFORMANCE.md).
Check existing authoritative current selection and exact accepted inputs where
present; report absent inputs honestly without manufacturing a Foundation or
phase artifact for this read-only review. Judge stage, consumers, durability,
retirement, test categories, sunset and budget using sources, not labels.

Look for:

- shallow modules that expose implementation detail;
- responsibilities split across unrelated callers;
- unstable or duplicated interfaces;
- seams in the wrong place and runtime concerns leaked into shared policy;
- adapters that do not isolate external systems;
- low locality that forces one change across many files;
- tests coupled to private helpers instead of public behavior; and
- repeated complexity a deeper module could hide;
- obsolete assumptions, formats, tests, or speculative compatibility that a
  scoped successor could retire; and
- expired temporary mechanisms needing reviewed removal or evidenced renewal.

Write the ignored local report under:

`docs/superpowers/architecture-reviews/YYYY-MM-DD-<topic>.md`

For each candidate include files/modules, evidence, current problem, proposed
deepening, interface/seam/adapter effects, data flow, test-surface effect,
benefits in locality and leverage, migration risks, and recommendation strength:

- **Strong:** current structure causes repeated cost or fragility.
- **Worth exploring:** likely benefit needs bounded design work.
- **Speculative:** plausible idea that must not block current work.

Apply every shared rubric line, with evidence-backed stage,
consumer/compatibility, subtraction, category, sunset and budget verdicts:
satisfied, violation or cannot verify (reasoned non-applicability is valid).
Answer its five subtraction questions for candidates. Compare deletion/direct
replacement with deepening; hypothetical adapters never justify a seam. Propose
explicit retirement mappings and retained coverage, not an automatic test purge.
Missing evidence blocks the dependent recommendation from execution.

The report is advisory. It never approves design, implementation, or release.
If a candidate becomes authorized work, route one bounded outcome to
`brainstorming`. Under Autonomous, that spec can progress through internal
review to Ready; Review-gated uses a readable user package after a new explicit
opt-in. Do not treat the architecture review itself as an artifact approval or
expand into unrelated refactoring.
