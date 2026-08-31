# Installation

Superpowers Architecture supports two distribution channels: GitHub/skills.sh
for Codex and the Codex plugin package. npm is not a
supported channel; the repository `package.json` is private tooling metadata.

Node.js 20 or newer is required for policy-aware artifact lifecycle, portable
bound SDD operations, Agentic Foundation lifecycle/candidate/receipt,
transactional existing-project migration, v2 handoff, and compact startup
operations. Missing Node is visible at startup and causes
correctness-critical operations to fail closed.

## Skills CLI

Superpowers Architecture is installable as a skills.sh package:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture
```

The CLI discovers the skills from this repository's `skills/<name>/SKILL.md` layout. It should list 16 skills.

To preview the available skills without installing:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture --list
```

To install every skill globally for Codex without prompts:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -a codex -g -y
```

Complete artifact-lifecycle and SDD workflows must install
`using-superpowers` alongside every consuming phase skill. It owns the single
portable operation module. A partial install that omits it fails closed and
prints this full-package recovery command:

```powershell
npx.cmd skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -y
```

Omit `-g` to install into the current project instead of the user-level skills directory.

On Windows PowerShell, use `npx.cmd` if the `npx.ps1` shim is blocked by execution policy:

```powershell
npx.cmd skills@latest add NenadBanjeglav/superpowers-architecture
```

After installation, start project inception or reorientation with:

```text
Use the wayfinder skill to establish the Agentic Foundation for <project>.
```

The former `project-setup` invocation was removed in version 0.5.0. This is a
breaking migration, not an alias; use `wayfinder`.

## Codex Plugin Package

The `npx skills` flow installs the shared skills. It does not install Codex plugin hooks.

This repository also includes Codex plugin packaging:

- `.codex-plugin/plugin.json`
- `hooks/hooks-codex.json`
- `hooks/session-start-codex`
- `hooks/run-hook.cmd`

Use Codex's plugin install or marketplace flow when you need the complete Codex
adapter. A release claim requires evidence from the installed plugin: load,
  startup/resume/clear/compaction behavior, Wayfinder discovery, the seven
Foundation operations, receipt-backed validation, isolated dispatch,
fresh-task handoff, same-checkout/plugin affinity, and safe fallback.

## Local Development

Clone the repo:

```powershell
git clone https://github.com/NenadBanjeglav/superpowers-architecture.git
```

### Expected Plugin Identity

- Display name: `Superpowers Architecture`
- Package name: `superpowers-architecture`
- Repository: `https://github.com/NenadBanjeglav/superpowers-architecture`

## Automated Handoff Prerequisites

Automated fresh-session mode depends on runtime support.

- Codex App uses only a genuinely new project task that can target the exact
  saved checkout; it never uses a conversation fork.
- The target must echo and independently revalidate the complete v2 envelope,
  its revision, and the fifteen-field record before phase work.
- The envelope carries Approval Policy, bounded goal, constraint source,
  Foundation receipt, and Brainstorming bindings outside the fixed record. The
  record uses `artifactRevision`.
- Ignored specs, plans, Foundation candidates, and receipts remain valid only
  in the exact checkout that owns them. A copied artifact, nearby worktree, or
  different local plugin root is not equivalent.
- `pluginSource` and `pluginRoot` must identify the installed package,
  local-plugin directory, or complete skills install available to the target
  session. Uncertain affinity falls back without automatic launch.
- Installed v1-only receivers accept genuinely Approved artifacts and reject
  Ready. They cannot be used to fabricate approval for an Autonomous handoff.

If the runtime cannot launch a fresh session automatically, Superpowers Architecture prints the exact next-phase prompt or command and stops.

See [Runtime Support](runtime-support.md) for host behavior and
[Release](release.md) for the evidence and publication gates.
