# Claude Code Tool Mapping

Skills speak in actions ("dispatch a subagent", "create a todo", "read a file"). On Claude Code these resolve to the tools below.

| Action skills request | Claude Code equivalent |
|----------------------|------------------------|
| Read a file | `Read` |
| Create a file | `Write` |
| Edit a file | `Edit` or `MultiEdit` |
| Run a shell command | `Bash` |
| Search file contents | `Grep` |
| Find files by name | `Glob` |
| Fetch a URL | `WebFetch` |
| Search the web | `WebSearch` |
| Invoke a skill | Use the skill directly, including plugin namespace when installed as a plugin |
| Dispatch a subagent | `Agent` |
| Ask the user a structured question | `AskUserQuestion` |
| Track tasks | `TodoWrite` |

## Instructions File

Claude Code project instructions normally live in `CLAUDE.md`. This repository uses `AGENTS.md` for its own DOX contracts; keep following the applicable `AGENTS.md` chain when editing this repository.

## Personal Skills Directory

Claude Code can load personal and project skills, and plugin skills are namespaced by plugin name. For this plugin, Claude Code invocations use:

```text
/superpowers-architecture:project-setup
/superpowers-architecture:brainstorming
/superpowers-architecture:writing-plans
/superpowers-architecture:subagent-driven-development
/superpowers-architecture:finishing-a-development-branch
```

## Plugin Runtime

Claude marketplace installs are copied into Claude's plugin cache. Hook scripts and skill references must use `${CLAUDE_PLUGIN_ROOT}` for bundled plugin files and must write generated project docs under the user's current repository, not inside the plugin cache.

## Host-Neutral Dispatch Adapter

Consume the request in [dispatch-contract.md](dispatch-contract.md) through the current Claude Code `Agent`/subagent surface. [Official Claude Code subagent documentation](https://code.claude.com/docs/en/sub-agents) describes each new subagent as starting in a fresh context window without the parent conversation history, while receiving a composed delegation prompt and basic environment details.

At dispatch time:

1. Read the bounded `promptPath` and verify every `artifactPaths` entry is readable. Pass only that crafted prompt and those paths; do not paste controller history or accumulated task summaries.
2. Inspect the installed Claude version and its advertised Agent/subagent schema or help. If that version does not provide or document the requested no-history behavior, disclose the reduced isolation before dispatch or use deterministic self-review.
3. Preserve any explicit user model selection. Otherwise map `fast`, `balanced`, or `strongest-available` only to models or aliases advertised by the installed host. If no valid mapping is available, inherit the runtime default and disclose the reduced guarantee.
4. Use a normal shared checkout only for sequential writers. Use read-only tools or prompt constraints for `read-only-review`, and `isolation: worktree` only when the installed Agent surface advertises it.
5. Report the Agent operation used, actual isolation behavior, selected or inherited model behavior, workspace realization, and any reduced guarantee.

A subagent remains part of one Claude session. It is never a substitute for the new named background session required by automated phase handoff.

## Automated Phase Handoff In Claude Code

When automated fresh-session mode is selected and an artifact has been explicitly approved, Claude Code may start the next phase in a background session.

Use this adapter only after approval. Do not use `/bg` to background the current conversation for phase handoff because the fresh phase session must start from the canonical prompt, not from current conversation history.

From the shell, run:

```bash
claude --bg --name "spa-<phase>-<artifact-slug>" "<canonical next-phase prompt>"
```

Official Claude Code docs state that `--bg` starts a background agent and returns immediately, while `--name` sets the session display name. Claude prints the session ID and management commands such as `claude agents`, `claude attach <id>`, `claude logs <id>`, and `claude stop <id>`.

PowerShell quoting-safe launch:

```powershell
$promptPath = Join-Path $env:TEMP 'superpowers-next-phase-prompt.txt'
@'
<canonical next-phase prompt>
'@ | Set-Content -NoNewline -Encoding UTF8 -LiteralPath $promptPath
$prompt = Get-Content -Raw -LiteralPath $promptPath
claude --bg --name "spa-<phase>-<artifact-slug>" $prompt
```

Bash quoting-safe launch:

```bash
prompt_file="$(mktemp)"
cat > "$prompt_file" <<'EOF'
<canonical next-phase prompt>
EOF
claude --bg --name "spa-<phase>-<artifact-slug>" "$(cat "$prompt_file")"
```

If `claude` is unavailable, authentication is missing, background agents are disabled by `disableAgentView` or `CLAUDE_CODE_DISABLE_AGENT_VIEW=1`, or launching from the current runtime is unsafe, print the quoting-safe command and canonical prompt unchanged as the manual fallback.

The canonical prompt must include:

- the next skill to use, namespaced as `/superpowers-architecture:<skill>` when the plugin namespace is required
- the approved spec or plan path
- instruction to read `AGENTS.md`, optional root `CONTEXT.md`, the approved artifact, and the codebase fresh
- the output path for the next artifact when planning
- the local docs guard: never stage or commit `docs/superpowers/**` unless explicitly asked

## Finishing

By default, `finishing-a-development-branch` is summary-only on Claude Code: run final verification, confirm local Superpowers docs are not staged, summarize commits, changed files, tests, and risks, then stop.

Only push, merge, open a PR, or discard work when the user explicitly asks. For those explicit requests, use normal git safety checks first, including checking branch state, staged files, and whether the workspace is externally managed or detached.
