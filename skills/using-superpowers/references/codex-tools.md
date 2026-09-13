# Codex Tool Mapping

Superpowers Architecture supports the complete Codex plugin and is optimized
for GPT-6 Astra. Shared skills own workflow policy; this reference owns concrete
Codex capabilities. Inspect the active host schema rather than assuming a tool
exists or using a stale API shape.

## Tools and Instructions

Use the advertised shell/exec tool for local reads and commands, prefer rg for
searches, and use apply_patch for edits. Use an available web tool for browsing;
a shell HTTP client is a fallback. Invoke installed skills by their advertised
identity (typically superpowers-architecture:<canonical-name>), while shared
skill text keeps bare canonical names. Task tracking uses the host tool when
available or the workflow’s ignored progress record.

Read the applicable AGENTS.md hierarchy and higher-priority host instructions.
Load task-relevant owners; do not read unrelated subtrees just because their
documents exist. A plugin’s selected model is a user configuration choice, not
a model override enforced by plugin metadata.

## Model Selection

Honor an explicit GPT-6 Astra selection for every worker, reviewer, capability
tier, and retry. When advertised by the active schema, its model identifier is
`gpt-6-astra`. Do not substitute a cheaper, faster, or supposedly stronger model.
If unavailable, report the mismatch; do not silently replace the user’s choice.
Without an explicit choice, preserve the host default or map the requested tier
only to advertised capabilities. Do not set a new reasoning-effort default.
Blocked work calls for better evidence, context, diagnosis, or decomposition
before retrying.

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

Use the active agent-wait tool for spawned agents. A code-mode exec/wait cell
is a different operation; inspect its schema instead of assuming equivalent names.

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

See `using-git-worktrees` for submodule guards and workspace policy.

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

By default, `finishing-a-development-branch` is summary-only on Codex. Confirm
current verification and exact review coverage, local docs guards, commits,
changes, and risks. Continue an already-authorized publication workflow after
its applicable checks.

Only push, merge, open a PR, or discard work when the user explicitly asks.
For those explicit requests, use normal git safety checks first, including
checking branch state, staged files, and whether the workspace is externally
managed or detached.
