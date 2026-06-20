# Installation

## Skills CLI

Superpowers Architecture is installable as a skills.sh package:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture
```

The CLI discovers the skills from this repository's `skills/<name>/SKILL.md` layout. It should list 15 skills.

To preview the available skills without installing:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture --list
```

To install every skill globally for Codex without prompts:

```bash
npx skills@latest add NenadBanjeglav/superpowers-architecture --skill '*' -a codex -g -y
```

Omit `-g` to install into the current project instead of the user-level skills directory.

On Windows PowerShell, use `npx.cmd` if the `npx.ps1` shim is blocked by execution policy:

```powershell
npx.cmd skills@latest add NenadBanjeglav/superpowers-architecture
```

## Codex Plugin Package

The `npx skills` flow installs the shared skills. It does not install Codex plugin hooks.

This repository also includes Codex plugin packaging:

- `.codex-plugin/plugin.json`
- `hooks/hooks-codex.json`
- `hooks/session-start-codex`
- `hooks/run-hook.cmd`

Use Codex's plugin install or marketplace flow when you specifically need the Codex session-start hook. If you maintain a personal Codex marketplace, add this plugin to that marketplace and install it from the Codex app.

## Local Development

Clone the repo:

```powershell
git clone https://github.com/NenadBanjeglav/superpowers-architecture.git
```

### Expected Plugin Identity

- Display name: `Superpowers Architecture`
- Package name: `superpowers-architecture`
- Repository: `https://github.com/NenadBanjeglav/superpowers-architecture`

## Claude Code Plugin

Claude support is shipped through a post-V1 Claude Code plugin adapter over the same shared skills.

In Claude Code:

```text
/plugin marketplace add NenadBanjeglav/superpowers-architecture
/plugin install superpowers-architecture@superpowers-architecture
```

Invoke skills with the plugin namespace:

```text
/superpowers-architecture:brainstorming
/superpowers-architecture:writing-plans
/superpowers-architecture:subagent-driven-development
/superpowers-architecture:finishing-a-development-branch
```

For local development from the repository root:

```bash
claude --plugin-dir .
```

After editing plugin manifests or hooks in an active Claude session, run:

```text
/reload-plugins
```
