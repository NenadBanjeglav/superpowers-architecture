# Architecture Review

The `improve-codebase-architecture` skill performs a read-only repository scan
and writes ignored Markdown reviews under:

```text
docs/superpowers/architecture-reviews/
```

Reviews are local working state and are not committed unless explicitly
requested. They identify opportunities; they never approve design,
implementation, or release.

## Candidate Shape

Each candidate includes:

- files and modules involved;
- evidence and current problem;
- proposed deepening;
- interface, seam, adapter, and data-flow effects;
- test-surface effect;
- expected gains in depth, locality, and leverage;
- migration risk; and
- recommendation strength.

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
