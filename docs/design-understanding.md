# Design Understanding

Every Design Spec establishes Design Understanding before Planning. The exact
spec is Draft while being authored, then progresses according to **Approval
Policy**: Autonomous resolves advisory findings and records Ready; Review-gated
records Approved only after a clear user response.

For Foundation-backed work, the spec is one bounded roadmap outcome under the
policy-accepted Agentic Foundation. The Project Blueprint owns project-wide
purpose, users, journeys, scope, stable requirements, release boundaries, and
roadmap traceability. A feature spec links those identities without copying
project-wide truth.

## Language

Name important concepts and rejected synonyms when ambiguity would spread across
modules or user behavior.

```markdown
**Renewal Attempt**:
A single scheduled try to renew a subscription after a failed payment.
_Avoid_: retry job, billing retry, payment loop
```

## Architecture

Record:

- modules and their responsibilities;
- public interfaces;
- seams and production/test adapters;
- source-to-sink data flow;
- intended depth, locality, and leverage;
- observable test surface through public module behavior;
- compatibility and migration boundaries; and
- business, safety, privacy, security, data, and external-action constraints.

The shared Architecture Conformance rubric binds these decisions through
Planning, TDD, implementation, task review, and whole-branch review.

## Durable Documentation Impact

Every design decision receives a stable `DDI-NNN` identity. Foundation-backed
durable changes additionally bind the candidate and its receipt. Record a
concrete classification reason, exact current-truth owner, and candidate action
identity or `none`:

- Task-local;
- Project-durable;
- Operating-contract; or
- No impact.

Task-local and No impact rows use `none`. Project-durable decisions include
their current-truth owner and an append-only `DECISIONS.md` entry.
Operating-contract decisions include the exact AGENTS.md owner and affected
parent Child DOX indexes. Managed file or reading-order changes also include the
manifest or Root Router consequence.

Paths appear only in the exact fenced JSON Foundation Candidate Declaration.
Its sorted path/action projection must equal operation-owned
`candidate.json`. Duplicate/conflicting paths, missing owner/ledger/index
effects, unreferenced actions, and no-op candidates fail review. An empty
declaration uses the exact unfenced sentence
`No durable documentation changes`.

Current truth is updated in one focused owner. Decision evidence is immutable:
a changed decision appends a new ledger entry naming `Supersedes`; only the
Current Decision Index changes prior status.

## Review and Correction

Advisory reviewers return Ready for progression under Autonomous, Ready for user
review under Review-gated, or Issues found. They never approve content.

Implementation-discovered in-scope design corrections return the spec and
dependent plan through Draft. Under Autonomous, the controller records the
change, refreshes, reviews, marks Ready, and resumes. Under Review-gated, the
changed readable artifact requires new clear human approval. A reviewer report,
conversation statement, or passing test does not create lifecycle evidence.

Ask the user only when a discovery changes the authorized goal, acceptance
criteria, safety boundary, consequential product behavior, or external-action
authority. If it changes project direction or several roadmap outcomes, return
to Wayfinder instead of widening one feature spec.
