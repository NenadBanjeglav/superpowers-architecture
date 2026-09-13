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
validates dependencies and extracts task text from one validated plan snapshot.
Legacy positional calls are for legacy controllers only.

Task, review, and progress commands return JSON with the output path/result;
workspace prints its absolute path. Record the returned unique path, never guess
it. Missing Node.js 20+ or the sibling core must fail closed; do not recreate
briefs, packages, or progress with ad hoc shell parsing.

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
