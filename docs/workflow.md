# Workflow

Superpowers Architecture uses written review gates and a selected Phase Mode.

## 0. Project Setup

Use `project-setup` when starting a new project from scratch or establishing project-wide operating instructions and context.

The agent inspects the repo, asks one question at a time, writes root `AGENTS.md`, root `CONTEXT.md`, justified child `AGENTS.md` files, and a high-level roadmap, asks for review, and stops. It does not write specs, plans, app code, CI, or deployment configuration.

After approval, start a first `brainstorming` session for one roadmap task. That first `brainstorming` session establishes the Phase Mode when no durable preference already exists.

## 1. Brainstorming

Use `brainstorming` for feature work, behavior changes, architecture changes, new components, or unclear requirements.

Before writing the spec, the first `brainstorming` session asks whether approvals should use automated fresh-session mode or same-session mode when no durable preference already exists.

The agent inspects the repo, asks one question at a time, builds Design Understanding, records the selected Phase Mode in the spec, writes a local Draft spec under `docs/superpowers/specs/`, refreshes its canonical SHA-256 revision, runs an advisory document review, asks the user to review that exact revision, and stops. The reviewer may report `Ready for user review` or `Issues found`; it cannot approve.

## 2. Planning

Planning starts only after the user approves the exact refreshed spec revision
and the lifecycle operation records `Status: Approved` for that digest. The
planning phase independently validates the Approved artifact from disk.

In automated fresh-session mode, approval starts a fresh Codex or Claude planning session only after the source proves repository, checkout, branch/worktree, artifact, ignored-file, and plugin affinity. The new session acknowledges all thirteen handoff fields and repeats those checks before planning. If no safe adapter is available, the agent prints the exact planning prompt or command.

In same-session mode, approval continues to `writing-plans` in the current conversation after the agent re-reads the approved spec and codebase from disk.

The planning phase writes a Draft implementation plan bound to the source spec path and exact Approved revision under `docs/superpowers/plans/`, refreshes its own canonical revision, runs advisory review, asks the user to review that exact revision, and stops.

## 3. Implementation

Implementation starts only after the user approves the exact refreshed plan revision and the next phase independently validates both the Approved plan and its referenced Approved spec.

In automated fresh-session mode, approval uses the same thirteen-field acknowledgement and same-checkout gate as planning. A fork, resumed conversation, nearby worktree, copied ignored artifact, or different local plugin root is not an acceptable substitute.

In same-session mode, approval continues to `subagent-driven-development` or `executing-plans` in the current conversation after the agent re-reads the approved plan, referenced spec, and codebase from disk.

Implementation commits code per task and must not commit `docs/superpowers/**` unless explicitly requested. Bounded implementer and reviewer work uses the host-neutral isolated-dispatch contract. Architecture Conformance ties tests, implementation, task review, and final review to the exact Approved Design Understanding.

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

Codex App automated fresh-session handoff uses only a genuinely new project task when the installed app can bind it to the exact checkout. It never uses a conversation fork.

Claude Code automated fresh-session handoff uses an installed, advertised named-background-session interface. Local-plugin handoff also binds the verified absolute `--plugin-dir` path.

Both adapters fall back to printing the exact next-phase prompt or command when automatic launch is unavailable, disabled, or unsafe.

See [Runtime Support](runtime-support.md) for installed-host requirements. A
runtime or release claim requires executed installed-host evidence; source
inspection alone is insufficient.

## Worktrees

Worktree isolation remains available. The agent may use it when requested or already active. The worktree skill must not edit or commit `.gitignore` automatically.
