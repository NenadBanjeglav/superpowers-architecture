---
name: using-superpowers
description: Use on entry to resolve workflow policy and route project direction, bounded design, or debugging.
metadata:
  priority: 100
---

# Using Superpowers Architecture

Resolve policy and route the work before choosing the next phase. Read the
applicable instruction chain and task-relevant owners; follow declared DOX
hierarchies without loading unrelated subtrees.

## Routing

| Current need | Skill |
| --- | --- |
| Project inception, missing Foundation, project-wide reorientation, release boundary, or several roadmap outcomes | `wayfinder` |
| One bounded outcome, feature, behavior, workflow, or architecture change | `brainstorming` |
| Bug, failing test, broken build, or unexpected behavior | `systematic-debugging` before a proposed fix |
| Plan from an exact policy-accepted Design Spec | `writing-plans` |
| Execute an exact policy-accepted plan | `subagent-driven-development` for independent tasks; `executing-plans` for linear work |
| Evidence for a completion claim | `verification-before-completion` |
| Final review coverage and Git closeout | `finishing-a-development-branch` |

Bounded discovery that changes project direction returns to `wayfinder`.
Explicitly invoked skills remain applicable; the router does not create a
phase-skipping path.

For a read-only explanation or review, inspect the requested scope without
creating an unsolicited phase artifact. A missing Foundation alone does not
turn a read-only request into project inception.

A bounded outcome in an established project may use brainstorming's generic
workflow with explicit absent Foundation bindings. Route missing-Foundation
work to wayfinder when establishing or reorienting project-wide direction.

## Policy and Authority

Approval Policy defaults to **Autonomous** for new and existing projects.
**Review-gated** requires a new explicit version-2 user opt-in. Old gates,
Approved artifacts, and Phase Mode do not opt in.

Draft never progresses. Ready records exact internal review with human approval
fields `none`; Approved preserves genuine approval of that revision.
Autonomous accepts Ready or Approved; Review-gated accepts Approved only.
Pass explicit policy to shared operations; omitted-policy/v1 consumers stay
strict. Never manufacture approval to overcome a capability mismatch.

In-scope design, plan, code, tests, review, and documentation repairs are
agent-owned under Autonomous. Ready/Approved specs and plans remain immutable;
revisions use distinct Draft successors through refresh, review, and Ready.
Review-gated requires approval of the successor's readable package. Ask about consequential goal/constraint choices or missing
required input/access, and actions beyond existing authority. Complete independent
safe work first. Preserve acceptance criteria, safety, immutable history, and
external-action boundaries. Load [product-evolution.md](references/product-evolution.md)
for stage/consumer evidence, current-owner selection, explicit retirement,
test categories, budgets, and sunset. Preserve the selected current contract;
historical runtime choices can be retired only through its scoped successor rules.

Load [workflow-policy.md](references/workflow-policy.md) for active legacy gate
migration or detailed policy/freshness handling. Migration is narrow,
internally reviewed, transactional, and limited to the active project at a safe
boundary; startup never runs it broadly.

Validate authoritative inputs on first use after fresh/resumed/compacted context,
after changed inputs/dependencies, branch/checkout changes or possible writers,
and within critical mutation locks. Reuse unchanged evidence in one uninterrupted
controller context.

## Phase Mode and References

Approval Policy and Phase Mode are independent. Preserve the recorded mode.
Same-session continuation rereads exact disk artifacts, relevant code, and
instructions, reusing unchanged valid evidence. Automated fresh-session mode
requires authorized task creation and proven genuine user-owned same-checkout,
plugin, ignored-state, and v2-envelope affinity. Follow the durable fallback
when unsupported; a fork, subagent, copied artifact, or different worktree is not
a substitute.

Read details only when the operation applies:

- [artifact-lifecycle.md](references/artifact-lifecycle.md): spec/plan operations.
- [agentic-foundation-lifecycle.md](references/agentic-foundation-lifecycle.md):
  Foundation validation, managed edits, candidates, and receipts.
- [dispatch-contract.md](references/dispatch-contract.md): bounded subagent work.
- [phase-handoff.md](references/phase-handoff.md): receiving/preparing a fresh phase.
- [codex-tools.md](references/codex-tools.md): actual runtime capability mappings.

<!-- STARTUP-CONTRACT:START -->
1. Route through the applicable skill, announce it, and read the local instruction chain before acting.
2. Approval Policy defaults to Autonomous for new and existing work; Review-gated requires a new explicit opt-in, and legacy gates are migrated narrowly with workflow migrate at a safe boundary.
3. Draft never progresses; Autonomous accepts internally reviewed Ready or Approved artifacts, while Review-gated accepts Approved only and preserves real human provenance.
4. Preserve the authorized goal, acceptance criteria, selected current contract, safety and external-action boundaries; Ready/Approved specs and plans are immutable. Use distinct reviewed successors for revisions and explicit authorized retirement; repair in-scope work without repeated human approval.
5. Phase Mode is independent: fresh mode requires a genuinely fresh user-owned same-checkout session with verified v2 bindings, while same-session mode rereads changed inputs; never substitute a fork or subagent.
6. Report missing capabilities and installed-host evidence honestly; never pretend migration, validation, isolation, checkout/plugin affinity, startup injection, or publication succeeded.
<!-- STARTUP-CONTRACT:END -->

## Local State and Core

`scripts/spa.mjs` owns portable artifact, Foundation, workflow migration,
handoff, startup, workspace, and SDD operations. Node.js 20+ and the complete
plugin are required for correctness-critical operations; missing dependencies
fail closed with installation guidance.

Generated `docs/superpowers/` specs, plans, architecture reviews, Foundation
candidates, workflow migrations, and verification records stay local and
unstaged unless explicitly requested.

Do not create plugin-root CONTEXT.md, lowercase context.md, ADRs, Matt
issue/PRD/triage flows, or visual companions. Wayfinder creates uppercase
CONTEXT.md and docs/agentic only in deliberate downstream projects. Shared
policy uses canonical skill names; concrete runtime syntax stays in references.
