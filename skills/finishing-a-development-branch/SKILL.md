---
name: finishing-a-development-branch
description: Use when implementation tasks are complete and final verification, commit summary, changed-file summary, and residual risk summary are needed
---

# Finishing A Development Branch

Verify the work and summarize it. Do not push, merge, open a PR, or discard work unless the user explicitly asks.

## Process

1. Read the implementation plan and referenced spec.
2. Run the final verification commands required by the plan.
3. Run `git status --short`.
4. Confirm `docs/superpowers/**` is not staged.
5. Summarize:
   - commits created
   - changed files
   - tests and manual checks run
   - requirements satisfied
   - remaining risks
6. Stop.

## Explicit Requests

If the user explicitly asks to push, merge, open a PR, or discard work, handle that request directly with normal git safety checks.

Never force-push or rewrite remote history unless the user explicitly asks and confirms.
