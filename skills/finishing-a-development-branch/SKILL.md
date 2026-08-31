---
name: finishing-a-development-branch
description: Use when implementation tasks are complete and final verification, review evidence, commit summary, changed-file summary, and local closeout are needed
---

# Finishing a Development Branch

Resolve the effective **Approval Policy** and exact policy-accepted spec, plan,
and optional Foundation bindings. Approval Policy controls artifact progression;
it does not authorize push, merge, PR creation, deployment, publication,
spending, communication with others, destructive cleanup, or discarding work.

1. Read applicable instructions and the exact current plan/spec/Foundation
   evidence from disk.
2. Confirm every planned task is complete, its review findings are resolved,
   and its recorded commit range matches Git history.
3. Run `verification-before-completion` against the bounded goal, acceptance
   criteria, Architecture Conformance, and applicable full test/build checks.
4. Run the final isolated whole-branch review when available. Under Autonomous,
   repair in-scope findings and rerun affected checks without a human gate.
   Under Review-gated, only an actual changed artifact revision returns to the
   readable user-review flow.
5. Inspect working tree, index, branch/worktree identity, and commits. Confirm
   root/local instructions and `docs/superpowers/**` are not staged unless the
   user explicitly requested them.
6. Report commits, changed files, tests and exact results, satisfied acceptance
   criteria, residual risks, ignored local artifacts, installed-runtime evidence
   limits, and any separately authorized action still pending.

Default closeout is local and summary-only. Do not offer or perform a merge,
push, PR, release, deployment, publication, discard, stash, branch deletion, or
cleanup menu unless the user explicitly asks for that action. Preserve untracked
and ignored user work.
