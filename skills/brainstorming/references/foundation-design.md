# Foundation-Backed Design

Read only when the spec has a non-none Foundation manifest/base. Also read
[agentic-foundation-lifecycle.md](../../using-superpowers/references/agentic-foundation-lifecycle.md)
for exact preview/apply/receipt operations.

For a Foundation-backed spec:

1. keep the Design Spec Draft while preparing complete ignored candidate files
   under `docs/superpowers/foundation-candidates/`;
2. include exact current-truth, immutable ledger, AGENTS.md, manifest, and Root
   Router consequences declared by the spec;
3. run policy-aware `foundation preview` against the exact policy-accepted base
   and exact Draft spec;
4. inspect operation-owned `candidate.json` and
   `DESIGN-CHANGE-SET.md`; require declaration/candidate equality and no
   missing, extra, duplicate, conflicting, unreferenced, or no-op action;
5. run one combined advisory review against the spec, prospective Foundation,
   readable change set, and Architecture Conformance;
6. repair all issues, re-refresh, and re-preview whenever bound bytes change;
7. under Autonomous, apply the exact reviewed change set with explicit policy;
   apply records the spec/result as Ready and emits the v2 receipt;
8. under Review-gated, present the combined readable package once. After a clear
   approval of that displayed package, bind the response internally and apply
   with Review-gated; apply records real Approved provenance.

Reviewers return `Ready for progression` under Autonomous,
`Ready for user review` under Review-gated, or `Issues found`. They never
approve or mutate artifacts.

An empty Foundation action set must preserve all Foundation bytes and lifecycle
timestamps while still producing valid policy-bound application evidence when
the operation requires it.
