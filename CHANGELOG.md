# Changelog

## Unreleased

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
- Removes visual companion behavior, `context.md`, ADR flows, Matt issue/PRD/triage flows, automatic local-doc commits, same-session phase transitions, and the default merge/PR/discard finish menu.
