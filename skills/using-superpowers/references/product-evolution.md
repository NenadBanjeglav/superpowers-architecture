# Product Evolution Contract

`using-superpowers` owns this shared policy. Phase skills consume an evidenced
evolution context in the selected spec, exact task bindings, and review verdicts.
The operation core checks identity, lifecycle, and writer boundaries; reviewers
follow sources to judge consumer evidence and authority. Headings and asserted
values cannot mechanically prove those facts.

> Historical artifacts are immutable records of past decisions. They do not make past runtime behavior permanently binding. Only the current policy-accepted artifact defines the active product contract.

## Maturity profile and evidence

Record maturity (`prototype`, `pre-beta`, `beta`, `production`, or `unknown`),
users, external consumers, data durability, schema compatibility, and reset
authority. Every factual field cites its source, observation boundary/date,
and limitations. Unknown never means none, disposable, or permission.
Reset authority names the authorizer, environment, covered datasets, and concrete
rebuild/reseed/recovery procedure; a Git revert alone is not recovery evidence.

Prototype work favors direct replacement and disposable fixtures. Pre-beta
favors current-only schemas and authorized recoverable reset/reseed. Beta checks
actual users, deployments, retained data, and promises. Production honors current
support, durability, and operational recovery. These are conditional defaults:
real data and external obligations override stage labels. Scope mixed systems
by dataset/interface. Reassess before stage promotion or a release boundary and
whenever a new consumer, first retained user data, environment change, or
conflicting observation invalidates evidence.

Foundation PRODUCT.md owns maturity/users/consumers; ARCHITECTURE.md owns
evolution/compatibility and links data ownership. Existing DATA.md owns detailed
durability; otherwise use a small ARCHITECTURE.md subsection. Root AGENTS.md owns
reset authority; VERIFICATION.md owns test policy. Navigation links to these
owners. Do not create an empty DATA.md or manufacture a Foundation for bounded
generic work: use its spec and applicable authority owner.

## Consumer evidence and compatibility

Every proposed abstraction, schema, adapter, cache, replay system, or
compatibility branch names a present caller/user/workflow and evidence of the
problem it solves. Test adapters need an active product/safety contract at a
justified seam; hypothetical adapters do not justify a port. Future-only needs
go to a roadmap note and Defer, without inventing features to justify code.

New or prolonged compatibility mechanisms require all five evidence items:
a real consumer, real durable data, a defined support window, a removal or
expiration condition, and evidence that reset/reseed is insufficient. Name
affected versions and sources. Missing evidence blocks that mechanism. An
existing external promise is not deleted because its evidence was never
collected. Investigate and resolve its scoped successor decision. A stateless
external obligation with no durable data requires explicit product-constraint
resolution; neither invent data nor silently waive the gate.

Compare direct replacement, reset/reseed, rebuilding derived indexes, and
removing obsolete formats first for disposable reset-authorized data. For
durable data, identify preservation and recovery obligations without assuming
every possible adapter is needed. Brainstorming compares the simplest
reversible alternative and justified durable alternatives, with explicit
non-goals and actual authority/recovery details.

## Successor retirement and current selection

Every Ready/Approved Design Spec and Implementation Plan is immutable,
including complete file bytes and genuine approval provenance, even if unused.
Draft stays editable. Create a distinct dated successor without overwriting an
existing path; initialize Draft, refresh, review, and mark Ready under Autonomous.
Review-gated requires real approval of that successor. Ready never acquires
retroactive human provenance. Preserve suspect stale history; restore only from
known exact evidence or author a separate successor, never guess lost bytes.

The successor's Predecessor Artifacts table names absolute path, type, exact
canonical revision, and affected scope. A plan-only change retains the exact
accepted source spec and names its predecessor plan. A design change requires
both successor spec and successor plan before divergent implementation resumes.
Foundation current truth keeps its managed candidate/receipt workflow; prior
ledger entries, accepted specs, and receipts remain immutable.

Successor specs contain Retired Requirements, Deleted Compatibility Contracts,
Obsolete Tests and Fixtures, and Replacement Behavior. Use reasoned `none`
where appropriate. Each retirement maps a stable requirement identity or exact
historical section to predecessor revision, current consumer/data evidence,
authority, replacement or intentional absence, affected code/tests/fixtures,
and verification. Omission and unrelated requirements remain binding. Carry
the complete active bounded contract plus exact history links, not the entire
historical chain in every prompt. An advisory finding or failed test is not
retirement authority. In-scope Autonomous simplification still preserves active
business, privacy, security, data, acceptance, and consequential external promises.

