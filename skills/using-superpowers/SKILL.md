---
name: using-superpowers
description: Use when starting a conversation to route make/build/create/implement app, site, tool, component, UI, API, workflow, or behavior requests to brainstorming before frontend, design, framework, or implementation skills
metadata:
  priority: 100
---

# Using Superpowers Architecture

Superpowers Architecture is an architecture-first software development workflow for agentic coding runtimes.

Before selecting any other skill, apply this priority rule: for any request to make, build, create, implement, add, change, or design a feature, app, site, tool, component, workflow, UI, API, or behavior, use `brainstorming` before frontend, app-builder, design, framework, implementation, or coding skills unless the user explicitly provides an approved implementation plan path or explicitly asks to bypass design/spec work.

Host-specific tool names live in `references/`. Use `codex-tools.md` on Codex and `claude-code-tools.md` on Claude Code. Keep shared workflow policy runtime-neutral.

If a Superpowers Architecture skill applies to the task, use it before acting. For feature work, behavior changes, architecture changes, or unclear requirements, the default phase flow is:

1. `brainstorming` writes and reviews a local architecture-aware spec.
2. A fresh session uses `writing-plans` to create an exact implementation plan from that spec.
3. A fresh session uses `subagent-driven-development` or `executing-plans` to implement from that plan.
4. `finishing-a-development-branch` verifies and summarizes the completed branch.

Generated downstream files under `docs/superpowers/**` are local developer working state. Do not stage or commit them unless the user explicitly asks.

## Required Skill Discipline

- If the user asks for feature work, behavior changes, architecture changes, generic app/site/tool/component creation, or unclear requirements, use `brainstorming` before implementation or frontend/app-builder skills.
- If the user asks to debug a bug, failing test, broken build, regression, or unexpected behavior, use `systematic-debugging` before proposing a fix.
- If the user provides an approved spec path and asks for a plan, use `writing-plans`.
- If the user provides an approved plan path and asks for implementation, use `subagent-driven-development` for mostly independent tasks or `executing-plans` for linear execution.
- Before claiming completion, use `verification-before-completion` unless another selected skill has a stricter verification closeout.

## Skill Priority

1. `brainstorming` for new feature work, behavior changes, architecture changes, generic make/build/create/implement requests, or unclear requirements. This outranks frontend, app-builder, design, framework, implementation, and coding skills unless an approved implementation plan path is provided or the user explicitly asks to bypass design/spec work.
2. `systematic-debugging` for bugs, failing tests, broken builds, regressions, or unexpected behavior.
3. `writing-plans` only when an approved local spec path is available.
4. `subagent-driven-development` or `executing-plans` only when an approved local plan path is available.
5. `finishing-a-development-branch` when implementation tasks are done and the user wants release-readiness verification.
6. `verification-before-completion` before any completion claim not already covered by the finishing skill.

## Phase Boundaries

Do not automatically continue from spec to plan or from plan to implementation in the same session.

At the end of brainstorming, stop and provide the exact next-session prompt for planning.
At the end of planning, stop and provide the exact next-session prompt for implementation.
Implementation starts only from an explicit plan path.

## Local Working State

These paths are local developer working state:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/superpowers/architecture-reviews/`

Do not stage or commit those paths unless the user explicitly requests it. Code commits remain allowed during implementation tasks.

## Removed Behaviors

The shipped skills must not actively instruct agents to:

- offer or run a visual companion
- create or maintain `context.md`
- create or maintain ADRs
- run Matt issue, PRD, or triage flows
- commit generated specs or plans automatically
- continue from spec to plan or plan to implementation in the same session
- present the default merge, PR, or discard finish menu

Mentions of removed behavior are allowed in public docs only when they clearly describe what this plugin removed from upstream workflows.
