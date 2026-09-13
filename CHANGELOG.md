# Changelog

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
