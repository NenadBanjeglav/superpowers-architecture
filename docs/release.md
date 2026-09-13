# Release Contract

Superpowers Architecture uses manual, evidence-bearing releases. Source-tree
inspection can catch packaging defects, but it never substitutes for running
the installed Codex adapter.

The release package is Codex-only and optimized for GPT-6 Astra. GitHub hosts
its source, repository marketplace, tags, and release notes. Claude adapters and
standalone skills.sh distribution are removed; npm remains unsupported.

The complete package includes .codex-plugin/plugin.json, all 16 skills, shared
operations, assets, and Codex hooks. The one-entry repository catalog locates
that root package; it is not another product channel.

## 0.6.0 Publication Exception

On 2026-09-13, after reviewing the failed startup check and the remaining
installed-host gaps, the maintainer explicitly requested committing and pushing
to main and publishing 0.6.0 as-is. This exception authorizes source/tag push,
GitHub About/topics updates, and release publication with the known limitations
disclosed in the README, installation guide, runtime support, and release notes.

Rows 8–10 retain their failed/unavailable status. The exception does not turn
source tests into installed-host evidence, assert automatic context recovery,
or waive lifecycle, architecture, review, user-work, or Git-history constraints.
Explicit `using-superpowers` invocation is the documented workaround. Full
runtime verification remains outstanding; see
[known limitations](runtime-support.md#060-known-limitations).

This exception is specific to 0.6.0. The default evidence requirements below
continue to apply to later releases unless the maintainer explicitly changes them.

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
   length framing, Draft/refresh/ready/approve/policy-aware validate
   transitions, writer exclusion, and drift.
3. The stable DDI/FCA declaration matrix: JSON-escaped paths containing spaces,
   semicolons, and Markdown delimiters; exact declaration/candidate equality;
   shared actions; owner, Decision Ledger, parent DOX index, router, and
   manifest obligations; duplicate/conflicting paths; empty declaration; and
   no-op rejection.
4. The sole `APPLIED.json` receipt matrix. A non-empty candidate must prove
   exact `spec -> base -> receipt -> result` with base and result different. An
   empty candidate must use the same receipt flow with base equal to result.
   Corrupt each schema, nonce, spec, base, result, action, path, and common
   v1 approval-timestamp and v2 policy/lifecycle-snapshot bindings and require
   read-only failure. Prove an empty explicit-policy apply changes no Foundation
   bytes or lifecycle timestamps.
5. Candidate preview/apply and recovery: readable complete diffs, base and
   candidate drift, the checkout-scoped cooperative lock, interrupted durable
   states, backup and mode integrity, exact staged/created-directory cleanup,
   terminal completion, and restored-or-applied end state. Evidence must state
   the V1 quiescent-application boundary: hostile same-machine mutation inside
   the bounded window is not covered.
6. Transactional generic and Foundation-backed existing-project migration:
   narrow complete-byte changes, Ready reconciliation, immutable history,
   concurrent writers, interruption/recovery, idempotence, and preservation of
   business/safety constraints and prior human approval facts.
7. Portable SDD operations, exact policy/spec/plan/Foundation binding, stale
   dependency rejection, workspace-manager fixtures, serialization, paths
   containing spaces, and missing-Node failure behavior.
8. Startup hooks through PowerShell/cmd, Git Bash, WSL Bash, and an actual Unix
   checkout, including startup/resume/clear/compaction reinjection and the
   4,000-character envelope limit.
9. Installed Codex plugin load, Wayfinder and policy-aware operation discovery,
   isolated dispatch, receipt-backed validation, v2 envelope plus exact
   fifteen-field acknowledgement, Ready-to-v1 rejection, genuine user-owned
   fresh-task identity, exact same-checkout/plugin affinity, and fallback.
10. Representative new and existing Autonomous flows, a new explicit
    Review-gated opt-in, and a smoke pass through the complete Codex marketplace/plugin
    installation, including removed-source rejection and migration guidance.

A failed or unavailable mandatory row retains that status and blocks release
by default, subject only to the explicit 0.6.0 exception above. It must not be
reported as passed, waived by source inspection, or hidden in public release copy.

Installed Codex evidence is mandatory. Source inspection, passing JSON, or a
printed fallback command cannot waive the installed-host gate.

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

## Release Preparation and Publication

Prepare release notes for the exact reviewed version and source commit. Include
the product workflow, Autonomous/v2 migration, Astra prompt changes, breaking
distribution changes, installation, actual verification, and unresolved evidence.
Byte reductions are descriptive measurements; do not infer model speed or quality.

After every mandatory evidence row passes, or under the explicit 0.6.0 exception,
verify Git hygiene, ancestry, aligned
package/plugin versions, and absence of conflicting tags/releases. Create the
annotated tag only at the verified release commit. Historical tags are optional
and must not be invented merely to fill a releases page.

External publication needs explicit user authorization; carry existing authority
across phases instead of requiring a newly timed approval. Push reviewed source
and tags through a non-force path, publish the exact notes, update repository
About/topics to the actual Codex/Astra scope, then read remote state back. Preserve
existing history and published tags.

The 0.6.0 release notes must state the observed startup failure and all remaining
installed-host gaps, give the manual entry-skill workaround, and distinguish
source, installed-helper, and actual host evidence. The maintainer's exception
permits publication; it does not turn unavailable evidence into success.
