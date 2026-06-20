# AGENTS.md

## Purpose

Plugin hook manifests and hook runner scripts.

## Ownership

- Owns `hooks/hooks.json`.
- Owns `hooks/hooks-codex.json`.
- Owns `hooks/session-start-claude`.
- Owns hook scripts and cross-platform wrappers under `hooks/`.
- `.codex-plugin/AGENTS.md` owns the Codex plugin manifest that references these hooks.

## Local Contracts

- Keep Codex and Claude hook manifests separate: `hooks/hooks-codex.json` uses `${PLUGIN_ROOT}`, and `hooks/hooks.json` uses `${CLAUDE_PLUGIN_ROOT}`.
- Hook scripts must preserve phase-separated workflow priority by injecting `using-superpowers` context without creating implementation files.
- Claude hook output must follow Claude Code hook JSON, including `hookSpecificOutput.hookEventName`.

## Work Guidance

- Keep hook scripts cross-platform where practical.
- Keep hook output valid for the runtime that consumes it.
- Do not edit `.gitignore` from hook or worktree behavior.

## Verification

- Parse hook JSON after edits.
- Check script references and shell syntax for changed hook scripts.

## Child DOX Index

- No child AGENTS.md files.
