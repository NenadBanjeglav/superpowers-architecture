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
/superpowers-architecture:brainstorming
/superpowers-architecture:writing-plans
/superpowers-architecture:subagent-driven-development
/superpowers-architecture:finishing-a-development-branch
```

The first Claude release does not add Claude agents, MCP servers, LSP servers, monitors, output styles, or runtime-specific skill forks.
