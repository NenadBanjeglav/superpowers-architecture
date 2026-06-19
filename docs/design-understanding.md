# Design Understanding

Every spec must include Design Understanding before planning.

## Language

Name important concepts explicitly. Define preferred terms and rejected synonyms when language is overloaded.

Example:

```markdown
**Renewal Attempt**:
A single scheduled try to renew a subscription after a failed payment.
_Avoid_: retry job, billing retry, payment loop
```

## Architecture

Capture:

- modules involved
- interfaces
- seams
- adapters
- data flow
- test surface

## Test Surface

Tests should verify behavior through the correct interface. If a test must reach past the interface, the module shape is probably wrong.

## Planning Impact

Implementation plans should preserve the Design Understanding decisions from the approved spec. If implementation reveals the design is wrong, stop and revise the spec or plan rather than silently changing architecture.
