# Task 1 Report

## What You Implemented

- Preserved the existing root `AGENTS.md` phase-mode workflow goals and durable user preference bullet because they already matched the Task 1 brief.
- Updated `skills/using-superpowers/SKILL.md` to define the selected phase flow, Phase Modes, explicit approval requirements, updated phase boundaries, and the revised removed-behavior guard text.
- Updated `skills/project-setup/SKILL.md` terminal state so first brainstorming establishes phase mode and only same-session durable instructions can continue in-session.
- Updated `skills/brainstorming/SKILL.md` to add Phase Mode selection, record Phase Mode in the required spec shape, and switch the review gate and terminal behavior to mode-specific handoff behavior.
- Updated `skills/writing-plans/SKILL.md` to read Phase Mode from the approved spec or root `AGENTS.md`, record it in the plan header, and switch the review gate and terminal behavior to mode-specific implementation handoff behavior.
- Updated `skills/subagent-driven-development/SKILL.md` and `skills/executing-plans/SKILL.md` so both require approved plan paths, fresh disk reads, and wording that supports both fresh-session and same-session execution after plan approval.

## Validation Commands Run And Results

1. Phase-mode language and stale same-session-ban checks:

```powershell
rg -n "Phase Mode|automated fresh-session|same-session|selected Phase Mode" skills/using-superpowers/SKILL.md skills/brainstorming/SKILL.md skills/writing-plans/SKILL.md
rg -n "continue from project setup to spec, spec to plan, or plan to implementation in the same session|Do not automatically continue from project setup to spec" skills -g "SKILL.md"
```

- First command returned matches in all three required files.
- Second command returned no matches, which is the expected result.

2. SKILL frontmatter check:

```powershell
$skills = Get-ChildItem skills -Recurse -Filter SKILL.md
if ($skills.Count -ne 16) { throw "Expected 16 SKILL.md files, found $($skills.Count)" }
foreach ($s in $skills) {
  $c = Get-Content -Raw $s.FullName
  if ($c -notmatch '(?ms)^---.*^name:\s*.+' -or $c -notmatch '(?ms)^---.*^description:\s*.+') { throw "Missing frontmatter: $($s.FullName)" }
}
'skill frontmatter ok 16'
```

- Result: `skill frontmatter ok 16`

3. Staging and local-doc guard:

```powershell
git add AGENTS.md skills/using-superpowers/SKILL.md skills/project-setup/SKILL.md skills/brainstorming/SKILL.md skills/writing-plans/SKILL.md skills/subagent-driven-development/SKILL.md skills/executing-plans/SKILL.md
git diff --cached --name-only
$stagedLocalDocs = git diff --cached --name-only | Select-String '^docs/superpowers/'
if ($stagedLocalDocs) { throw 'docs/superpowers staged' } else { 'local docs not staged' }
```

- Expected staged paths were confirmed before commit.
- Result: `local docs not staged`

## Files Changed

- `AGENTS.md`
- `skills/using-superpowers/SKILL.md`
- `skills/project-setup/SKILL.md`
- `skills/brainstorming/SKILL.md`
- `skills/writing-plans/SKILL.md`
- `skills/subagent-driven-development/SKILL.md`
- `skills/executing-plans/SKILL.md`

## Self-Review Findings

- Task 1 wording matches the brief for all required inserted and replacement blocks.
- Root `AGENTS.md` phase-mode diff was preserved rather than rewritten.
- Validation commands from the brief were run exactly and produced the expected outcomes.
- No `docs/superpowers/**` paths were staged or committed.

## Issues Or Concerns

- No functional concerns for Task 1.
- Git warned that working-copy LF lines will be normalized to CRLF on future Git writes for the edited Markdown files. No task action was required.

## Task 1 Fix Commit: tighten phase mode persistence policy

### What Changed

- Updated `skills/using-superpowers/SKILL.md` so the phase boundary now requires an explicit approved plan path before implementation starts.
- Updated `skills/brainstorming/SKILL.md` so durable phase-mode persistence in downstream projects records the concrete selected Phase Mode, reason, and durability in root `AGENTS.md`, while keeping any existing generic first-`brainstorming` preference bullet intact unless the downstream project owner explicitly wants to replace it.
- Left this plugin repo's root `AGENTS.md` unchanged so the required generic user preference bullet remains exactly as specified for Task 1.

### Covering Checks

1. Approved-plan wording present, weakened wording absent:

```powershell
rg -n "Implementation starts only from an explicit approved plan path\.|Implementation starts only from an explicit plan path\." skills/using-superpowers/SKILL.md
rg -n "Implementation starts only from an explicit plan path\." skills/using-superpowers/SKILL.md
```

- First command result:

```text
71:Implementation starts only from an explicit approved plan path.
```

- Second command result: no matches.

2. Brainstorming now records a concrete selected Phase Mode in downstream root `AGENTS.md` when durable:

```powershell
rg -n "records the selected Phase Mode explicitly|selected mode, the reason, and that the preference is durable|Keep any existing generic first-`brainstorming` preference bullet intact" skills/brainstorming/SKILL.md
```

- Result:

```text
63:5. If root `AGENTS.md` exists and the user wants this preference to be durable for the project, propose a concrete root `AGENTS.md` update that records the selected Phase Mode explicitly, including the selected mode, the reason, and that the preference is durable for later approval gates. Keep any existing generic first-`brainstorming` preference bullet intact unless the downstream project owner explicitly asks to replace it.
```

3. Required generic root `AGENTS.md` user preference bullet remains intact:

```powershell
Select-String -Path AGENTS.md -Pattern '- During first `brainstorming`, ask whether approved next steps should use automated fresh sessions or same-session continuation; follow that selected phase mode for later approval gates.'
```

- Result:

```text
AGENTS.md:209:- During first `brainstorming`, ask whether approved next steps should use automated fresh sessions or same-session continuation; follow that selected phase mode for later approval gates.
```

4. SKILL frontmatter check:

```powershell
$skills = Get-ChildItem skills -Recurse -Filter SKILL.md
if ($skills.Count -ne 16) { throw "Expected 16 SKILL.md files, found $($skills.Count)" }
foreach ($s in $skills) {
  $c = Get-Content -Raw $s.FullName
  if ($c -notmatch '(?ms)^---.*^name:\s*.+' -or $c -notmatch '(?ms)^---.*^description:\s*.+') { throw "Missing frontmatter: $($s.FullName)" }
}
'skill frontmatter ok 16'
```

- Result:

```text
skill frontmatter ok 16
```

5. Staging guard before commit:

```powershell
git add .superpowers/sdd/task-1-report.md skills/using-superpowers/SKILL.md skills/brainstorming/SKILL.md
git diff --cached --name-only
$stagedLocalDocs = git diff --cached --name-only | Select-String '^docs/superpowers/'
if ($stagedLocalDocs) { throw 'docs/superpowers staged' } else { 'local docs not staged' }
```

- Expected staged files: `.superpowers/sdd/task-1-report.md`, `skills/brainstorming/SKILL.md`, `skills/using-superpowers/SKILL.md`
- The `docs/superpowers/**` guard must return `local docs not staged` before commit.
