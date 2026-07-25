# Release Contract

Superpowers Architecture uses manual, evidence-bearing releases. Source-tree
inspection can catch packaging defects, but it never substitutes for running
the installed Codex and Claude Code adapters.

## Supported Distribution Channels

| Channel | Public artifact | Installation contract |
| --- | --- | --- |
| GitHub/skills.sh | This repository's shared `skills/` tree | Install through `skills.sh`; complete lifecycle and SDD workflows include `using-superpowers` |
| Codex plugin package | `.codex-plugin/plugin.json`, shared skills, assets, and Codex hooks | Install through a supported Codex plugin or marketplace flow |
| Claude marketplace plugin | `.claude-plugin/marketplace.json`, plugin manifest, shared skills, and Claude hooks | Add the repository marketplace and install `superpowers-architecture@superpowers-architecture` |

npm is unsupported. `package.json` is private repository/tooling metadata and
does not promise an npm package.

## Manual Evidence Matrix

Release evidence is local developer state under
`docs/superpowers/release-evidence/` and is never committed by default. Every
row records the runtime version, environment, exact command or operation,
result, artifact identity, and linked risk closure.

The matrix must cover:

1. JSON parsing, manifest references, Markdown links, skill frontmatter, public
   URLs, executable modes, and forbidden active guidance.
2. Canonical Design Spec and Implementation Plan artifact vectors plus
   canonical multi-file Agentic Foundation vectors. Cover strict UTF-8,
   optional BOM, CRLF/LF normalization, bytewise path ordering, unambiguous
   length framing, Draft/refresh/approve/validate transitions, and drift.
3. The stable DDI/FCA declaration matrix: JSON-escaped paths containing spaces,
   semicolons, and Markdown delimiters; exact declaration/candidate equality;
   shared actions; owner, Decision Ledger, parent DOX index, router, and
   manifest obligations; duplicate/conflicting paths; empty declaration; and
   no-op rejection.
4. The sole `APPLIED.json` receipt matrix. A non-empty candidate must prove
   exact `spec -> base -> receipt -> result` with base and result different. An
   empty candidate must use the same receipt flow with base equal to result.
   Corrupt each schema, nonce, spec, base, result, action, path, and common
   approval-timestamp binding and require read-only failure.
5. Candidate preview/apply and recovery: readable complete diffs, base and
   candidate drift, the checkout-scoped cooperative lock, interrupted durable
   states, backup and mode integrity, exact staged/created-directory cleanup,
   terminal completion, and restored-or-applied end state. Evidence must state
   the V1 quiescent-application boundary: hostile same-machine mutation inside
   the bounded window is not covered.
6. Portable SDD operations, workspace-manager fixtures, serialization, paths
   containing spaces, and missing-Node failure behavior.
7. Startup hooks through PowerShell/cmd, Git Bash, WSL Bash, and an actual Unix
   checkout, including startup/resume/clear/compaction reinjection and the
   4,000-character envelope limit.
8. Installed Codex plugin load, Wayfinder and six Foundation operations,
   isolated dispatch, receipt-backed validation, fixed fifteen-field
   fresh-task handoff plus external receipt acknowledgement, exact
   same-checkout/plugin affinity, and fallback behavior.
9. Installed Claude marketplace and `--plugin-dir` load, auto-discovered hook
   execution, Wayfinder and six Foundation operations, isolated Agent dispatch,
   receipt-backed validation, fixed fifteen-field named background handoff plus
   external receipt acknowledgement, checkout/plugin affinity, and fallback.
10. A smoke pass through each supported distribution channel.

A failed or unavailable mandatory row remains a failure and blocks release. It
must not be rewritten as a limitation, waived by source inspection, or hidden
behind a conditional support claim.

Installed Codex and installed Claude Code evidence are independently mandatory.
Source inspection, passing JSON, a printed fallback command, or one installed
host cannot waive the other.

## Historical Tag Provenance

Historical tag candidates are bound to complete release trees, not merely to
commits that changed a version string:

| Tag | Required commit |
| --- | --- |
| `v0.1.0` | `4cafc482bd85650aada0be59259383ee88b2d3e9` |
| `v0.2.0` | `3aa4877571b1c4c779e58752816d1f0679a1cfcc` |
| `v0.3.0` | `52a0f13b82e92cbeb4b19a93f537eeded35dfef9` |
| `v0.4.0` | `637638ceba8767702bece9b05459be01a62ad07c` |

Before creating a local tag, verify ancestry, package and manifest versions,
changelog coverage, and the complete runtime surface at that commit. Any
mismatch cancels the candidate; do not choose a convenient replacement commit.

## Local-Only Tag Preparation

After every mandatory evidence row passes, release preparation may create
annotated local historical tags and a local `v0.5.0` tag at the exact verified
release commit. Confirm every tag resolves to its intended commit and that no
remote tag was created. A local tag is preparation, not publication.

## Publication Gate

Pushing commits or tags and creating GitHub releases are separate externally
visible actions. They require a new explicit user request after the complete
manual matrix passes and local refs are reported. Publication then verifies the
remote refs and release artifacts; it must not force-push, rewrite history,
merge, open a pull request, or discard local work unless separately requested.

The current 0.5.0 preparation remains blocked until the installed Claude matrix,
the refreshed installed Codex package passes its compaction canary, and every
other required environment row is recorded as passing evidence.