At a quiescent controller boundary after applicable review and Foundation
application, select the exact target in the existing authoritative work/outcome
owner. Planning may select an accepted spec alone; implementation needs a
complete compatible accepted spec/plan pair. Generic work uses existing ignored
task progress/current-work instructions; Foundation work uses existing outcome
owners and exact receipt. No registry is needed. Ready status and filename dates
do not select current work. Selection is a target, not proof of released behavior.

At entry, resume, compaction, rebind, or a possible owner change, compare current
selection with exact task bindings. Ambiguous successors, partial pairs, and
older plans after successor selection stop affected progression. Finish only
nondivergent work or stop workers before changing selection, regenerate inputs,
and revalidate. Reuse unchanged task evidence only after checking successor
contract and exact diff coverage.

Specs include Current Consumers, Evolution Policy, Complexity Budget,
Compatibility Justification, and Deletion Plan, linking current owners with
scope-specific decisions. Each task carries Add, Replace, Remove, and Defer
intent (`none` with reason is valid), affected contracts, evolution constraints,
budget slice, test categories, sunset obligations, and exact artifact bindings.

## Test category

Every new or substantively changed durable test names its primary category and
active contract in its title/comment or adjacent inventory. A uniform suite
annotation suffices; mixed suites name exceptions. No runtime tagging framework
or retrospective classification of untouched tests is required.

| Primary category | Rule |
| --- | --- |
| Product behavior | Protect active observable user/module behavior; retire with its accepted successor. |
| Safety/security invariant | Retain while its boundary exists, regardless of maturity. |
| External compatibility contract | Require consumer/window evidence and explicit sunset. |
| Temporary migration test | Bind to the specific mechanism and cleanup milestone. |
| Implementation detail | Replace with interface coverage unless an independent contract warrants reclassification. |

Pre-beta coverage primarily protects product and safety with evidenced external
exceptions. Categories are not deletion permission. Inspect touched old tests
and fixtures, replace only retired obligations, and preserve retained coverage.
Use meaningful red/green through the intended interface. An absence assertion
is useful when absence itself is observable; otherwise verify retained behavior
and reference removal. Keep justified TDD exceptions and document their evidence.

## Complexity budget and checkpoints

Before implementation bind metric scope, baseline command/source/environment,
threshold, and reviewer. Report production lines added/deleted/net, modules,
dependency fan-out, persistent schema versions, semantic compatibility paths,
focused/full verification time, and named concepts needed to explain the feature.
Report source-module count where useful and Markdown volume separately. A module
owns a behavioral interface; count compatibility paths, not raw conditionals.
Unavailable measurements include reasons and cannot pass as zero. Negative net
lines do not excuse widened interfaces, and deletion quotas never justify harm.

Both execution paths stop affected divergent work before unplanned schemas,
abstractions, adapters, caches/replay, compatibility paths, or budget breaches.
A material unexpected test-duration increase also checkpoints; compare command,
inputs, environment, and cache conditions. One diagnostic rerun may investigate
noise; do not repeat until the best time appears. Preserve test coverage while
explaining additions/removals in comparisons.

Choose **Simplify**, **Replace**, **Defer**, or **Revise**. Compare deletion/direct
implementation first. Record evidence and consequences. Contract, plan, or budget
changes require a Draft successor, review, policy acceptance, and fresh bindings
before resuming. Threshold relaxation is never a silent implementation edit or
automatic human gate. Unaffected safe work can continue.

## Sunset and review

Every temporary compatibility/migration mechanism records introduction reason,
current consumer/evidence, supported versions, removal date or milestone, owning
test category, accountable owner, and a concrete cleanup task in existing
plan/roadmap/evidence. Cleanup covers production paths, tests, fixtures, docs,
and formats. Expiration blocks extending or relying on the mechanism until
reviewed removal or explicit renewal with fresh evidence and a successor;
never blindly delete live data or support because a date passed.

Document, task, final, and architecture reviews use the one Architecture
Conformance rubric. Ask: what can this delete; which assumptions are obsolete;
which tests protect obsolete formats; does this fit the current stage; would we
build this mechanism today from an empty codebase? No deletion can be the correct
evidenced outcome. Report stage, consumer/compatibility, subtraction, category,
sunset, and budget as satisfied, violation, or cannot verify with evidence or
reasoned non-applicability. Required gaps and violations block affected work.
Closeout reports actual measurements, retained coverage, removals, remaining
temporary cleanup, current exact bindings, and source/installed evidence limits.
