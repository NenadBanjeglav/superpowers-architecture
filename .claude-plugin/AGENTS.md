# AGENTS.md

## Purpose

Deferred Claude Code adapter source for Superpowers Architecture.

## Ownership

- Owns `.claude-plugin/plugin.json`.
- Root AGENTS.md owns product identity, repository URL, release boundaries, and public attribution.
- `hooks/AGENTS.md` owns the standard Claude hook manifest auto-discovered from `hooks/hooks.json`.

## Local Contracts

- This subtree is retained thin adapter source over shared `skills/<skill>/SKILL.md`; it is unsupported and unadvertised in the current Codex-only release.
- Use plugin name `superpowers-architecture` so skills invoke as `/superpowers-architecture:<skill>`.
- Do not duplicate skills, add Claude agents, MCP servers, LSP servers, monitors, or output styles unless the user explicitly expands the release scope.
- Public URLs must point to `https://github.com/NenadBanjeglav/superpowers-architecture`.
- Do not add marketplace ownership, installation guidance, or current release claims without a separately approved support release.

## Work Guidance

- Keep `plugin.json` `version` aligned with `package.json` and `.codex-plugin/plugin.json` when present.
- Keep `skills` pointing at `./skills/`.
- Keep Claude hooks at the standard auto-discovered `hooks/hooks.json` location; do not also list that file in `plugin.json`, because current Claude Code rejects the duplicate registration.

## Verification

- Parse JSON after edits.
- Confirm referenced paths and the auto-discovered `hooks/hooks.json` file exist.

## Child DOX Index

- No child AGENTS.md files.
