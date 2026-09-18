# Changelog

## 0.7.1 — 2026-09-18

- Protects task-brief and review-package outputs from overwriting accepted
  artifacts, bindings, Foundation manifests, receipts and managed files, including
  hardlinks and physical aliases. Safely preserves existing workspace metadata.
- Fixes SDD physical containment so equal-length sibling checkouts cannot satisfy
  same-checkout bindings.
- Checks the source spec's Foundation manifest/base against implementation plans
  in SDD and handoff prepare/receive, including generic all-none bindings.
- Uses one shared binding validator and validated snapshots; preserves public
  commands/results, all 16 skills, lifecycle hashes and supported v1/v2 flows.
- Source checks: broader suite 162 passed/two Windows symlink skips (25.7 seconds);
  final focused suite 56 passed/two symlink skips (24.5 seconds). Runtime delta
  +170/-158/net+12, one internal module, no new schema or external dependency.
- No startup repair: automatic startup/context recovery, complete installed
  workflows, fresh-task/receipt/plugin affinity and native Unix remain unverified.
  Explicitly invoke `using-superpowers`; see runtime support and release conditions.

## 0.7.0 — 2026-09-18

- Makes the workflow stage-aware, evidence-gated, reversible, and subtractive.
  Current consumers, retained data and actual reset authority determine durability;
  prototype/pre-beta labels alone do not authorize data loss or remove promises.
- **Breaking authoring change:** Ready/Approved specs and plans are immutable,
  including unused artifacts. Supported writers reject Draft reset, stale refresh,
  and changed accepted migration targets. Use distinct reviewed successors with
  exact current selection; historical readers and Foundation receipts remain.
- Adds scoped retirement of requirements, compatibility contracts, tests and
  fixtures, plus explicit replacement behavior. Historical decisions do not make
  old runtime behavior permanently binding; omitted obligations remain active.
- Requires present-consumer justification and five evidence items for new or
  prolonged compatibility. Disposable, reset-authorized data favors direct
  replacement/reseed; future-only mechanisms go to the roadmap.
- Adds reversible alternatives/non-goals, five evolution sections in specs,
  Add/Replace/Remove/Defer in every task, contract-based test categories, and
  Simplify/Replace/Defer/Revise checkpoints in both execution paths.
- Adds stage/subtraction/budget review verdicts, measured complexity budgets,
  and complete ownership/expiration/cleanup for temporary mechanisms.
- Preserves all 16 skills, TDD, architecture vocabulary, exact lifecycle and
  Foundation guarantees, Phase Mode, and genuine external-action authority.
- Source verification: focused 88 passed/full 107 passed, one Windows EPERM
  symlink skip each; 17.4/23.8 seconds. Production +16/-7 lines, net +9;
  nine runtime modules and no new schemas, imports or compatibility paths.
- Does not repair the prior Windows startup-delivery failure. Explicit
  `using-superpowers` entry remains necessary; automatic recovery and complete
  installed-host workflows remain unverified. See runtime support and release
  documentation for the evidence boundary and publication condition.

## 0.6.0 — 2026-09-13

- Publishes with an explicit maintainer exception for unresolved installed-host
  verification. Automatic startup injection failed on the tested Windows Codex
  client after hook trust and restart. Documents explicit `using-superpowers`
  invocation; resume/clear/compaction and complete installed flows remain
  unverified. Failed and unavailable checks are not reported as passed.

- **Breaking distribution change:** ships only the complete Codex plugin, optimized
  for GPT-6 Astra. Removes retained Claude adapters, standalone skills.sh install
  routes, and skills-install handoffs; unsupported inputs fail explicitly.
- Adds a one-entry repository marketplace for the root Codex plugin and documents
  full-package upgrades, new-session pickup, and hook trust.
- Shortens all 16 skill descriptions and removes repeated coaching/diagrams.
  Detailed templates and Foundation/SDD procedures have direct conditional owners.
- Preserves the architecture phases, exact lifecycle/receipt contracts, TDD, and
  review checks. Removes punitive work deletion and silent model escalation.
- Reuses current evidence across messages, reviews complete task ranges, and
  reuses one exact unchanged final review during finishing.
- Aligns README, plugin/package copy, installation, and repository metadata
  preparation with Codex-only packaging and the Astra model choice.
- Keeps mandatory installed-host release evidence distinct from local source
  checks and descriptive prompt-size measurements.


- **Breaking workflow change:** defaults new and existing projects to Autonomous
  under Workflow Policy Version 2; Review-gated now requires a new explicit
  opt-in.
- Adds truthful Draft/Ready/Approved lifecycle states. Autonomous consumes
  Ready or Approved; Review-gated and omitted-policy v1 callers require
  Approved and preserve real human provenance.
- Adds narrow transactional migration of active legacy Superpowers gates,
  including affected current artifacts and Foundation state, without a
  migration-approval prompt or global dormant-project scan.
