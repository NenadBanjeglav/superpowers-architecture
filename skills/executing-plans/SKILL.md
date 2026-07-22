---
name: executing-plans
description: Use when executing written implementation plans linearly after written plan approval
---

# Executing Plans

## Required Input

Start only from an approved written Implementation Plan path and its exact expected `sha256:` revision. Resolve the sibling `using-superpowers` operation module and validate the plan as `Implementation Plan` at that revision before reading it for instructions.

Read the validated plan's `Spec` and `Spec Revision` fields, then validate that source artifact as an Approved `Design Spec` at the recorded revision. Only after both validations pass may you read the plan, referenced spec, and codebase from disk. Do not rely on prior conversation context, even in same-session mode after plan approval.

If either artifact is Draft, missing or duplicated lifecycle metadata, the wrong type, edited after approval, or at a different revision, stop and report the expected and actual values. Missing Node.js or a missing operation module also fails closed with the full-package installation guidance.

## Local Superpowers Docs Guard

Before each task commit, inspect staged files. If any path under `docs/superpowers/` is staged, unstage it unless the user explicitly requested committing local Superpowers docs.

Use:

```bash
git diff --cached --name-only
git restore --staged docs/superpowers 2>/dev/null || true
```

## Overview

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** If subagents are available and the plan's tasks are mostly independent, use `subagent-driven-development` instead of this skill. Use this skill for linear plans, no-subagent runtimes, or tasks that require tight sequential control.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with the user before starting
4. If no concerns: Create todos for the plan items and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

If implementation reveals that the approved modules, interfaces, seams, adapters, data flow, or test surface must change, stop before diverging. Run `artifact draft` on the controlling spec (and the dependent plan when applicable), return the artifact to user review, and resume only from newly Approved revisions.

### Step 3: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use `finishing-a-development-branch`
- Follow that skill to run final verification, confirm local Superpowers docs are not staged, summarize commits, changed files, tests, and risks, then stop unless the user explicitly asks to push, merge, open a PR, or discard work.

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent

## Integration

**Required workflow skills:**
- **using-git-worktrees** - Ensures isolated workspace (creates one or verifies existing)
- **writing-plans** - Creates the plan this skill executes
- **finishing-a-development-branch** - Complete development after all tasks
