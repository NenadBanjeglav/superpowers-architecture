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
- intended depth, locality, and leverage
- test surface through public module behavior and justified external seams

## Test Surface

Tests should verify behavior through the correct interface. If a test must reach past the interface, the module shape is probably wrong.

## Planning Impact

Implementation plans bind each task to the modules, interfaces, seams/adapters,
data flow, depth/locality/leverage intent, and test surface in the exact Approved
spec revision. TDD, implementer, task-reviewer, and final-reviewer prompts use
the same Architecture Conformance rubric, so a generic passing test suite does
not excuse a violated seam or shallow module boundary.

This is true whether later phases run in automated fresh-session mode or
same-session mode: the Approved artifact is the source of truth, and the next phase
must validate and re-read it from disk. If implementation reveals that the
design is wrong, return the controlling artifact to Draft, refresh its revision,
and obtain new user approval rather than silently changing architecture.
