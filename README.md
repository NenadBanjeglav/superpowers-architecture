# Superpowers Architecture

**Architecture-first Superpowers for Codex, optimized for GPT-6 Astra.**

Superpowers Architecture is a Codex plugin that carries a project from a clear
foundation through design, planning, implementation, review, and verification.
The workflow is **stage-aware, evidence-gated, reversible, and subtractive**.
Version 0.7.1 protects generated outputs and strengthens exact workflow bindings. Autonomous execution is the default; architecture, TDD,
and review checks remain built in.

The complete Codex plugin is the only supported package. It includes all
16 skills, shared Node.js operations, and startup hooks. Claude, standalone
skills.sh installation, and npm distribution are unsupported.

## Install

Requires Node.js 20+ and a Codex client with plugin support. Select GPT-6 Astra
in Codex; the plugin preserves that choice for workers and reviewers.

```sh
codex plugin marketplace add NenadBanjeglav/superpowers-architecture --ref v0.7.1
codex plugin add superpowers-architecture@superpowers-architecture
```

Start a new Codex session. Review and trust this plugin's startup hook through
Codex's hook controls when prompted. See [Installation](docs/installation.md)
for local development, upgrades, and migration.
For an existing installation pinned to an older tag, follow the
[upgrade steps](docs/installation.md#upgrade-a-pinned-git-installation) first.

## Start Working

Start each task by explicitly loading the entry skill:

```text
$superpowers-architecture:using-superpowers
```

**Runtime limitation:** 0.7.1 repairs SDD and handoff integrity;
it does not repair startup hook delivery. Automatic startup failed in the prior
Windows 0.6.0 checks, including after hook trust and an app restart. Automatic
startup, context recovery, and complete installed-host workflows remain unverified
for 0.7.1. Invoke the entry skill again after resuming, clearing, or compacting
context. See [Runtime Support](docs/runtime-support.md#071-verification-status)
for the source evidence and remaining gaps.

For a new project or a change in project direction:

```text
Use wayfinder to establish the Agentic Foundation for my project.
```

For one bounded feature in an established project:

```text
Use brainstorming to design <outcome>, then carry it through implementation and verification.
```

For a regression, start with `systematic-debugging`. A read-only explanation
does not create unsolicited design artifacts.

## The Workflow

1. **Wayfinder** establishes or resumes a documentation-only Agentic Foundation:
   project direction, architecture, a Blueprint, and a traceable roadmap.
2. **Brainstorming** designs one bounded outcome, records architecture decisions,
   and reviews any durable documentation changes together.
3. **Planning** binds an actionable implementation plan to the exact accepted
   design and, when applicable, the resulting Foundation and application receipt.
4. **Implementation** follows TDD, preserves the chosen module interfaces and
   seams, and resolves task review findings.
5. **Finishing** verifies acceptance, confirms one final whole-branch review,
   and reports the actual result and Git state.

A single Architecture Conformance rubric follows modules, interfaces, seams,
adapters, data flow, depth, locality, leverage, and public test surfaces through
every phase.

Designs use evidence of current consumers and data obligations. Plans name what
to **add, replace, remove, and defer**. Both execution paths checkpoint unexpected
complexity through **Simplify, Replace, Defer, or Revise**. Reviews check stage
appropriateness, obsolete code/tests, complexity budgets, and temporary cleanup.

> Historical artifacts are immutable records of past decisions. They do not make past runtime behavior permanently binding. Only the current policy-accepted artifact defines the active product contract.

Ready/Approved specs and plans stay immutable, including unused artifacts.
Revisions use new reviewed successors with explicit retirement and replacement.
Compatibility needs a real consumer, durable data, a support window, an expiration
condition, and evidence that reset/reseed is insufficient. Unknown data or users
do not grant reset authority. See [Workflow](docs/workflow.md) and the
[0.7.0 changelog](CHANGELOG.md#070--2026-09-18).

## Autonomous by Default

Once the goal and constraints are understood, Codex handles in-scope design,
plan, implementation, test, documentation, and review repairs without repeated
document approvals. Existing projects migrate active legacy approval gates
narrowly and transactionally on their next workflow entry. Their goals,
constraints, user work, Phase Mode, and immutable decision history are preserved.

- **Draft:** incomplete or changed; never executable.
- **Ready:** internally reviewed for the exact revision; no human approval claim.
- **Approved:** genuinely approved by a person for that exact revision.

Autonomous accepts Ready or Approved. **Review-gated** requires a new explicit
opt-in and accepts Approved only. Legacy v1 consumers remain strict and cannot
consume Ready.

Approval Policy and **Phase Mode** are independent. Same-session mode rereads
current artifacts from disk. Automated fresh-session mode requires a genuine
user-owned task in the exact same checkout with verified plugin and artifact
bindings. If the host cannot prove that, it uses the recorded fallback.
A subagent, fork, or copied artifact cannot substitute.

Push, merge, PR creation, deployment, publication, messages to others, and
destructive actions require user authorization. Existing authorization is
preserved; the workflow does not ask for it again at every phase.

## What Changed for Astra

Following OpenAI's
[guidance on skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra),
the catalog uses short, distinct triggers and skills load detailed procedures
when needed. Repeated coaching and redundant diagrams are removed. Verification
reuses current evidence; reviews cover complete task ranges and reuse an exact
unchanged final review.

The architecture workflow, TDD, review, exact lifecycle, and Foundation contracts
remain. Smaller prompts are not a measured performance claim.

## Local Project Documentation

Wayfinder gives current truth one owner, links Blueprint requirements to roadmap
outcomes, and preserves an append-only Decision Ledger. The Foundation exists
in deliberate downstream projects, not inside this plugin repository.

Generated specs, plans, reviews, Foundation candidates, migration records, and
verification beneath `docs/superpowers/` remain ignored and unstaged unless
you request otherwise.

## Documentation

- [Installation and migration](docs/installation.md)
- [Workflow](docs/workflow.md)
- [Design Understanding](docs/design-understanding.md)
- [Architecture Review](docs/architecture-review.md)
- [Runtime Support](docs/runtime-support.md)
- [Release Contract](docs/release.md)
- [Changelog](CHANGELOG.md)

## Attribution

Adapted from [obra/superpowers](https://github.com/obra/superpowers) and
[mattpocock/skills](https://github.com/mattpocock/skills), with MIT attribution
in [NOTICE.md](NOTICE.md) and [LICENSE](LICENSE). This project is independent
and is not officially affiliated with OpenAI or either upstream project.
