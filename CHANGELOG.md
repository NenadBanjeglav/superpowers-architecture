# Changelog

## 0.5.0

- Adds a canonical Draft/Approved artifact lifecycle whose SHA-256 revisions bind spec approval, plan approval, and every downstream phase validation.
- Adds host-neutral isolated dispatch and a separate thirteen-field fresh-session handoff contract with exact checkout, artifact, and plugin affinity.
- Moves lifecycle, SDD workspace/progress, startup rendering, and project-bootstrap decisions into shared Node.js 20+ operations with thin Windows and Unix launchers.
- Threads one Architecture Conformance rubric through plans, TDD, implementation, task review, and final review.
- Replaces duplicated startup payloads with a compact marked contract, reinjects it after Codex and Claude compaction, and keeps missing-Node degradation visible.
- Aligns public examples and advisory document review with lifecycle metadata, Phase Mode, exact revisions, and user-only approval.
- Removes inherited product-specific fixtures, dates, metrics, runtime names, and default merge wording from active guidance.
- Defines GitHub/skills.sh, the Codex plugin package, and the Claude marketplace plugin as the supported distribution channels; npm is unsupported and `package.json` is private tooling metadata.
- Replaces the Claude roadmap with current runtime-support and evidence-bearing release documentation, and removes unrelated GitHub policy URLs from Codex metadata.
- Prepares, but does not publish, the 0.5.0 release contract. Installed Claude evidence and a passing installed Codex compaction canary remain hard release blockers; source inspection does not close them.

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
