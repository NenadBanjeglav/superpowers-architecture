# AGENTS.md

## Purpose

Plugin hook manifests and hook runner scripts.

## Ownership

- Owns `hooks/hooks-codex.json`.
- Owns `hooks/session-start-codex`.
- Owns hook scripts and cross-platform wrappers under `hooks/`.
- `.codex-plugin/AGENTS.md` owns the Codex plugin manifest that references these hooks.

## Local Contracts

- `hooks/hooks-codex.json` is the sole hook manifest and uses `${PLUGIN_ROOT}`. Launchers accept only `session-start-codex`.
- `skills/using-superpowers/SKILL.md` owns the single marked startup contract. Hook adapters inject only that marked text inside a host envelope; they must not duplicate policy or inject the full skill body.
- Codex output uses `hookSpecificOutput.hookEventName: SessionStart`, includes all six marked invariants, and stays at or below 4,000 characters.
- Missing Node.js emits valid host JSON with the exact degraded-mode context and exits zero only for startup rendering; correctness-critical helpers still fail closed.
- Keep the Codex adapter on the `startup|resume|clear|compact` matcher. Installed Codex evidence remains the release gate.

## Work Guidance

- Keep hook scripts as process-only adapters: Windows invokes the shared Node renderer directly, while Unix invokes the LF shell launcher.
- Keep hook output valid for the runtime that consumes it.
- Do not edit `.gitignore` from hook or worktree behavior.

## Verification

- Parse hook JSON after edits.
- Assert the Codex manifest matches startup, resume, clear, and compact session starts; removed host/launcher inputs fail without running a hook.
- Check script references and shell syntax for changed hook scripts.
- Measure both normal and degraded payloads and assert the 4,000-character gate.

## Child DOX Index

- No child AGENTS.md files.
