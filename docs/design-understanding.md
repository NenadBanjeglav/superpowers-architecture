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

The stage-aware design contracts described here are included in 0.7.0. See
[verification status](runtime-support.md#070-verification-status) for source
evidence and the remaining installed-host limits.

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

## Evolution Evidence

Use [product-evolution.md](../skills/using-superpowers/references/product-evolution.md)
for maturity, current consumers, scoped data/reset authority and reversible
alternatives. Unknowns remain unknown; stage labels cannot remove obligations.
Specs carry the five evolution sections and successor retirement mappings;
accepted history is immutable, while current selection defines the target.
Future-only complexity is deferred. Budget measurements, active test categories
and complete temporary cleanup are reviewed through the one conformance rubric.
A hypothetical second adapter does not justify a seam.

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

Implementation-discovered in-scope design corrections preserve accepted bytes
and create distinct Draft successor spec and plan files. Under Autonomous, the
controller records explicit retirement/replacement, refreshes, reviews and marks
Ready. Under Review-gated, the readable successors require genuine approval.
Select the compatible pair in the current work owner at a quiescent boundary,
regenerate inputs and revalidate before divergent work resumes. A reviewer report,
conversation statement, or passing test does not create lifecycle evidence.

Ask the user only when a discovery changes the authorized goal, acceptance
criteria, safety boundary, consequential product behavior, or external-action
authority. If it changes project direction or several roadmap outcomes, return
to Wayfinder instead of widening one feature spec.
