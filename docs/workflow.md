# Workflow

Superpowers Architecture uses phase-separated fresh sessions by default.

## 0. Project Setup

Use `project-setup` when starting a new project from scratch or establishing project-wide operating instructions and context.

The agent inspects the repo, asks one question at a time, writes root `AGENTS.md`, root `CONTEXT.md`, justified child `AGENTS.md` files, and a high-level roadmap, asks for review, and stops. It does not write specs, plans, app code, CI, or deployment configuration.

After approval, start a fresh `brainstorming` session for one roadmap task.

## 1. Brainstorming

Use `brainstorming` for feature work, behavior changes, architecture changes, new components, or unclear requirements.

The agent inspects the repo, asks one question at a time, builds Design Understanding, writes a local spec under `docs/superpowers/specs/`, asks for review, and stops.

## 2. Planning

Start a fresh session with the approved spec path.

The agent reads the spec and repo from disk, writes an exact implementation plan under `docs/superpowers/plans/`, asks for review, and stops.

## 3. Implementation

Start a fresh session with the approved plan path.

Use `subagent-driven-development` for mostly independent tasks or `executing-plans` for linear execution. Implementation commits code per task and must not commit `docs/superpowers/**` unless explicitly requested.

## 4. Finish

Use `finishing-a-development-branch` after implementation tasks are complete.

The agent runs final verification, checks git status, confirms local Superpowers docs are not staged, summarizes commits, changed files, tests, satisfied requirements, and residual risks, then stops.

## Invocation Names

With skills.sh or Codex skill installs, use the skill names directly.

With the Claude Code plugin, use the plugin namespace:

```text
/superpowers-architecture:project-setup
/superpowers-architecture:brainstorming
/superpowers-architecture:writing-plans
/superpowers-architecture:subagent-driven-development
/superpowers-architecture:finishing-a-development-branch
```

## Worktrees

Worktree isolation remains available. The agent may use it when requested or already active. The worktree skill must not edit or commit `.gitignore` automatically.
