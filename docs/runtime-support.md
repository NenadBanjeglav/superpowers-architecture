# Runtime Support

Superpowers Architecture ships one host-neutral `skills/<skill>/SKILL.md` core
and a thin Codex adapter, packaged as one complete Codex plugin optimized for
GPT-6 Astra. Claude and standalone skill installation are unsupported.

Runtime support requires installed-host evidence. Reading source, manifests, or
passing local tests is not a substitute.

## 0.6.0 Known Limitations

Version 0.6.0 is published with an explicit maintainer exception to the complete
installed-host release gate. The failed and unavailable observations remain
recorded; publication is not a claim that the full runtime matrix passed.

- **Observed working:** complete plugin installation and discovery of all 16
  skills, 75 installed runtime files matching reviewed source, and exact
  spec/plan validation through installed helpers.
- **Observed failure:** on Windows with Codex CLI/runtime 0.154.0-alpha.6.2,
  fresh app tasks did not receive the startup contract before using tools.
  The failure remained after normal hook trust and a user-reported app restart;
  a separate CLI diagnostic also reported no injected contract. The remaining
  cause has not been established.
- **Unverified:** resume/clear/compaction delivery, installed review isolation,
  complete receiver/receipt/plugin affinity, and representative new/existing
  Autonomous and explicit Review-gated workflows. App metadata did establish
  Astra, the exact checkout, and no fork/parent/subagent lineage for the canaries.
- **Platform limits:** direct cmd, Git Bash, and WSL launcher checks passed;
  they do not prove host delivery or an independent macOS/native-Linux Codex run.

Explicitly invoke `$superpowers-architecture:using-superpowers` at the start of
a task and again after context recovery. This loads the entry instructions for
that task; it does not repair the hook or prove end-to-end reliability. Fresh
handoffs still require their actual capability checks and the recorded fallback.

The remaining sections describe the intended runtime contracts. Treat any
capability listed as unverified above as unverified in this release.

## Unreleased Source Evolution

Current repository source guards Ready/Approved spec/plan writes and requires
reviewed successors, current-owner selection, consumer/stage evidence, complexity
checkpoints and sunset review. These changes are not installed or released in
the pinned 0.6.0 plugin. Its older helpers can still mutate accepted artifacts;
controllers must follow successor policy and must not infer the new guards from
the version label. Core checks establish identity/write boundaries; semantic
evidence and current selection remain controller/reviewer responsibilities.
No handoff fields, runtime schemas or installed-host claims are added.

## Supported Surfaces

| Surface | Shared core | Adapter | Required installed evidence |
| --- | --- | --- | --- |
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

When the startup hook runs, missing Node is visibly degraded. Correctness-critical operations
fail closed; they never reconstruct revisions, Approval Policy, receipts,
progress, or migration state from conversation memory.

## Startup

The Codex hook adapter uses the
`startup|resume|clear|compact` SessionStart matcher and render only the six
marked invariants from `using-superpowers` inside a 4,000-character host
envelope. Startup directs the controller to resolve Approval Policy and migrate
active legacy gates at a safe boundary; it does not scan or mutate projects
itself.

The Codex adapter must prove actual injection on startup, resume, clear, and
compaction. Codex requires review and trust of non-managed plugin hooks before
execution; installation alone does not prove injection.

## Model Choice

The intended model is GPT-6 Astra. An explicit selection is preserved for all
workers/reviewers and capability tiers. The adapter inspects the active host
schema and reports unavailable capabilities rather than silently substituting
another model. Plugin metadata does not enforce model configuration.

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

## Evidence Requirements

A claim of complete verified runtime support requires all mandatory installed
Codex rows to pass, including:

- plugin load and complete operation discovery;
- startup/resume/clear/compaction injection and bounded payload;
- visible Node degradation and fail-closed critical operations;
- policy-v2 migration and Ready/Approved lifecycle flows;
- isolated review without inherited controller history;
- v2 target acknowledgement, receive validation, and genuine fresh task identity;
- exact same-checkout/plugin/receipt affinity and safe fallback; or
- complete Codex marketplace/plugin installation smoke checks.

By default, missing mandatory evidence blocks publication. The explicit 0.6.0
exception in [Release Contract](release.md#060-publication-exception) permits
publication with the limitations above; it does not establish runtime support
for unverified capabilities. Review, Git hygiene, truthful evidence, and user
publication authority remain required.
