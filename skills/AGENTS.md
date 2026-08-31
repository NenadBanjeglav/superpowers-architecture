# AGENTS.md

## Purpose

Shared Superpowers Architecture skills, prompts, references, and helper scripts.

## Ownership

- Owns every `skills/<skill>/SKILL.md`.
- Owns skill-local prompts, references, and scripts.
- Root AGENTS.md owns adaptation policy, banned flows, and product positioning.

## Local Contracts

- Keep skills shared across Codex and Claude Code by using `skills/<skill>/SKILL.md`.
- Shared skill workflow policy must stay runtime-neutral; host-specific tool and install details belong in runtime adapters or `skills/using-superpowers/references/`.
- Shared skills use bare canonical skill identities. Plugin namespaces, host tool names, context flags, session flags, and concrete model identifiers belong only in runtime references.
- `skills/using-superpowers/references/dispatch-contract.md` owns the host-neutral subagent request. Isolation means no parent conversation turns and must be verified by the runtime adapter; capability tiers map only to choices advertised by the active host, with explicit user model choices taking precedence.
- `skills/using-superpowers/references/phase-handoff.md` owns the host-neutral fifteen-field fresh-session preflight. Handoffs bind the exact repository, checkout, branch/worktree, phase artifact, source spec, Agentic Foundation, plugin source, and `same-checkout` policy; the target must acknowledge and independently revalidate every field before phase work. The Brainstorming prompt additionally binds the selected ready roadmap outcome identity and its exact canonical prompt outside the unchanged record.
- `skills/using-superpowers/scripts/` owns the shared Node.js operation module, including artifact canonicalization and lifecycle state. Runtime adapters and consuming phase skills must call that module rather than reimplement its behavior.
- `wayfinder` is the sole downstream project-inception and project-wide reorientation skill. It owns documentation-only discovery, the resumable Wayfinding Map, exact Foundation review, Blueprint-traceable roadmap outcomes, and the first Foundation-to-Brainstorming handoff.
- `skills/wayfinder/references/agentic-foundation-contract.md` is the only detailed downstream document-shape contract. Keep the Root Router, compact dashboard, truth owners, Decision Ledger, Project Blueprint, roadmap, verification, lifecycle metadata, manifest grammar, identity grammar, readiness, Phase Mode, and optional-document rules local there.
- Agentic Foundation lifecycle and candidate correctness remain in the one shared Node operation core and `agentic-foundation-lifecycle.md`. Skills call host-neutral Foundation operations, including explicit readiness and policy-aware preview/apply/validation; runtime references only map concrete host capabilities. Explicit-policy application uses v2 receipts with distinct lifecycle snapshots and application time; v1 evidence retains its historical checks.
- Current truth has one owning Foundation document. Each durable decision also appends one immutable ledger entry; only the Current Decision Index records current or superseded state, and prior ledger entries remain byte-for-byte unchanged. Navigation documents point to owners and identities instead of copying detail.
- Blueprint requirements and roadmap outcomes use stable identities. Brainstorming Design Specs trace bounded outcomes back to the Blueprint, and durable or operating-contract changes enter one prospective Foundation candidate for the combined Design Change Set review.
- Foundation candidates under `docs/superpowers/foundation-candidates/` are ignored, non-authoritative complete-file previews. Exact application is bound to the reviewed prospective revision and the lifecycle contract's quiescent-application precondition.
- Portable SDD workspace, task-brief, review-package, and progress behavior lives in the shared Node operation core. Bash and Windows files under `subagent-driven-development/scripts/` are process-only launchers; progress writes use a sibling temporary file, atomic rename, and serialized replacement.
- The marked `STARTUP-CONTRACT` block in `using-superpowers/SKILL.md` is the only startup-policy source. The shared Node renderer extracts it into host envelopes no larger than 4,000 characters; hook launchers own process invocation and exact visible Node-degraded JSON only.
- Workspace preparation detection is a read-only shared Node operation. Applicable project instructions win; declarations outrank same-ecosystem lockfiles; ambiguity runs nothing; baseline verification is resolved independently and never inferred from the selected package manager.
- Node.js 20 or newer is required for correctness-critical artifact operations. Missing Node or a missing sibling operation module must fail closed with actionable installation guidance.
- `skills/using-superpowers/references/workflow-policy.md` owns Approval Policy precedence and progression. Version 2 defaults new and existing projects to Autonomous; Review-gated requires a new explicit opt-in, and Phase Mode remains independent.
- Specs and implementation plans use the shared Draft/Ready/Approved lifecycle. Ready carries no human-approval metadata; Approved preserves exact human provenance. Explicit Autonomous validation accepts Ready or Approved, explicit Review-gated and legacy omitted-policy validation require Approved. All states bind to the exact canonical SHA-256 payload revision.
- Foundation, spec, and plan document reviewers are advisory only. Dispatch them with isolated read-only context and the shared architecture-conformance rubric when available; otherwise use the owning phase skill's deterministic self-review. They report readiness or issues according to policy and never approve artifacts.
- Do not create or maintain `context.md`.
- `wayfinder` may create uppercase root `CONTEXT.md` only in a deliberate downstream project; this plugin repository must not create its own root `CONTEXT.md` or `docs/agentic/` Foundation.
- Do not create ADR files.
- Do not include Matt issue, PRD, or triage flows.
- Remove visual companion behavior from active brainstorming behavior.
- Preserve Matt's `codebase-design` vocabulary: module, interface, seam, adapter, depth, leverage, locality, test surface.
- `skills/codebase-design/ARCHITECTURE-CONFORMANCE.md` is the shared plan/implementation/TDD/review rubric. Every consumer receives exact Approved spec/plan identities and their binding modules, interfaces, seams/adapters, data flow, depth/locality/leverage intent, and test surface; any violation blocks completion and design changes require a newly Approved artifact revision.

## Work Guidance

- Clean-rewrite high-policy skills only when changing workflow policy: `wayfinder`, `using-superpowers`, `brainstorming`, `writing-plans`, `finishing-a-development-branch`, and `improve-codebase-architecture`.
- During Wayfinder, ask one concise question at a time and immediately follow it with a concrete recommendation and short reason.
- Record the selected Phase Mode durably in the downstream Root Router. Recommend automated fresh sessions and preserve that choice across Foundation, spec, and plan approval gates; same-session continuation requires an exact disk reread.
- `brainstorming` grilling questions must put the question first and immediately follow it with a concrete recommendation and short reason.
- Patch operational skills narrowly: `subagent-driven-development`, `executing-plans`, `using-git-worktrees`, review, debugging, and TDD skills.
- Keep inherited examples self-contained: remove upstream project names, dated session claims, unsupported metrics, and runtime-specific fixture names that are not part of this plugin.
- Keep helper scripts executable and aligned with their owning skill docs.
- Keep every `SKILL.md` frontmatter with `name` and `description`.

## Verification

- Check every edited `SKILL.md` has `name` and `description` frontmatter.
- Search active skill instructions for removed behavior after workflow changes.
- Run relevant script checks when hook or helper scripts change.

## Child DOX Index

- No child AGENTS.md files.
