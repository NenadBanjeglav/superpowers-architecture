---
name: brainstorming
description: Use before make/build/create/implement requests for apps, sites, tools, components, UI, APIs, workflows, feature work, architecture changes, behavior changes, or unclear requirements; writes a local design spec before planning or coding
metadata:
  priority: 100
---

# Brainstorming

<HARD-GATE>
Do not write implementation code, scaffold production files, create implementation plans, or invoke implementation skills until the written local spec has been approved by the user.
</HARD-GATE>

## Priority

Use this skill before frontend, app-builder, design, framework, implementation, or coding skills for generic app/site/tool/component prompts such as `Let's make a react todo list`.

Only skip this skill when the user explicitly provides an approved implementation plan path, explicitly asks to bypass design/spec work, or asks for a narrow mechanical edit that already has complete requirements.

## Inputs

Start from the user prompt. If the prompt contains a Jira ticket key or URL and Atlassian tools are available, read the ticket and relevant comments read-only. If tools are unavailable, ask the user to paste the ticket content or continue from the prompt.

Never comment on or update Jira unless the user explicitly asks.

## Explore Project Context

Before asking design questions:

- Inspect the repo shape enough to identify affected backend, frontend, mobile, shared, or infrastructure areas.
- Search for related modules, tests, and prior patterns.
- If root `CONTEXT.md` exists, read it before asking feature questions and use it as durable project context.
- If root `CONTEXT.md` does not exist, continue without it and keep task-specific language and architecture context inside the local spec.
- Search local `docs/superpowers/specs/` and `docs/superpowers/architecture-reviews/` if they exist.
- Do not create `CONTEXT.md` from this skill.
- Do not create or update lowercase `context.md`.
- Do not create ADRs.
- Do not offer or use a visual companion.

## Project Context Updates

If root `CONTEXT.md` exists and feature design reveals durable changes to domain language, architecture, stack decisions, verification, risks, or roadmap direction, propose a concise update and wait for user approval before editing `CONTEXT.md`.

When approved, update the existing statement in place. Do not append feature history, task transcripts, implementation-plan detail, or completed-work logs.

If root `CONTEXT.md` does not exist, do not create it from `brainstorming`; keep the discovered context in the local design spec under `docs/superpowers/specs/`.

## Phase Mode Selection

Before writing the first spec for a project or task chain, determine the Phase Mode.

1. Read root `AGENTS.md` and optional root `CONTEXT.md` for an existing Superpowers Architecture phase-mode preference.
2. If a durable preference exists, use it and do not ask again.
3. If no durable preference exists, ask this question before writing the spec:

```text
Do you want approvals in this workflow to start each next phase in a fresh session automatically, or should I continue through planning and implementation in this same session after each approval?

Recommendation: Use automated fresh sessions for larger or architecture-sensitive work because each phase starts with clean context from the approved artifact. Use same-session mode only when speed matters more than context isolation.
```

4. Record the selected Phase Mode in the spec.
5. If root `AGENTS.md` exists and the user wants this preference to be durable for the project, propose this exact update and wait for approval before editing:

```markdown
- During first `brainstorming`, ask whether approved next steps should use automated fresh sessions or same-session continuation; follow that selected phase mode for later approval gates.
```

If no root `AGENTS.md` exists, do not create one from `brainstorming`; record the selected Phase Mode only in the spec and current workflow chain.

## Adaptive Architecture Grilling

Ask one concise question at a time until the design is decision-complete. Increase rigor when language, module ownership, interfaces, seams, adapters, data flow, test surface, or acceptance criteria are unclear.

Every design question must be immediately followed by the agent's recommendation. Use this shape:

```text
<one concise question>

Recommendation: <the option or answer the agent recommends, with a short reason.>
```

The recommendation must be concrete and opinionated enough for the user to accept, reject, or modify. It must not replace waiting for the user's answer.

For terse or generic prompts such as `Let's make a react todo list`, ask at least one design question before writing the spec. Do not draft the spec entirely from assumptions.

Use the vocabulary from `codebase-design`:

- **Module**: anything with an interface and implementation.
- **Interface**: everything callers must know to use the module correctly.
- **Seam**: where an interface lives and behavior can be altered without editing in place.
- **Adapter**: concrete thing satisfying an interface at a seam.
- **Depth**: leverage at the interface.
- **Leverage**: capability callers get from the interface.
- **Locality**: change and verification concentrated in one place.
- **Test surface**: the interface through which behavior should be verified.

Challenge shallow designs. Prefer deep modules with small interfaces, clear seams, explicit adapters, and tests through the public interface.

## Required Spec Shape

Every spec must include:

```markdown
# <Feature Name> Design Spec

**Source:** <user prompt, pasted spec, or ticket reference>
**Date:** <YYYY-MM-DD>
**Status:** Approved local working spec

## Problem

## Goal

## Non-Goals

## Design Understanding

### Language

**<Preferred Term>**:
<One or two sentence definition.>
_Avoid_: <rejected synonyms>

### Phase Mode

**Selected Mode:** <Automated fresh-session mode or same-session mode>
**Reason:** <one sentence>
**Durability:** <Durable in root AGENTS.md or workflow-chain-local>

### Architecture

- **Modules involved:**
- **Interfaces:**
- **Seams:**
- **Adapters:**
- **Data flow:**
- **Test surface:**

### Key Decisions

### Open Risks

## User-Facing Behavior

## Implementation Shape

## Testing Strategy

## Acceptance Criteria
```

## Writing The Spec

Write the approved spec to:

`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`

These files are local developer working state. Do not commit them. If `docs/superpowers/**` is not ignored, warn the user but do not edit `.gitignore` automatically.

## Written Spec Review Gate

After writing the spec, ask one of these based on the selected Phase Mode.

Automated fresh-session mode:

```text
Spec written to `<path>`. Please review it before planning. After you approve it, I will start planning in a fresh session using the selected automated fresh-session mode.
```

Same-session mode:

```text
Spec written to `<path>`. Please review it before planning. After you approve it, I will continue to planning in this same session using the selected same-session mode.
```

If the user requests changes, update the spec and repeat the review gate.

## Terminal State

After writing the spec, stop. Do not invoke `writing-plans` until the user explicitly approves the written spec.

After approval:

- In automated fresh-session mode, build the canonical planning prompt, use the runtime adapter when available, report the spawned session identity or fallback prompt, then stop.
- In same-session mode, announce that approval is noted, use `writing-plans`, re-read the approved spec and codebase from disk, write the implementation plan, and stop at the written-plan review gate.

Canonical planning prompt:

Print:

```text
Use the writing-plans skill to create an implementation plan from:
<absolute-or-repo-relative-spec-path>

Read the spec and codebase fresh. Save the plan under docs/superpowers/plans/. Stop after the written plan is reviewed. Do not stage or commit docs/superpowers/** unless I explicitly ask.
```
