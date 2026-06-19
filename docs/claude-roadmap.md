# Claude Roadmap

V1 is Codex-first.

Claude support should be added only after the Codex release is stable.

Future Claude support should add:

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `hooks/hooks.json`
- Claude-specific `session-start` hook using `${CLAUDE_PLUGIN_ROOT}`

Shared skill files should remain in:

```text
skills/<skill>/SKILL.md
```

Claude plugin skills should be namespaced, for example:

```text
/superpowers-architecture:brainstorming
```

Do not ship `.claude-plugin/` in V1.
