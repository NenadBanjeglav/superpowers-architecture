# Superpowers Architecture

[![skills.sh](https://skills.sh/b/NenadBanjeglav/superpowers-architecture)](https://skills.sh/NenadBanjeglav/superpowers-architecture)

Architecture-first Superpowers for Codex.

Codex supported; Claude deferred/unadvertised.

Superpowers Architecture is a shared skill pack and Codex runtime plugin. It
keeps written design, concrete plans, TDD, review, worktree-aware implementation,
task commits, and final verification, and adds Wayfinder, an exact Agentic
Foundation lifecycle, automatic legacy-gate migration, and one Architecture
Conformance contract.

## Workflow Policy

Workflow Policy Version 2 defaults new and existing projects to
**Autonomous**. Once the goal and constraints are understood, the agent designs,
plans, implements, repairs review findings, tests, and verifies without repeated
document approvals. **Review-gated** is available only after a new explicit
opt-in.

Existing projects are migrated automatically on their next active
Superpowers Architecture entry. The agent prepares and reviews a narrow
transaction that removes legacy workflow gates while preserving business,
safety, privacy, data, publication, deployment, and external-action constraints,
user work, Phase Mode, and immutable decision history. It does not scan dormant
projects globally or ask for migration approval.

Artifacts use truthful lifecycle states:

- **Draft** is incomplete and never progresses.
- **Ready** passed applicable internal checks for its exact revision and carries
  no human approval metadata.
- **Approved** records real human approval of that exact revision.

Autonomous accepts Ready or Approved. Review-gated accepts Approved only. Legacy
v1 callers remain strict and cannot consume Ready.

## Quickstart

Install all shared skills for Codex:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -a codex -g -y
```

On Windows PowerShell, use `npx.cmd` when execution policy blocks `npx.ps1`.
Node.js 20 or newer is required for lifecycle, Foundation, migration, handoff,
startup, workspace, and SDD operations.

Then start or reorient a project with:

```text
Use the wayfinder skill to establish the Agentic Foundation for <project>.
```

The Codex plugin package is the second supported channel and adds startup hooks.
npm is unsupported; `package.json` is private tooling metadata.

## Agentic Foundation

`wayfinder` creates a documentation-only project foundation:

- root `AGENTS.md` owns operating policy, permissions, reading routes, and
  Phase Mode;
- root `CONTEXT.md` is the compact current-state dashboard;
- `docs/agentic/WAYFINDING.md` is the sole lifecycle manifest;
- `PROJECT-BLUEPRINT.md` owns project-wide requirements and stable identities;
- product, domain, architecture, decision, roadmap, and verification documents
  each own one current-truth area; and
- `DECISIONS.md` keeps an append-only immutable ledger while its Current
  Decision Index identifies decisions in force.

The manifest-selected bundle has one canonical Draft, Ready, or Approved
SHA-256 revision. Roadmap outcomes link Blueprint requirements and carry exact
bounded Brainstorming prompts.

## Phase Flow

1. `wayfinder` establishes or resumes the Foundation, Approval Policy, Phase
   Mode, Blueprint, and roadmap. It reviews the exact Foundation and progresses
   to Ready under Autonomous or a readable user package under Review-gated.
2. `brainstorming` designs one bounded outcome. Every decision receives a
   stable DDI identity and durable changes use exact FCA actions.
3. Foundation-backed design previews one complete ignored candidate and readable
   Design Change Set. Policy-aware apply writes a v2 receipt, preserves empty
   change-set bytes/timestamps, and records Ready or Approved truthfully.
4. `writing-plans` validates the exact spec, Foundation base, receipt, and
   result before reading code. It writes and reviews an exact implementation
   plan, then progresses according to policy.
5. `subagent-driven-development` or `executing-plans` validates exact bound
   inputs, implements with TDD, repairs findings, and runs task and whole-branch
   review.
6. `finishing-a-development-branch` verifies and summarizes local work.
   Push, merge, PR creation, deployment, publication, destructive cleanup, and
   communication with others remain separately authorized.

Approval Policy and Phase Mode are independent. Automated fresh-session mode
uses a v2 envelope around an exact fifteen-field record. The envelope binds
policy, goal, authoritative constraints, receipt, and Brainstorming prompt.
Each target revalidates the exact same checkout and dependencies. A fork,
subagent, copied ignored artifact, or nearby worktree is never described as a
fresh user-owned task. Same-session mode rereads changed inputs from disk.

## Local Working State

Generated downstream state is ignored and not committed by default:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/superpowers/architecture-reviews/`
- `docs/superpowers/foundation-candidates/`
- `docs/superpowers/workflow-migrations/`
- `docs/superpowers/verification/`

## Distribution and Evidence

Exactly two channels are supported:

- GitHub/skills.sh for Codex;
- the Codex plugin package.

Runtime and release claims require executed installed-Codex evidence. Source
inspection and passing local tests cannot replace startup, resume, clear,
compaction, plugin inventory, isolated dispatch, genuine fresh-task, exact
same-checkout, and fallback evidence. The current missing installed startup and
compaction matrix remains a hard release blocker. Publication requires a
separate explicit request after clean review and Git closeout.

## Documentation

- [Installation](docs/installation.md)
- [Workflow](docs/workflow.md)
- [Design Understanding](docs/design-understanding.md)
- [Architecture Review](docs/architecture-review.md)
- [Runtime Support](docs/runtime-support.md)
- [Release Contract](docs/release.md)
- [Workflow Policy](skills/using-superpowers/references/workflow-policy.md)
- [Artifact Lifecycle](skills/using-superpowers/references/artifact-lifecycle.md)
- [Agentic Foundation Lifecycle](skills/using-superpowers/references/agentic-foundation-lifecycle.md)
- [Phase Handoff Contract](skills/using-superpowers/references/phase-handoff.md)

## Attribution

This project adapts ideas, workflow structure, and selected MIT-licensed
material from [obra/superpowers](https://github.com/obra/superpowers) and
[mattpocock/skills](https://github.com/mattpocock/skills). It is independent and
not officially affiliated with either project.
