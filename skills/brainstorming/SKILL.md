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
- Search local `docs/superpowers/specs/` and `docs/superpowers/architecture-reviews/` if they exist.
- Do not create or update `context.md`.
- Do not create ADRs.
- Do not offer or use a visual companion.

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

After writing the spec, ask:

```text
Spec written to `<path>`. Please review it before planning. I will not create an implementation plan until you approve this written spec.
```

If the user requests changes, update the spec and repeat the review gate.

## Terminal State

After the user approves the written spec, stop. Do not invoke `writing-plans` in the same session.

Print:

```text
Start a fresh session in the same checkout and say:

Use the writing-plans skill to create an implementation plan from:
<absolute-or-repo-relative-spec-path>

Read the spec and codebase fresh. Save the plan under docs/superpowers/plans/. Stop after the written plan is reviewed.
```
