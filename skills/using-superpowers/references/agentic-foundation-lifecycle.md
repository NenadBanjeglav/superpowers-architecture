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

`foundation apply` first recovers a matching interrupted transaction, if one
exists, then repeats every preview validation. The recomputed prospective
revision must equal `--expected-result-revision`; any base, Design Spec,
candidate, manifest, file-set, or result drift stops before mutation and returns
the Design Change Set to review.

Apply is one recoverable local-filesystem transaction:

1. Persist `journal.json` with the exact checkout, candidate, Design Spec,
   manifest, base/spec/result revisions, and backup entries.
2. Back up exact bytes and file modes for the Design Spec, manifest, and every
   affected authoritative path. Record originally missing paths explicitly.
3. Prepare Approved Design Spec bytes through the shared artifact lifecycle and
   stage every replacement in a sibling temporary file on the destination
   volume. Each staged path is journaled before the next replacement is staged;
   recovery also removes operation-named sibling files left by an interruption
   between staging and the journal update.
4. Record journal state before each replacement or deletion. States advance
   from `prepared` through `replacing:<index>:<path>`, `validating`, and
   `recording-applied`.
5. Replace the Design Spec and reviewed candidates, then replace
   `WAYFINDING.md` directly with Approved metadata at the exact prospective
   revision and the same timestamp.
6. Validate the exact Approved Design Spec and exact Approved Foundation from
   disk.
7. Write `APPLIED.json` with the exact relative paths, spec/base/result
   revisions, timestamp, and sorted actions.
8. Remove `.transaction/` only after both validations and the applied marker
   succeed.

The journal target set must exactly equal the Design Spec, manifest, and
candidate-derived action targets for the validated operation binding. Before
staging, replacement, deletion, or rollback, every existing target ancestor
must be a physical directory inside the exact checkout; a symlink or junction
ancestor fails before mutation. Candidate file modes are proposal metadata, not
reviewed authority: replacements preserve the pre-transaction authoritative
mode and additions use the deterministic implementation default.

Any failure restores original bytes, modes, and present/missing state, removes
new files and empty directories created by the operation, revalidates the
restored Approved base and Draft Design Spec, and reports whether recovery
succeeded. A later apply may recover a stale journal only when every recorded
checkout/path/revision binding and the exact candidate-derived target set match
the retry. If an interruption occurs after `APPLIED.json` is installed but
before transaction cleanup, apply validates the marker bindings, sorted
actions, result artifacts, and common approval timestamp, removes the terminal
transaction without rollback, and then rejects the already-applied candidate.
Preview rejects stale transaction state so it cannot silently review a
partially recovered checkout.

`APPLIED.json` visibly invalidates the candidate. Preview and apply both reject
an applied candidate, so the same Design Change Set cannot be applied twice.
Candidate proposal files may remain for local evidence, but they are never
authoritative.

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
