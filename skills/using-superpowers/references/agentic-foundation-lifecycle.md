# Agentic Foundation Lifecycle

This reference defines the host-neutral lifecycle and canonical revision contract
for a downstream Agentic Foundation. The shared Node.js operation core owns this
behavior. Runtime wrappers locate Node.js and invoke the core; they do not
calculate revisions or rewrite lifecycle state.

## Lifecycle Metadata

`docs/agentic/WAYFINDING.md` is the only file that records active Foundation
lifecycle metadata:

```markdown
**Artifact Type:** Agentic Foundation
**Status:** Draft
**Revision:** sha256:<64 lowercase hexadecimal characters>
**Approved Revision:** none
**Approved At:** none
```

An Approved Foundation uses:

```markdown
**Artifact Type:** Agentic Foundation
**Status:** Approved
**Revision:** sha256:<64 lowercase hexadecimal characters>
**Approved Revision:** sha256:<the same 64 lowercase hexadecimal characters>
**Approved At:** <ISO-8601 timestamp>
```

Each of the five lines must appear exactly once outside fenced Markdown blocks.
Lifecycle-looking lines inside fences are document content and participate in
the revision. No other Foundation file may store or receive active lifecycle
metadata.

## Manifest Grammar

`WAYFINDING.md` contains exactly one unfenced second-level section named
`Foundation Files`:

```markdown
## Foundation Files

- `AGENTS.md`
- `CONTEXT.md`
- `docs/agentic/AGENTS.md`
- `docs/agentic/WAYFINDING.md`
- `docs/agentic/PROJECT-BLUEPRINT.md`
- `docs/agentic/PRODUCT.md`
- `docs/agentic/DOMAIN.md`
- `docs/agentic/ARCHITECTURE.md`
- `docs/agentic/DECISIONS.md`
- `docs/agentic/ROADMAP.md`
- `docs/agentic/VERIFICATION.md`
```

The section body may contain blank lines and backticked Markdown bullets only.
Paths are unique, normalized, forward-slash, repository-relative UTF-8 strings.
They cannot be absolute, contain backslashes, use `.` or `..` traversal, contain
empty segments, or end with `/`.

All eleven paths shown above are required. Additional authoritative documents
are allowed only beneath `docs/agentic/`, for example
`docs/agentic/SECURITY.md`. Every declared path must resolve to a readable,
strict UTF-8 regular file inside the exact checkout root. Symbolic links,
non-regular files, missing files, and real paths that escape through a symlink
or junction fail closed.

The command root must be an absolute existing physical checkout directory. The
manifest argument must be its exact absolute
`docs/agentic/WAYFINDING.md` path.

## V1 Revision Bytes

The schema and ASCII domain separator are:

```text
superpowers-architecture-agentic-foundation-v1
```

Canonicalization performs these steps:

1. Validate the manifest and every managed path against the exact checkout.
2. Read each file as strict UTF-8 after removing one optional UTF-8 BOM.
3. Normalize CRLF and CR line endings to LF.
4. From `WAYFINDING.md` only, remove complete lifecycle metadata lines outside
   fenced Markdown blocks. Preserve identical-looking fenced lines and every
   other character.
5. Normalize every file to exactly one trailing LF without changing internal
   blank lines.
6. Sort records by unsigned bytewise order of their UTF-8 path bytes.
7. Encode the ASCII domain separator, one NUL byte, and the unsigned 64-bit
   big-endian record count.
8. For every sorted record, encode the unsigned 64-bit big-endian path-byte
   length, path bytes, unsigned 64-bit big-endian content-byte length, and
   content bytes.
9. Hash the complete byte stream with SHA-256 and format the lowercase result
   as `sha256:<64 hex characters>`.

The manifest content participates in the digest after lifecycle lines are
removed. Adding, removing, or renaming an authoritative file therefore changes
the revision. Length prefixes and the record count make record boundaries
unambiguous. The deterministic examples are stored in
`agentic-foundation-revision-golden-vectors.json`.

## Command Interface

The shared command adapter exposes six Foundation operations:

