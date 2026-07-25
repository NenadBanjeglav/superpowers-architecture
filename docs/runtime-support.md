# Runtime Support

Superpowers Architecture ships one shared `skills/<skill>/SKILL.md` core with
thin adapters for Codex and Claude Code. Runtime support is accepted only after
the relevant installed host completes the manual evidence matrix in
[Release](release.md). Reading manifests or adapter source is not a substitute
for running the installed host.

## Prerequisite

Node.js 20 or newer is required for artifact lifecycle operations, portable
SDD workspace operations, Agentic Foundation lifecycle/candidate/receipt
operations, and compact startup-context rendering. Startup hooks emit a
visible degraded-mode message when Node is unavailable. Correctness-critical
operations fail closed and print actionable installation guidance; they never
reconstruct approval, Foundation state, or progress from conversation memory.

## Foundation Operation Surface

The [shared Agentic Foundation lifecycle](../skills/using-superpowers/references/agentic-foundation-lifecycle.md)
exposes exactly six host-neutral operations through the shared Node core:

1. `foundation draft`
2. `foundation refresh`
3. `foundation approve`
4. `foundation validate`
5. `foundation preview`
6. `foundation apply`

Receipt-backed validation is an all-or-none mode of the existing read-only
`foundation validate` operation, not a seventh operation. It validates the
exact Approved Design Spec, the spec's base Foundation, the operation-owned
candidate-root `APPLIED.json`, and the resulting Approved Foundation. The
receipt is the sole base-to-result Application Receipt; runtime adapters do not
reimplement its schema or canonicalization.

## Supported Runtime Surfaces

| Surface | Shared core | Runtime adapter | Installed-host evidence required |
| --- | --- | --- | --- |
| GitHub/skills.sh | Skills selected from `skills/` | The installing agent's native skill runtime | Skill discovery, complete-operation install, lifecycle/SDD invocation, and fail-closed partial-install behavior |
| Codex plugin package | `skills/` | `.codex-plugin/plugin.json` and `hooks/hooks-codex.json` | Plugin load, startup/resume/clear/compaction behavior, Wayfinder and six-operation discovery, isolated dispatch, fresh-task handoff, same-checkout affinity, receipt validation, and safe fallback |
| Claude marketplace plugin | `skills/` | `.claude-plugin/`, `hooks/hooks.json`, and the Claude tool mapping | Marketplace and local-plugin load, startup/resume/clear/compaction hooks, Wayfinder and six-operation discovery, isolated Agent dispatch, named background handoff, same-checkout/plugin affinity, receipt validation, and safe fallback |

The repository `package.json` is private tooling metadata. npm is not a
supported installation or publication surface.

## Isolated Dispatch

Subagent dispatch is bounded by a role, an isolated or inherited context
policy, a capability tier, a prompt path, explicit artifact paths, and a
workspace policy. An isolated request must prove that the worker received the
bounded prompt and artifacts without receiving parent conversation turns.
Runtime adapters discover the active host's available tools and model choices;
they do not hard-code stale identifiers.

Codex maps no-history isolation to an advertised `spawn_agent` operation with
`fork_turns: "none"`. Claude maps it to the installed Agent/subagent surface
only when that version documents and exposes fresh-context behavior. If the
host cannot prove isolation, the adapter discloses the reduced guarantee or
uses the owning workflow's deterministic fallback.

## Automated Fresh-Session Handoff

A phase handoff starts a genuinely new user-owned task or session. It is not a
fork, resumed conversation, or subagent. Before launch, the source session
records exactly these fifteen fields, in the order owned by the
[shared phase-handoff contract](../skills/using-superpowers/references/phase-handoff.md):

- `phase`
- `repositoryRemote`
- `checkoutRoot`
- `branch`
- `worktreeIdentity`
- `artifactPath`
- `artifactType`
- `approvedRevision`
- `sourceSpecPath`
- `sourceSpecRevision`
- `foundationManifestPath`
- `foundationRevision`
- `pluginSource`
- `pluginRoot`
- `workspacePolicy`, which must be `same-checkout`

For Foundation-backed Planning and implementation, the canonical prompt carries
`Foundation Application Receipt: <absolute candidate-root APPLIED.json path>`
outside this unchanged record. It is an external binding, not a sixteenth
field. A generic Planning or implementation prompt carries literal `none`.
Brainstorming instead carries the selected ready roadmap outcome and exact
canonical prompt outside the record.

The target first echoes the complete record, separately acknowledges every
external binding, and independently revalidates its repository, checkout,
branch/worktree, artifact lifecycle, source spec, Foundation
manifest/revision/receipt, ignored-file state, and plugin source from disk. Any
mismatch stops phase work.

Codex handoff may use only a new project task that the installed app can bind
to the exact saved checkout. It must never use a conversation fork. Claude
handoff may use named background-session flags only after the installed
`claude --help` advertises them. A local Claude checkout must also pass the
verified absolute plugin root through `--plugin-dir`; an installed copy or a
different checkout is not equivalent.

Specs, plans, Foundation candidates, and receipts under `docs/superpowers/`
are ignored local state. They remain valid only in the same physical checkout;
copying one to another worktree cannot satisfy `workspacePolicy:
same-checkout`. When exact checkout, ignored-state continuity, receipt, or
plugin affinity cannot be proven, the adapter prints the complete canonical
prompt and a quoting-safe manual command and does not launch automatically.

## Hard Release Blockers

The following conditions block a runtime or release claim:

- an installed host cannot load the advertised distribution channel;
- isolated dispatch receives parent conversation history or cannot prove its
  context policy;
- a target phase session cannot acknowledge and revalidate all handoff fields;
- a Foundation-backed Planning or implementation target cannot acknowledge and
  receipt-validate the exact spec/base/receipt/result binding;
- an ignored artifact, dirty working tree, worktree, or local plugin directory
  cannot be preserved in the exact checkout;
- required startup context is absent after startup, resume, clear, or
  compaction;
- Node degradation is silent, or a correctness-critical operation continues;
- required shell/operating-system evidence is unavailable; or
- an installed Codex or Claude matrix remains incomplete.

Both hook adapters use the `startup|resume|clear|compact` SessionStart matcher
and render only the shared six-invariant marked startup contract within the
4,000-character envelope. For the 0.5.0 preparation, installed Claude CLI
evidence and a passing installed Codex compaction canary are still mandatory.
Until the release evidence closes both, 0.5.0 must not be described as fully
verified or published.
