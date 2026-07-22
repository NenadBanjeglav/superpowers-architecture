# Phase Handoff Contract

Automated fresh-session mode crosses a trust boundary. Before launch, the
current session must run **prepare handoff** and produce one verified,
host-neutral record. The next session must acknowledge the same record and
repeat its checks before it invokes the next phase skill.

Phase handoff is not subagent dispatch. It starts a new user-owned session with
no dependency on the current conversation history.

## Handoff Record

Use exactly these fields:

```json
{
  "phase": "planning | implementation",
  "repositoryRemote": "canonical git remote URL",
  "checkoutRoot": "absolute path",
  "branch": "branch name or detached commit",
  "worktreeIdentity": "main-checkout | linked-worktree | codex-managed-worktree | detached",
  "artifactPath": "absolute path",
  "artifactType": "Design Spec | Implementation Plan",
  "approvedRevision": "sha256 digest",
  "sourceSpecPath": "absolute path or none",
  "sourceSpecRevision": "sha256 digest or none",
  "pluginSource": "installed | local-plugin-dir | skills-install",
  "pluginRoot": "verified absolute path or none",
  "workspacePolicy": "same-checkout"
}
```

The record is immutable for one launch attempt. If any value changes, discard
the attempt and prepare a new record.

## Prepare Handoff

Run these checks from the checkout that owns the approved artifact:

1. Resolve `checkoutRoot` with `git rev-parse --show-toplevel`. Require an
   absolute, existing path and run every remaining Git check from that path.
2. Read the canonical remote with `git remote get-url origin`, or the
   repository's explicitly configured canonical remote when it has no
   `origin`. Require it to equal the expected repository identity.
3. Read the branch with `git branch --show-current`. When empty, record the
   exact `git rev-parse HEAD` value and set `worktreeIdentity` to `detached`.
4. Compare `git rev-parse --git-dir` with `git rev-parse --git-common-dir` and
   check `git rev-parse --show-superproject-working-tree`. A nonempty
   superproject path means the current repository is a submodule, not proof of
   a linked worktree. Otherwise record `linked-worktree` when the Git and common
   directories differ, `codex-managed-worktree` only when the active Codex host
   explicitly identifies it as such, and `main-checkout` for the normal
   checkout.
5. Require `artifactPath` to be absolute, readable, and located at the expected
   path in this exact checkout. Run the shared `artifact validate` operation
   with `artifactType` and `approvedRevision`. For implementation, validate the
   referenced Approved Design Spec at `sourceSpecPath` and
   `sourceSpecRevision` too.
6. If the artifact is under `docs/superpowers/`, require
   `git check-ignore --quiet -- <artifactPath>` to succeed. Its ignored status
   is intentional local developer state, so a different checkout cannot be
   assumed to contain it.
7. Verify the selected `pluginSource`:
   - `installed`: prove that the active host lists Superpowers Architecture as
     installed; `pluginRoot` may be `none` when the host owns the install path.
   - `local-plugin-dir`: resolve and verify the complete plugin root, require
     its manifests and shared skills to exist, and record that absolute path.
   - `skills-install`: resolve and verify the installed skill-pack root and
     record that absolute path.
8. Inspect `git status --short`. A dirty tree is allowed only when the next
   session targets the exact same checkout and the changes are disclosed in
   the prompt. It never relaxes artifact, branch, plugin, or staging guards.
9. Set `workspacePolicy` to `same-checkout`. Do not copy an ignored artifact to
   another checkout as a workaround.

Any failed or ambiguous check stops automatic launch. Print the complete
canonical prompt and the runtime's quoting-safe manual fallback instead.

## Canonical Prompt Envelope

The planning or implementation prompt must contain the full handoff record as
JSON, followed by these instructions:

```text
Before invoking the phase skill, acknowledge every handoff field with the exact
received value. Then independently re-run repository, checkout, branch,
worktree, artifact lifecycle/revision, source-spec, ignored-file, and plugin
source checks from disk. Do not begin next-phase work if any target-side value
is missing, differs, or cannot be proven. Report the mismatch and stop.
```

The target's first output must include the complete acknowledged record. At a
minimum, operators must visibly verify `checkoutRoot`, `branch`,
`artifactPath`, and `approvedRevision` before allowing phase work to continue.

## Workspace Cases

- **Normal checkout:** automatic launch is allowed only when the adapter can
  address the saved checkout at the exact `checkoutRoot`.
- **Linked worktree:** require the existing linked-worktree path. Creating a
  fresh worktree violates `same-checkout` and loses ignored artifacts.
- **Codex-managed worktree:** use the current managed worktree only when the app
  API explicitly guarantees that exact identity. A generic new worktree target
  is not equivalent.
- **Detached checkout:** record the full commit as `branch` and require the
  target to remain detached at that commit. Do not silently create or select a
  branch.
- **Submodule:** treat the submodule root, remote, Git state, and applicable
  instruction chain as the repository boundary. Do not classify a submodule as
  a linked worktree merely because its Git directory is elsewhere.
- **Ignored artifact:** require the exact checkout path and confirm the file is
  still ignored and readable on both sides of the handoff.
- **Dirty tree:** disclose it and preserve it in the exact checkout. Never
  stage, stash, discard, or copy changes merely to enable handoff.
- **Installed plugin:** require host inventory evidence for the installed
  Superpowers Architecture plugin before launch and again target-side.
- **Local plugin directory:** require the verified absolute plugin root and a
  runtime mechanism that binds the new session to that exact directory.
- **Unsafe fallback:** if checkout targeting, ignored-file continuity, plugin
  affinity, lifecycle state, or target acknowledgement cannot be proven, do
  not launch. Print the full record, canonical prompt, and a quoting-safe manual
  command so the user can start the phase deliberately.

## Target-Side Gate

The receiving session performs no planning or implementation before it:

1. prints an exact acknowledgement of all thirteen handoff fields;
2. validates repository, checkout, branch/commit, and worktree identity;
3. validates every Approved artifact at the expected revision through the
   shared lifecycle operation;
4. verifies ignored local files and plugin affinity in that session; and
5. confirms `workspacePolicy: same-checkout` is actually satisfied.

Mismatch is a terminal handoff result, not permission to choose a nearby
checkout, branch, artifact revision, or plugin installation.
