# Artifact Lifecycle Contract

`using-superpowers` owns the one shared operation module for specs and implementation plans. Phase skills consume this interface; runtime adapters must not reimplement hashing, lifecycle validation, or approval policy.

## Metadata

Every managed artifact contains exactly one line for each field:

```markdown
**Artifact Type:** Design Spec | Implementation Plan
**Status:** Draft | Approved
**Revision:** sha256:<64 lowercase hex characters>
**Approved Revision:** none | sha256:<64 lowercase hex characters>
**Approved At:** none | ISO-8601 timestamp
```

The revision hashes the canonical payload: decode strict UTF-8 after removing an optional UTF-8 BOM, normalize CRLF and CR to LF, remove complete lifecycle metadata lines, preserve every other character and internal blank line, normalize to one trailing LF, and SHA-256 hash those UTF-8 bytes.

## Commands

Invoke the shared parser directly with Node or through the platform launcher:

```text
spa artifact draft --path PATH --type "Design Spec"
spa artifact refresh --path PATH --type "Design Spec"
spa artifact approve --path PATH --type "Design Spec" --expected-revision sha256:DIGEST
spa artifact validate --path PATH --type "Design Spec" --expected-revision sha256:DIGEST
```

Each success prints one JSON object. Any failure prints an actionable error and exits nonzero. Types are explicit, and approval or validation requires the complete expected digest.

## Managed Edit Sequence

1. Run `artifact draft` before changing content. This invalidates prior approval.
2. Edit the payload.
3. Run `artifact refresh` and present the exact resulting revision for advisory review and user review.
4. Only after explicit user approval, run `artifact approve` with that exact reviewed revision.
5. Every downstream phase runs `artifact validate` with the expected type and revision before acting.

An unmanaged post-approval edit leaves stale metadata. Validation recomputes the payload and rejects it with both the expected approved digest and actual digest; filename, timestamp, or conversation memory never proves approval.

## Packaging and Failure Policy

Plugin installs always bundle `using-superpowers` and this operation module. A complete skills.sh lifecycle or SDD installation must include `using-superpowers` alongside every consuming phase skill. If the sibling operation module is missing, fail closed and print this full-package install command:

```powershell
npx.cmd skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -y
```

Node.js 20 or newer is a correctness prerequisite. Missing Node or a missing operation module never falls back to chat history, manual digest guesses, or a claimed successful phase transition.
