# Claude Code Tool Mapping

Skills speak in actions ("dispatch a subagent", "create a todo", "read a file"). On Claude Code these resolve to the tools below.

| Action skills request | Claude Code equivalent |
|----------------------|------------------------|
| Read a file | `Read` |
| Create a file | `Write` |
| Edit a file | `Edit` or `MultiEdit` |
| Run a shell command | `Bash` |
| Search file contents | `Grep` |
| Find files by name | `Glob` |
| Fetch a URL | `WebFetch` |
| Search the web | `WebSearch` |
| Invoke a skill | Use the skill directly, including plugin namespace when installed as a plugin |
| Dispatch a subagent | `Agent` |
| Ask the user a structured question | `AskUserQuestion` |
| Track tasks | `TodoWrite` |

## Instructions File

Claude Code project instructions normally live in `CLAUDE.md`. This repository uses `AGENTS.md` for its own DOX contracts; keep following the applicable `AGENTS.md` chain when editing this repository.

## Personal Skills Directory

Claude Code can load personal and project skills, and plugin skills are namespaced by plugin name. For this plugin, Claude Code invocations use:

```text
/superpowers-architecture:wayfinder
/superpowers-architecture:brainstorming
/superpowers-architecture:writing-plans
/superpowers-architecture:subagent-driven-development
/superpowers-architecture:finishing-a-development-branch
```

## Plugin Runtime

Claude marketplace installs are copied into Claude's plugin cache. Hook scripts and skill references must use `${CLAUDE_PLUGIN_ROOT}` for bundled plugin files and must write generated project docs under the user's current repository, not inside the plugin cache.

## Host-Neutral Dispatch Adapter

