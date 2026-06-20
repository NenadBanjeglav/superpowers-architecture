# Workflow

Superpowers Architecture uses written review gates and a selected Phase Mode.

## 0. Project Setup

Use `project-setup` when starting a new project from scratch or establishing project-wide operating instructions and context.

The agent inspects the repo, asks one question at a time, writes root `AGENTS.md`, root `CONTEXT.md`, justified child `AGENTS.md` files, and a high-level roadmap, asks for review, and stops. It does not write specs, plans, app code, CI, or deployment configuration.

After approval, start a first `brainstorming` session for one roadmap task. That first `brainstorming` session establishes the Phase Mode when no durable preference already exists.

## 1. Brainstorming

Use `brainstorming` for feature work, behavior changes, architecture changes, new components, or unclear requirements.

Before writing the spec, the first `brainstorming` session asks whether approvals should use automated fresh-session mode or same-session mode when no durable preference already exists.

The agent inspects the repo, asks one question at a time, builds Design Understanding, records the selected Phase Mode in the spec, writes a local spec under `docs/superpowers/specs/`, asks for review, and stops.

## 2. Planning

Planning starts only after written spec approval.

In automated fresh-session mode, approval starts a fresh Codex or Claude planning session when a runtime adapter is available. If no adapter is available, the agent prints the exact planning prompt or command.

In same-session mode, approval continues to `writing-plans` in the current conversation after the agent re-reads the approved spec and codebase from disk.

The planning phase writes an exact implementation plan under `docs/superpowers/plans/`, asks for review, and stops.

## 3. Implementation

Implementation starts only after written plan approval.

In automated fresh-session mode, approval starts a fresh Codex or Claude implementation session when a runtime adapter is available. If no adapter is available, the agent prints the exact implementation prompt or command.

In same-session mode, approval continues to `subagent-driven-development` or `executing-plans` in the current conversation after the agent re-reads the approved plan, referenced spec, and codebase from disk.

Implementation commits code per task and must not commit `docs/superpowers/**` unless explicitly requested.

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

## Runtime Handoffs

Codex App automated fresh-session handoff uses a fresh project thread when the Codex thread tool is available.

Claude Code automated fresh-session handoff uses `claude --bg --name "<name>" "<prompt>"` when Claude Code background agents are available.

Both adapters fall back to printing the exact next-phase prompt or command when automatic launch is unavailable, disabled, or unsafe.

## Worktrees

Worktree isolation remains available. The agent may use it when requested or already active. The worktree skill must not edit or commit `.gitignore` automatically.
