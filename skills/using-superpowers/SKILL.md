---
name: using-superpowers
description: Use when starting a conversation to route greenfield inception or project-wide reorientation to wayfinder and bounded feature, app, site, tool, component, UI, API, workflow, behavior, or architecture work to brainstorming before planning or implementation
metadata:
  priority: 100
---

# Using Superpowers Architecture

Superpowers Architecture is an architecture-first software development workflow
for agentic coding runtimes.

Before selecting any other skill, apply these priority rules:

- For deliberate greenfield project inception, a missing Agentic Foundation, or
  project-wide reorientation that changes the destination, release boundary,
  project-wide architecture, or several roadmap outcomes, use `wayfinder`
  before `brainstorming`, frontend, app-builder, design, framework,
  implementation, or coding skills.
- For one bounded roadmap outcome or a request to make, build, create,
  implement, add, change, or design a feature, app, site, tool, component,
  workflow, UI, API, behavior, or feature architecture in an established
  project, use `brainstorming` before frontend, app-builder, design, framework,
  implementation, or coding skills unless the user explicitly provides an
  Approved implementation plan path or explicitly asks to bypass design/spec
  work.
- When feature discovery invalidates the project destination, affects several
  roadmap outcomes, or exposes project-wide architecture or release fog, return
  to `wayfinder`.

Host-specific tool names live in `references/`. Use `codex-tools.md` on Codex
and `claude-code-tools.md` on Claude Code. Keep shared workflow policy
runtime-neutral.

Subagent workflows use the request in `references/dispatch-contract.md`: role,
context policy, capability tier, bounded prompt path, artifact paths, and
workspace policy. Shared skills never name host tools or concrete models. Phase
handoff uses the separate `prepare handoff` preflight in
`references/phase-handoff.md` and must create a genuinely new user-owned
session rather than a subagent.

If a Superpowers Architecture skill applies to the task, use it before acting.
The selected phase flow is:

1. For a new downstream project or project-wide reorientation, `wayfinder`
   establishes or resumes the exact Agentic Foundation, creates a
   Blueprint-traceable roadmap, records the durable Phase Mode, and stops at
   exact Foundation review without scaffolding production work.
2. After exact Foundation approval, the selected Phase Mode starts
   `brainstorming` for one ready bounded roadmap outcome:
   - Automated fresh-session mode prepares a verified fifteen-field
     same-checkout handoff to a fresh Codex or Claude session.
   - Same-session mode continues only after revalidating the Foundation and
     re-reading the Root Router, manifest-selected documents, roadmap outcome,
     and relevant checkout files from disk.
3. Generic established-project `brainstorming` establishes the Phase Mode when
   no durable preference exists. It writes and reviews one local
   architecture-aware Design Spec and stops at the written-spec review gate.
4. After written spec approval, the selected Phase Mode controls planning:
   - Automated fresh-session mode starts `writing-plans` in a fresh session
     from the Approved spec path, resulting Foundation, and physical application
     receipt when a runtime adapter is available.
   - Same-session mode invokes `writing-plans` in the current conversation
     after receipt-backed validation of the Approved spec base and resulting
     Foundation, then re-reading the Approved spec, applicable Foundation, and
     codebase from disk.
5. `writing-plans` writes and reviews an exact implementation plan from the
   Approved spec, then stops at the written-plan review gate.
6. After written plan approval, the selected Phase Mode controls implementation:
   - Automated fresh-session mode starts `subagent-driven-development` or
     `executing-plans` in a fresh session from the Approved plan path when a
     runtime adapter is available.
   - Same-session mode invokes the selected implementation controller after
     receipt-backed validation of the Approved plan, referenced spec base, and
     resulting Foundation, then re-reading those artifacts and the codebase from
     disk.
7. `finishing-a-development-branch` verifies and summarizes the completed
   branch without pushing, merging, opening PRs, discarding work, or publishing
   unless the user explicitly asks.

Generated downstream files under `docs/superpowers/**` are local developer
working state. Do not stage or commit them unless the user explicitly asks.

## Phase Modes

**Phase Mode** is the workflow progression rule stored durably during
Wayfinder, or selected during the first generic `brainstorming` session when no
durable preference exists.

**Automated fresh-session mode** means exact artifact approval starts the next
phase in a genuinely fresh user-owned session using a self-contained prompt. If
the runtime adapter is unavailable, disabled, or unsafe, print the exact
fallback prompt or command and stop.

**Same-session mode** means exact artifact approval continues to the next phase
in the current conversation. Before producing the next artifact or
implementation, re-read `AGENTS.md`, optional root `CONTEXT.md`, every
applicable Approved artifact, and relevant codebase files from disk. Ignore
prior design conclusions unless present in Approved artifacts or authoritative
project docs.

Approval must be explicit in both modes. Never infer approval from silence,
artifact creation, an advisory reviewer, or a request to continue that does not
identify the exact artifact revision.

Before an automated fresh-session launch, run `prepare handoff` and bind the
prompt to all fifteen immutable fields: exact repository remote, checkout root,
branch or detached commit, worktree identity, phase artifact, source spec when
applicable, Agentic Foundation when applicable, plugin source/root, and
`same-checkout` policy. For Foundation-backed Planning and implementation, bind
the absolute Foundation Application Receipt outside the unchanged record and
carry the result revision in `foundationRevision`. The receiving session must
acknowledge all fifteen fields and the receipt separately, then independently
revalidate them before the next skill begins. If the runtime cannot address the
exact checkout or prove plugin, ignored-artifact, and receipt affinity, print
the complete canonical fallback and do not launch.