```text
spa foundation draft --root ROOT --manifest PATH
spa foundation refresh --root ROOT --manifest PATH
spa foundation approve --root ROOT --manifest PATH --expected-revision sha256:DIGEST
spa foundation validate --root ROOT --manifest PATH --expected-revision sha256:DIGEST
spa foundation preview --root ROOT --manifest PATH --candidate-root PATH --spec-path PATH --expected-spec-revision sha256:DIGEST --expected-base-revision sha256:DIGEST
spa foundation apply --root ROOT --manifest PATH --candidate-root PATH --spec-path PATH --expected-spec-revision sha256:DIGEST --expected-base-revision sha256:DIGEST --expected-result-revision sha256:DIGEST
```

Commands emit one JSON success object. Errors emit one JSON error object and
exit nonzero. Revisions supplied for approval or validation must be complete
lowercase SHA-256 identities; abbreviated revisions are rejected.

`draft` computes current canonical bytes and writes Draft metadata.

`refresh` recomputes the revision after managed edits. It preserves Approved
state only when the bundle revision and all approval metadata remain valid and
unchanged. Otherwise it writes Draft state with `Approved Revision: none` and
`Approved At: none`.

`approve` requires Draft state, the exact refreshed metadata revision, the same
recomputed bundle revision, and a valid approval timestamp. It records Approved
state only in `WAYFINDING.md`.

`validate` requires Approved state, exact expected/recorded revision equality,
a valid approval timestamp, and equality with the freshly recomputed bundle.
It performs no write.

## Foundation Candidate Contract

A Foundation Candidate is an ignored, non-authoritative set of complete file
proposals bound to one exact Approved Foundation and one exact Draft Design
Spec. Its root is exactly:

```text
docs/superpowers/foundation-candidates/<design-spec-stem>/
├── candidate.json
├── files/
│   └── <repository-relative complete upsert files>
├── DESIGN-CHANGE-SET.md
├── APPLIED.json
└── .transaction/
    ├── journal.json
    ├── approved-spec.md
    └── backups/
```

Brainstorming owns `candidate.json` and `files/`. The Foundation operation owns
`DESIGN-CHANGE-SET.md`, `APPLIED.json`, and `.transaction/`. The candidate root
must be the physical directory whose name is the Draft Design Spec filename
without `.md`; the Design Spec must be a physical Markdown file under
`docs/superpowers/specs/` in the same checkout.

`candidate.json` has this exact schema and no additional fields:

```json
{
  "schema": "superpowers-architecture-foundation-candidate-v1",
  "manifestPath": "docs/agentic/WAYFINDING.md",
  "baseRevision": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  "designSpecPath": "docs/superpowers/specs/2026-07-24-account-flow-design.md",
  "designSpecRevision": "sha256:2222222222222222222222222222222222222222222222222222222222222222",
  "changes": [
    {
      "path": "docs/agentic/ARCHITECTURE.md",
      "action": "upsert"
    },
    {
      "path": "docs/agentic/STYLE.md",
      "action": "delete"
    }
  ]
}
```

Each change contains exactly `path` and `action`. Paths are unique normalized
repository-relative paths. `upsert` requires one complete strict UTF-8 file at
`files/<path>`. `delete` requires no candidate file and may remove only an
existing optional Foundation document. A recursive scan of `files/` must equal
the declared upsert set exactly. Missing, extra, undeclared, duplicate,
non-UTF-8, symbolic-link, filesystem-escape, and declared no-op candidates fail
closed.

The complete prospective `WAYFINDING.md` must still declare every core
Foundation document. Its manifest set must equal the virtual prospective file
set exactly. Adding or deleting an optional document therefore requires a
complete `WAYFINDING.md` upsert in the same candidate.

## Preview and Review Report

`foundation preview` rejects an applied candidate or an incomplete transaction,
validates the exact Approved base and exact Draft Design Spec, validates every
candidate binding, and materializes the prospective Foundation in memory. It
does not change Design Spec or authoritative Foundation bytes.

Preview writes `DESIGN-CHANGE-SET.md` and returns JSON containing:

- exact Design Spec path and revision;
- exact manifest path and Approved base revision;
- exact prospective Foundation revision;
- exact candidate root and review path;
- changed-file actions sorted by unsigned UTF-8 path bytes.

The report names both reviewed revisions, renders the sorted action table, and
contains normalized per-file Git-style text diffs. The operation runs
`git diff --no-index`; exit `1` means a readable difference, while an exit above
`1` is an operation error. The operation stages and atomically replaces the
report; an existing symbolic report entry is rejected, so report generation
never follows a link into user-owned bytes.

