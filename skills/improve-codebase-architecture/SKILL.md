---
name: improve-codebase-architecture
description: Use when scanning a codebase for shallow modules, unclear interfaces, weak seams, poor adapters, poor locality, low leverage, or weak test surfaces
---

# Improve Codebase Architecture

Use Matt Pocock's `codebase-design` vocabulary to find architecture deepening opportunities. Produce markdown-only local architecture reviews.

## Inputs

Start from the user's selected repo area or the current repo. Inspect the codebase directly. Do not require browser output, Tailwind, Mermaid, temporary HTML files, `context.md`, or ADRs.

## Review Criteria

Look for:

- shallow modules with large interfaces and thin implementation
- unclear module ownership
- seams in the wrong place
- adapters mixed into core logic
- tests crossing past the intended interface
- repeated caller complexity that should move behind a deeper interface
- poor locality, where one behavior change spreads across many files

## Present Candidates As Markdown

Write a markdown review to:

`docs/superpowers/architecture-reviews/YYYY-MM-DD-<topic>.md`

The review is local developer working state. Do not commit it unless explicitly requested.

Each candidate must include:

- Files/modules involved
- Problem
- Proposed deepening
- Interface/seam impact
- Adapter impact
- Test-surface impact
- Benefits in locality and leverage
- Recommendation strength: Strong, Worth exploring, or Speculative

End with a top recommendation.

## Conversation

After writing the review, ask which candidate the user wants to pursue. If they choose one, use `brainstorming` for a feature-level design spec before planning or implementation.

Do not create `context.md`. Do not create ADRs.
