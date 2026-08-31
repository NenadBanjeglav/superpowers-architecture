# AGENTS.md

## Purpose

Codex plugin packaging metadata for Superpowers Architecture.

## Ownership

- Owns `.codex-plugin/plugin.json`.
- Root AGENTS.md owns product identity, repository URL, release boundaries, and public release constraints.

## Local Contracts

- Keep this scope Codex-specific.
- Do not add Claude install support here; Claude Code packaging belongs under `.claude-plugin/`.
- Public URLs must point to `https://github.com/NenadBanjeglav/superpowers-architecture`.
- Plugin metadata must use **Superpowers Architecture** as the product name and **Architecture-first Superpowers** as positioning.
- Public workflow prompts must describe policy-accepted artifacts and the Autonomous default; do not imply that every phase requires human Approved state.
- Keep the manifest version aligned with `package.json` and the Claude plugin manifest.
- Do not use unrelated third-party privacy or terms URLs. Add policy links only for separately approved, repository-owned plugin policies.
- Codex support and release claims require installed-plugin evidence for startup/resume/compaction behavior, isolated dispatch, exact-checkout phase handoff, and safe fallback.

## Work Guidance

- Keep hook references aligned with files under `hooks/`.
- Keep skill references aligned with shared `skills/<skill>/SKILL.md` layout.

## Verification

- Parse JSON after editing.
- Confirm referenced hook and asset paths exist.

## Child DOX Index

- No child AGENTS.md files.
