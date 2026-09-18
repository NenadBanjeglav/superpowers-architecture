# Architecture Review

The `improve-codebase-architecture` skill performs a read-only repository scan
and writes ignored Markdown reviews under:

```text
docs/superpowers/architecture-reviews/
```

Reviews are local working state and are not committed unless explicitly
requested. They identify opportunities; they never approve design,
implementation, or release.

The stage-aware evolution changes described here apply to current repository
source. They are not installed or released in the pinned 0.6.0 plugin; its
[startup and installed-host limits](runtime-support.md#060-known-limitations)
remain. Source checks do not establish host delivery.

## Candidate Shape

Each candidate includes:

- files and modules involved;
- evidence and current problem;
- deletion/direct replacement compared with proposed deepening;
- interface, seam, adapter, and data-flow effects;
- test-surface effect;
- expected gains in depth, locality, and leverage;
- migration risk; and
- recommendation strength.

Use the shared [Architecture Conformance rubric](../skills/codebase-design/ARCHITECTURE-CONFORMANCE.md)
and [evolution policy](../skills/using-superpowers/references/product-evolution.md).
Every candidate reports stage, consumer/compatibility, subtraction, test-category,
sunset and budget as satisfied, violation or cannot verify, with evidence or
reasoned non-applicability. Answer the five subtraction questions: what can this
delete; which assumptions are obsolete; which tests protect obsolete formats;
does this fit the current stage; would we build this today from an empty codebase?

No deletion can be the correct result. A recommendation cannot retire a current
obligation: execution requires an exact accepted successor and current selection.
Preserve retained behavior/safety coverage and identify temporary cleanup across
code, tests, fixtures, docs and formats. Missing measures cannot count as zero.

## Recommendation Strength

- **Strong:** current structure causes repeated cost, fragility, or scattered
  changes.
- **Worth exploring:** likely improvement needs bounded design work.
- **Speculative:** plausible idea that must not block current work.

## After Review

If a candidate becomes authorized work, route one bounded outcome to
`brainstorming`. **Approval Policy** applies to the resulting artifacts:
Autonomous resolves internal review and progresses the exact spec to Ready;
Review-gated uses a readable user package after a new explicit opt-in. Phase
Mode independently controls fresh-task or same-session progression.

The resulting plan and implementation must preserve Design Understanding and
Architecture Conformance. Do not turn an advisory architecture review into an
approval token or use it to expand unrelated scope.

Implementation review is a separate contract: `requesting-code-review` owns one
task review per task and one final whole-branch review. Record complete ranges;
finishing can reuse the exact unchanged final review. Changed source or artifact
requirements need affected re-review. The architecture scan above does not replace
either implementation review.