An empty `changes` array is valid only with an empty `files/` tree. Preview then
reports no durable Foundation file changes and the prospective revision equals
the Approved base revision. Apply still approves the exact Design Spec and
records the Foundation as Approved with the same approval timestamp.

## Recoverable Apply and Candidate Invalidation

`foundation preview` rejects either a transaction or the checkout-scoped
operation lock, so it cannot render a review while apply or recovery owns the
Foundation. The one lock is resolved from the already validated physical
candidate parent and stored at:

```text
docs/superpowers/foundation-candidates/.foundation-operation.lock.json
```

Its exact schema is
`superpowers-architecture-foundation-operation-lock-v1`. The record contains
only `schema`, `operationNonce`, `ownerPid`, `root`, `manifestPath`, `specPath`,
`candidateRoot`, `expectedBaseRevision`, `expectedSpecRevision`,
`expectedResultRevision`, and `acquiredAt`. Acquisition uses exclusive create
with mode `0o600`, writes and syncs the complete record, then closes it.

A lock owner is live when `process.kill(ownerPid, 0)` succeeds or reports
`EPERM`. Only `ESRCH` proves a dead owner. A live owner is always a conflict,
including when a second apply presents identical bindings. A different
candidate is also blocked by the same checkout-scoped live lock before it can
create transaction state or mutate authoritative bytes. Invalid, partial, or
unreadable lock state fails closed instead of being guessed stale.

A dead owner authorizes recovery only when every lock binding matches the exact
retry and its nonce matches the exact transaction journal. A dead lock with no
prepared journal may remove only its fixed candidate transaction directory and
exact nonce-derived journal temporary file after the Approved base Foundation
and Draft Design Spec revalidate unchanged. Before release, the operation
re-reads the exact regular lock and revalidates nonce, owner, timestamp, and all
bindings. Release occurs only after successful apply cleanup, successful
rollback cleanup, or validated terminal recovery.

The `.transaction/journal.json` schema is
`superpowers-architecture-foundation-transaction-v1` and contains exactly:

```text
schema
operationNonce
lockPath
root
manifestPath
specPath
candidateRoot
expectedBaseRevision
expectedSpecRevision
expectedResultRevision
additionMode
state
entries
stagedPaths
createdDirectories
```

`additionMode` is the immutable implementation-owned integer `0o644`. It is
validated before staging, apply, or recovery. Candidate filesystem modes are
never authority. An existing authoritative replacement preserves the exact
pre-apply mode recorded in its entry; a missing target uses only
`journal.additionMode`.

Entries are sorted by unsigned UTF-8 order of normalized checkout-relative
target identity and contain exactly `index`, `targetPath`, `backupPath`,
`backupDigest`, `existed`, and `mode`. For a missing original target,
`backupPath`, `backupDigest`, and `mode` are all `null`. For an existing target,
the backup path is deterministically bound to both the sorted index and target
identity:

```text
backups/<four-digit-index>-<sha256 of normalized target identity>.bin
```

`backupDigest` is the lowercase `sha256:` identity of the exact backup bytes.
Recovery validates entry order, indexes, target-set equality, unique derived
backup paths, physical regular-file containment, every backup digest, and every
recorded authoritative mode before any rollback mutation.

The journal is first persisted as `preparing`, before backups can authorize a
restore. Exact backups are written and synced, all content identities validate,
and only then does the state become `prepared`. Subsequent durable boundaries
are `staged`, `replacing:<index>:<path>`, `validating`, and
`recording-applied`. The journal's own temporary path is derived exactly from
the operation nonce; recovery never discovers journal state by prefix scan.

Each staged replacement is reserved in `stagedPaths` before exclusive sibling
creation. A record contains exactly `path`, `targetPath`, `purpose`, and
`ordinal`. The path is derived from the operation nonce, deterministic ordinal,
target basename, and one exact purpose: Approved Design Spec, candidate upsert,
Approved manifest, applied marker, or restore. Deletions have no staged file.
Recovery validates and removes only these exact recorded siblings. It never
scans `.spa-foundation-*.tmp`; an unrelated file with that old prefix survives.

