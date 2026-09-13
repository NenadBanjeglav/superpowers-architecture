# AGENTS.md

## Purpose

A single-entry marketplace for the Superpowers Architecture Codex plugin.

## Ownership

- Owns marketplace.json.
- .codex-plugin/AGENTS.md owns the root plugin manifest.

## Local Contracts

- Marketplace name: superpowers-architecture.
- One plugin entry: superpowers-architecture, source.path "./" relative to the
  repository root. Do not create a second plugin copy.
- Keep installation AVAILABLE, authentication ON_INSTALL, and products CODEX.
- Product identity, URLs, and package version follow the root plugin.

## Work Guidance

- Keep this a discovery adapter without skill or workflow policy.

## Verification

- Parse JSON, validate identifiers, and resolve the entry to the root manifest.
- Smoke-test marketplace add and plugin add using an isolated Codex configuration.

## Child DOX Index

- No child AGENTS.md files.
