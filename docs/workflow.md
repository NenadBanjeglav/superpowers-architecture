# Workflow

Superpowers Architecture is a Codex-only plugin optimized for GPT-6 Astra.
It separates **Approval Policy** from **Phase Mode**.

- Approval Policy controls whether exact internally reviewed Ready artifacts can
  progress. Version 2 defaults new and existing work to Autonomous.
  Review-gated requires a new explicit opt-in.
- Phase Mode controls whether progression uses a genuinely fresh user-owned
  same-checkout task or continues after a same-session disk reread.

## Entry and Existing Projects

Every fresh, resumed, or compacted controller reads the applicable instruction
chain and resolves policy before phase checks. Active legacy Superpowers
document gates are migrated at a safe writer boundary through the shared
`workflow migrate` operation. The transaction changes only reviewed instruction
and current artifact/Foundation bytes named in its exact ignored request.

Migration preserves goal, acceptance criteria, business and safety rules,
privacy/data/security constraints, external-action authority, Phase Mode, user
work, and immutable Decision Ledger entries. Changed current specs/plans and
Foundation results become Ready with no human approval metadata. Existing valid
Approved artifacts remain Approved. No migration-approval prompt is used.

## 0. Wayfinder

Use `wayfinder` for greenfield inception, a missing Agentic Foundation, or
project-wide reorientation. It is documentation-only.

Wayfinder establishes or resumes the Root Router, compact dashboard,
`WAYFINDING.md` lifecycle manifest, Project Blueprint, current-truth owners,
immutable Decision Ledger, traceable roadmap, Approval Policy, and Phase Mode.
It runs exact Foundation review. Autonomous repairs findings, marks the exact
revision Ready, and progresses. Review-gated presents one readable package and
records Approved only after a clear user response.

## 1. Brainstorming

Use `brainstorming` for one bounded roadmap outcome or generic design unit.
It validates the exact policy-accepted Foundation when present, reads the
selected Blueprint/roadmap bindings, and writes one local Draft Design Spec.

Every decision receives a stable `DDI-NNN` identity and classification.
Project-durable and operating-contract changes use stable sorted `FCA-NNN`
actions in one exact JSON declaration. The shared operation proves declaration
and candidate equality, previews complete files, and renders a readable Design
Change Set.

Reviewers are advisory. Under Autonomous, the controller resolves findings and
policy-aware apply records the spec/result Ready with a v2 Application Receipt.
Under Review-gated, one combined readable package receives clear human approval
before apply records real Approved provenance. An empty change set causes no
Foundation byte or lifecycle timestamp churn.

## 2. Planning

`writing-plans` accepts a Ready or Approved spec under Autonomous and Approved
only under Review-gated. Foundation-backed Planning validates:

```text
policy-accepted Design Spec
-> Base Agentic Foundation from the spec
-> v2 APPLIED.json receipt
-> policy-accepted resulting Agentic Foundation
```

The plan records exact spec, Foundation manifest/base/result/receipt, Approval
Policy Version 2, Phase Mode, goal, global constraints, architecture bindings,
files, interfaces, commands, meaningful red/green tests, review boundaries, and
Git closeout. Generic plans use literal `none` for all Foundation fields.

Advisory review returns Ready for progression, Ready for user review, or Issues
found. Autonomous repairs and marks the plan Ready; Review-gated records
Approved only after a clear user response.

## 3. Implementation

Implementation validates the exact plan, source spec, and optional
Foundation/receipt before codebase inspection. New SDD task briefs and review
packages carry an exact v2 policy/dependency binding and reject stale inputs.

Implementation uses TDD, sequential writers, task-scoped advisory review,
Architecture Conformance, and a whole-branch review. Under Autonomous, in-scope
code, test, docs, design, plan, and review repairs continue without a routine
human gate. A changed goal, weakened acceptance criterion, safety boundary, or
unauthorized external action still requires the appropriate user decision.

Generated `docs/superpowers/**` state remains ignored and unstaged unless the
user explicitly requests committing it.

## 4. Phase Handoff

Automated fresh-session mode uses
`superpowers-architecture-phase-handoff-v2`. The envelope binds policy, bounded
goal, raw-byte constraint source, exact fifteen-field record, Foundation
receipt, and Brainstorming outcome/prompt. The record uses
`artifactRevision`, not a false approval label.

Shared prepare/receive operations validate local mechanics. The runtime must
still prove installed plugin inventory, exact saved-checkout targeting, and
genuine fresh user-owned task identity. A v1 receiver accepts genuinely
Approved inputs only and rejects Ready. Unsafe handoff falls back according to
the durable Phase Mode without copying ignored state or pretending a fork or
subagent is fresh.

Same-session mode revalidates changed dependencies and rereads authoritative
artifacts and relevant code from disk. It reuses unchanged validation within
one uninterrupted context.

## 5. Finish

`finishing-a-development-branch` confirms current verification and exact task/
whole-branch review coverage, inspects Git/index state, and reports commits, changed files,
tests, satisfied requirements, residual risks, ignored artifacts, and installed
runtime limitations.

It does not push, merge, open a PR, deploy, publish, discard work, or perform
destructive cleanup without separate authorization.

## Relevant Context and Evidence

All 16 skills retain their roles. Short catalog descriptions identify when each
applies; Foundation, migration, and handoff procedures load when needed. Generic
work still validates explicit absent Foundation bindings. Read-only questions
do not start an unsolicited design phase.

Within an uninterrupted context, reuse checks and the one final whole-branch
review when their exact inputs/coverage are unchanged. Changed bytes, dependencies,
branch/checkout, possible external writers, resume, and compaction require the
applicable reread/revalidation. Required integrated checks remain mandatory.

Workers and reviewers preserve the explicit Astra choice. A blocked task calls
for better evidence, diagnosis, context, or decomposition before another attempt.
