# Artifact Lifecycle Contract

`using-superpowers` owns the one shared operation module for specs and implementation plans. Phase skills consume this interface; runtime adapters must not reimplement hashing, lifecycle validation, or approval policy.

## Metadata

Every managed artifact contains exactly one line for each field:

```markdown
**Artifact Type:** Design Spec | Implementation Plan
**Status:** Draft | Ready | Approved
**Revision:** sha256:<64 lowercase hex characters>
**Approved Revision:** none | sha256:<64 lowercase hex characters>
**Approved At:** none | ISO-8601 timestamp
```

Lifecycle discovery and rewriting treat only matching lines outside fenced Markdown blocks as managed metadata, so literal templates remain intact. Canonical hashing still follows the approved byte algorithm exactly and removes every complete lifecycle-form line before hashing.

The revision hashes the canonical payload: decode strict UTF-8 after removing an optional UTF-8 BOM, normalize CRLF and CR to LF, remove complete lifecycle metadata lines, preserve every other character and internal blank line, normalize to one trailing LF, and SHA-256 hash those UTF-8 bytes.

## Commands

Invoke the shared parser directly with Node or through the platform launcher:

```text
spa artifact draft --path PATH --type "Design Spec"
spa artifact refresh --path PATH --type "Design Spec"
spa artifact ready --path PATH --type "Design Spec" --expected-revision sha256:DIGEST
spa artifact approve --path PATH --type "Design Spec" --expected-revision sha256:DIGEST
spa artifact validate --path PATH --type "Design Spec" --expected-revision sha256:DIGEST --policy Autonomous
```

Each success prints one JSON object. Any failure prints an actionable error and exits nonzero. Types are explicit, and readiness, approval, or validation requires the complete expected digest. `Autonomous` validation accepts Ready or Approved; `Review-gated` accepts Approved. Omitting policy preserves strict legacy behavior.

All lifecycle writes acquire one exact sibling directory lock and reread state under that lock. Cooperating lifecycle writers serialize. A controlled validation or write failure releases its known-empty lock and preserves the original diagnostic; a terminated process or cleanup anomaly leaves visible state that must be inspected before its empty lock is removed. Cleanup errors never silently replace an operation error. An uncooperative external process can still replace bytes after validation, so controllers require a quiescent writer boundary and every later consumer recomputes the exact revision. Unknown drift is never treated as Ready.

## Managed Edit Sequence

1. Run `artifact draft` before changing content. This invalidates prior approval.
2. Edit the payload.
3. Run `artifact refresh` and advisory review on the exact resulting revision.
4. Under Autonomous, resolve findings and run `artifact ready`. Under Review-gated, present a readable review package and only after clear user approval run `artifact approve`.
5. Every downstream phase runs `artifact validate` with explicit policy, expected type, and revision before acting.

An unmanaged post-approval edit leaves stale metadata. Validation recomputes the payload and rejects it with both the expected approved digest and actual digest; filename, timestamp, or conversation memory never proves approval.

## Packaging and Failure Policy

Plugin installs always bundle `using-superpowers` and this operation module. A complete skills.sh lifecycle or SDD installation must include `using-superpowers` alongside every consuming phase skill. If the sibling operation module is missing, fail closed and print this full-package install command:

```powershell
npx.cmd skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -y
```

Node.js 20 or newer is a correctness prerequisite. Missing Node or a missing operation module never falls back to chat history, manual digest guesses, or a claimed successful phase transition.
