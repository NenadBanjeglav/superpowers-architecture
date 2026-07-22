---
name: brainstorming
description: Use before make/build/create/implement requests for apps, sites, tools, components, UI, APIs, workflows, feature work, architecture changes, behavior changes, or unclear requirements; writes a local design spec before planning or coding
metadata:
  priority: 100
---

# Brainstorming

<HARD-GATE>
Do not write implementation code, scaffold production files, create implementation plans, or invoke implementation skills until the written local spec has been approved by the user at its exact recorded SHA-256 revision.
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
5. If root `AGENTS.md` exists and the user wants this preference to be durable for the project, propose a concrete root `AGENTS.md` update that records the selected Phase Mode explicitly, including the selected mode, the reason, and that the preference is durable for later approval gates. Wait for user approval before editing the downstream root `AGENTS.md`. Keep any existing generic first-`brainstorming` preference bullet intact unless the downstream project owner explicitly asks to replace it.

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
**Artifact Type:** Design Spec
**Status:** Draft
**Revision:** none
**Approved Revision:** none
**Approved At:** none

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

Write the Draft spec to:

`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`

These files are local developer working state. Do not commit them. If `docs/superpowers/**` is not ignored, warn the user but do not edit `.gitignore` automatically.

Resolve the sibling `using-superpowers` operation module and run `artifact refresh --path <path> --type "Design Spec"` after writing. If Node.js or the operation module is unavailable, fail closed with its full-package installation guidance; do not calculate a digest independently or rely on conversation memory.

## Advisory Spec Review

After refreshing the Draft, dispatch an isolated advisory document reviewer with:

- the absolute spec path;
- isolated context with no parent conversation turns;
- balanced capability;
- read-only workspace policy.

The reviewer may return only `Ready for user review` or `Issues found`; it cannot approve the artifact. If isolated advisory review is unavailable, perform this deterministic self-review instead:

1. Confirm every required section is complete and contains no TODO, TBD, or placeholder.
2. Confirm requirements and decisions are internally consistent and unambiguous for planning.
3. Confirm Language and Architecture define modules, interfaces, seams, adapters, data flow, and test surface.
4. Confirm scope is one coherent planning unit and contains no unrequested features.
5. Confirm acceptance criteria cover every stated goal and risk.
6. Confirm lifecycle metadata still says `Status: Draft` and `Revision` equals the refreshed digest.

Resolve advisory issues before showing the artifact to the user. After any content change, run `artifact draft` before editing and `artifact refresh` afterward, repeat advisory review or the self-review, and report the new exact revision.

## Written Spec Review Gate

After writing the spec, ask one of these based on the selected Phase Mode.

Automated fresh-session mode:

```text
Draft spec written to `<path>` at `<sha256 revision>`. Please review that exact revision before planning. After you explicitly approve it, I will record approval in the artifact and start planning in a fresh session using the selected automated fresh-session mode.
```

Same-session mode:

```text
Draft spec written to `<path>` at `<sha256 revision>`. Please review that exact revision before planning. After you explicitly approve it, I will record approval in the artifact and continue to planning in this same session using the selected same-session mode.
```

If the user requests changes, run `artifact draft` before editing, update the spec, run `artifact refresh`, repeat advisory review or deterministic self-review, and repeat the review gate with the new digest.

## Terminal State

After writing and reviewing the Draft spec, stop. Do not invoke `writing-plans` until the user explicitly approves the reported exact revision.

After approval:

- Run `artifact approve --path <path> --type "Design Spec" --expected-revision <reviewed sha256>` before any handoff. If approval fails, stop and require renewed review of the actual refreshed revision.
- In automated fresh-session mode, run the host-neutral `prepare handoff` preflight from `using-superpowers/references/phase-handoff.md`. Build the canonical planning prompt from the resulting immutable record, use the runtime adapter only when it can preserve every affinity field, report the new session identity or complete fallback prompt, then stop.
- In same-session mode, use `writing-plans`, revalidate the Approved spec at its exact revision, re-read the spec and codebase from disk, write the implementation plan, and stop at the written-plan review gate.

Canonical planning prompt:

Print:

```text
Use the writing-plans skill to create an implementation plan from:
<absolute-spec-path>

Approved artifact:
- Type: Design Spec
- Revision: <exact approved sha256 digest>
- Repository remote: <canonical remote>
- Checkout root: <absolute checkout root>
- Branch: <branch or detached commit>
- Worktree identity: <main-checkout | linked-worktree | codex-managed-worktree | detached>
- Workspace policy: same-checkout
- Plugin source: <installed | local-plugin-dir | skills-install>
- Plugin root: <verified absolute path or none>
- Phase Mode: <selected mode>

Handoff record:
{
  "phase": "planning",
  "repositoryRemote": "<canonical remote>",
  "checkoutRoot": "<absolute checkout root>",
  "branch": "<branch or detached commit>",
  "worktreeIdentity": "<main-checkout | linked-worktree | codex-managed-worktree | detached>",
  "artifactPath": "<absolute-spec-path>",
  "artifactType": "Design Spec",
  "approvedRevision": "<exact approved sha256 digest>",
  "sourceSpecPath": "none",
  "sourceSpecRevision": "none",
  "pluginSource": "<installed | local-plugin-dir | skills-install>",
  "pluginRoot": "<verified absolute path or none>",
  "workspacePolicy": "same-checkout"
}

Before invoking writing-plans, acknowledge every handoff field with the exact received value. Then independently re-run repository, checkout, branch, worktree, artifact lifecycle/revision, ignored-file, and plugin-source checks from disk. Do not begin planning if any target-side value is missing, differs, or cannot be proven. Report the mismatch and stop.

Validate the Approved Design Spec at that exact revision before inspecting the codebase. Read the spec and codebase fresh. Save the Draft plan under docs/superpowers/plans/, refresh and review its exact revision, and stop at the written-plan review gate. Do not stage or commit docs/superpowers/** unless I explicitly ask.
```
