# Superpowers Architecture

Architecture-first Superpowers for Codex.

Superpowers Architecture is a Codex skill pack for developers who want an agent to agree on design before it writes plans or code. It keeps the best parts of Superpowers - specs, plans, TDD, reviews, worktree-aware implementation, task commits, and final verification - and strengthens the first phase with module, interface, seam, adapter, data-flow, and test-surface thinking.

## Why

Coding agents often jump from a rough ticket to implementation. That is fast, but it can create shallow modules, unclear interfaces, brittle tests, and rework.

This plugin makes the agent stop first and build **Design Understanding**:

- what the feature actually means
- which modules are involved
- where interfaces and seams belong
- which adapters sit at those seams
- how data flows through the system
- what should be tested through which surface
- which architecture constraints must survive implementation

## Quickstart

V1 targets Codex.

1. Clone this repo:

   ```powershell
   git clone https://github.com/NenadBanjeglav/superpowers-architecture.git
   ```

2. Install it through your local Codex plugin workflow.
3. Start a fresh Codex session.
4. Say: `I want to design a feature before implementation.`

## Workflow

1. `brainstorming` writes and reviews a local architecture-aware spec.
2. Start a fresh session.
3. `writing-plans` writes and reviews an implementation plan from the approved spec.
4. Start a fresh session.
5. `subagent-driven-development` or `executing-plans` implements the plan with TDD, reviews, and code commits.
6. `finishing-a-development-branch` verifies and summarizes the work.

## Local Working Docs

Generated downstream docs are local per-developer working state:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/superpowers/architecture-reviews/`

Do not commit them unless you explicitly choose to.

## What Changed From Superpowers

- Architecture-first brainstorming.
- Design Understanding in specs.
- Phase-separated fresh sessions.
- Local specs, plans, and architecture reviews.
- Worktree workflow remains available.
- Code commits remain allowed during implementation.
- Visual companion behavior is removed.
- `context.md` and ADR flows are removed.
- Matt issue, PRD, and triage flows are not included.
- The default merge/PR/discard finish menu is replaced with verification summary.

## Documentation

- [Installation](docs/installation.md)
- [Workflow](docs/workflow.md)
- [Design Understanding](docs/design-understanding.md)
- [Architecture Review](docs/architecture-review.md)
- [Claude Roadmap](docs/claude-roadmap.md)

## Examples

- [Simple feature spec](examples/simple-feature-spec.md)
- [Architecture-heavy spec](examples/architecture-heavy-spec.md)

## Attribution

This project adapts ideas, workflow structure, and selected MIT-licensed material from:

- [obra/superpowers](https://github.com/obra/superpowers)
- [mattpocock/skills](https://github.com/mattpocock/skills)

It is independent and not officially affiliated with either project.
