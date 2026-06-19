# Superpowers Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, Codex-first plugin repo named `superpowers-architecture` that provides an architecture-first version of the Superpowers workflow.

**Architecture:** The plugin is a standalone repo with one shared `skills/` tree, Codex packaging in `.codex-plugin/`, runtime bootstrap hooks in `hooks/`, and public documentation at the repo root and `docs/`. It starts from `obra/superpowers`, adapts selected Matt Pocock architecture guidance, removes unneeded workflow parts, and keeps the source layout compatible with future Claude plugin packaging.

**Tech Stack:** Markdown skill files, Codex plugin manifest JSON, shell hooks with Windows wrapper, Git, optional Atlassian MCP input at runtime, and standard markdown documentation.

## Global Constraints

- V1 is Codex-first only. Do not add Claude install support in V1.
- Keep the repo layout Claude-compatible: `skills/<skill>/SKILL.md`, all resources inside plugin root, no references to files outside the plugin.
- Position the repo publicly as **Architecture-first Superpowers**.
- Keep worktree workflow available.
- Keep phase-separated fresh sessions by default: brainstorming stops after spec, planning stops after plan, implementation starts from plan.
- Keep code commits during implementation tasks.
- Treat generated downstream `docs/superpowers/**` artifacts as local per-developer working state and gitignored.
- Never stage or commit downstream `docs/superpowers/**` unless the user explicitly asks.
- Do not create `context.md`.
- Do not create ADR files.
- Do not include Matt issue, PRD, or triage flows.
- Remove visual companion behavior and assets from brainstorming.
- Remove brainstorming's design-doc commit step.
- Replace default merge, PR, discard finish menu with final verification summary.
- Attribute upstream projects clearly: `obra/superpowers` and `mattpocock/skills`.
- Do not imply official affiliation with either upstream project.

---

## Target Repository Layout

Create this folder:

```text
C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture
```

Target tree:

```text
superpowers-architecture/
  .codex-plugin/
    plugin.json
  .github/
    ISSUE_TEMPLATE/
      bug_report.md
      feature_request.md
      config.yml
    PULL_REQUEST_TEMPLATE.md
  assets/
    app-icon.png
    superpowers-architecture-small.svg
  docs/
    architecture-review.md
    claude-roadmap.md
    design-understanding.md
    installation.md
    workflow.md
  examples/
    architecture-heavy-spec.md
    simple-feature-spec.md
  hooks/
    hooks-codex.json
    run-hook.cmd
    session-start-codex
  skills/
    brainstorming/
      SKILL.md
    codebase-design/
      SKILL.md
      DEEPENING.md
      DESIGN-IT-TWICE.md
    dispatching-parallel-agents/
      SKILL.md
    executing-plans/
      SKILL.md
    finishing-a-development-branch/
      SKILL.md
    improve-codebase-architecture/
      SKILL.md
    receiving-code-review/
      SKILL.md
    requesting-code-review/
      SKILL.md
      code-reviewer.md
    subagent-driven-development/
      SKILL.md
      implementer-prompt.md
      task-reviewer-prompt.md
      scripts/
        review-package
        sdd-workspace
        task-brief
    systematic-debugging/
      SKILL.md
      condition-based-waiting.md
      condition-based-waiting-example.ts
      defense-in-depth.md
      root-cause-tracing.md
    test-driven-development/
      SKILL.md
      testing-anti-patterns.md
    using-git-worktrees/
      SKILL.md
    using-superpowers/
      SKILL.md
      references/
        codex-tools.md
    verification-before-completion/
      SKILL.md
    writing-plans/
      SKILL.md
  CHANGELOG.md
  LICENSE
  NOTICE.md
  README.md
  package.json
```

---

## Task 1: Scaffold The Public Repo Shell

**Files:**
- Create: `superpowers-architecture/.codex-plugin/plugin.json`
- Create: `superpowers-architecture/hooks/hooks-codex.json`
- Create: `superpowers-architecture/hooks/session-start-codex`
- Create: `superpowers-architecture/hooks/run-hook.cmd`
- Create: `superpowers-architecture/package.json`
- Create: `superpowers-architecture/LICENSE`
- Create: `superpowers-architecture/NOTICE.md`
- Create: `superpowers-architecture/CHANGELOG.md`
- Create: `superpowers-architecture/README.md`

**Interfaces:**
- Produces a valid Codex plugin root.
- Produces a repo shape that can later accept `.claude-plugin/` without moving shared skill files.

- [ ] **Step 1: Create repo directories**

Run:

