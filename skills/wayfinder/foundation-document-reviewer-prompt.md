# Foundation Document Reviewer Prompt

Dispatch this host-neutral request through the active runtime adapter:

```json
{
  "role": "document-reviewer",
  "contextPolicy": "isolated",
  "capabilityTier": "balanced",
  "workspacePolicy": "read-only-review"
}
```

## Inputs

Read every input fresh from disk:

- the exact
  `skills/wayfinder/references/agentic-foundation-contract.md`;
- the shared `skills/codebase-design/ARCHITECTURE-CONFORMANCE.md`;
- the shared `skills/using-superpowers/references/product-evolution.md` and
  actual evidence sources for the maturity/evolution facts;
- the absolute `docs/agentic/WAYFINDING.md` manifest path and exact Draft
  Foundation revision;
- every manifest-selected Foundation file, including root files and every
  selected optional document;
- the readable Foundation changes and the ready roadmap outcome identified by
  Wayfinder.
- the exact effective **Approval Policy** (`Autonomous` or `Review-gated`) and
  Workflow Policy Version 2 owner.

If an input is missing, unreadable, outside the checkout, or inconsistent with
the manifest, report an issue. Do not infer missing content from the dispatch
conversation.

## Review Scope

Perform a read-only advisory review. Do not edit files, run approval, write
candidate content, change lifecycle state, stage changes, or continue into
Brainstorming.

Check:

1. lifecycle metadata and Foundation file manifest grammar;
2. every Wayfinder readiness item;
3. non-overlapping ownership with one owner for every current-truth category;
4. Root Router reading links, Approval Policy, Phase Mode, permissions, and Child DOX
   indexes;
5. compact dashboard behavior and absence of copied lifecycle revision;
6. Project Blueprint identities, project-wide scope, release boundaries, and
   roadmap Blueprint traceability;
7. immutable decision evidence, alternatives, current-truth links, primary
   source URLs and verification dates where required, and supersession links;
8. project-wide architecture modules, interfaces, seams, adapters, data flow,
   depth, locality, leverage, and test surface against the shared Architecture
   Conformance rubric;
9. stable roadmap identities, prerequisites, dependencies, readiness, and one
   canonical bounded Brainstorming prompt;
10. optional-document justification for every selected optional owner and
    absence of unjustified placeholders;
11. visible Frontier, Fog, Out of Scope, remaining uncertainty, and a
    destination coherent with the ready outcome;
12. evidence-backed maturity/consumer/durability, compatibility, scoped reset
    authority and recovery, and test-category policy in the correct owners;
    explicit unknowns, invalidation triggers and no speculative mechanisms;
13. absence of banned behavior: production scaffolding, framework or
    package-manager files, implementation plans, feature Design Specs, ADRs,
    PRDs, issue or triage flows, visual companions, and lowercase `context.md`.

Report every issue with a file path, the violated contract, and the smallest
required correction. Do not silently redesign a bound module, interface, seam,
adapter, data flow, depth/locality/leverage intent, or test surface. Under
Autonomous, an in-scope correction returns through Draft and internal review to
Ready. Review-gated changes return to readable user review.

Apply the shared evolution review questions and report evidence-backed stage,
consumer/compatibility, subtraction, test-category, sunset and budget verdicts
through Architecture Conformance. Use satisfied, violation, or cannot verify;
reasoned non-applicability is valid. Required missing evidence blocks readiness.
Foundation current truth remains managed-editable; accepted spec/plan history
and ledger entries are not rewritten. Review the existing outcome selection
owner and receipt implications whenever this change affects current work.

Return exactly one of these terminal statuses:

- `Ready for progression`
- `Ready for user review`
- `Issues found`

Use `Ready for progression` only when every check passes under Autonomous. Use
`Ready for user review` only when every check passes under Review-gated. With
`Issues found`, list actionable findings after that status. This advisory
reviewer never approves a Foundation or changes lifecycle metadata.
