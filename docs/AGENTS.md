# AGENTS.md

## Purpose

Public documentation and local Superpowers working docs.

## Ownership

- Owns committed docs under `docs/`.
- `docs/superpowers/AGENTS.md` owns ignored local generated specs, plans, and architecture reviews.
- Root AGENTS.md owns product identity, release boundaries, and release validation.

## Local Contracts

- Public docs must state the exact current boundary: `Codex supported; Claude deferred/unadvertised`.
- Public docs must distinguish exactly two supported channels: GitHub/skills.sh for Codex and the Codex plugin package. npm is unsupported and `package.json` is private tooling metadata.
- Public workflow docs must describe Workflow Policy Version 2: Autonomous is
  the default for new and existing projects, active legacy gates migrate
  narrowly on next entry, Review-gated requires a new explicit opt-in, and
  Ready never claims human approval.
- Runtime and release documentation must require installed Codex evidence; source inspection cannot substitute, and missing mandatory Codex evidence is a hard release blocker.
- Local tag preparation and external publication are separate gates. Public docs must not imply that a local tag was pushed or a GitHub release was created.
- Mentions of removed upstream behavior must be descriptive, not active instructions.
- Public URLs must point to `https://github.com/NenadBanjeglav/superpowers-architecture`.

## Work Guidance

- Keep docs concise and operational.
- Keep installation docs aligned with `README.md`, `.codex-plugin/plugin.json`, `package.json`, and hook files.
- Do not create `context.md` or ADR files.

## Verification

- Review Markdown links and headings after documentation edits.
- For runtime-related docs, confirm Codex guidance stays aligned with shared host-neutral skill policy.
- Confirm `runtime-support.md` and `release.md` agree on distribution channels, evidence blockers, and publication authority.
- Confirm `workflow.md`, `runtime-support.md`, and lifecycle references agree on
  v2 envelopes, strict v1 compatibility, policy-aware readiness, and automatic
  existing-project migration.

## Child DOX Index

- `docs/superpowers/AGENTS.md` covers ignored local generated working docs.
