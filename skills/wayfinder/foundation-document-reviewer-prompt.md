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
- the absolute `docs/agentic/WAYFINDING.md` manifest path and exact Draft
  Foundation revision;
- every manifest-selected Foundation file, including root files and every
  selected optional document;
- the readable Foundation changes and the ready roadmap outcome identified by
  Wayfinder.

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
4. Root Router reading links, workflow gates, permissions, and Child DOX
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
12. absence of banned behavior: production scaffolding, framework or
    package-manager files, implementation plans, feature Design Specs, ADRs,
    PRDs, issue or triage flows, visual companions, and lowercase `context.md`.

Report every issue with a file path, the violated contract, and the smallest
required correction. Do not redesign an Approved module, interface, seam,
adapter, data flow, depth/locality/leverage intent, or test surface. A necessary
design change is an issue that returns the controlling artifact to Draft and
user review.

Return exactly one of these terminal statuses:

- `Ready for user review`
- `Issues found`

Use `Ready for user review` only when every check passes. With `Issues found`,
list the actionable findings after that status and use no other verdict or
approval wording. This advisory reviewer never approves a Foundation.
