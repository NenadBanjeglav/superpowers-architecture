# Runtime Support

Superpowers Architecture ships one host-neutral `skills/<skill>/SKILL.md` core
and a thin supported Codex adapter.

Codex supported; Claude deferred/unadvertised.

Runtime support requires installed-host evidence. Reading source, manifests, or
passing local tests is not a substitute.

## Supported Surfaces

| Surface | Shared core | Adapter | Required installed evidence |
| --- | --- | --- | --- |
| GitHub/skills.sh for Codex | Selected `skills/` packages plus shared operation core | Codex native skill runtime | discovery, complete install, policy/lifecycle/SDD invocation, and partial-install failure |
| Codex plugin package | Shared skills, references, assets, and Node core | `.codex-plugin/plugin.json` and Codex hooks | plugin load, startup/resume/clear/compaction, migration routing, isolated review, v2 handoff, same-checkout affinity, and fallback |

npm is unsupported. `package.json` is private tooling metadata.

## Shared Operation Core

Node.js 20 or newer is required for:

- Draft/Ready/Approved artifact lifecycle and policy-aware validation;
- Agentic Foundation lifecycle, preview/apply, v1/v2 receipts, recovery, and
  writer exclusion;
- transactional existing-project workflow migration;
- v1/v2 phase-handoff validation;
- SDD workspace, bound briefs/packages, and progress;
- workspace preparation detection; and
- compact startup rendering.

Missing Node is visibly degraded at startup. Correctness-critical operations
fail closed; they never reconstruct revisions, Approval Policy, receipts,
progress, or migration state from conversation memory.

## Startup

Both source hook adapters use the
`startup|resume|clear|compact` SessionStart matcher and render only the six
marked invariants from `using-superpowers` inside a 4,000-character host
envelope. Startup directs the controller to resolve Approval Policy and migrate
active legacy gates at a safe boundary; it does not scan or mutate projects
itself.

The Codex adapter must prove actual injection on startup, resume, clear, and
compaction. Deferred Claude files remain source adapters and are not advertised
support.

## Isolated Advisory Dispatch

Shared dispatch requests bind role, context policy, capability tier, bounded
prompt path, explicit artifact paths, and workspace policy. Codex maps
no-history isolation only through an active advertised operation that can omit
parent conversation turns. The adapter reports actual context and workspace
realization and any reduced guarantee.

Document reviewers are advisory. Under Autonomous they return
`Ready for progression`; under Review-gated they return
`Ready for user review`; otherwise they return `Issues found`. They never
approve artifacts.

## V2 Phase Handoff

A phase handoff is a genuinely new user-owned task, never a fork, resume, or
subagent. V2 wraps this exact fifteen-field record:

- `phase`
- `repositoryRemote`
- `checkoutRoot`
- `branch`
- `worktreeIdentity`
- `artifactPath`
- `artifactType`
- `artifactRevision`
- `sourceSpecPath`
- `sourceSpecRevision`
- `foundationManifestPath`
- `foundationRevision`
- `pluginSource`
- `pluginRoot`
- `workspacePolicy: same-checkout`

The envelope also binds Approval Policy, bounded goal, raw-byte constraint
source/revision, Foundation receipt, and Brainstorming outcome/prompt.
`handoff prepare` and `handoff receive` independently validate Git identity,
artifacts, source spec, Foundation/receipt, ignored paths, cross-fields, and the
exact envelope revision.

The CLI intentionally returns unresolved `hostEvidenceRequired` items.
Installed inventory, exact plugin loading, Codex-managed worktree identity, exact
saved-project targeting, and fresh-task identity require active host evidence.
A CLI assertion cannot satisfy them.

V1 keeps `approvedRevision` and Review-gated semantics. It accepts only
genuinely Approved inputs. Ready must never be sent to a v1-only installed
receiver.

## Same-Checkout and Fallback

Specs, plans, candidates, receipts, migration journals, and verification under
`docs/superpowers/` are ignored local state. An automated target must use the
same physical checkout. Copying artifacts to another worktree, changing branch,
or loading a nearby plugin root does not preserve affinity.

If the host cannot prove exact targeting, plugin inventory, ignored-state
continuity, or fresh task identity, it does not launch. It prints the unchanged
v2 prompt and one actionable blocker. A subagent/fork is not a fallback fresh
session. Same-session continuation is used only when the durable Phase Mode
permits it.

## Hard Release Blockers

A runtime or release claim is blocked when any mandatory installed Codex row is
missing or fails, including:

- plugin load and complete operation discovery;
- startup/resume/clear/compaction injection and bounded payload;
- visible Node degradation and fail-closed critical operations;
- policy-v2 migration and Ready/Approved lifecycle flows;
- isolated review without inherited controller history;
- v2 target acknowledgement, receive validation, and genuine fresh task identity;
- exact same-checkout/plugin/receipt affinity and safe fallback; or
- supported GitHub/skills.sh and plugin-package smoke passes.

The current missing installed Codex startup/compaction and genuine user-owned
fresh-task evidence remains a hard release blocker. Source verification cannot
waive it. Publication remains separately authorized.
