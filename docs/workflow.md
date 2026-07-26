# Workflow

Superpowers Architecture uses written review gates and a selected Phase Mode.

## 0. Wayfinder

Use `wayfinder` for deliberate greenfield inception, a missing Agentic
Foundation, or project-wide reorientation.

Wayfinder is documentation-only. It establishes or resumes root `AGENTS.md` as
the small Root Router, root `CONTEXT.md` as a compact dashboard, and the
manifest-selected Agentic Foundation under `docs/agentic/`. The Project
Blueprint owns project-wide requirements; roadmap outcomes link to those
requirements and identify which outcome is Ready for Brainstorming.

Wayfinder records destination, readiness criteria, frontier, fog, out-of-scope
state, and one durable Phase Mode. It refreshes the exact Draft Foundation
revision, runs advisory review, asks the user to review that revision, and
stops. It does not write feature specs, implementation plans, app code, CI, or
deployment configuration.

After exact Foundation approval, automated fresh-session mode prepares a
same-checkout Brainstorming handoff for one selected ready roadmap outcome.
Same-session mode independently validates the Approved Foundation and rereads
the Root Router, manifest, and roadmap from disk before invoking
`brainstorming`.

## 1. Brainstorming

Use `brainstorming` for one bounded roadmap outcome, feature, behavior change,
architecture change, new component, or unclear requirement. A
Foundation-backed session first validates the exact Approved Foundation,
verifies the selected roadmap outcome and canonical prompt, and reads the
project through the Root Router. A generic session selects a Phase Mode only
when no durable project preference exists.

The Draft Design Spec records:

- the Foundation manifest, exact `Base Agentic Foundation`, roadmap outcome,
  Blueprint requirements, and prior decisions, or literal `none` for a generic
  workflow;
- a Durable Documentation Impact row for every design decision, using a stable
  `DDI-NNN` identity, one classification, and a concrete reason;
- stable `FCA-NNN` candidate-action references for project-durable or
  operating-contract decisions; and
- one escape-safe JSON Foundation Candidate Declaration whose sorted
  path/action projection must equal `candidate.json`.

Task-local and no-impact rows use `none`. A generic or otherwise empty
declaration includes the exact sentence `No durable documentation changes`.
Durable candidates are complete ignored file previews and do not modify
authoritative current truth.

The shared operation validates the Draft spec and candidate, previews the exact
prospective Foundation revision, and renders one readable Design Change Set.
Advisory review covers the spec, declaration obligations, candidate equality,
Blueprint traceability, and Architecture Conformance. The user reviews the
exact Draft spec revision and prospective Foundation revision together at one
gate.

Exact combined approval applies only the reviewed candidate, approves the spec
and resulting Foundation with one timestamp, and atomically installs the
operation-owned candidate-root `APPLIED.json` as the sole Foundation
Application Receipt. Planning does not start until receipt-backed validation
proves the exact spec, base, actions, result, and approval timestamp. A
non-empty change normally has base and result inequality; an empty change uses
the same receipt flow with base equal to result.

## 2. Planning

Planning starts only after the exact Design Spec is Approved. A
Foundation-backed phase validates this sequence before reading the Foundation
or codebase:

```text
Approved Design Spec
-> Base Agentic Foundation from the spec
-> sole APPLIED.json receipt
-> resulting Approved Agentic Foundation
```

In automated fresh-session mode, approval starts a fresh Codex planning task
only after the source proves repository, checkout,
branch/worktree, artifact, ignored-file, receipt, and plugin affinity. The new
session acknowledges all fifteen handoff fields and separately acknowledges
the external Foundation Application Receipt binding before repeating those
checks. If no safe adapter is available, the agent prints the exact planning
prompt or command.

In same-session mode, approval continues to `writing-plans` only after the
agent revalidates the same spec/base/receipt/result binding and rereads the
Approved inputs and codebase from disk.

The Draft implementation plan records these four fields:

```markdown
**Foundation Manifest:** <absolute WAYFINDING.md path or none>
**Foundation Base Revision:** <exact Approved base revision or none>
**Foundation Result Revision:** <exact Approved result revision or none>
**Foundation Application Receipt:** <absolute APPLIED.json path or none>
```

A generic plan uses literal `none` for all four. The plan is bound to the
source spec path and exact Approved revision, carries the same four fields in
every task context, refreshes its own canonical revision, runs advisory static
review, and stops for user review. The future implementation handoff is not
rendered while the plan is Draft.

## 3. Implementation

Implementation starts only after the user approves the exact refreshed plan
revision. Only then is the implementation prompt rendered and verified.
Before codebase inspection, the controller independently validates the
Approved plan, referenced Approved spec, and the same Foundation
base/receipt/result binding.

In automated fresh-session mode, approval uses the same fixed fifteen-field
acknowledgement and same-checkout gate as Planning. The receipt path remains an
external prompt binding, not a sixteenth record field. A fork, resumed
conversation, nearby worktree, copied ignored artifact, or different local
plugin root is not an acceptable substitute.

In same-session mode, approval continues to `subagent-driven-development` or
`executing-plans` only after the agent revalidates and rereads the Approved
plan, referenced spec, applicable Foundation and receipt, and codebase from
disk.

Implementation commits code per task and must not commit `docs/superpowers/**` unless explicitly requested. Bounded implementer and reviewer work uses the host-neutral isolated-dispatch contract. Architecture Conformance ties tests, implementation, task review, and final review to the exact Approved Design Understanding.

## 4. Finish

Use `finishing-a-development-branch` after implementation tasks are complete.

The agent runs final verification, checks git status, confirms local Superpowers docs are not staged, summarizes commits, changed files, tests, satisfied requirements, and residual risks, then stops.

## Invocation Names

With skills.sh or Codex skill installs, use the skill names directly.

## Runtime Handoffs

Codex App automated fresh-session handoff uses only a genuinely new project task when the installed app can bind it to the exact checkout. It never uses a conversation fork.

The Codex adapter falls back to printing the exact next-phase prompt or
command when automatic launch is unavailable, disabled, or unsafe.

The immutable handoff record contains exactly fifteen fields. Brainstorming
adds its selected roadmap outcome and exact canonical prompt outside the
record. Foundation-backed Planning and implementation add the absolute
Foundation Application Receipt outside the record. Targets acknowledge and
revalidate these external bindings separately.

The exact command schemas, receipt rules, and record fields remain owned by the
[shared Agentic Foundation lifecycle](../skills/using-superpowers/references/agentic-foundation-lifecycle.md)
and [shared phase-handoff contract](../skills/using-superpowers/references/phase-handoff.md).

See [Runtime Support](runtime-support.md) for installed-host requirements. A
runtime or release claim requires executed installed-host evidence; source
inspection alone is insufficient.

## Worktrees

Worktree isolation remains available. The agent may use it when requested or already active. The worktree skill must not edit or commit `.gitignore` automatically.
