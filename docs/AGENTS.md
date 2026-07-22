# AGENTS.md

## Purpose

Public documentation and local Superpowers working docs.

## Ownership

- Owns committed docs under `docs/`.
- `docs/superpowers/AGENTS.md` owns ignored local generated specs, plans, and architecture reviews.
- Root AGENTS.md owns product identity, release boundaries, and release validation.

## Local Contracts

- Public docs must describe Codex and Claude Code support as shipped runtime adapters over the shared skill core.
- Public docs must clearly distinguish the three supported channels: GitHub/skills.sh, the Codex plugin package, and the Claude marketplace plugin. npm is unsupported and `package.json` is private tooling metadata.
- Runtime and release documentation must require installed-host evidence; source inspection cannot substitute for Codex or Claude execution, and missing mandatory evidence is a hard release blocker.
- Local tag preparation and external publication are separate gates. Public docs must not imply that a local tag was pushed or a GitHub release was created.
- Mentions of removed upstream behavior must be descriptive, not active instructions.
- Public URLs must point to `https://github.com/NenadBanjeglav/superpowers-architecture`.

## Work Guidance

- Keep docs concise and operational.
- Keep installation docs aligned with `README.md`, `.codex-plugin/plugin.json`, `package.json`, and hook files.
- Do not create `context.md` or ADR files.

## Verification

- Review Markdown links and headings after documentation edits.
- For runtime-related docs, confirm Codex and Claude Code guidance stays aligned with shared skill policy.
- Confirm `runtime-support.md` and `release.md` agree on distribution channels, evidence blockers, and publication authority.

## Child DOX Index

- `docs/superpowers/AGENTS.md` covers ignored local generated working docs.
