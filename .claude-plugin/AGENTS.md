# AGENTS.md

## Purpose

Claude Code plugin and marketplace metadata for Superpowers Architecture.

## Ownership

- Owns `.claude-plugin/plugin.json`.
- Owns `.claude-plugin/marketplace.json`.
- Root AGENTS.md owns product identity, repository URL, release boundaries, and public attribution.
- `hooks/AGENTS.md` owns the Claude hook manifest referenced by this metadata.

## Local Contracts

- Claude packaging is a shipped runtime adapter over shared `skills/<skill>/SKILL.md`.
- Use plugin name `superpowers-architecture` so skills invoke as `/superpowers-architecture:<skill>`.
- Do not duplicate skills, add Claude agents, MCP servers, LSP servers, monitors, or output styles unless the user explicitly expands the release scope.
- Public URLs must point to `https://github.com/NenadBanjeglav/superpowers-architecture`.
- Marketplace metadata must not imply official affiliation with Anthropic, Claude, `obra/superpowers`, or `mattpocock/skills`.

## Work Guidance

- Keep `plugin.json` `version` aligned with `package.json` and `.codex-plugin/plugin.json` when present.
- Keep `skills` pointing at `./skills/` and `hooks` pointing at `./hooks/hooks.json`.
- Keep `marketplace.json` strict by default; do not set `strict: false`.

## Verification

- Run `claude plugin validate .` after metadata edits.
- Parse JSON after edits.
- Confirm referenced paths exist.

## Child DOX Index

- No child AGENTS.md files.
