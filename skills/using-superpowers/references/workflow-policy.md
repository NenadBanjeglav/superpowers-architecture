# Workflow Policy Contract

Approval Policy and Phase Mode are independent. Controllers record `Workflow Policy Version: 2` and one effective policy in the applicable instruction owner.

## Precedence

`Autonomous` is the default for new and existing projects. `Review-gated` applies only after a new explicit user instruction under version 2. Legacy approval clauses, old Approved artifacts, Phase Mode, and runtime isolation preferences do not opt into Review-gated.

At project entry or resume, read the applicable instruction chain before phase routing. If active Superpowers clauses still impose legacy document gates, prepare a narrow migration, review it internally, and call the shared `workflow migrate` operation before encountering those gates. Preserve goal, acceptance criteria, business and safety constraints, external-action authority, Phase Mode, user work, and immutable decision history.

## Progression

- Draft means content has not completed applicable checks and is never executable.
- Ready means checks and blocking advisory findings for the exact revision are resolved. It carries no human approval metadata.
- Approved means a human approved that exact content revision. It retains its historical meaning.
- Autonomous accepts Ready or Approved authoritative inputs. Review-gated accepts Approved only. Operations whose callers omit policy retain strict Review-gated compatibility.

Goal authorization permits ordinary local design, implementation, documentation repair, review repair, and testing needed for the bounded outcome. Record and internally review in-scope changes; never reduce requirements to make checks pass. Ask only about an unresolved consequential product choice, a goal/constraint change, missing access/input that cannot be resolved, or an action outside existing authority. Complete independent safe work first.

Validate authoritative input on first use in a fresh, resumed, or compacted context; after edits or dependency changes; after branch/checkout changes or possible external writers; and inside correctness-critical mutations under their lock. Within one uninterrupted controller context, reuse a proven check while its inputs remain unchanged.

## Phase progression and capability limits

Both Phase Modes consume current artifacts according to Approval Policy. Automated fresh-session mode still requires genuine user-owned task creation and exact checkout, plugin, artifact, receipt, and constraint affinity. A subagent, fork, copied ignored artifact, or nearby worktree is not a fresh-session substitute. Runtime failure does not create a document-approval requirement.
