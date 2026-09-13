# Host-Neutral Dispatch Contract

Shared skills request bounded subagent work through one interface. Runtime adapters own tool syntax, context controls, capability discovery, and workspace enforcement.

## Request

```json
{
  "role": "implementer | task-reviewer | final-reviewer | interface-designer | document-reviewer",
  "contextPolicy": "isolated | inherited",
  "capabilityTier": "fast | balanced | strongest-available",
  "promptPath": "absolute path to a bounded prompt or brief",
  "artifactPaths": ["absolute path"],
  "workspacePolicy": "shared-checkout | read-only-review | isolated-worktree"
}
```

Every field is required. `promptPath` is the single bounded task prompt, and `artifactPaths` lists only the files needed for that role. Do not paste controller history or accumulated prior-task summaries into either field.

## Context Policy

`isolated` requires a fresh subagent context with no parent conversation turns. The adapter may supply the bounded prompt, named artifact paths, applicable repository instructions, and basic workspace details. It must not silently inherit the controller transcript. If the active host cannot prove that policy, disclose the reduced isolation before dispatch or use the caller's deterministic self-review fallback.

`inherited` is opt-in and permits host-supported parent context. Shared skills must not select it merely for convenience.

## Capability Policy

An explicit user model choice wins for every role, tier, and retry. A tier does
not authorize replacing that choice. Improve context, diagnosis, or task
decomposition when work is blocked. Otherwise the caller supplies a capability
tier, not a model identifier:

- `fast`: bounded mechanical work with complete requirements.
- `balanced`: multi-file implementation or review requiring ordinary judgment.
- `strongest-available`: architecture-sensitive or whole-branch judgment.

At dispatch time, the runtime adapter discovers choices advertised by the active host and maps only to those choices. It must not invent identifiers or preserve a stale hard-coded table. If the requested tier has no valid mapping, preserve the runtime default and disclose the reduced guarantee. If an explicit user choice is unavailable, report that mismatch rather than substituting silently.

## Workspace Policy

- `shared-checkout`: the worker uses the current checkout; callers must sequence writers to avoid conflicts.
- `read-only-review`: the worker must not mutate the working tree, index, HEAD, or branch. If the host cannot enforce read-only access, the prompt must state the restriction and the caller must verify no mutation occurred.
- `isolated-worktree`: the adapter uses a host-supported isolated checkout and reports its path and branch state.

## Adapter Result

The adapter reports the host operation used, actual context policy, selected or inherited model behavior, workspace realization, and any reduced guarantee. Phase sessions are not dispatch results: planning and implementation handoffs use the separate phase-handoff contract and a genuinely new user-owned session.
