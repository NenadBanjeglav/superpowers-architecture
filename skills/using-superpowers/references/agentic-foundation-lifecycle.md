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

The shared command adapter exposes these lifecycle operations:

```text
spa foundation draft --root ROOT --manifest PATH
spa foundation refresh --root ROOT --manifest PATH
spa foundation approve --root ROOT --manifest PATH --expected-revision sha256:DIGEST
spa foundation validate --root ROOT --manifest PATH --expected-revision sha256:DIGEST
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

Foundation correctness transitions require Node.js 20 or newer and the shared
operation module. Missing Node.js, missing operation code, invalid UTF-8,
malformed metadata or manifest grammar, path ambiguity, filesystem escape,
missing/non-regular files, incomplete revisions, stale metadata, and bundle
drift all stop the operation.

Install or restore Node.js and the shared operation core before retrying a
correctness transition. For content or metadata drift, run `foundation draft`,
make or repair the authoritative edits, run `foundation refresh`, obtain renewed
review of the exact refreshed revision, and run `foundation approve`. Restore
missing core files; remove invalid optional entries or restore them as regular
UTF-8 files inside the checkout. Never copy a revision from conversation memory,
another checkout, or another worktree.
