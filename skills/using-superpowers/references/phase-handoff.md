# Phase Handoff Contract

Automated fresh-session mode crosses a trust boundary. Before launch, the
current session must run **prepare handoff** and produce one verified,
host-neutral record. The next session must acknowledge the same record and
repeat its checks before invoking the next phase skill.

Phase handoff is not subagent dispatch. It starts a new user-owned session with
no dependency on current conversation history.

## Handoff Record

Use exactly these fifteen immutable fields, in this order:

```json
{
  "phase": "brainstorming | planning | implementation",
  "repositoryRemote": "canonical git remote URL",
  "checkoutRoot": "absolute path",
  "branch": "branch name or detached commit",
  "worktreeIdentity": "main-checkout | linked-worktree | codex-managed-worktree | detached",
  "artifactPath": "absolute path",
  "artifactType": "Agentic Foundation | Design Spec | Implementation Plan",
  "approvedRevision": "sha256 digest",
  "sourceSpecPath": "absolute path or none",
  "sourceSpecRevision": "sha256 digest or none",
  "foundationManifestPath": "absolute WAYFINDING.md path or none",
  "foundationRevision": "sha256 digest or none",
  "pluginSource": "installed | local-plugin-dir | skills-install",
  "pluginRoot": "verified absolute path or none",
  "workspacePolicy": "same-checkout"
}
```

The record is immutable for one launch attempt. If any value changes, discard
the attempt and prepare a new record.

## Phase Bindings

- **Brainstorming:** `artifactPath` is the absolute Approved
  `WAYFINDING.md`; `artifactType` is `Agentic Foundation`;
  `approvedRevision` equals `foundationRevision`; and
  `foundationManifestPath` equals `artifactPath`. The Approved manifest is both
  the phase artifact and the Foundation. `sourceSpecPath` and
  `sourceSpecRevision` are `none` because no Design Spec exists yet.
- **Planning:** `artifactPath` is the absolute Approved Design Spec,
  `artifactType` is `Design Spec`, and `approvedRevision` is its exact revision.
  A Foundation-backed workflow also carries the exact Approved
  `foundationManifestPath` and `foundationRevision`. The Design Spec itself is
  the source input, so the separate source-spec pair is `none`.
- **Implementation:** `artifactPath` is the absolute Approved Implementation
  Plan, `artifactType` is `Implementation Plan`, and `approvedRevision` is its
  exact revision. `sourceSpecPath` and `sourceSpecRevision` identify the exact
  Approved Design Spec. A Foundation-backed workflow also identifies the exact
  Approved Foundation.

Literal `none` is allowed only for a generic workflow with no Foundation in the
Foundation pair. `foundationManifestPath` and `foundationRevision` must be both
`none` or both exact values. The source-spec pair uses `none` only when the
phase has no separate source Design Spec, as defined above. Never use `none` to
hide missing affinity or a failed validation.

## Prepare Handoff

Run these checks from the checkout that owns every recorded artifact:

1. Resolve `checkoutRoot` with `git rev-parse --show-toplevel`. Require an
   absolute existing physical path and run every remaining Git check from that
   path.
2. Read the canonical remote with `git remote get-url origin`, or the
   repository's explicitly configured canonical remote when it has no
   `origin`. Require equality with `repositoryRemote`.
3. Read the branch with `git branch --show-current`. When empty, record the
   exact `git rev-parse HEAD` value and set `worktreeIdentity` to `detached`.
4. Compare `git rev-parse --git-dir` with `git rev-parse --git-common-dir` and
   check `git rev-parse --show-superproject-working-tree`. A nonempty
   superproject path means the current repository is a submodule, not proof of
   a linked worktree. Otherwise record `linked-worktree` when Git and common
   directories differ, `codex-managed-worktree` only when the active Codex host
   explicitly proves that identity, and `main-checkout` for the normal
   checkout.
5. Require `artifactPath` to be absolute, readable, at the expected path in this
   exact checkout, and consistent with the phase binding. For a Design Spec or
   Implementation Plan, run shared `artifact validate` with `artifactType` and
   `approvedRevision`. For an Agentic Foundation, run shared `foundation
   validate` with exact `checkoutRoot`, `artifactPath`, and `approvedRevision`.
6. When the source-spec pair is present, require both values and run `artifact
   validate` for `Design Spec` at that exact path and revision. When the phase
   requires a source spec, reject `none`.
