---
name: finishing-a-development-branch
description: Use after implementation to verify acceptance, review coverage, and local Git closeout.
---

# Finishing a Development Branch

Read applicable instructions, Approval Policy, and exact current policy-accepted
spec/plan and optional Foundation evidence from disk. Confirm all planned tasks
are complete and their recorded ranges match Git history.

Use `verification-before-completion` to check the bounded goal, acceptance
criteria, Architecture Conformance, and applicable integrated test/build evidence.
Use `requesting-code-review` for final whole-branch review ownership. Reuse an
existing final review only when its exact source and artifact coverage is
unchanged; fixes or changed requirements require affected re-review. Repair
in-scope findings under Autonomous without a human gate. Review-gated applies
only when authoritative content changes.

Inspect the working tree, index, physical checkout, branch, and commits. Keep
local-only instructions and `docs/superpowers/**` unstaged unless explicitly
requested. Preserve untracked and ignored user work.

Report the result, commits and meaningful changes, verification, acceptance gaps,
risks, ignored working artifacts, and actual installed-runtime limitations.
Detailed records can remain in the ignored evidence files.

Default closeout is local and summary-only. Approval Policy does not grant
authority for push, merge, PR creation, deployment, release, spending, messages
to others, destructive cleanup, stash, or discarding work. Complete external
actions already authorized by the user after their applicable checks; ask only
for authority that is actually missing. Do not introduce a routine action menu.
