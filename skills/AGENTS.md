# AGENTS.md

## Purpose

Shared Superpowers Architecture skills, prompts, references, and helper scripts.

## Ownership

- Owns every `skills/<skill>/SKILL.md`.
- Owns skill-local prompts, references, and scripts.
- Root AGENTS.md owns adaptation policy, banned flows, and product positioning.

## Local Contracts

- Keep skills shared across Codex and Claude Code by using `skills/<skill>/SKILL.md`.
- Shared skill workflow policy must stay runtime-neutral; host-specific tool and install details belong in runtime adapters or `skills/using-superpowers/references/`.
- Do not create or maintain `context.md`.
- `project-setup` may instruct downstream projects to create uppercase root `CONTEXT.md`; this plugin repository must not create its own root `CONTEXT.md`.
- Do not create ADR files.
- Do not include Matt issue, PRD, or triage flows.
- Remove visual companion behavior from active brainstorming behavior.
- Preserve Matt's `codebase-design` vocabulary: module, interface, seam, adapter, depth, leverage, locality, test surface.

## Work Guidance

- Clean-rewrite high-policy skills only when changing workflow policy: `project-setup`, `using-superpowers`, `brainstorming`, `writing-plans`, `finishing-a-development-branch`, and `improve-codebase-architecture`.
- `brainstorming` grilling questions must put the question first and immediately follow it with a concrete recommendation and short reason.
- Patch operational skills narrowly: `subagent-driven-development`, `executing-plans`, `using-git-worktrees`, review, debugging, and TDD skills.
- Keep helper scripts executable and aligned with their owning skill docs.
- Keep every `SKILL.md` frontmatter with `name` and `description`.

## Verification

- Check every edited `SKILL.md` has `name` and `description` frontmatter.
- Search active skill instructions for removed behavior after workflow changes.
- Run relevant script checks when hook or helper scripts change.

## Child DOX Index

- No child AGENTS.md files.