7. When the Foundation pair is present, require both values, require the
   manifest to be the physical absolute
   `docs/agentic/WAYFINDING.md` in this checkout, and run `foundation validate`
   with `foundationRevision`. When a Foundation-backed phase requires the pair,
   reject `none`.
8. For Brainstorming, additionally require `artifactPath` and
   `foundationManifestPath` equality and `approvedRevision` and
   `foundationRevision` equality.
9. If any phase artifact, source spec, or Foundation working artifact is under
   `docs/superpowers/`, require `git check-ignore --quiet -- <path>` to succeed.
   Ignored local state makes a different checkout non-equivalent.
10. Verify the selected `pluginSource`:
    - `installed`: prove that the active host lists Superpowers Architecture as
      installed; `pluginRoot` may be `none` when the host owns the install path.
    - `local-plugin-dir`: resolve and verify the complete plugin root, require
      its manifests and shared skills to exist, and record the absolute path.
    - `skills-install`: resolve and verify the installed skill-pack root and
      record the absolute path.
11. Inspect `git status --short`. A dirty tree is allowed only when the next
    session targets this exact checkout and the changes are disclosed in the
    prompt. It never relaxes artifact, Foundation, branch, plugin, or staging
    guards.
12. Set `workspacePolicy` to `same-checkout`. Do not copy an ignored artifact or
    Foundation candidate into another checkout as a workaround.

Any failed or ambiguous check stops automatic launch. Print the complete
canonical prompt and the runtime adapter's quoting-safe manual fallback
instead.

## Canonical Prompt Envelope

The Brainstorming, Planning, or implementation prompt contains the full handoff
record as JSON, followed by these instructions:

```text
Before invoking the phase skill, acknowledge all fifteen handoff fields with
the exact received values. Then independently re-run repository, checkout,
branch, worktree, phase-artifact lifecycle/revision, source-spec,
Foundation-manifest/revision, ignored-file, and plugin-source checks from disk.
Use foundation validate for a recorded Agentic Foundation. Do not begin
next-phase work if any target-side value is missing, differs, or cannot be
proven. Report the mismatch and stop.
```

The target's first output includes the complete acknowledged record. At a
minimum, operators visibly verify `checkoutRoot`, `branch`, `artifactPath`,
`approvedRevision`, `foundationManifestPath`, and `foundationRevision` before
allowing phase work.

## Workspace Cases

- **Normal checkout:** automatic launch is allowed only when the adapter can
  address the saved checkout at exact `checkoutRoot`.
- **Linked worktree:** require the existing linked-worktree path. Creating a
  fresh worktree violates `same-checkout` and loses ignored artifacts.
- **Codex-managed worktree:** use the current managed worktree only when the app
  interface explicitly guarantees that exact identity. A generic new worktree
  target is not equivalent.
- **Detached checkout:** record the full commit as `branch` and require the
  target to remain detached at that commit. Do not silently create or select a
  branch.
- **Submodule:** treat the submodule root, remote, Git state, and applicable
  instruction chain as the repository boundary. Do not classify a submodule as
  a linked worktree merely because its Git directory is elsewhere.
- **Ignored artifact or candidate:** require the exact checkout path and
  confirm the file is still ignored and readable on both sides of the handoff.
- **Dirty tree:** disclose and preserve it in the exact checkout. Never stage,
  stash, discard, or copy changes merely to enable handoff.
- **Installed plugin:** require host inventory evidence before launch and again
  target-side.
- **Local plugin directory:** require the verified absolute plugin root and a
  runtime mechanism that binds the new session to that exact directory.
- **Unsafe fallback:** if checkout targeting, ignored-file continuity,
  Foundation continuity, plugin affinity, lifecycle state, or target
  acknowledgement cannot be proven, do not launch. Print all fifteen fields,
  the canonical prompt, and a quoting-safe manual command.

## Target-Side Gate

The receiving session performs no Brainstorming, Planning, or implementation
before it:

1. prints an exact acknowledgement of all fifteen handoff fields;
2. validates repository, checkout, branch or commit, and worktree identity;
3. validates the phase artifact and source Design Spec when applicable;
4. runs `foundation validate` for every recorded Foundation and confirms all
   cross-field phase bindings;
5. verifies ignored local files and plugin affinity in that session; and
6. confirms `workspacePolicy: same-checkout` is actually satisfied.

Mismatch is a terminal handoff result, not permission to choose a nearby
checkout, branch, artifact revision, Foundation revision, or plugin
installation.
