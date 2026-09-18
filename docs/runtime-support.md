# Runtime Support

Superpowers Architecture ships one host-neutral `skills/<skill>/SKILL.md` core
and a thin Codex adapter, packaged as one complete Codex plugin optimized for
GPT-6 Astra. Claude and standalone skill installation are unsupported.

Runtime support requires installed-host evidence. Reading source, manifests, or
passing local tests is not a substitute.

## 0.7.1 Verification Status

Version 0.7.1 repairs three integrity defects: generated-output overwrites,
foreign-checkout acceptance and inconsistent spec/plan/Foundation bindings.
Workspace metadata and aliases receive the same protection. Public command and
result formats, canonical hashes, all 16 skills and valid v1/v2 behavior remain.

The broader source suite passed 162 checks with two Windows file-symlink skips
in 25.7 seconds. Two further focused coverage cases were then added; the final
focused run passed 56 with two symlink skips in 24.5 seconds. Hardlink/junction
checks and real Foundation receipts under both approval policies ran successfully.
These are separate runs, not a claim of complete installed-host coverage.
An isolated Codex CLI 0.155.0-alpha.9 installation discovered all 16 skills and
matched 98 tracked files to its candidate snapshot. Installed helpers validated
the exact Ready spec/plan, generated a bound brief, and rejected both overwrite
attempts without changing fixture bytes. This proves package/helper behavior.
The production change is +170/-158/net+12 lines, with ten Node modules and unchanged
maximum import fan-out. All 12 historical accepted local artifacts remain unchanged.

No startup-hook repair is included. Automatic startup/resume/clear/compaction,
complete installed workflows, fresh-task/receipt/plugin affinity and native Unix
host coverage remain unverified. The 0.6.0 startup failure below is historical;
it is not evidence of a newly observed 0.7.1 failure. Invoke `using-superpowers`
explicitly after startup and context recovery. See [Release Contract](release.md)
for current package evidence and the applicable publication condition.

## 0.7.0 Verification Status

Version 0.7.0 contains the reviewed stage-aware workflow and accepted-artifact
write guards. The source implementation passed all 13 acceptance criteria,
three task reviews and final whole-branch review. Focused checks passed 88 tests
in 17.4 seconds; full checks passed 107 in 23.8 seconds. Each had one Windows
EPERM symlink skip. These checks cover source operations and authored policy,
not actual host delivery.

An isolated Windows Codex CLI 0.155.0-alpha.9 installation smoke test installed
the 0.7.0 candidate, discovered all 16 skills, and matched 97 tracked package
files to its source snapshot. Installed helpers validated the exact Ready spec
and plan and rejected an attempted Ready-to-Draft reset without changing bytes.
This is package/helper evidence, not a fresh user-task or startup-delivery check.

The 0.7.0 runtime contains all 16 skills and nine Node modules, with no added
schema, dependency or compatibility path. Ready/Approved spec/plan writes are
guarded; revisions require reviewed successors and exact current-owner selection.
Core checks establish identity and write boundaries. Semantic consumer evidence,
retirement authority and current selection remain controller/reviewer duties.

No startup-hook repair is included. The prior Windows failure below remains
relevant; automatic startup/resume/clear/compaction, complete installed workflow
coverage, exact fresh-task/receipt/plugin affinity and native Unix host behavior
remain unverified for 0.7.0. Installation or byte comparison alone cannot close
those gaps. Invoke the entry skill explicitly and honor capability fallback.
See [Release Contract](release.md) for the publication condition.

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

The remaining sections describe the intended runtime contracts. Treat capabilities
listed as unverified above as unverified until actual evidence establishes them.
Older 0.6.0 helpers can still mutate accepted artifacts; upgrade the complete
plugin and use successor authoring. Do not use old helpers to bypass 0.7.0 guards.

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

By default, missing mandatory evidence blocks publication. The explicit
[0.7.0 exception](release.md#070-publication-exception) permits this release with
its disclosed limits; the [0.6.0 exception](release.md#060-publication-exception)
remains historical. Neither establishes unverified runtime support or waives the
complete matrix for later releases. Review, Git hygiene, truthful evidence and
user publication authority remain required.
