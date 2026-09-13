# Phase Handoff Contract

Automated fresh-session mode crosses a trust boundary. A handoff progresses
current work only when its lifecycle state is accepted by the effective Approval
Policy and the runtime can create a genuinely new user-owned session in the
same checkout. A subagent, fork, copied artifact, or nearby worktree is not a
fresh phase session.

The shared Node operation validates mechanical bindings. Runtime adapters must
separately prove host inventory, plugin loading, exact checkout targeting, and
fresh-session identity. CLI output never substitutes for that host evidence.

## V2 Envelope

New handoffs use this exact envelope shape and field order:

```json
{
  "schema": "superpowers-architecture-phase-handoff-v2",
  "policy": "Autonomous | Review-gated",
  "goal": "bounded authorized goal",
  "constraintSourcePath": "absolute path to the controlling instruction or goal source",
  "constraintSourceRevision": "raw-byte sha256 digest",
  "record": {
    "phase": "brainstorming | planning | implementation",
    "repositoryRemote": "canonical git remote URL",
    "checkoutRoot": "absolute physical path",
    "branch": "branch name or detached commit",
    "worktreeIdentity": "main-checkout | linked-worktree | codex-managed-worktree | detached",
    "artifactPath": "absolute physical path",
    "artifactType": "Agentic Foundation | Design Spec | Implementation Plan",
    "artifactRevision": "sha256 digest",
    "sourceSpecPath": "absolute physical path or none",
    "sourceSpecRevision": "sha256 digest or none",
    "foundationManifestPath": "absolute WAYFINDING.md path or none",
    "foundationRevision": "sha256 digest or none",
    "pluginSource": "installed | local-plugin-dir",
    "pluginRoot": "verified absolute path or none",
    "workspacePolicy": "same-checkout"
  },
  "foundationApplicationReceipt": "absolute APPLIED.json path or none",
  "selectedRoadmapOutcome": "OUT-NNN or none",
  "canonicalBrainstormingPrompt": "exact ROADMAP.md prompt or none"
}
```

The inner record remains exactly fifteen fields. V2 replaces the misleading
v1 `approvedRevision` name with `artifactRevision`; it does not add a record
field. Policy, goal, constraint source, Foundation receipt, and Brainstorming
bindings stay outside the record. The shared operation computes an exact
`envelopeRevision` over the ordered JSON values. The receiver must be given
that revision and reject any altered envelope.

The goal is a trimmed, nonempty string no longer than 2,000 characters. The
constraint source is a readable physical file in the checkout, and its revision
is SHA-256 over its exact bytes. It may be an applicable `AGENTS.md`, Root
Router, or another authoritative source that actually contains the binding
constraints. It is not an approval token.

## Phase Bindings

- **Brainstorming:** the phase artifact is the Agentic Foundation manifest.
  `artifactPath` equals `foundationManifestPath`, and `artifactRevision` equals
  `foundationRevision`. The source-spec pair and receipt are `none`. The
  selected ready roadmap outcome and its exact canonical prompt are required.
- **Planning:** the phase artifact is the Design Spec. The separate source-spec
  pair is `none`. Generic work uses a fully `none` Foundation group;
  Foundation-backed work carries the exact manifest, result revision, and v2
  application receipt bound by the Design Spec's base revision.
- **Implementation:** the phase artifact is the Implementation Plan. The
  source-spec pair identifies the exact current Design Spec. The plan's Spec and
  Foundation traceability fields must equal the envelope. Generic and
  Foundation-backed forms follow the same complete-group rule as Planning.

Every path/revision pair is either fully `none` or fully exact. A
Foundation-backed Planning or implementation handoff requires all manifest,
base, result, and receipt evidence. Literal `none` never hides a failed check.

## Shared Operations

Write the envelope beneath ignored local working state in the checkout, then
prepare it through the public operation:

```text
spa handoff prepare --root <checkoutRoot> --envelope <absolute-envelope.json>
```

The adapter includes the returned `envelopeRevision`, complete envelope, dirty
state disclosure, and target-side instructions in the canonical prompt. The
receiver repeats validation before phase work:

```text
spa handoff receive --root <checkoutRoot> --envelope <absolute-envelope.json> --expected-envelope-revision <sha256>
```

Prepare and receive both:

1. resolve the physical Git root and require exact `checkoutRoot` equality;
2. re-read the origin remote, branch or detached commit, Git/common directories,
   and worktree identity;
3. validate the constraint source and its raw-byte revision;
4. validate the phase artifact under the explicit policy: Autonomous accepts
   Ready or Approved, while Review-gated accepts Approved only;
5. validate the exact source Design Spec when implementation records one;
6. validate the Foundation and policy-bound v2 receipt when recorded;
7. verify plan/spec/Foundation cross-fields and Brainstorming roadmap bindings;
8. require working artifacts beneath `docs/superpowers/` to remain ignored;
9. inspect the local plugin layout where possible and return every remaining
   host proof in `hostEvidenceRequired`.

`launchAuthorized` is false while any host proof remains. Typical required
proofs are installed-plugin inventory, exact local-plugin runtime binding,
Codex-managed worktree identity, and receiver-side
fresh user-owned session identity. An adapter must satisfy these through the
active host; it cannot pass a CLI flag that merely asserts they are true.

## V1 Compatibility

Only the complete Codex plugin is supported. Historical `skills-install`
handoffs fail without mutation: install the complete plugin and prepare a new
envelope from current validated artifacts. Never reinterpret the old envelope
or replace its source value while retaining its revision.

A legacy record keeps its original fifteen fields and `approvedRevision` name.
It has Review-gated semantics and accepts only a genuinely Approved artifact and
Approved dependencies. Ready work must never be sent to a v1-only receiver. If
an installed receiver lacks `superpowers-architecture-phase-handoff-v2`, report
that capability blocker and use a valid manual v2 prompt or an already-permitted
same-session continuation. Do not auto-approve, downgrade Ready to Draft, or
reuse a prior human approval.

Historical Foundation v1 receipts retain their original validator semantics
only in a true v1 Approved flow. New explicit-policy handoffs use v2 receipts.

## Runtime Launch Gate

Before launch, the runtime adapter must:

1. prove it can target the exact existing checkout and worktree without copying
   ignored state;
2. prove the selected plugin source will load in the new task;
3. preserve the complete envelope and `envelopeRevision` without rewriting;
4. create a new user-owned session with no inherited controller conversation;
5. inspect the target's first output for all fifteen acknowledged record fields,
   policy, goal/constraint binding, external bindings, and successful receive
   validation; and
6. stop the target when any acknowledgement or validation differs.

The target visibly reports `checkoutRoot`, `branch`, `artifactPath`,
`artifactRevision`, `foundationManifestPath`, `foundationRevision`, receipt,
policy, and `envelopeRevision` before invoking the phase skill.

If exact targeting, plugin affinity, ignored-file continuity, lifecycle state,
or freshness cannot be proven, do not launch. Provide the unchanged canonical
prompt and one actionable capability blocker. Continue in the same session only
when the durable Phase Mode already permits that fallback. Never create a
substitute checkout, claim a fork or subagent is fresh, or ask for document
reapproval to work around a runtime limitation.
