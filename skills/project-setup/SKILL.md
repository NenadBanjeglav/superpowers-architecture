---
name: project-setup
description: Use when starting a new project from scratch or establishing project operating contracts, root CONTEXT.md, stack decisions, architecture summary, domain language, and a high-level roadmap before feature brainstorming
metadata:
  priority: 110
---

# Project Setup

<HARD-GATE>
Do not scaffold app code, production files, package manager files, framework files, CI, deployment configuration, implementation plans, local design specs, ADRs, PRDs, issue flows, visual companion artifacts, or lowercase context.md from this skill.
</HARD-GATE>

Project Setup is the project-inception phase for downstream projects that need durable agent operating instructions and project context before feature-level work.

Use this skill for requests to start a new project from scratch, establish a project contract, create root `AGENTS.md`, create root `CONTEXT.md`, choose a tech stack, define domain language, summarize architecture, or build a high-level development roadmap.

Do not use this skill to implement roadmap items. Roadmap items hand off to `brainstorming`.

## Repository Boundary

This skill creates or updates project-foundation documents in the user's downstream target project. In the Superpowers Architecture plugin repository itself, do not create a root `CONTEXT.md` and do not create lowercase `context.md`.

If the current checkout already has a root `CONTEXT.md`, treat it as intentional project context and update it only after review. If no root `CONTEXT.md` exists, create one only when the user is deliberately setting up that downstream project.

## Explore Existing Project State

Before asking setup questions:

- Inspect the repo shape enough to identify durable folders, existing app code, public docs, tests, and deployment files.
- Read any existing root `AGENTS.md`, child `AGENTS.md` files, and root `CONTEXT.md`.
- Check whether `docs/superpowers/` exists, but do not write specs, plans, or architecture reviews from this skill.
- Search for existing domain language, roadmap notes, architecture docs, and verification commands.
- Decide whether child `AGENTS.md` files are justified by durable ownership boundaries. For small projects, a single root `AGENTS.md` is enough.

## Adaptive Project Grilling

Ask one concise question at a time until the project foundation is decision-complete. Every question must be immediately followed by the agent's recommendation:

```text
<one concise question>

Recommendation: <the option or answer the agent recommends, with a short reason.>
```

The recommendation must be concrete enough for the user to accept, reject, or modify. It must not replace waiting for the user's answer.

Cover these topics as needed:

- project idea and target users
- goals, non-goals, and success criteria
- primary user workflows
- domain language and rejected synonyms
- tech stack, constraints, and version-sensitive decisions
- modules, interfaces, seams, adapters, data flow, and test surface
- persistence, auth, integrations, deployment, and observability
- verification expectations
- high-level development roadmap

Use the vocabulary from `codebase-design`: module, interface, seam, adapter, depth, leverage, locality, and test surface.

## Project Contract: AGENTS.md

Generated `AGENTS.md` files are agent operating contracts. They own project purpose, ownership, local contracts, work guidance, verification, and child indexes.

The root `AGENTS.md` must include this section order:

```markdown
# AGENTS.md

## Purpose

## Ownership

## Local Contracts

## Work Guidance

## Verification

## Child DOX Index
```

Include DOX-style hierarchy rules in the root file when the project does not already have them. Do not duplicate the entire DOX framework in every child file. Child `AGENTS.md` files should own only local differences and their own child index.

## Project Context: CONTEXT.md

Root `CONTEXT.md` is project knowledge, not agent instructions. It holds product, domain, architecture, stack, risks, verification, and roadmap context.

Use this shape:

```markdown
# <Project Name> Context

## Idea

## Users

## Goals

## Non-Goals

## Domain Language

## Tech Stack

## Architecture

### Modules

### Interfaces

### Seams

### Adapters

### Data Flow

### Test Surface

## Decisions

## Current Focus

## Risks

## Verification

## Development Roadmap
```

Keep `CONTEXT.md` compact. For most projects, target 200-400 lines. Prefer replacing stale statements over appending history. Do not store task transcripts, implementation-plan detail, completed-work logs, or long decision history in `CONTEXT.md`.

## Roadmap Rules

Roadmap entries are high-level and task-sized. They describe outcomes and the next `brainstorming` prompt, not exact file changes.

Use this entry shape:

```markdown
### Task 1: Account Creation Flow

**Intent:** Establish sign-up, sign-in, and session behavior.
**Run next:** Use the brainstorming skill to write a design spec for the account creation flow, using `CONTEXT.md` as project context.
```

## File Writing Rules

- Create or update root `AGENTS.md`.
- Create or update root `CONTEXT.md`.
- Create child `AGENTS.md` files only where a durable folder boundary has distinct purpose, rules, verification, side effects, or ownership.
- Refresh every affected Child DOX Index.
- Do not create `docs/superpowers/specs/**`.
- Do not create `docs/superpowers/plans/**`.
- Do not create `docs/superpowers/architecture-reviews/**`.
- Do not create lowercase `context.md`.
- Do not create ADR files.
- Do not scaffold app code or production configuration.

## Review Gate

After writing setup files, stop and ask for review:

```text
Project setup written to `AGENTS.md`, `CONTEXT.md`, and any child `AGENTS.md` files listed in the root Child DOX Index. Please review these project contracts before feature work. I will not create specs, plans, or implementation until you approve the setup.
```

## Terminal State

After the user approves project setup, stop. Do not invoke `brainstorming` in the same session unless the user has already selected same-session mode in durable project instructions.

Print:

```text
Start a first brainstorming session in the same checkout and say:

Use the brainstorming skill to write a design spec for the next roadmap task from `CONTEXT.md`.

Read `AGENTS.md`, `CONTEXT.md`, and the codebase fresh. During this first brainstorming session, establish whether approved next steps should use automated fresh sessions or same-session continuation. Store the spec under docs/superpowers/specs/. Stop after the written spec is reviewed.
```
