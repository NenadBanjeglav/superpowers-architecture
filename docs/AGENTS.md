# AGENTS.md

## Purpose

Public documentation and local Superpowers working docs.

## Ownership

- Owns committed docs under `docs/`.
- `docs/superpowers/AGENTS.md` owns ignored local generated specs, plans, and architecture reviews.
- Root AGENTS.md owns product identity, release boundaries, and release validation.

## Local Contracts

- Public docs must describe Codex and Claude Code support as shipped runtime adapters over the shared skill core.
- Public docs must clearly distinguish skills.sh, Codex plugin, and Claude Code plugin install paths.
- Mentions of removed upstream behavior must be descriptive, not active instructions.
- Public URLs must point to `https://github.com/NenadBanjeglav/superpowers-architecture`.

## Work Guidance

- Keep docs concise and operational.
- Keep installation docs aligned with `README.md`, `.codex-plugin/plugin.json`, `package.json`, and hook files.
- Do not create `context.md` or ADR files.

## Verification

- Review Markdown links and headings after documentation edits.
- For runtime-related docs, confirm Codex and Claude Code guidance stays aligned with shared skill policy.

## Child DOX Index

- `docs/superpowers/AGENTS.md` covers ignored local generated working docs.
