# Codex Tool Mapping

Skills speak in actions ("dispatch a subagent", "create a todo", "read a file"). On Codex these resolve to the tools below.

| Action skills request | Codex equivalent |
|----------------------|------------------|
| Read a file | `shell` (e.g., `cat`, `head`, `tail`) — Codex reads files via shell |
| Create / edit / delete a file | `apply_patch` (structured diff for create, update, delete) |
| Run a shell command | `shell` |
| Search file contents | `shell` (e.g., `grep`, `rg`) |
| Find files by name | `shell` (e.g., `find`, `ls`) |
| Fetch a URL | `shell` with `curl` / `wget` — Codex has no native fetch tool |
| Search the web | `web_search` (enabled by default; configurable in `config.toml` via the top-level `web_search` setting — `live`, `cached`, or `disabled`) |
| Invoke a skill | Skills load natively — just follow the instructions |
| Dispatch a subagent (`Subagent (general-purpose):` template) | `spawn_agent` (see [Subagent dispatch requires multi-agent support](#subagent-dispatch-requires-multi-agent-support)) |
| Multiple parallel dispatches | Multiple `spawn_agent` calls in one response |
| Wait for subagent result | `wait_agent` |
| Free up subagent slot when done | `close_agent` |
| Task tracking ("create a todo", "mark complete") | `update_plan` |

## Instructions file

When a skill mentions "your instructions file", on Codex this is **`AGENTS.md`** at the project root. Codex also reads `~/.codex/AGENTS.md` for global context, and an `AGENTS.override.md` (in the project tree or `~/.codex/`) takes precedence when present. Codex walks from the project root down to the current working directory, concatenating `AGENTS.md` files it finds along the way, up to `project_doc_max_bytes` (32 KiB by default).

## Personal skills directory

User-level skills live at **`$CODEX_HOME/skills/`** (default `~/.codex/skills/`). Codex also reads the cross-runtime path **`~/.agents/skills/`** (shared with Copilot CLI and Gemini CLI). When both directories exist at the same scope, Codex loads them both as separate skill catalogs — Codex's docs don't currently document a precedence between them. Each skill is a subdirectory containing a `SKILL.md` (with `name` and `description` frontmatter).

## Subagent dispatch requires multi-agent support

Add to your Codex config (`~/.codex/config.toml`):

```toml
[features]
multi_agent = true
```

This enables `spawn_agent`, `wait_agent`, and `close_agent` for skills like `dispatching-parallel-agents` and `subagent-driven-development`.

Legacy note: Codex builds before `rust-v0.115.0` exposed spawned-agent
waiting as `wait`. Current Codex uses `wait_agent` for spawned agents. The
`wait` name now belongs to code-mode `exec/wait`, which resumes a yielded exec
cell by `cell_id`; it is not the spawned-agent result tool.

## Environment Detection

Skills that create worktrees should detect their environment with read-only
git commands before proceeding:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` → already in a linked worktree (skip creation)
- `BRANCH` empty → detached HEAD (externally managed workspace)

See `using-git-worktrees` Step 0 for how that skill uses these signals.

## Codex App Finishing

By default, `finishing-a-development-branch` is summary-only on Codex:
run final verification, confirm local Superpowers docs are not staged,
summarize commits, changed files, tests, and risks, then stop.

Only push, merge, open a PR, or discard work when the user explicitly asks.
For those explicit requests, use normal git safety checks first, including
checking branch state, staged files, and whether the workspace is externally
managed or detached.