<!-- STARTUP-CONTRACT:START -->
1. Route through an applicable skill before acting, and announce the selected skill.
2. New-project inception and project-wide reorientation use wayfinder and stop at exact Agentic Foundation review; bounded roadmap outcomes use brainstorming before planning or implementation.
3. Local AGENTS.md and user instructions take precedence; never create plugin-root CONTEXT.md, lowercase context.md, ADRs, Matt flows, or visual companions.
4. Specs and plans remain Draft until the user approves their exact SHA-256 revision; each next phase revalidates the artifact from disk.
5. The selected Phase Mode controls whether approval launches a genuinely fresh user-owned session or continues after a same-session disk reread; never substitute a fork, resume, or subagent for a fresh phase session.
6. Missing runtime capabilities must be reported explicitly. Never silently pretend routing, validation, isolation, checkout/plugin affinity, or startup injection succeeded.
<!-- STARTUP-CONTRACT:END -->

## Artifact And Foundation Lifecycles

Design Specs and implementation plans are Draft until the user approves an
exact canonical SHA-256 payload revision. Filenames, timestamps, headings, and
chat memory never prove approval; only successful validation of artifact type,
`Status: Approved`, Approved revision, and recomputed payload digest does.

`using-superpowers/scripts/spa.mjs` owns the shared artifact lifecycle
implementation. Consuming skills and runtime adapters call `artifact draft`,
`artifact refresh`, `artifact approve`, and `artifact validate` instead of
reimplementing canonicalization.

The same shared operation core owns Agentic Foundation lifecycle and candidate
operations behind `foundation draft`, `foundation refresh`, `foundation
approve`, `foundation validate`, `foundation preview`, and `foundation apply`.
`WAYFINDING.md` is the only lifecycle manifest. Wayfinder and later phase
consumers call the operations; they never calculate or rewrite Foundation
revisions themselves.

Result-only `foundation validate` remains the Foundation lifecycle check.
Planning and implementation use its receipt-backed form to bind the Approved
Design Spec base, operation-owned `APPLIED.json`, and resulting Approved
Foundation. They do not require base and result revisions to be equal.

Node.js 20 or newer is required for correctness-critical transitions. If Node
or the sibling operation module is unavailable, fail closed and print the
full-package installation guidance from the applicable lifecycle reference.

Managed content changes run the appropriate Draft operation before editing and
refresh afterward. Advisory reviewers identify issues but cannot approve; only
explicit user approval of the reported exact revision permits approval. Every
next phase independently validates every applicable Approved artifact from
disk.

## Required Skill Discipline

- Use `wayfinder` for greenfield inception, Agentic Foundation creation or
  resumption, project-wide reorientation, destination or release-boundary
  changes, and project-wide architecture or multi-outcome fog.
- Route a ready bounded roadmap outcome to `brainstorming`; never continue
  discovery, feature design, planning, or implementation inside Wayfinder.
- Use `brainstorming` for feature work, behavior changes, bounded architecture
  changes, generic app/site/tool/component creation, or unclear bounded
  requirements.
- Use `systematic-debugging` before proposing a fix for a bug, failing test,
  broken build, regression, or unexpected behavior.
- Use `writing-plans` only from an exact Approved local Design Spec.
- Use `subagent-driven-development` for mostly independent plan tasks or
  `executing-plans` for linear plan execution, only from an exact Approved local
  implementation plan.
- Before claiming completion, use `verification-before-completion` unless
  another selected skill has a stricter closeout.

## Skill Priority

1. `wayfinder` for downstream greenfield inception, Agentic Foundation
   creation/resumption, and project-wide reorientation. It outranks
   `brainstorming` only for that project-wide scope.
2. `brainstorming` for bounded roadmap outcomes, feature work, behavior
   changes, bounded architecture changes, generic make/build/create/implement
   requests, or unclear bounded requirements in an established project.
3. `systematic-debugging` for bugs, failing tests, broken builds, regressions,
   or unexpected behavior.
4. `writing-plans` only when an exact Approved local Design Spec is available.
5. `subagent-driven-development` or `executing-plans` only when an exact
   Approved local implementation plan is available.
6. `finishing-a-development-branch` when implementation tasks are done and the
   user wants release-readiness verification.
7. `verification-before-completion` before a completion claim not already
   covered by the finishing skill.

## Phase Boundaries

Do not continue from Wayfinder to Brainstorming, Brainstorming to Planning, or
Planning to implementation before the relevant exact artifact is Approved.

At the end of Wayfinder, stop at exact Agentic Foundation review. After exact
approval, follow the durable Phase Mode and the fifteen-field handoff or
same-session disk-reread rule.

At the end of Brainstorming, stop at its written review gate and describe what
will happen after exact approval under the selected Phase Mode. At the end of
Planning, stop at its written-plan review gate. Implementation starts only from
an explicit exact Approved plan path.

## Local Working State

These paths are local developer working state:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/superpowers/architecture-reviews/`
- `docs/superpowers/foundation-candidates/`

Do not stage or commit those paths unless the user explicitly requests it.
Code commits remain allowed during implementation tasks.

## Removed Behaviors

The shipped skills must not actively instruct agents to:

- retain an inception alias or redirect for the removed predecessor skill
- offer or run a visual companion
- create or maintain plugin-local lowercase `context.md`
- create or maintain root `CONTEXT.md` in this plugin repository
- create or maintain ADRs
- run Matt issue, PRD, or triage flows
- commit generated specs, plans, reviews, or Foundation candidates automatically
- continue across any exact review gate before the relevant artifact is
  Approved
- present the default merge, PR, or discard finish menu

Mentions of removed behavior are allowed in public docs only when they clearly
describe historical migration. Wayfinder may create uppercase root
`CONTEXT.md` only in a deliberate downstream project.
