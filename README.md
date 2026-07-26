# Superpowers Architecture

[![skills.sh](https://skills.sh/b/NenadBanjeglav/superpowers-architecture)](https://skills.sh/NenadBanjeglav/superpowers-architecture)

Architecture-first Superpowers for Codex.

Codex supported; Claude deferred/unadvertised.

Superpowers Architecture is a shared skill pack and runtime plugin for developers who want an agent to agree on project direction and design before it writes plans or code. It keeps the best parts of Superpowers - specs, plans, TDD, reviews, worktree-aware implementation, task commits, and final verification - and adds Wayfinder, an exact Agentic Foundation lifecycle, and module, interface, seam, adapter, data-flow, and test-surface thinking.

For a new project or project-wide reorientation, use `wayfinder`. It establishes a documentation-only Agentic Foundation, a Project Blueprint, and a Blueprint-traceable roadmap before feature-level specs or implementation plans exist. Version 0.5.0 removes the former `project-setup` skill as a breaking change; there is no alias or compatibility route.

## Why

Coding agents often jump from a rough ticket to implementation. That is fast, but it can create shallow modules, unclear interfaces, brittle tests, and rework.

This plugin makes the agent stop first and build **Design Understanding**:

- what the feature actually means
- which modules are involved
- where interfaces and seams belong
- which adapters sit at those seams
- how data flows through the system
- what should be tested through which surface
- which architecture constraints must survive implementation

## Quickstart

### Skills CLI

Install the shared skills package:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture
```

Then pick the skills you want and the agent you want to install them into. For a non-interactive Codex install of all skills:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -a codex -g -y
```

Complete lifecycle and SDD workflows must include `using-superpowers`, which
owns the single portable operation module. If a partial skills.sh install omits
it, consuming skills fail closed and print the full-package install command:

```powershell
npx.cmd skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -y
```

Node.js 20 or newer is required for artifact lifecycle, SDD workspace, and
compact startup-context operations.

On Windows PowerShell, use `npx.cmd` if the `npx.ps1` shim is blocked by execution policy:

```powershell
npx.cmd skills@latest add NenadBanjeglav/superpowers-architecture
```

Start a fresh Codex session and say:

```text
Use the wayfinder skill to establish the Agentic Foundation for <project>.
```

### Codex Plugin Package

The `npx skills` flow installs the shared skills. The Codex plugin package is a
separate supported channel that also installs the Codex startup hook; use a
Codex plugin or marketplace flow that supports this repository's manifest.

## Agentic Foundation

Wayfinder creates a complete but focused project knowledge base:

- root `AGENTS.md` is the small operating contract, reading router, and Child DOX Index;
- root `CONTEXT.md` is the compact current-state dashboard;
- `docs/agentic/WAYFINDING.md` is the sole Foundation lifecycle manifest;
- `docs/agentic/PROJECT-BLUEPRINT.md` owns project-wide requirements and stable identities;
- focused product, domain, architecture, decision, roadmap, and verification documents each own current truth;
- `docs/agentic/DECISIONS.md` preserves append-only decision entries while its Current Decision Index identifies the decisions in force.

The manifest-selected bundle has one canonical Draft or Approved SHA-256 revision. Roadmap outcomes link back to Blueprint requirements and carry a canonical Brainstorming prompt.

## Workflow

1. `wayfinder` establishes or resumes the Draft Agentic Foundation, records the durable Phase Mode, resolves destination, readiness, frontier, fog, and out-of-scope state, and stops at exact Foundation review. It writes documentation only.
2. Exact Foundation approval starts `brainstorming` for one ready roadmap outcome. Automated fresh-session mode uses a verified same-checkout handoff; same-session mode revalidates and rereads the Approved Foundation from disk.
3. Foundation-backed `brainstorming` records the exact `Base Agentic Foundation` in the Design Spec. Every documentation-impact decision receives a stable `DDI-NNN` identity and reason; durable candidate actions use stable `FCA-NNN` identities in one escape-safe JSON Foundation Candidate Declaration.
4. The shared operation validates that the declaration's sorted path/action projection equals the ignored candidate, previews the exact prospective Foundation, and presents the Draft spec and prospective result as one Design Change Set. The user approves both exact revisions once.
5. Apply changes only the reviewed Foundation files, approves the spec and result with one timestamp, and installs the operation-owned candidate-root `APPLIED.json` as the sole Foundation Application Receipt. A non-empty candidate normally has different base and result revisions; an empty candidate uses the same receipt flow with base equal to result.
6. `writing-plans` validates the Approved spec, its base Foundation, the receipt, and the resulting Approved Foundation before reading the project. The Draft plan records `Foundation Manifest`, `Foundation Base Revision`, `Foundation Result Revision`, and `Foundation Application Receipt`; generic workflows use literal `none` for all four.
7. After exact plan approval, the implementation prompt is rendered and verified. The phase-handoff JSON remains exactly fifteen fields; Foundation-backed Planning and implementation carry the absolute receipt path as an external binding outside that record.
8. `subagent-driven-development` or `executing-plans` revalidates the Approved plan, source spec, receipt, and result before implementation with TDD and review. `finishing-a-development-branch` verifies and summarizes the work.

## Local Working Docs

Generated downstream docs are local per-developer working state:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/superpowers/architecture-reviews/`
- `docs/superpowers/foundation-candidates/`

Foundation candidate roots also hold the operation-owned review report, transaction evidence, and sole `APPLIED.json` receipt. These paths remain ignored local working state. Do not commit them unless you explicitly choose to.

## What Changed From Superpowers

- Wayfinder replaces the former project-inception skill with a resumable, documentation-only Agentic Foundation workflow.
- A Project Blueprint and stable roadmap outcome identities connect project-wide requirements to bounded feature design.
- Architecture-first brainstorming.
- Stable DDI/FCA declarations, exact candidate previews, one combined Design Change Set approval, and the sole `APPLIED.json` receipt preserve base-to-result truth.
- Design Understanding in specs.
- Phase-mode handoffs use a fixed fifteen-field record, with the Foundation Application Receipt carried externally when applicable.
- Automated fresh sessions or same-session continuation occur only after explicit exact approval and disk validation.
- Local specs, plans, and architecture reviews.
- Worktree workflow remains available.
- Code commits remain allowed during implementation.
- Visual companion behavior is removed.
- `context.md` and ADR flows are removed.
- Matt issue, PRD, and triage flows are not included.
- The default merge/PR/discard finish menu is replaced with verification summary.

## Documentation

- [Installation](docs/installation.md)
- [Workflow](docs/workflow.md)
- [Design Understanding](docs/design-understanding.md)
- [Architecture Review](docs/architecture-review.md)
- [Runtime Support](docs/runtime-support.md)
- [Release Contract](docs/release.md)
- [Shared Agentic Foundation Lifecycle](skills/using-superpowers/references/agentic-foundation-lifecycle.md)
- [Shared Phase Handoff Contract](skills/using-superpowers/references/phase-handoff.md)

The supported distribution channels are GitHub/skills.sh for Codex and the
Codex plugin package. npm is not supported;
`package.json` is private repository/tooling metadata.

## Examples

- [Simple feature spec](examples/simple-feature-spec.md)
- [Architecture-heavy spec](examples/architecture-heavy-spec.md)

## Attribution

This project adapts ideas, workflow structure, and selected MIT-licensed material from:

- [obra/superpowers](https://github.com/obra/superpowers)
- [mattpocock/skills](https://github.com/mattpocock/skills)

It is independent and not officially affiliated with either project.
