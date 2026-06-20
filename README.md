# Superpowers Architecture

[![skills.sh](https://skills.sh/b/NenadBanjeglav/superpowers-architecture)](https://skills.sh/NenadBanjeglav/superpowers-architecture)

Architecture-first Superpowers for Codex and Claude Code.

Superpowers Architecture is a shared skill pack and runtime plugin for developers who want an agent to agree on design before it writes plans or code. It keeps the best parts of Superpowers - specs, plans, TDD, reviews, worktree-aware implementation, task commits, and final verification - and strengthens the first phase with module, interface, seam, adapter, data-flow, and test-surface thinking.

For a brand-new project, start with `project-setup`. It creates root `AGENTS.md`, root `CONTEXT.md`, justified child `AGENTS.md` files, and a high-level roadmap before any feature-level specs or implementation plans exist.

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

### Skills CLI

Install the shared skills package:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture
```

Then pick the skills you want and the agent you want to install them into. For a non-interactive Codex install of all skills:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -a codex -g -y
```

On Windows PowerShell, use `npx.cmd` if the `npx.ps1` shim is blocked by execution policy:

```powershell
npx.cmd skills@latest add NenadBanjeglav/superpowers-architecture
```

Start a fresh Codex session and say: `I want to design a feature before implementation.`

### Codex Plugin Package

The `npx skills` flow installs the shared skills. The Codex plugin manifest and session-start hook are also included in this repo for Codex plugin packaging, but those require Codex's plugin install or marketplace flow.

### Claude Code Plugin

In Claude Code, add the marketplace and install the plugin:

```text
/plugin marketplace add NenadBanjeglav/superpowers-architecture
/plugin install superpowers-architecture@superpowers-architecture
```

Then invoke skills with the plugin namespace:

```text
/superpowers-architecture:project-setup
/superpowers-architecture:brainstorming
/superpowers-architecture:writing-plans
/superpowers-architecture:subagent-driven-development
/superpowers-architecture:finishing-a-development-branch
```

For local plugin development from a clone of this repository:

```bash
claude --plugin-dir .
```

## Workflow

1. Optional for new projects: `project-setup` writes and reviews root `AGENTS.md`, root `CONTEXT.md`, justified child `AGENTS.md` files, and a high-level roadmap.
2. First `brainstorming` for a roadmap task or feature asks whether later approvals should use automated fresh-session mode or same-session mode when no durable preference already exists.
3. `brainstorming` writes and reviews a local architecture-aware spec under `docs/superpowers/specs/`.
4. After written spec approval, automated fresh-session mode starts planning in a fresh Codex or Claude session; same-session mode continues to planning in the current conversation after re-reading the spec and codebase from disk.
5. `writing-plans` writes and reviews an exact implementation plan under `docs/superpowers/plans/`.
6. After written plan approval, automated fresh-session mode starts implementation in a fresh Codex or Claude session; same-session mode continues to implementation in the current conversation after re-reading the plan, referenced spec, and codebase from disk.
7. `subagent-driven-development` or `executing-plans` implements the plan with TDD, reviews, and code commits.
8. `finishing-a-development-branch` verifies and summarizes the work.

## Local Working Docs

Generated downstream docs are local per-developer working state:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/superpowers/architecture-reviews/`

Do not commit them unless you explicitly choose to.

## What Changed From Superpowers

- Documentation-first project setup for new downstream projects.
- Architecture-first brainstorming.
- Design Understanding in specs.
- Phase-mode handoffs: automated fresh sessions or same-session continuation after explicit approval.
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