Consume the request in [dispatch-contract.md](dispatch-contract.md) through the current Claude Code `Agent`/subagent surface. [Official Claude Code subagent documentation](https://code.claude.com/docs/en/sub-agents) describes each new subagent as starting in a fresh context window without the parent conversation history, while receiving a composed delegation prompt and basic environment details.

At dispatch time:

1. Read the bounded `promptPath` and verify every `artifactPaths` entry is readable. Pass only that crafted prompt and those paths; do not paste controller history or accumulated task summaries.
2. Inspect the installed Claude version and its advertised Agent/subagent schema or help. If that version does not provide or document the requested no-history behavior, disclose the reduced isolation before dispatch or use deterministic self-review.
3. Preserve any explicit user model selection. Otherwise map `fast`, `balanced`, or `strongest-available` only to models or aliases advertised by the installed host. If no valid mapping is available, inherit the runtime default and disclose the reduced guarantee.
4. Use a normal shared checkout only for sequential writers. Use read-only tools or prompt constraints for `read-only-review`, and `isolation: worktree` only when the installed Agent surface advertises it.
5. Report the Agent operation used, actual isolation behavior, selected or inherited model behavior, workspace realization, and any reduced guarantee.

A subagent remains part of one Claude session. It is never a substitute for the new named background session required by automated phase handoff.

## Automated Phase Handoff In Claude Code

When automated fresh-session mode is selected and an artifact has been
explicitly approved, Claude Code may start the next phase in a named background
session. First run `prepare handoff` from
[phase-handoff.md](phase-handoff.md) and build the canonical prompt from the
complete verified record. For Foundation-backed Planning and implementation,
that prompt carries `Foundation Application Receipt` as an external binding
outside the unchanged record.

Do not use `/bg` to background the current conversation. The fresh session must
start from the canonical prompt without current conversation history.

Before launch:

1. Resolve and change to the exact `checkoutRoot`. Re-run the remote,
   branch/commit, worktree, ignored-artifact, and lifecycle checks there. The
   named background session must preserve `workspacePolicy: same-checkout`.
2. Inspect the installed `claude --help`. Require it to advertise `--bg` and
   `--name`; command syntax that is absent from the installed CLI is not safe to
   assume. Also require Agent View/background operation to be enabled and the
   current authentication to work.
3. For `pluginSource: installed`, require `claude plugin list --json` to contain
   the Superpowers Architecture plugin and repeat that inventory check in the
   target prompt.
4. For `pluginSource: local-plugin-dir`, require the installed CLI to advertise
   `--plugin-dir`, verify the exact absolute `pluginRoot`, and include
   `--plugin-dir <pluginRoot>` in the launch. For `skills-install`, verify the
   exact installed skill root on both sides. These checks are the required
   plugin affinity proof; inventory by name alone does not prove a local root.
5. Re-run `foundation validate` for a recorded `foundationManifestPath` and
   `foundationRevision`. For `phase: brainstorming`, require those values to
   equal the phase artifact path and revision. For Planning or implementation,
   require the external Foundation Application Receipt path, prove it is
   readable and ignored in the exact checkout, and use receipt-backed
   `foundation validate` to revalidate the source-spec base, receipt, and
   resulting `foundationRevision`.
6. Require the new session's first output to acknowledge all fifteen handoff
   fields and separately acknowledge the external receipt binding. It shows the
   exact `checkoutRoot`, `branch`, `artifactPath`, `approvedRevision`,
   `foundationManifestPath`, `foundationRevision`, and receipt before invoking
   `/superpowers-architecture:brainstorming` or another next phase skill.

Only after every check passes, launch from the verified checkout. For an
installed plugin:

```bash
claude --bg --name "spa-<phase>-<artifact-slug>" "<canonical next-phase prompt>"
```

For an exact local plugin root:

```bash
claude --plugin-dir "<verified-absolute-plugin-root>" --bg --name "spa-<phase>-<artifact-slug>" "<canonical next-phase prompt>"
```

The installed CLI's output is the authority for the created session identity
and available management commands. The current official background-agent
documentation is [Agent View](https://code.claude.com/docs/en/agent-view), but
installed capability discovery remains mandatory because CLI flags can differ
by version.

PowerShell quoting-safe launch:

```powershell
$handoffPromptPath = Join-Path $env:TEMP 'superpowers-next-phase-prompt.txt'
@'
<canonical prompt with complete handoff record and target-side gate>
'@ | Set-Content -NoNewline -Encoding UTF8 -LiteralPath $handoffPromptPath
$handoffPrompt = Get-Content -Raw -LiteralPath $handoffPromptPath
Set-Location -LiteralPath '<verified-checkout-root>'
claude --plugin-dir '<verified-plugin-root>' --bg --name 'spa-<phase>-<artifact-slug>' $handoffPrompt
```

Bash quoting-safe launch:

```bash
prompt_file="$(mktemp)"
cat > "$prompt_file" <<'EOF'
<canonical prompt with complete handoff record and target-side gate>
EOF
cd -- '<verified-checkout-root>'
claude --plugin-dir '<verified-plugin-root>' --bg --name 'spa-<phase>-<artifact-slug>' "$(cat "$prompt_file")"
```

For `installed` or `skills-install`, omit `--plugin-dir` from those fallback
templates. The canonical prompt names the next skill as
`/superpowers-architecture:<skill>` when plugin namespacing is required and
contains all fifteen handoff fields from
[phase-handoff.md](phase-handoff.md).

If `claude` is unavailable, authentication or background agents are disabled,
the installed help lacks `--bg`, `--name`, or a required `--plugin-dir`, plugin
inventory does not match, the exact checkout cannot be entered, receipt
affinity is uncertain, or any affinity check is ambiguous, use the safe fallback:
do not launch. Print the applicable quoting-safe command, the
complete canonical prompt, and the failed preflight field. Missing
installed-host evidence remains a release blocker; a printed fallback is not
successful phase-handoff evidence.

## Finishing

By default, `finishing-a-development-branch` is summary-only on Claude Code: run final verification, confirm local Superpowers docs are not staged, summarize commits, changed files, tests, and risks, then stop.

Only push, merge, open a PR, or discard work when the user explicitly asks. For those explicit requests, use normal git safety checks first, including checking branch state, staged files, and whether the workspace is externally managed or detached.
