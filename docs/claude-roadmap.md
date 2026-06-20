# Claude Plugin Availability

Superpowers Architecture ships Claude Code support as a post-V1 runtime adapter over the shared skill core.

The Claude adapter includes:

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `hooks/hooks.json`
- `hooks/session-start-claude`

Shared skill files remain in:

```text
skills/<skill>/SKILL.md
```

Claude plugin skills are namespaced:

```text
/superpowers-architecture:project-setup
/superpowers-architecture:brainstorming
/superpowers-architecture:writing-plans
/superpowers-architecture:subagent-driven-development
/superpowers-architecture:finishing-a-development-branch
```

## Automated Fresh-Session Handoff

Claude Code automated fresh-session mode uses background sessions:

```bash
claude --bg --name "spa-<phase>-<artifact-slug>" "<canonical next-phase prompt>"
```

If background agents are unavailable or disabled, the agent prints a quoting-safe command and the canonical prompt instead of launching automatically.

The first Claude release does not add Claude agents, MCP servers, LSP servers, monitors, output styles, or runtime-specific skill forks.