For an addition, every missing ancestor is recorded in `createdDirectories` as
`planned` before non-recursive creation and advances to `created` afterward.
Rollback removes only these exact recorded paths, in reverse order, using
non-recursive removal. A pre-existing empty directory is not recorded and
survives. If a recorded directory contains unexpected content, recovery
preserves it and fails visibly instead of inferring ownership from emptiness.

Apply and recovery preserve this order:

1. Validate candidate bindings and the exact prospective revision.
2. Acquire the exact checkout-scoped cooperative lock.
3. Recover a matching dead operation or reject a conflict.
4. Create the nonce-bound `preparing` journal.
5. Write, sync, identify, and validate exact backups; mark `prepared`.
6. Reserve and write exact staged siblings while recording exact created
   directories; mark `staged`.
7. Revalidate the Approved base, Draft Design Spec, candidate, and result.
8. Journal each replacement or deletion before mutation.
9. Validate the exact Approved result; mark `recording-applied`.
10. Atomically install exact `APPLIED.json`, including `operationNonce`.
11. Validate marker nonce, sorted actions, artifact revisions, and the common
    approval timestamp.
12. Clean exact staged and transaction state, then release the exact lock.

On an error after `prepared`, recovery first revalidates the lock, journal,
target set, backup identities, modes, staged records, and directory ledger.
Only then may it restore exact bytes, modes, and present/missing state. It cleans
only exact operation-owned state, validates the restored Approved base and
Draft Design Spec, removes `.transaction/` only after proving physical
containment and terminal-or-restored ownership, and finally releases the lock.
Uncertain binding or a corrupt backup preserves lock and transaction evidence
without recovery mutation.

If interruption occurs after `APPLIED.json` installation, recovery accepts a
terminal result only from `recording-applied` and only after marker schema,
operation nonce, sorted actions, both exact artifacts, revisions, and one common
timestamp validate. It then cleans exact transaction state without rollback,
releases the lock, and rejects duplicate application.

`APPLIED.json` visibly invalidates the candidate. Preview and apply both reject
an applied candidate, so the same Design Change Set cannot be applied twice.
Candidate proposal files may remain for local evidence, but they are never
authoritative.

## Quiescent Application Boundary

V1 rejects hazards present or observable at its validation boundaries and
serializes cooperating Foundation writers. It does not protect against a
malicious or uncooperative same-machine process racing path replacement after
validation. Supporting that adversary requires a newly Approved design that
selects platform-specific secure mutation primitives or a different runtime
capability contract.

## Combined Design Change Set Authority

The user approves one combined authority boundary: the exact Draft Design Spec
revision and the exact prospective Foundation revision shown by preview. That
approval authorizes only the bound candidate actions against the named Approved
base. Apply records both artifacts as Approved with one timestamp. It does not
create a second normal Foundation review gate, and Planning may begin only
after both exact post-apply validations succeed.

## Managed Edit Sequence

Use this sequence for every authoritative Foundation change:

1. Run `foundation draft` before editing.
2. Edit only declared authoritative documents and update the manifest if the
   authoritative file set changes.
3. Run `foundation refresh`.
4. Present the complete refreshed revision and readable document changes for
   user review.
5. After the user approves that exact revision, run `foundation approve`.
6. Before a downstream phase consumes the Foundation, run
   `foundation validate` with the exact Approved revision.

An edit after approval is unmanaged until the Foundation returns through Draft,
refresh, review, and approval. `refresh` safely clears stale approval metadata;
`validate` never repairs drift.

## Fail-Closed Policy and Recovery

Foundation correctness transitions require Node.js 20 or newer, Git for
candidate diffs, and the shared operation module. Missing Node.js, missing
operation code, unusable Git, invalid UTF-8, malformed metadata, candidate JSON,
or manifest grammar, path ambiguity, filesystem escape, missing/non-regular
files, incomplete revisions, stale metadata, and bundle or candidate drift all
stop the operation.

Install or restore Node.js and the shared operation core before retrying a
correctness transition. For content or metadata drift, run `foundation draft`,
make or repair the authoritative edits, run `foundation refresh`, obtain renewed
review of the exact refreshed revision, and run `foundation approve`. Restore
missing core files; remove invalid optional entries or restore them as regular
UTF-8 files inside the checkout. Never copy a revision from conversation memory,
another checkout, or another worktree.