- Adds policy-bound Foundation v2 receipts and lifecycle snapshots, preserves
  v1 receipt evidence, and prevents Foundation byte/timestamp churn for an
  empty change set.
- Adds the v2 phase envelope: policy, bounded goal, constraint source, receipt,
  and Brainstorming bindings surround an exact fifteen-field record using
  `artifactRevision`. V1 receivers reject Ready.
- Adds exact policy/spec/plan/Foundation bindings to new SDD task briefs and
  review packages and rejects stale dependencies.
- Makes advisory document review policy-aware: `Ready for progression`,
  `Ready for user review`, or `Issues found`; reviewers never approve.
- Retains genuine installed-Codex startup-context evidence as the requirement
  for verified automatic behavior; this release uses the disclosed exception above.
- **Breaking:** removes `project-setup` without an alias and makes `wayfinder` the sole documentation-only skill for project inception and project-wide reorientation.
- Adds the deterministic Agentic Foundation lifecycle, Root Router, compact dashboard, Project Blueprint, immutable Decision Ledger, and Blueprint-traceable roadmap outcomes.
- Adds stable DDI/FCA identities and an escape-safe JSON Foundation Candidate Declaration with deterministic owner, ledger, DOX-index, router, manifest, and candidate-equality obligations.
- Adds one combined Design Change Set review and reuses the operation-owned candidate-root `APPLIED.json` as the sole Foundation Application Receipt.
- Carries exact Design Spec, base Foundation, receipt, and resulting Foundation identities into Planning and implementation without requiring base/result equality for non-empty candidates.
- Keeps the phase-handoff record fixed at fifteen fields and carries policy and external bindings in the v2 envelope after policy-aware readiness.

Historical entries below document source versions; they do not establish that
corresponding GitHub tags or releases were published.

## 0.5.0

- Adds a canonical Draft/Approved artifact lifecycle whose SHA-256 revisions bind spec approval, plan approval, and every downstream phase validation.
- Adds host-neutral isolated dispatch and a separate fifteen-field fresh-session handoff contract with exact checkout, artifact, Foundation, and plugin affinity.
- Moves lifecycle, SDD workspace/progress, startup rendering, and project-bootstrap decisions into shared Node.js 20+ operations with thin Windows and Unix launchers.
- Threads one Architecture Conformance rubric through plans, TDD, implementation, task review, and final review.
- Replaces duplicated startup payloads with a compact marked contract, reinjects it after Codex and Claude compaction, and keeps missing-Node degradation visible.
- Aligns public examples and advisory document review with lifecycle metadata, Phase Mode, exact revisions, and user-only approval.
- Removes inherited product-specific fixtures, dates, metrics, runtime names, and default merge wording from active guidance.
- Defines GitHub/skills.sh for Codex and the Codex plugin package as the supported distribution channels; npm is unsupported and `package.json` is private tooling metadata.
- Aligns runtime-support and evidence-bearing release documentation with the current Codex-only release boundary and removes unrelated GitHub policy URLs from Codex metadata.
- Prepares, but does not publish, the 0.5.0 release contract. Genuine installed-Codex startup evidence remains mandatory; source inspection does not close it.

## 0.4.0

- Adds selected Phase Mode during first `brainstorming`: automated fresh-session mode or same-session mode.
- Adds Codex App fresh-thread and Claude Code `claude --bg` handoff guidance for approved phase transitions.
- Updates brainstorming and planning gates so later phases consume the selected mode without bypassing written review.
- Updates public workflow documentation, metadata versions, and runtime handoff prerequisites.

## 0.3.0

- Adds a documentation-first `project-setup` skill for downstream project inception.
- Routes new-project setup requests to `project-setup` before `brainstorming`.
- Teaches `brainstorming` to read existing root `CONTEXT.md` and require reviewed updates for durable project-context changes.
- Documents the optional project setup phase and updates skill invocation lists.

## 0.2.0

- Adds Claude Code plugin metadata and marketplace catalog.
- Adds a Claude SessionStart hook adapter that injects Superpowers Architecture startup context through Claude hook JSON.
- Adds Claude Code tool mapping guidance while keeping shared skill policy runtime-neutral.
- Documents skills.sh, Codex plugin, and Claude Code plugin install paths separately.

## 0.1.0

- Initial Codex-first public release.
- Adds architecture-first brainstorming with Design Understanding.
- Keeps local specs, exact implementation plans, TDD, reviews, worktree workflow, task commits, and final verification summaries.
- Manual Codex smoke-tested brainstorming, planning, implementation entry, and finishing phase boundaries.
- Removes visual companion behavior, `context.md`, ADR flows, Matt issue/PRD/triage flows, automatic local-doc commits, within-session implementation carryover, and the default merge/PR/discard finish menu.
