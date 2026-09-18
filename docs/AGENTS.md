# AGENTS.md

## Purpose

Public documentation and local Superpowers working docs.

## Ownership

- Owns committed docs under `docs/`.
- `docs/superpowers/AGENTS.md` owns ignored local generated specs, plans, and architecture reviews.
- Root AGENTS.md owns product identity, release boundaries, and release validation.

## Local Contracts

- Public docs describe Superpowers Architecture as a Codex-only plugin optimized for GPT-6 Astra.
- Only the complete Codex plugin is supported. GitHub hosts source/releases; Claude and standalone skills.sh are removed. npm is unsupported and package.json is private tooling metadata.
- Installation uses the repository marketplace and full plugin, with accurate new-session pickup and hook-trust requirements.
- Prompt-size measurements describe explicit byte/read-set models, not empirical token, speed, or model-quality gains.
- Public workflow docs must describe Workflow Policy Version 2: Autonomous is
  the default for new and existing projects, active legacy gates migrate
  narrowly on next entry, Review-gated requires a new explicit opt-in, and
  Ready never claims human approval.
- Runtime claims require installed Codex evidence; source inspection cannot substitute. Missing mandatory evidence blocks release by default. The maintainer explicitly authorized 0.6.0 publication with failed/unverified host checks disclosed; docs/release.md owns this version-specific exception, and README/installation/runtime/release notes must agree on the manual entry workaround and limits.
- A separate explicit 2026-09-18 exception permits 0.7.0 publication with its
  disclosed installed-host gaps. Keep both exceptions version-specific; later
  releases retain the complete-matrix default. Do not turn an exception into
  passing evidence or omit the manual entry workaround.
- Integrity repair in 0.7.1 protects generated-output and workspace writes and
  validates full physical/spec/plan/Foundation bindings. Keep source test results,
  installed package/helper evidence and observed host behavior distinct. Existing
  public interfaces, lifecycle hashes and accepted history remain supported.
- Stage-aware workflow descriptions apply to 0.7.0 and later; installation pins,
  package/plugin versions and changelog must agree. Keep historical 0.6.0 evidence
  distinct from current source, installed-byte and actual host observations.
  Accepted specs/plans use immutable history and reviewed successors; current
  selection, stage/consumer evidence, subtraction, categories, budget and sunset
  must agree with the shared evolution policy and conformance rubric.

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