```powershell
New-Item -ItemType Directory -Force `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\.codex-plugin", `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\hooks", `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\skills", `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\docs", `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\examples", `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\assets", `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\.github\ISSUE_TEMPLATE"
```

Expected: directories exist.

- [ ] **Step 2: Add Codex plugin manifest**

Create `superpowers-architecture/.codex-plugin/plugin.json`:

```json
{
  "name": "superpowers-architecture",
  "version": "0.1.0",
  "description": "Architecture-first Superpowers for Codex: design understanding, planning, TDD, reviews, and implementation workflows.",
  "author": {
    "name": "Nenad"
  },
  "homepage": "https://github.com/nenad/superpowers-architecture",
  "repository": "https://github.com/nenad/superpowers-architecture",
  "license": "MIT",
  "keywords": [
    "codex",
    "agent-skills",
    "superpowers",
    "architecture",
    "tdd",
    "developer-tools"
  ],
  "skills": "./skills/",
  "hooks": "./hooks/hooks-codex.json",
  "interface": {
    "displayName": "Superpowers Architecture",
    "shortDescription": "Architecture-first Superpowers workflow for Codex",
    "longDescription": "Use Superpowers Architecture to guide Codex through design understanding, local specs, exact implementation plans, TDD, reviews, and final verification summaries.",
    "developerName": "Nenad",
    "category": "Coding",
    "capabilities": [
      "Interactive",
      "Read",
      "Write"
    ],
    "defaultPrompt": [
      "I have a feature idea and want to design it before implementation.",
      "Help me turn this ticket into an architecture-aware implementation plan."
    ],
    "websiteURL": "https://github.com/nenad/superpowers-architecture",
    "privacyPolicyURL": "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
    "termsOfServiceURL": "https://docs.github.com/en/site-policy/github-terms/github-terms-of-service",
    "brandColor": "#2563EB",
    "composerIcon": "./assets/superpowers-architecture-small.svg",
    "logo": "./assets/app-icon.png",
    "screenshots": []
  }
}
```

- [ ] **Step 3: Add Codex hook configuration**

Create `superpowers-architecture/hooks/hooks-codex.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear",
        "hooks": [
          {
            "type": "command",
            "command": "\"${PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start-codex",
            "async": false
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 4: Add Codex session-start bootstrap**

Create `superpowers-architecture/hooks/session-start-codex`:

```bash
#!/usr/bin/env bash
# Codex SessionStart hook for superpowers-architecture plugin

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

using_superpowers_content=$(cat "${PLUGIN_ROOT}/skills/using-superpowers/SKILL.md" 2>&1 || echo "Error reading using-superpowers skill")

escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

using_superpowers_escaped=$(escape_for_json "$using_superpowers_content")
session_context="<EXTREMELY_IMPORTANT>\nYou have Superpowers Architecture.\n\nBelow is the full content of your 'superpowers-architecture:using-superpowers' skill. For all other skills, follow Codex skill-loading behavior and the instructions in that skill.\n\n${using_superpowers_escaped}\n</EXTREMELY_IMPORTANT>"

printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$session_context" | cat

exit 0
```

- [ ] **Step 5: Add cross-platform hook wrapper**

Copy `superpowers/hooks/run-hook.cmd` into `superpowers-architecture/hooks/run-hook.cmd` unchanged.

Run:

```powershell
Copy-Item -LiteralPath "C:\Users\nenad\OneDrive\Desktop\skills\superpowers\hooks\run-hook.cmd" `
  -Destination "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\hooks\run-hook.cmd"
```

Expected: `run-hook.cmd` exists.

- [ ] **Step 6: Add package metadata**

Create `superpowers-architecture/package.json`:

```json
{
  "name": "superpowers-architecture",
  "version": "0.1.0",
  "description": "Architecture-first Superpowers workflow for Codex",
  "private": false,
  "license": "MIT",
  "keywords": [
    "codex",
    "agent-skills",
    "superpowers",
    "architecture",
    "tdd",
    "developer-tools"
  ]
}
```

- [ ] **Step 7: Add MIT license**

Create `superpowers-architecture/LICENSE`:

```text
MIT License

Copyright (c) 2026 Nenad

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 8: Add upstream attribution notice**

Create `superpowers-architecture/NOTICE.md`:

```markdown
# Notice

Superpowers Architecture is an independent project.

It adapts ideas, workflow structure, and selected MIT-licensed material from:

- [obra/superpowers](https://github.com/obra/superpowers), copyright 2025 Jesse Vincent
- [mattpocock/skills](https://github.com/mattpocock/skills), copyright 2026 Matt Pocock

This project is not affiliated with, endorsed by, or maintained by either upstream project.

The goal is a narrower workflow: architecture-first Superpowers for Codex, with local specs and plans, worktree-aware implementation, code commits, TDD, reviews, and phase-separated fresh sessions.
```

- [ ] **Step 9: Add initial changelog**

Create `superpowers-architecture/CHANGELOG.md`:

```markdown
# Changelog

## 0.1.0

- Initial Codex-first release.
- Adds architecture-first brainstorming.
- Keeps local specs, exact implementation plans, TDD, reviews, worktree workflow, and code commits.
- Removes visual companion, context files, ADRs, issue/PRD/triage flow, and default merge/PR/discard finish menu.
```

- [ ] **Step 10: Commit scaffold**

Run from `superpowers-architecture`:

```powershell
git init
git add .codex-plugin hooks package.json LICENSE NOTICE.md CHANGELOG.md
git commit -m "chore: scaffold superpowers architecture plugin"
```

Expected: one initial commit. Do not stage generated downstream `docs/superpowers/**`; none should exist in this repo at this point.

---

## Task 2: Copy Baseline Superpowers Skills

**Files:**
- Create: `superpowers-architecture/skills/**`

**Interfaces:**
- Produces the core workflow skill set.
- Keeps skill folder names compatible with Codex and future Claude plugin layout.

- [ ] **Step 1: Copy required baseline skill folders**

Run:

```powershell
$src = "C:\Users\nenad\OneDrive\Desktop\skills\superpowers\skills"
$dst = "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\skills"

$skills = @(
  "brainstorming",
  "dispatching-parallel-agents",
  "executing-plans",
  "finishing-a-development-branch",
  "receiving-code-review",
  "requesting-code-review",
  "subagent-driven-development",
  "systematic-debugging",
  "test-driven-development",
  "using-git-worktrees",
  "using-superpowers",
  "verification-before-completion",
  "writing-plans"
)

foreach ($skill in $skills) {
  Copy-Item -Recurse -Force -LiteralPath (Join-Path $src $skill) -Destination (Join-Path $dst $skill)
}
```

Expected: all listed folders exist under `superpowers-architecture/skills/`.

- [ ] **Step 2: Copy Matt architecture skill folders**

Run:

```powershell
$matt = "C:\Users\nenad\OneDrive\Desktop\skills\skills\skills\engineering"
$dst = "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\skills"

Copy-Item -Recurse -Force -LiteralPath (Join-Path $matt "codebase-design") -Destination (Join-Path $dst "codebase-design")
Copy-Item -Recurse -Force -LiteralPath (Join-Path $matt "improve-codebase-architecture") -Destination (Join-Path $dst "improve-codebase-architecture")
```

Expected: `codebase-design` and `improve-codebase-architecture` exist under `skills/`.

- [ ] **Step 3: Remove visual companion scripts and references from copied brainstorming folder**

Delete only these copied files from the new plugin:

```powershell
Remove-Item -Recurse -Force `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\skills\brainstorming\scripts", `
  "C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture\skills\brainstorming\visual-companion.md"
```

Expected: `skills/brainstorming/scripts` and `skills/brainstorming/visual-companion.md` do not exist in the new repo.

- [ ] **Step 4: Commit copied baseline**

Run from `superpowers-architecture`:

```powershell
git add skills
git commit -m "chore: add baseline workflow skills"
```

Expected: commit contains only skill files copied into the plugin repo.

---

## Task 3: Rewrite `using-superpowers` For This Plugin

**Files:**
- Modify: `superpowers-architecture/skills/using-superpowers/SKILL.md`
- Modify: `superpowers-architecture/skills/using-superpowers/references/codex-tools.md`

**Interfaces:**
- Session-start bootstrap loads this skill.
- The skill must tell Codex to use Architecture-first Superpowers before creative coding tasks.

- [ ] **Step 1: Replace upstream branding and scope**

Modify `skills/using-superpowers/SKILL.md` so it states:

```markdown
---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use Superpowers Architecture skills before design, planning, implementation, debugging, or review work
---

# Using Superpowers Architecture

Superpowers Architecture is an architecture-first software development workflow for Codex.

If a skill applies to the task, use it before acting. For feature work, the default phase flow is:

1. `brainstorming` writes and reviews a local architecture-aware spec.
2. A fresh session uses `writing-plans` to create an exact implementation plan from that spec.
3. A fresh session uses `subagent-driven-development` or `executing-plans` to implement from that plan.

Generated downstream files under `docs/superpowers/**` are local developer working state. Do not stage or commit them unless the user explicitly asks.
```

Keep the existing strict skill-use rules from Superpowers unless they conflict with the new phase boundaries.

- [ ] **Step 2: Update process priority**

Ensure the skill priority section says:

```markdown
## Skill Priority

1. `brainstorming` for new feature work, behavior changes, architecture changes, or unclear requirements.
2. `systematic-debugging` for bugs, failing tests, broken builds, regressions, or unexpected behavior.
3. `writing-plans` only when an approved local spec path is available.
4. `subagent-driven-development` or `executing-plans` only when an approved local plan path is available.
5. `verification-before-completion` before any completion claim.
```

- [ ] **Step 3: Add phase-boundary rule**

Add:

```markdown
## Phase Boundaries

Do not automatically continue from spec to plan or from plan to implementation in the same session.

At the end of brainstorming, stop and provide the exact next-session prompt for planning.
At the end of planning, stop and provide the exact next-session prompt for implementation.
Implementation starts only from an explicit plan path.
```

- [ ] **Step 4: Commit using-superpowers rewrite**

Run:

```powershell
git add skills/using-superpowers
git commit -m "feat: define architecture-first bootstrap workflow"
```

Expected: `using-superpowers` describes the plugin-specific flow and local docs rule.

---

## Task 4: Rewrite `brainstorming` As Architecture-First Spec Creation

**Files:**
- Modify: `superpowers-architecture/skills/brainstorming/SKILL.md`

**Interfaces:**
- Input: user prompt, pasted spec, Jira URL/key if connector is available.
- Output: local spec file under `docs/superpowers/specs/`.
- Terminal state: stop after written spec review and print next-session planning prompt.

- [ ] **Step 1: Replace frontmatter**

Use this frontmatter:

```markdown
---
name: brainstorming
description: "Use before feature work, architecture changes, behavior changes, new components, or unclear requirements. Explores intent, design understanding, module shape, interfaces, seams, and test surface before planning or implementation."
---
```

- [ ] **Step 2: Define the hard gate**

The skill body must include:

```markdown
<HARD-GATE>
Do not write implementation code, scaffold production files, create implementation plans, or invoke implementation skills until the written local spec has been approved by the user.
</HARD-GATE>
```

- [ ] **Step 3: Add source-input rules**

Add:

```markdown
## Inputs

Start from the user prompt. If the prompt contains a Jira ticket key or URL and Atlassian tools are available, read the ticket and relevant comments read-only. If tools are unavailable, ask the user to paste the ticket content or continue from the prompt.

Never comment on or update Jira unless the user explicitly asks.
```

- [ ] **Step 4: Add exploration rules**

Add:

```markdown
## Explore Project Context

Before asking design questions:

- Inspect the repo shape enough to identify affected backend, frontend, mobile, shared, or infrastructure areas.
- Search for related modules, tests, and prior patterns.
- Search local `docs/superpowers/specs/` and `docs/superpowers/architecture-reviews/` if they exist.
- Do not create or update `context.md`.
- Do not create ADRs.
- Do not offer or use a visual companion.
```

- [ ] **Step 5: Add adaptive grilling loop**

Add:

```markdown
## Adaptive Architecture Grilling

Ask concise questions until the design is decision-complete. Increase rigor when language, module ownership, interfaces, seams, test surface, or acceptance criteria are unclear.

Use the vocabulary from `codebase-design`:

- **Module**: anything with an interface and implementation.
- **Interface**: everything callers must know to use the module correctly.
- **Seam**: where an interface lives and behavior can be altered without editing in place.
- **Adapter**: concrete thing satisfying an interface at a seam.
- **Depth**: leverage at the interface.
- **Leverage**: capability callers get from the interface.
- **Locality**: change and verification concentrated in one place.

Challenge shallow designs. Prefer deep modules with small interfaces, clear seams, and tests through the public interface.
```

- [ ] **Step 6: Add required spec format**

Add this exact spec skeleton:

```markdown
# <Feature Name> Design Spec

**Source:** <user prompt, pasted spec, or Jira reference>
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

- [ ] **Step 7: Add local write rules**

Add:

```markdown
## Writing The Spec

Write the approved spec to:

`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`

These files are local developer working state. Do not commit them. If `docs/superpowers/**` is not ignored, warn the user but do not edit `.gitignore` automatically.
```

- [ ] **Step 8: Add written-spec review gate**

Add:

```markdown
## Written Spec Review Gate

After writing the spec, ask:

"Spec written to `<path>`. Please review it before planning. I will not create an implementation plan until you approve this written spec."

If the user requests changes, update the spec and repeat the review gate.
```

- [ ] **Step 9: Add next-session handoff**

Add:

```markdown
## Terminal State

After the user approves the written spec, stop. Do not invoke `writing-plans` in the same session.

Print:

```text
Start a fresh session in the same checkout and say:

Use the writing-plans skill to create an implementation plan from:
<absolute-or-repo-relative-spec-path>

Read the spec and codebase fresh. Save the plan under docs/superpowers/plans/. Stop after the written plan is reviewed.
```
```

- [ ] **Step 10: Commit brainstorming rewrite**

Run:

```powershell
git add skills/brainstorming/SKILL.md
git commit -m "feat: add architecture-first brainstorming workflow"
```

Expected: brainstorming no longer references visual companion, spec commits, context files, ADRs, or automatic planning.

---

## Task 5: Add `codebase-design` As Architecture Vocabulary

**Files:**
- Modify: `superpowers-architecture/skills/codebase-design/SKILL.md`
- Keep: `superpowers-architecture/skills/codebase-design/DEEPENING.md`
- Keep: `superpowers-architecture/skills/codebase-design/DESIGN-IT-TWICE.md`

**Interfaces:**
- Other skills reference `codebase-design` for terms and principles.

- [ ] **Step 1: Normalize frontmatter**

Ensure `skills/codebase-design/SKILL.md` uses:

```markdown
---
name: codebase-design
description: Use when designing or improving module interfaces, deciding where seams go, deepening shallow modules, making code testable, or applying architecture vocabulary during brainstorming, planning, review, or refactoring.
---
```

- [ ] **Step 2: Keep Matt vocabulary intact**

Preserve these exact terms and definitions in substance:

- Module
- Interface
- Implementation
- Depth
- Seam
- Adapter
- Leverage
- Locality

Do not rename "seam" to "boundary." Do not narrow "interface" to a language keyword.

- [ ] **Step 3: Add Superpowers integration note**

Add:

```markdown
## Integration With Superpowers Architecture

Use this skill during:

- `brainstorming` to shape Design Understanding.
- `writing-plans` to preserve module/interface/seam decisions.
- implementation review to detect shallow modules, leaky seams, and tests that cross the wrong interface.

Do not create `context.md` or ADRs from this skill in this plugin. Put feature-specific architecture decisions into the local spec or architecture review.
```

- [ ] **Step 4: Commit codebase-design integration**

Run:

```powershell
git add skills/codebase-design
git commit -m "feat: add codebase design vocabulary"
```

Expected: skill is discoverable and plugin-specific integration is clear.

---

## Task 6: Rewrite `writing-plans` For Fresh Planning Sessions

**Files:**
- Modify: `superpowers-architecture/skills/writing-plans/SKILL.md`

**Interfaces:**
- Input: approved spec path.
- Output: local plan under `docs/superpowers/plans/`.
- Terminal state: stop after written plan review and print next-session implementation prompt.

- [ ] **Step 1: Update frontmatter**

Use:

```markdown
---
name: writing-plans
description: Use when an approved local design spec exists and an exact implementation plan is needed before code changes
---
```

- [ ] **Step 2: Preserve exact-code planning style**

Keep these requirements:

- exact files
- exact interfaces
- exact commands
- expected outputs
- failing tests before implementation
- minimal implementation steps
- task commits
- no vague placeholders

- [ ] **Step 3: Add required input contract**

Add:

```markdown
## Required Input

Start only from an approved local spec path. Read the spec from disk and inspect the codebase fresh. Do not rely on prior conversation context.

If no spec path is provided, ask for it. Do not infer the feature from memory.
```

- [ ] **Step 4: Add local plan path**

Add:

```markdown
## Save Plans To

`docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`

Plans are local developer working state. Do not commit them. If `docs/superpowers/**` is not ignored, warn the user but do not edit `.gitignore` automatically.
```

- [ ] **Step 5: Add commit hygiene rule**

Add:

```markdown
## Commit Hygiene

Task commit steps may commit code, tests, migrations, and project documentation that the user explicitly wants committed.

Never include `docs/superpowers/**` in `git add` examples unless the user explicitly requests committing local Superpowers docs.
```

- [ ] **Step 6: Keep plan header and add spec reference**

Plan header must be:

```markdown
# <Feature Name> Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `<path-to-approved-spec>`
**Goal:** <one sentence>
**Architecture:** <2-3 sentences using Design Understanding from the spec>
**Tech Stack:** <key technologies/libraries>

## Global Constraints

<Exact constraints copied from the spec. Include local-doc commit hygiene.>

---
```

- [ ] **Step 7: Add written-plan review gate**

Add:

```markdown
## Written Plan Review Gate

After writing the plan, ask:

"Plan written to `<path>`. Please review it before implementation. I will not start implementation until you approve this written plan."

If the user requests changes, update the plan and repeat the review gate.
```

- [ ] **Step 8: Add next-session implementation handoff**

Add:

```markdown
## Terminal State

After the user approves the written plan, stop. Do not invoke implementation skills in the same session.

Print:

```text
Start a fresh session in the same checkout and say:

Use subagent-driven-development to implement:
<absolute-or-repo-relative-plan-path>

Read the plan, referenced spec, and codebase fresh. Use worktree isolation if I request it or if one is already active. Commit code per task, but never commit docs/superpowers/** unless I explicitly ask.
```
```

- [ ] **Step 9: Commit writing-plans rewrite**

Run:

```powershell
git add skills/writing-plans/SKILL.md
git commit -m "feat: make planning a fresh-session phase"
```

Expected: `writing-plans` no longer offers same-session execution by default.

---

## Task 7: Adapt Worktree Workflow Without Auto-Gitignore Edits

**Files:**
- Modify: `superpowers-architecture/skills/using-git-worktrees/SKILL.md`

**Interfaces:**
- Worktree skill remains available.
- It asks before creating worktrees unless explicitly requested.
- It does not auto-edit `.gitignore`.

- [ ] **Step 1: Keep existing detection logic**

Preserve:

- existing isolation detection
- submodule guard
- preference for native worktree tools
- fallback to git worktree
- baseline setup and test verification

- [ ] **Step 2: Replace auto-ignore behavior**

Replace any instruction that says to add `.worktrees/` or `worktrees/` to `.gitignore` and commit it.

Use:

```markdown
## Ignore Safety

Before creating a project-local worktree directory, verify it is ignored.

If it is not ignored, stop and ask the user whether to:

1. add the ignore rule themselves,
2. allow you to edit `.gitignore`, or
3. choose a different worktree location.

Do not edit or commit `.gitignore` automatically.
```

- [ ] **Step 3: Add local Superpowers docs warning**

Add:

```markdown
If `docs/superpowers/**` exists and is tracked or unignored, warn the user before implementation. Do not modify `.gitignore` automatically.
```

- [ ] **Step 4: Commit worktree adaptation**

Run:

```powershell
git add skills/using-git-worktrees/SKILL.md
git commit -m "feat: keep worktrees user-controlled"
```

Expected: worktrees remain available but no automatic `.gitignore` mutation occurs.

---

## Task 8: Adapt Implementation Skills For Local Docs And Phase Boundaries

**Files:**
- Modify: `superpowers-architecture/skills/subagent-driven-development/SKILL.md`
- Modify: `superpowers-architecture/skills/executing-plans/SKILL.md`
- Modify: `superpowers-architecture/skills/finishing-a-development-branch/SKILL.md`

**Interfaces:**
- Implementation starts from a plan path.
- Code commits remain allowed.
- Local Superpowers docs are never committed.
- Finish produces verification summary instead of merge/PR/discard menu.

- [ ] **Step 1: Update subagent-driven-development required input**

Add near the top:

```markdown
## Required Input

Start only from a written implementation plan path. Read the plan, referenced spec, and codebase from disk. Do not rely on prior conversation context.
```

- [ ] **Step 2: Keep task commits and review package workflow**

Preserve:

- task brief extraction
- implementer report files
- task review packages
- task commits
- final whole-branch review
- progress ledger

- [ ] **Step 3: Add local docs commit guard**

Add:

```markdown
## Local Superpowers Docs Guard

Before each task commit, inspect staged files. If any path under `docs/superpowers/` is staged, unstage it unless the user explicitly requested committing local Superpowers docs.

Use:

```bash
git diff --cached --name-only
git restore --staged docs/superpowers 2>/dev/null || true
```
```

- [ ] **Step 4: Update executing-plans similarly**

Add the same required input and local docs guard to `skills/executing-plans/SKILL.md`.

- [ ] **Step 5: Rewrite finish skill as verification summary**

Replace merge/PR/discard menu behavior in `skills/finishing-a-development-branch/SKILL.md` with:

```markdown
---
name: finishing-a-development-branch
description: Use when implementation tasks are complete and final verification, commit summary, changed-file summary, and residual risk summary are needed
---

# Finishing A Development Branch

Verify the work and summarize it. Do not push, merge, open a PR, or discard work unless the user explicitly asks.

## Process

1. Read the plan and referenced spec.
2. Run the final verification commands required by the plan.
3. Check git status.
4. Confirm `docs/superpowers/**` is not staged.
5. Summarize:
   - commits created
   - changed files
   - tests run and results
   - requirements satisfied
   - remaining risks or manual checks
6. Stop.

## Explicit Requests

If the user explicitly asks to push, merge, open a PR, or discard work, handle that request directly with normal git safety checks.
```

- [ ] **Step 6: Commit implementation skill adaptations**

Run:

```powershell
git add skills/subagent-driven-development skills/executing-plans skills/finishing-a-development-branch
git commit -m "feat: adapt implementation flow for local docs"
```

Expected: implementation skills support fresh sessions, code commits, and local-doc exclusions.

---

## Task 9: Adapt Architecture Review Skill To Markdown-Only Local Reviews

**Files:**
- Modify: `superpowers-architecture/skills/improve-codebase-architecture/SKILL.md`
- Remove or ignore: `superpowers-architecture/skills/improve-codebase-architecture/HTML-REPORT.md`

**Interfaces:**
- Input: repo or selected area.
- Output: markdown architecture review under `docs/superpowers/architecture-reviews/`.

- [ ] **Step 1: Update frontmatter**

Use:

```markdown
---
name: improve-codebase-architecture
description: Use when scanning a codebase for shallow modules, unclear interfaces, weak seams, poor test surfaces, or architecture refactoring opportunities
---
```

- [ ] **Step 2: Replace HTML report requirement**

Replace the report section with:

```markdown
## Present Candidates As Markdown

Write a markdown review to:

`docs/superpowers/architecture-reviews/YYYY-MM-DD-<topic>.md`

The review is local developer working state. Do not commit it unless explicitly requested.

Each candidate must include:

- Files/modules involved
- Problem
- Proposed deepening
- Interface/seam impact
- Test-surface impact
- Benefits in locality and leverage
- Recommendation strength: Strong, Worth exploring, or Speculative

End with a top recommendation.
```

- [ ] **Step 3: Keep Matt vocabulary**

Ensure the skill uses:

- module
- interface
- seam
- adapter
- depth
- leverage
- locality

- [ ] **Step 4: Remove HTML dependency references**

Delete instructions requiring:

- Tailwind CDN
- Mermaid CDN
- browser opening
- temporary HTML files
- visual report cards

- [ ] **Step 5: Commit architecture review adaptation**

Run:

```powershell
git add skills/improve-codebase-architecture
git commit -m "feat: make architecture reviews local markdown"
```

Expected: architecture review skill is markdown-only.

---

## Task 10: Add Public Documentation

**Files:**
- Create: `superpowers-architecture/README.md`
- Create: `superpowers-architecture/docs/installation.md`
- Create: `superpowers-architecture/docs/workflow.md`
- Create: `superpowers-architecture/docs/design-understanding.md`
- Create: `superpowers-architecture/docs/architecture-review.md`
- Create: `superpowers-architecture/docs/claude-roadmap.md`

**Interfaces:**
- README explains the project quickly.
- Docs explain install, workflow, design understanding, architecture reviews, and Claude roadmap.

- [ ] **Step 1: Write README**

Create `README.md` with these sections:

```markdown
# Superpowers Architecture

Architecture-first Superpowers for Codex.

Superpowers Architecture is a Codex skill pack for developers who want an agent to agree on design before it writes plans or code. It keeps the best parts of Superpowers - specs, plans, TDD, reviews, and implementation discipline - and strengthens the first step with module, interface, seam, and test-surface thinking inspired by Matt Pocock's engineering skills.

## Why

Coding agents often jump from a rough ticket to implementation. That is fast, but it creates shallow modules, unclear interfaces, brittle tests, and rework.

This plugin makes the agent stop first and build **Design Understanding**:

- what the feature actually means
- which modules are involved
- where interfaces and seams belong
- what should be tested through which surface
- what architecture constraints must survive implementation

## Quickstart

Codex support is first. Claude support is planned.

### Local Development Install

1. Clone this repo.
2. Add it as a local Codex plugin or install it through your local Codex plugin marketplace.
3. Start a fresh Codex session.
4. Say: `I want to design a feature before implementation.`

## Workflow

1. `brainstorming` writes and reviews a local design spec.
2. Start a fresh session.
3. `writing-plans` writes and reviews an implementation plan from the spec.
4. Start a fresh session.
5. `subagent-driven-development` implements the plan with TDD, reviews, and code commits.
6. `finishing-a-development-branch` verifies and summarizes the work.

## Local Working Docs

Generated downstream docs are local per-developer working state:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/superpowers/architecture-reviews/`

Do not commit them unless you explicitly choose to.

## What Changed From Superpowers

- Architecture-first brainstorming.
- Phase-separated fresh sessions.
- Local gitignored specs and plans.
- Worktree workflow remains available.
- Code commits remain allowed.
- Visual companion removed.
- `context.md` and ADRs removed.
- Issue/PRD/triage flow not included.
- Default merge/PR/discard finish menu replaced with verification summary.

## Attribution

This project adapts ideas and selected MIT-licensed material from:

- `obra/superpowers`
- `mattpocock/skills`

It is independent and not officially affiliated with either project.
```

- [ ] **Step 2: Write installation docs**

Create `docs/installation.md` with:

```markdown
# Installation

## Codex

V1 targets Codex.

### Local Development

Clone the repo:

```powershell
git clone https://github.com/nenad/superpowers-architecture.git
```

Install it through your Codex local plugin workflow. If you maintain a personal Codex marketplace, add this plugin to that marketplace and install it from the Codex app.

## Claude

Claude support is not shipped in V1. See `docs/claude-roadmap.md`.
```

- [ ] **Step 3: Write workflow docs**

Create `docs/workflow.md` explaining:

- brainstorming session
- spec review gate
- fresh planning session
- plan review gate
- fresh implementation session
- worktree option
- code commits
- final verification summary
- local docs are not committed

- [ ] **Step 4: Write design understanding docs**

Create `docs/design-understanding.md` explaining the spec section:

```markdown
# Design Understanding

Every spec must include Design Understanding before planning.

## Language

Use preferred terms and `_Avoid_` synonyms when language is overloaded.

## Architecture

Capture modules, interfaces, seams, adapters, data flow, and test surface.

## Test Surface

Tests should verify behavior through the correct interface. If a test must reach past the interface, the module shape is probably wrong.
```

- [ ] **Step 5: Write architecture review docs**

Create `docs/architecture-review.md` explaining markdown architecture reviews and recommendation strengths.

- [ ] **Step 6: Write Claude roadmap**

Create `docs/claude-roadmap.md`:

```markdown
# Claude Roadmap

V1 is Codex-first.

Claude support should add:

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `hooks/hooks.json`
- Claude-specific `session-start` hook using `${CLAUDE_PLUGIN_ROOT}`

Shared skill files should remain in `skills/<skill>/SKILL.md`.

Claude plugin skills are namespaced, for example:

```text
/superpowers-architecture:brainstorming
```
```

- [ ] **Step 7: Commit docs**

Run:

```powershell
git add README.md docs
git commit -m "docs: explain architecture-first workflow"
```

Expected: public docs are committed.

---

## Task 11: Add Examples

**Files:**
- Create: `superpowers-architecture/examples/simple-feature-spec.md`
- Create: `superpowers-architecture/examples/architecture-heavy-spec.md`

**Interfaces:**
- Examples demonstrate output quality and make the repo easier to understand.

- [ ] **Step 1: Add simple feature spec example**

Create `examples/simple-feature-spec.md` with a small feature spec using the required Design Understanding structure.

Use a neutral example such as adding account notification preferences. Include:

- Problem
- Goal
- Non-Goals
- Design Understanding
- User-Facing Behavior
- Implementation Shape
- Testing Strategy
- Acceptance Criteria

- [ ] **Step 2: Add architecture-heavy spec example**

Create `examples/architecture-heavy-spec.md` with a feature where module/interface/seam decisions matter.

Use a neutral example such as subscription renewal retry handling. Include:

- language choices
- modules involved
- interface definition
- seam placement
- adapters
- test surface
- key decisions
- open risks

- [ ] **Step 3: Commit examples**

Run:

```powershell
git add examples
git commit -m "docs: add example architecture specs"
```

Expected: examples are committed and referenced from README.

---

## Task 12: Add GitHub Project Hygiene

**Files:**
- Create: `superpowers-architecture/.github/PULL_REQUEST_TEMPLATE.md`
- Create: `superpowers-architecture/.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `superpowers-architecture/.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `superpowers-architecture/.github/ISSUE_TEMPLATE/config.yml`

**Interfaces:**
- Public contributors get clear expectations.
- Maintainers can ask for real workflow evidence before accepting skill behavior changes.

- [ ] **Step 1: Add PR template**

Create `.github/PULL_REQUEST_TEMPLATE.md` with:

```markdown
## Problem

What workflow problem does this solve?

## Change

What changed?

## Skill Behavior

If this changes skill behavior, include before/after examples or transcripts.

## Testing

- [ ] Codex plugin manifest validates
- [ ] Skill frontmatter validates
- [ ] Clean-session smoke test performed
- [ ] Local docs were not committed accidentally

## Attribution

- [ ] This PR does not imply official affiliation with upstream projects
- [ ] Upstream material remains MIT-attributed where relevant
```

- [ ] **Step 2: Add issue templates**

Create concise issue templates:

- bug report asks for Codex version, plugin version, prompt, expected behavior, actual behavior, and whether local docs were gitignored.
- feature request asks for the concrete workflow problem, proposed behavior, and whether the feature belongs in architecture-first workflow.

- [ ] **Step 3: Commit GitHub metadata**

Run:

```powershell
git add .github
git commit -m "chore: add github contribution templates"
```

Expected: GitHub templates exist.

---

## Task 13: Validate Plugin And Skills

**Files:**
- Inspect: `superpowers-architecture/.codex-plugin/plugin.json`
- Inspect: `superpowers-architecture/skills/**/SKILL.md`
- Modify only files with validation failures.

**Interfaces:**
- Plugin must be installable by Codex.
- Skill frontmatter must be valid.

- [ ] **Step 1: Validate JSON files**

Run:

```powershell
Get-ChildItem -Path . -Recurse -Filter *.json | ForEach-Object {
  try {
    Get-Content -Raw $_.FullName | ConvertFrom-Json | Out-Null
    Write-Host "OK $($_.FullName)"
  } catch {
    Write-Error "Invalid JSON: $($_.FullName)"
    throw
  }
}
```

Expected: all JSON files parse.

- [ ] **Step 2: Check skill frontmatter presence**

Run:

```powershell
Get-ChildItem -Path .\skills -Recurse -Filter SKILL.md | ForEach-Object {
  $content = Get-Content -Raw $_.FullName
  if ($content -notmatch '^---\s*\r?\n') {
    throw "Missing YAML frontmatter: $($_.FullName)"
  }
  if ($content -notmatch 'name:\s*[a-z0-9-]+') {
    throw "Missing name field: $($_.FullName)"
  }
  if ($content -notmatch 'description:\s*') {
    throw "Missing description field: $($_.FullName)"
  }
  Write-Host "OK $($_.FullName)"
}
```

Expected: every `SKILL.md` has `name` and `description`.

- [ ] **Step 3: Check removed behavior is absent**

Run:

```powershell
rg "visual companion|visual-companion|CONTEXT.md|ADR|to-prd|triage|create a Pull Request|Merge back|Discard this work" skills README.md docs
```

Expected:

- No active visual companion instructions.
- No active `context.md` or ADR creation instructions.
- No included Matt issue/PRD/triage workflow.
- No default merge/PR/discard finish menu.

If matches are attribution, roadmap, or "removed features" documentation, keep them. If matches are active instructions, edit them out.

- [ ] **Step 4: Check local docs commit guard is present**

Run:

```powershell
rg "docs/superpowers" skills README.md docs
```

Expected:

- Brainstorming writes specs under `docs/superpowers/specs/`.
- Writing-plans writes plans under `docs/superpowers/plans/`.
- Architecture review writes reviews under `docs/superpowers/architecture-reviews/`.
- Implementation skills forbid staging or committing `docs/superpowers/**`.

- [ ] **Step 5: Commit validation fixes**

Run:

```powershell
git status --short
git add .codex-plugin hooks skills README.md docs examples .github package.json LICENSE NOTICE.md CHANGELOG.md
git commit -m "test: validate plugin structure"
```

Expected: commit exists only if validation required fixes. If there are no changes, skip commit.

---

## Task 14: Manual Smoke Test In Codex

**Files:**
- Inspect generated downstream test repo files.
- Do not commit downstream `docs/superpowers/**`.

**Interfaces:**
- Clean session should auto-load `using-superpowers`.
- Feature prompt should trigger `brainstorming`.
- Phase boundaries should hold.

- [ ] **Step 1: Install plugin locally in Codex**

Use the local Codex plugin installation workflow for `C:\Users\nenad\OneDrive\Desktop\skills\superpowers-architecture`.

Expected: plugin appears as `Superpowers Architecture`.

- [ ] **Step 2: Run clean-session brainstorming smoke test**

In a fresh Codex session in a disposable test repo, prompt:

```text
Let's make a react todo list
```

Expected:

- Agent invokes `brainstorming`.
- Agent does not write code.
- Agent explores project context first.
- Agent asks design questions.
- Agent does not offer visual companion.

- [ ] **Step 3: Complete a tiny spec**

Approve a very small spec.

Expected:

- Spec is written under `docs/superpowers/specs/`.
- Spec includes `Design Understanding`.
- Agent asks for written spec review.
- Agent stops after approval and prints the next-session planning prompt.

- [ ] **Step 4: Run fresh planning session**

Start a fresh session in the same checkout with the printed planning prompt.

Expected:

- Agent reads the spec from disk.
- Agent writes plan under `docs/superpowers/plans/`.
- Plan uses exact-code Superpowers style.
- Plan commit steps do not include `docs/superpowers/**`.
- Agent stops after plan review and prints implementation prompt.

- [ ] **Step 5: Run implementation session**

Start a fresh session with the printed implementation prompt.

Expected:

- Agent reads plan and referenced spec from disk.
- Agent offers or uses worktree flow only when requested or already active.
- Agent commits code per task.
- Agent does not commit local Superpowers docs.
- Agent ends with verification summary.

- [ ] **Step 6: Record smoke test result**

Add a short section to `CHANGELOG.md` or a release note draft only if useful for public release notes. Do not commit generated downstream specs/plans from the test repo.

---

## Task 15: Prepare GitHub Release-Ready Repo

**Files:**
- Modify: `superpowers-architecture/README.md`
- Modify: `superpowers-architecture/docs/installation.md`
- Modify: `superpowers-architecture/package.json`
- Modify: `superpowers-architecture/.codex-plugin/plugin.json`

**Interfaces:**
- Repo is ready to push to GitHub.
- URLs point to the actual repository.

- [ ] **Step 1: Verify GitHub URLs**

Create the GitHub repo as:

```text
https://github.com/nenad/superpowers-architecture
```

Verify these fields already point to that URL:

- `.codex-plugin/plugin.json` `homepage`
- `.codex-plugin/plugin.json` `repository`
- `.codex-plugin/plugin.json` `interface.websiteURL`
- `package.json` repository field if added
- README clone/install commands

Use the actual GitHub repository URL.

- [ ] **Step 2: Add GitHub topics**

In GitHub repo settings, add:

```text
codex
agent-skills
superpowers
ai-coding
architecture
tdd
developer-tools
```

- [ ] **Step 3: Final local verification**

Run:

```powershell
git status --short
git log --oneline -5
```

Expected:

- Working tree is clean.
- Recent commits match scaffold, skills, docs, examples, validation.

- [ ] **Step 4: Push initial repo**

Run:

```powershell
git branch -M main
git remote add origin https://github.com/nenad/superpowers-architecture.git
git push -u origin main
```

Expected: repo is visible on GitHub.

---

## Self-Review Checklist

- [ ] Plan covers Codex plugin scaffold.
- [ ] Plan keeps Claude future-proof layout without adding Claude support in V1.
- [ ] Plan includes architecture-first brainstorming.
- [ ] Plan includes fresh-session phase boundaries.
- [ ] Plan keeps worktree workflow.
- [ ] Plan allows code commits.
- [ ] Plan forbids committing downstream `docs/superpowers/**` unless explicitly requested.
- [ ] Plan removes visual companion.
- [ ] Plan removes context and ADR workflow.
- [ ] Plan removes Matt issue/PRD/triage flow.
- [ ] Plan replaces default finish menu with verification summary.
- [ ] Plan includes public repo docs and attribution.
- [ ] Plan includes validation and smoke testing.
