# Architecture Review

The `improve-codebase-architecture` skill scans a repo for module deepening opportunities and writes markdown-only local reviews under:

```text
docs/superpowers/architecture-reviews/
```

These reviews are local working state and should not be committed unless explicitly requested.

## Candidate Shape

Each candidate includes:

- files/modules involved
- problem
- proposed deepening
- interface/seam impact
- adapter impact
- test-surface impact
- benefits in locality and leverage
- recommendation strength

## Recommendation Strength

- **Strong**: The current design is actively causing complexity, fragility, or repeated implementation cost.
- **Worth exploring**: The design may improve locality or leverage, but the tradeoff needs project context.
- **Speculative**: The idea is plausible but should not block current work.

## After Review

If a candidate should become work, use `brainstorming` to create an approved local spec before planning or implementation.
