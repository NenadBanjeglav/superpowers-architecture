# Workflow Policy Contract

Approval Policy and Phase Mode are independent. Controllers record `Workflow Policy Version: 2` and one effective policy in the applicable instruction owner.

## Precedence

`Autonomous` is the default for new and existing projects. `Review-gated` applies only after a new explicit user instruction under version 2. Legacy approval clauses, old Approved artifacts, Phase Mode, and runtime isolation preferences do not opt into Review-gated.

At project entry or resume, read the applicable instruction chain before phase routing. If active Superpowers clauses still impose legacy document gates, prepare a narrow migration, review it internally, and call the shared `workflow migrate` operation before encountering those gates. Preserve goal, acceptance criteria, business and safety constraints, external-action authority, Phase Mode, user work, and immutable decision history.

## Existing-project migration

The controller identifies active legacy workflow clauses and supplies complete,
internally reviewed replacement document bytes. The operation core never
classifies natural-language permissions. Invoke:

```text
spa workflow migrate --root ROOT --request ABSOLUTE_JSON --policy Autonomous
```

The request is exactly
`docs/superpowers/workflow-migrations/<id>/request.json` in the selected checkout
and contains only `schema`, `id`, `root`, `branch`, `policy`, `policyOwner`,
`readSet`, `changes`, `artifacts`, and `foundation`. `readSet` entries bind a
normalized checkout-relative `path` to the raw-byte `sha256:` digest or `none`
for an absent target. `changes` contain normalized paths and complete UTF-8
document content. The policy owner must be among the changes and record literal
version 2 and Autonomous markers. Requests bind the exact physical Git root and
branch. Unknown fields, duplicate or unsorted paths, traversal, links, non-file
targets, stale raw bytes, non-Autonomous policy, and unignored operation paths
fail before mutation.

Mutation targets are limited to named AGENTS.md owners, root CONTEXT.md,
Foundation documents, and current local Design Specs or Implementation Plans.
Source code, Git internals, and old receipts are never migration targets. A
generic request cannot change a managed Foundation record; it must supply the
complete Foundation subgraph. Existing Review-gated language is migration input,
not evidence of a new opt-in. The controller preserves business, safety,
privacy, deployment, publication, and data constraints in its reviewed complete
bytes.

Each artifact entry contains `path`, `artifactType`, `expectedRevision`, and
`sourceSpecPath`. Every changed spec or plan is listed. Plans bind an included
Design Spec, its exact revision, and all four Foundation fields. Unchanged valid
Approved artifacts remain unchanged. Changed current artifacts become Ready
with empty approval fields; original changed Approved bytes are archived as
immutable history.

The optional Foundation record contains `manifestPath`, `baseRevision`,
`resultRevision`, `specPath`, `specRevision`, and the absent deterministic
`receiptPath`. Migration loads the complete raw managed record set even when its
old lifecycle metadata is Draft or stale, recomputes base and prospective bundle
identities through the shared Foundation canonicalizer, validates the migration
spec declaration against the managed changes, and preserves every prior Decision
Ledger entry byte-for-byte. The core writes the changed Foundation as Ready and
creates the policy-bound v2 receipt itself. It never overwrites an old receipt or
accepts a controller-authored receipt.

All migration writers share one physical-checkout writer exclusion. A
Foundation-backed migration also holds the shared Foundation writer exclusion.
The ignored request directory retains its exact request lock, recoverable
transaction journal, raw-byte backups, target graph, core-generated receipt,
and immutable history. Preparation journals ownership before backups. Retry may
clean an exact partial preparation or roll back only when each current target is
the original snapshot or this operation's output. Unknown edits, corrupt
backups, uncertain PIDs, graph drift, or unexpected operation-state content are
preserved and fail closed. `RESULT.json` binds the exact history-manifest digest.
A completed retry validates that terminal binding, current outputs, and every
history file/digest before returning `already-complete`; an unchanged new
request writes no transaction state.

## Progression

- Draft means content has not completed applicable checks and is never executable.
- Ready means checks and blocking advisory findings for the exact revision are resolved. It carries no human approval metadata.
- Approved means a human approved that exact content revision. It retains its historical meaning.
- Autonomous accepts Ready or Approved authoritative inputs. Review-gated accepts Approved only. Operations whose callers omit policy retain strict Review-gated compatibility.

Goal authorization permits ordinary local design, implementation, documentation repair, review repair, and testing needed for the bounded outcome. Record and internally review in-scope changes; never reduce requirements to make checks pass. Ask only about an unresolved consequential product choice, a goal/constraint change, missing access/input that cannot be resolved, or an action outside existing authority. Complete independent safe work first.

Validate authoritative input on first use in a fresh, resumed, or compacted context; after edits or dependency changes; after branch/checkout changes or possible external writers; and inside correctness-critical mutations under their lock. Within one uninterrupted controller context, reuse a proven check while its inputs remain unchanged.
A new message or nested skill alone does not invalidate evidence. Preserve required
integrated checks; repeat or broaden verification only after changes, failures,
drift, or a named unresolved concern. Task and final review coverage are owned by
`requesting-code-review`; finishing reuses an exact unchanged final review.

## Phase progression and capability limits

Both Phase Modes consume current artifacts according to Approval Policy. Automated fresh-session mode still requires genuine user-owned task creation and exact checkout, plugin, artifact, receipt, and constraint affinity. A subagent, fork, copied ignored artifact, or nearby worktree is not a fresh-session substitute. Runtime failure does not create a document-approval requirement.
