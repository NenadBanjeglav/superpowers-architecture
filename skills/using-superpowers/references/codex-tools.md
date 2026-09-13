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
| Dispatch a host-neutral request | `spawn_agent` through the adapter below |
| Multiple parallel dispatches | Multiple `spawn_agent` calls in one response |
| Wait for subagent result | `wait_agent` |
| Task tracking ("create a todo", "mark complete") | `update_plan` |

## Instructions file

When a skill mentions "your instructions file", on Codex this is **`AGENTS.md`** at the project root. Codex also reads `~/.codex/AGENTS.md` for global context, and an `AGENTS.override.md` (in the project tree or `~/.codex/`) takes precedence when present. Codex walks from the project root down to the current working directory, concatenating `AGENTS.md` files it finds along the way, up to `project_doc_max_bytes` (32 KiB by default).

## Personal skills directory

User-level skills live at **`$CODEX_HOME/skills/`** (default `~/.codex/skills/`). Codex also reads the cross-runtime path **`~/.agents/skills/`** (shared with Copilot CLI and Gemini CLI). When both directories exist at the same scope, Codex loads them both as separate skill catalogs — Codex's docs don't currently document a precedence between them. Each skill is a subdirectory containing a `SKILL.md` (with `name` and `description` frontmatter).

## Wayfinder Invocation

Invoke `wayfinder` natively for greenfield project inception or project-wide
reorientation. The shared skill owns discovery and Foundation policy; this
adapter only maps Codex capabilities. When the effective Approval Policy accepts
the current Foundation state, use the v2 phase-handoff envelope for
`phase: brainstorming` rather than carrying Wayfinder conversation history into
the new task.

## Host-Neutral Dispatch Adapter

Consume the request in [dispatch-contract.md](dispatch-contract.md). Multi-agent support must be present in the active tool schema; installations that expose it through configuration may require:

```toml
[features]
multi_agent = true
```

At dispatch time:

1. Read the bounded `promptPath` and verify every `artifactPaths` entry is readable. Do not append controller history.
2. Inspect the active `spawn_agent` schema. Discover available model overrides and context-fork values from that schema at use time.
3. Map `contextPolicy: isolated` to `fork_turns: "none"`. Map `inherited` only when explicitly requested. If the active schema cannot express no-history isolation, report the reduced guarantee or use the caller's deterministic fallback.
4. Use the requested role to form the bounded task name and pass the rendered prompt plus artifact paths. Do not substitute a phase handoff for a subagent dispatch.
5. Preserve an explicit user model choice when it is advertised. Otherwise map the capability tier only to identifiers advertised by the active schema. If no valid mapping is available, omit the override, preserve the runtime default, and disclose the reduced guarantee.
6. Realize `shared-checkout` in the current checkout, `read-only-review` through a read-only prompt plus post-dispatch Git-state verification, and `isolated-worktree` only through an available isolated-workspace mechanism.
7. Report the operation used, actual context policy, model behavior, workspace realization, and any reduced guarantee.

For isolation smoke evidence, place a unique token only in the controller conversation, write a different prompt token and artifact path into the bounded request, dispatch with `fork_turns: "none"`, and require the child to report the prompt token/path while confirming the controller-only token is unavailable.

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

## Automated Phase Handoff In Codex App

When automated fresh-session mode is selected and the effective Approval Policy
accepts the artifact's Ready or Approved state, Codex may start the next phase
in a fresh user-owned task if the user's request or durable Phase Mode authorizes
task creation. First run `spa handoff prepare` from
[phase-handoff.md](phase-handoff.md). Build the canonical prompt from the
complete v2 envelope and returned `envelopeRevision`. Policy, goal, constraint
source, Foundation receipt, and Brainstorming bindings remain outside the exact
fifteen-field record.

Use `create_thread` only. Never use `fork_thread` for phase handoff because a
fork inherits conversation state and is not a fresh phase session.

Before launch:

1. Inspect the active `list_projects` and `create_thread` schemas rather than
   assuming an older app shape.
2. Select a saved project only when its resolved path equals `checkoutRoot`
   exactly. Require the selected environment to guarantee that same existing
   path. A generic request for a new worktree does not preserve an existing
   linked or Codex-managed worktree and cannot satisfy `same-checkout`.
3. Satisfy every item returned in `hostEvidenceRequired` through the active host.
   Installed plugin inventory and local-plugin runtime binding cannot
   be asserted through a CLI option. For `local-plugin-dir`, launch only if the
   app or saved project configuration proves it will load the exact `pluginRoot`.
4. Treat shared `handoff prepare` validation as current mechanical evidence;
   never rewrite the envelope after it returns `envelopeRevision`.
5. Pass the complete canonical prompt, including the v2 envelope, revision, and
   receiver gate, to a new user-owned task. Omit model overrides unless the user
   explicitly selected one and the active schema advertises it.

When the current schema proves that a local project target resolves to the
exact saved `checkoutRoot`, the request has this shape:

```json
{
  "prompt": "<canonical prompt with complete handoff record and target-side gate>",
  "target": {
    "type": "project",
    "projectId": "<exact-path projectId from list_projects>",
    "environment": {
      "type": "local"
    }
  }
}
```

After `create_thread` succeeds, use the active task-wait/read surface to inspect
the target's first output. It must acknowledge the v2 envelope and all fifteen
record fields, run `spa handoff receive` against the unchanged
`envelopeRevision`, satisfy receiver-side host evidence, and show the exact
policy, goal/constraint binding, `checkoutRoot`, `branch`, `artifactPath`,
`artifactRevision`, `foundationManifestPath`, `foundationRevision`, receipt,
and envelope revision before `brainstorming`, `writing-plans`,
`executing-plans`, or `subagent-driven-development` begins.
If acknowledgement or target-side validation reports a mismatch, do not ask
that task to continue. Report the failed handoff.

If the installed receiver supports only v1 and the current artifact is Ready,
do not launch: v1 accepts only genuinely Approved inputs. If no project path equals `checkoutRoot`, an exact linked/managed/detached
workspace cannot be addressed, receipt affinity or local plugin affinity is not
guaranteed, or the active API has no exact-path guarantee, use the safe fallback:
decline automatic launch, print the complete canonical prompt and
handoff envelope unchanged, tell the user to open a new task in the exact
checkout, and stop. Never copy an ignored `docs/superpowers/**` artifact or
receipt to make another checkout appear equivalent.

On success, report the new task identity and emit the Codex App
`created-thread` directive required by the host.

## Codex App Finishing

By default, `finishing-a-development-branch` is summary-only on Codex:
run final verification, confirm local Superpowers docs are not staged,
summarize commits, changed files, tests, and risks, then stop.

Only push, merge, open a PR, or discard work when the user explicitly asks.
For those explicit requests, use normal git safety checks first, including
checking branch state, staged files, and whether the workspace is externally
managed or detached.
