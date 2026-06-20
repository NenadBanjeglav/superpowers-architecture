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

## Finishing

By default, `finishing-a-development-branch` is summary-only on Claude Code: run final verification, confirm local Superpowers docs are not staged, summarize commits, changed files, tests, and risks, then stop.

Only push, merge, open a PR, or discard work when the user explicitly asks. For those explicit requests, use normal git safety checks first, including checking branch state, staged files, and whether the workspace is externally managed or detached.
