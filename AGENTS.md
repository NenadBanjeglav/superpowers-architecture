# AGENTS.md

Instructions for agents working in this repository.

## Project

This repo is `superpowers-architecture`: a public, Codex-first plugin that adapts Superpowers into an architecture-first workflow.

Canonical remote:

```text
https://github.com/NenadBanjeglav/superpowers-architecture
```

Use **Superpowers Architecture** as the product name and **Architecture-first Superpowers** as the positioning phrase.

## Current State

`superpowers-architecture-plan.md` is temporary implementation scaffolding. It may be used while building the repo, but the final public-ready root should remove it unless the user explicitly asks to keep it.

If `docs/superpowers/specs/2026-06-19-superpowers-architecture-release-plan-design.md` exists, treat it as the approved design for revising the release plan.

## Hard Constraints

- V1 remains Codex-first.
- Post-V1 Claude Plugin Availability may add `.claude-plugin/`, `hooks/hooks.json`, and `hooks/session-start-claude` only as runtime adapters over the shared skill core.
- Keep the layout future-compatible with Claude by using shared `skills/<skill>/SKILL.md` files and resources inside the plugin root.
- Do not create or maintain plugin-local lowercase `context.md` or root `CONTEXT.md`; `project-setup` may create uppercase root `CONTEXT.md` only in downstream projects.
- Do not create ADR files.
- Do not include Matt issue, PRD, or triage flows.
- Remove visual companion behavior from shipped brainstorming behavior.
- Do not commit generated downstream `docs/superpowers/**` unless the user explicitly asks.
- Do not force-push or rewrite remote history unless the user explicitly asks and confirms.
- Attribute `obra/superpowers` and `mattpocock/skills` clearly without implying official affiliation.

## Workflow Goals

The finished plugin should enforce written review gates and establish a phase mode during the first `brainstorming` session:

1. For new downstream projects, `project-setup` writes root `AGENTS.md`, root `CONTEXT.md`, justified child `AGENTS.md` files, and a high-level roadmap, then stops.
2. The first `brainstorming` session asks whether approved next steps should start in automated fresh sessions or continue in the same session, records the selected mode, writes a local architecture-aware spec, and stops at the written-spec review gate.
3. In automated fresh-session mode, approval starts `writing-plans` in a fresh Codex or Claude session from the approved spec path; in same-session mode, approval continues to `writing-plans` in the current session after re-reading the approved spec and codebase from disk.
4. `writing-plans` writes a local implementation plan from the approved spec and stops at the written-plan review gate.
5. In automated fresh-session mode, plan approval starts `subagent-driven-development` or `executing-plans` in a fresh Codex or Claude session from the approved plan path; in same-session mode, plan approval continues to implementation in the current session after re-reading the approved plan, referenced spec, and codebase from disk.
6. `finishing-a-development-branch` verifies and summarizes without pushing, merging, opening PRs, or discarding work unless explicitly asked.

Generated downstream docs are local developer working state:

```text
docs/superpowers/specs/
docs/superpowers/plans/
docs/superpowers/architecture-reviews/
```

## Skill Adaptation Rules

Use the hybrid adaptation model:

- Copy upstream Superpowers skills first to preserve operational machinery.
- Clean-rewrite high-policy skills:
  - `project-setup`
  - `using-superpowers`
  - `brainstorming`
  - `writing-plans`
  - `finishing-a-development-branch`
  - `improve-codebase-architecture`
- Patch operational skills narrowly:
  - `subagent-driven-development`
  - `executing-plans`
  - `using-git-worktrees`
  - review, debugging, and TDD skills only where they reference removed flows

Keep Matt's `codebase-design` vocabulary intact. Use these terms consistently:

- module
- interface
- seam
- adapter
- depth
- leverage
- locality
- test surface

## Public Repo Expectations

The final release repo should include:

- `.claude-plugin/`
- `.codex-plugin/plugin.json`
- `hooks/`
- `skills/`
- `assets/`
- `docs/`
- `examples/`
- `.github/`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `NOTICE.md`
- `package.json`

All public URLs must point to:

```text
https://github.com/NenadBanjeglav/superpowers-architecture
```

## Validation

Do not add committed validation scripts or CI for V1 unless the user changes this decision.

Use manual release checks instead:

- JSON files parse.
- Every `SKILL.md` has frontmatter with `name` and `description`.
- Removed legacy behavior is absent from active skill instructions.
- Mentions of removed behavior in docs are descriptive, not active instructions.
- Local docs guards for `docs/superpowers/**` are present.
- `superpowers-architecture-plan.md` is removed before final public readiness.
- Git status is clean before final push.

## Git Hygiene

Grouped commits are preferred over one commit per tiny step. Preserve the existing remote history.

Before staging or committing, inspect status carefully. Do not stage `docs/superpowers/**` unless explicitly asked.

# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:

- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

When the user requests a durable behavior change, record it here or in the relevant child AGENTS.md

- During first `brainstorming`, ask whether approved next steps should use automated fresh sessions or same-session continuation; follow that selected phase mode for later approval gates.

## Child DOX Index

- `.claude-plugin/AGENTS.md` covers Claude Code plugin manifest and marketplace metadata.
- `.codex-plugin/AGENTS.md` covers Codex plugin manifest metadata.
- `.github/AGENTS.md` covers GitHub issue and pull request templates.
- `assets/AGENTS.md` covers visual assets used by plugin metadata and docs.
- `docs/AGENTS.md` covers public documentation and the local `docs/superpowers/` working-doc area.
- `examples/AGENTS.md` covers committed example specs.
- `hooks/AGENTS.md` covers plugin hook manifests and hook runner scripts.
- `skills/AGENTS.md` covers shared skill instructions, prompts, references, and helper scripts.
