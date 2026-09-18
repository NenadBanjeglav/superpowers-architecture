# Installation

Install the complete **Codex plugin**, optimized for GPT-6 Astra. GitHub hosts
its source and releases; it is not a second standalone-skill channel. Claude
and skills.sh installations are no longer supported. npm is unsupported and
package.json remains private tooling metadata.

## Requirements

- Node.js 20 or newer on the execution environment's PATH.
- Codex plugin and hook support in the client being used.
- GPT-6 Astra selected in Codex for the intended model behavior.

Plugin metadata does not force a model. The runtime adapter preserves an explicit
Astra choice for all workers/reviewers and reports an unavailable choice rather
than silently substituting.

## Released Package

Register the repository marketplace and install its single root plugin:

```sh
codex plugin marketplace add NenadBanjeglav/superpowers-architecture --ref v0.7.0
codex plugin add superpowers-architecture@superpowers-architecture
codex plugin list
```

The marketplace name is `superpowers-architecture`; the plugin name is the same.
The catalog at `.agents/plugins/marketplace.json` points to `./`, resolved
from the repository root. It does not contain a duplicate skill tree.

Start a new session after installation or refresh. A running task does not
automatically receive refreshed skill instructions.

## Upgrade a Pinned Git Installation

Codex rejects adding the same marketplace from a different pinned ref. If your
`superpowers-architecture` marketplace is the GitHub repository at an older tag,
replace that registration, then reinstall the plugin:

```sh
codex plugin marketplace remove superpowers-architecture
codex plugin marketplace add NenadBanjeglav/superpowers-architecture --ref v0.7.0
codex plugin add superpowers-architecture@superpowers-architecture
```

These commands target only this Git marketplace. For a local development
marketplace, keep its existing name/source and follow Local Development below.
Start a new task and confirm 0.7.0 after reinstalling. `marketplace upgrade`
refreshes the configured ref; it does not select a newer tag for a pinned install.

## Start Explicitly

In the new task, invoke:

```text
$superpowers-architecture:using-superpowers
```

Then describe the outcome you want. This loads the entry instructions and routes
the request to the relevant skill while preserving the full architecture workflow.
Repeat the invocation after resuming, clearing, or compacting context.

The prior 0.6.0 Windows checks discovered all 16 skills but did not deliver
startup instructions automatically, even after hook trust and an app restart.
Version 0.7.0 does not change that hook implementation. Manual invocation remains
the workaround; automatic context recovery and complete installed workflows
remain unverified. See [0.7.0 verification status](runtime-support.md#070-verification-status).

## Startup Hook Trust

Installation does not automatically trust plugin hooks. Review the current
Superpowers Architecture hook when Codex prompts for trust; the CLI exposes
`/hooks`. The hook is intended to invoke the bundled Node startup renderer and
inject the six marked workflow invariants. Trust and discovery alone do not
establish execution or delivery. Changed hook definitions may require review
again. See [Codex hooks](https://learn.chatgpt.com/docs/hooks).

When the hook runs, missing Node produces degraded startup guidance. Artifact, Foundation,
migration, handoff, and SDD operations fail closed until the complete plugin and
Node are available. Do not recover by copying individual skills.

## Local Development

Clone the source, then register the checkout itself as the marketplace:

```sh
git clone https://github.com/NenadBanjeglav/superpowers-architecture.git
cd superpowers-architecture
codex plugin marketplace add .
codex plugin add superpowers-architecture@superpowers-architecture
```

These commands require a checkout containing the new catalog. Confirm the
marketplace resolves to the intended source before refreshing an existing local
installation. Use a changed release version or the supported development
cachebuster flow for updated bytes, reinstall through Codex, and start a new
session. Do not manually patch installed cache files.

## Migrate from an Earlier Setup

- **Existing Codex plugin:** refresh the complete package from the intended
  marketplace. Verify the reported version and all 16 skills in a new session.
- **Standalone skills.sh copy:** install the Codex plugin, verify it loads, then
  remove only the obsolete Superpowers Architecture copies through your previous
  installation manager. Preserve unrelated and customized skills. This release
  does not delete user-level skill directories automatically.
- **Claude setup:** no Claude adapter is shipped. Use this package in Codex.
- **Older project workflow:** active legacy document gates migrate on entry under
  Autonomous. Historical approvals and unrelated constraints remain intact;
  Review-gated requires a new opt-in.
- **0.6.0 accepted-artifact edits:** 0.7.0 rejects resetting a Ready/Approved
  spec or plan to Draft, refreshing changed accepted content, and migrating
  changed accepted targets in place. Create a distinct Draft successor, review
  and accept it under policy, then select the compatible current spec/plan pair.
  Unchanged accepted refresh and historical readers remain supported. Foundation
  current-truth edits retain their candidate/apply/receipt workflow. Do not use
  an older helper to bypass the new write boundary.
- **Old handoff:** `skills-install` is rejected without rewriting its envelope.
  Recreate the handoff from validated current artifacts using `installed` or
  `local-plugin-dir`, both referring to the complete Codex package. A Ready
  artifact cannot be received by a v1-only consumer.
- **Old project-setup invocation:** use `wayfinder`; the removed name has no alias.

## Phase Handoffs

Fresh-session mode requires exact same-checkout, plugin, ignored-artifact,
receipt, policy, constraint, and genuine user-owned task evidence. Neither a
nearby worktree nor a fork/subagent substitutes for that identity. If the host
cannot prove it, the workflow provides the canonical fallback and does not
launch. Same-session continuation follows the recorded Phase Mode.

See [Runtime Support](runtime-support.md) for observed capabilities and
[Release](release.md) for the evidence matrix and version-specific publication conditions.
