# SDD Operation Details

Read when preparing a task brief, committed review package, or progress record.
All operations use the shared Node core under `using-superpowers/scripts/`.
Use the active runtime's launcher; paths below are relative to the SDD skill.

| Operation | Bash / Git Bash / WSL / Unix | Windows cmd / PowerShell |
| --- | --- | --- |
| Workspace | `scripts/sdd-workspace` | `scripts/sdd-workspace.cmd` |
| Bound task | `scripts/task-brief PLAN N OUTFILE BINDING_FILE` | `scripts/task-brief.cmd PLAN N OUTFILE BINDING_FILE` |
| Bound review | `scripts/review-package BASE HEAD OUTFILE BINDING_FILE` | `scripts/review-package.cmd BASE HEAD OUTFILE BINDING_FILE` |
| Read progress | `scripts/progress read` | `scripts/progress.cmd read` |
| Complete task | `scripts/progress complete --task N --base BASE --head HEAD --review clean` | `scripts/progress.cmd complete --task N --base BASE --head HEAD --review clean` |

New controllers pass the exact v2 SDD binding defined by `writing-plans`:
policy, plan/spec paths and revisions, and all four Foundation fields. The core
validates physical checkout containment and the complete plan/spec/Foundation
graph, including the spec's manifest/base when the plan declares none. It extracts
task text from the validated plan snapshot.
Legacy positional calls are for legacy controllers only.

Outputs must be regular generated files, separate from every bound input and
existing lifecycle artifact. Linked files/directories, hardlinks and protected
aliases fail before replacement. Workspace initialization preserves compatible
`.gitignore` metadata; reconcile incompatible state explicitly. Ordinary generated
files can be regenerated. Writes use exclusive sibling temporaries and a final
safety check; cooperative writer quiescence still applies.

Task, review, and progress commands return JSON with the output path/result;
workspace prints its absolute path. Record the returned unique path, never guess
it. Missing Node.js 20+ or the sibling core must fail closed; do not recreate
briefs, packages, or progress with ad hoc shell parsing.

Before generation and after resume/rebind or possible owner change, compare
current work/outcome selection with the exact binding per
[product-evolution.md](../../using-superpowers/references/product-evolution.md).
The core validates identities; the controller verifies semantic selection and
evidence. Do not add JSON fields or infer selection from Ready or dates. Stop
stale workers before changing selection, then regenerate briefs and review
inputs. Include the owner path and task evolution/budget/test/sunset context;
reuse prior evidence only after successor-contract and exact diff checks.

Keep bulk context in files. An implementer gets the task brief, exact
architecture bindings, necessary prior interfaces, and report path. Reviewers
get that brief, report, complete diff package, spec/plan bindings, constraints,
and rubric. Reports record actual commands/results; final worker messages carry
status, commits, concise tests/concerns, and the report path.

The task base is the commit recorded before dispatch, never HEAD~1. The final
base is the verified branch-start/merge base. Ensure pending edits are explicitly
reviewed before committing; committed range packages cannot cover unstaged bytes.

`progress read` returns completed entries and `unparsedLines`. Verify entries
against Git; reconcile unrecognized state before dispatch/writes. After clean
review, `progress complete` validates revisions and atomically replaces the
task entry using the operation's serialization. Preserve the ignored ledger.
After resume/compaction, reread disk and Git before trusting progress; if lost,
recover from actual commits and evidence instead of redispatching everything.
