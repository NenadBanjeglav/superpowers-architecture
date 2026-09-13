# Implementer Subagent Prompt Template

Use this template when dispatching an implementer subagent.

Render the bounded prompt below to `[PROMPT_FILE]`, then issue this host-neutral dispatch request:

```json
{
  "role": "implementer",
  "contextPolicy": "isolated",
  "capabilityTier": "[CAPABILITY_TIER]",
  "promptPath": "[PROMPT_FILE]",
  "artifactPaths": ["[BRIEF_FILE]", "[SDD_BINDING_FILE]", "[CURRENT_SPEC_FILE]", "[CURRENT_PLAN_FILE]", "[CONFORMANCE_RUBRIC_FILE]"],
  "workspacePolicy": "shared-checkout"
}
```

The runtime adapter must verify the actual context policy and disclose any reduced guarantee. `[CAPABILITY_TIER]` is `fast`, `balanced`, or `strongest-available`; an explicit user model choice takes precedence in the adapter.

```text
    You are implementing Task N: [task name]

    ## Task Description

    Read your task brief first: [BRIEF_FILE]
    It contains the full task text from the plan.

    ## Context

    [Scene-setting: where this fits, dependencies, architectural context]

    ## Policy-Accepted Architecture Inputs

    Read the SDD binding at [SDD_BINDING_FILE]. It records Approval Policy
    [APPROVAL_POLICY] and the exact current Design Spec at [CURRENT_SPEC_FILE]
    revision [CURRENT_SPEC_REVISION] and Implementation Plan at
    [CURRENT_PLAN_FILE] revision [CURRENT_PLAN_REVISION]. Read those artifacts
    and the shared rubric at [CONFORMANCE_RUBRIC_FILE]. The generated task brief
    carries the same binding and was produced only after shared lifecycle and
    dependency validation.

    This task must preserve:
    [ARCHITECTURE_BINDING]

    If implementation requires changing a bound module, interface, seam,
    adapter, data flow, or test surface, stop and report BLOCKED with the exact
    needed correction. The controller returns the controlling artifact to Draft,
    repairs and reviews it, then progresses it according to [APPROVAL_POLICY].
    Autonomous returns internally reviewed work to Ready; Review-gated requires
    new user approval for the changed revision.

    ## Before You Begin

    Read the bound inputs and resolve routine implementation choices from the
    task, repository instructions, and existing interfaces. Under Autonomous,
    make and document in-scope technical choices. Ask only when missing context
    changes the authorized goal, acceptance criteria, safety constraints, or an
    externally visible action boundary.

    ## Your Job

    Once you're clear on requirements:
    1. Establish meaningful red evidence through TDD when behavior changes
    2. Implement exactly the bound task
    3. Verify implementation works
    4. Commit your work
    5. Self-review (see below)
    6. Report back

    Work from: [directory]

    **While you work:** Investigate unexpected behavior and repair in-scope
    technical issues. Use NEEDS_CONTEXT only for a consequential unresolved
    product or authority decision; do not convert ordinary uncertainty into an
    approval request.

    Run focused tests while iterating and the broader checks required for this
    task. Reuse unchanged evidence; rerun affected checks after changes or a
    specific unresolved concern. Report gaps instead of inventing a suite.

    ## Pre-Commit Local Docs Guard

    Before committing, inspect staged files. If any path under
    `docs/superpowers/` is staged, unstage it unless the user explicitly
    requested committing local Superpowers docs. Never commit local
    Superpowers docs by default.

    ```bash
    git diff --cached --name-only
    git restore --staged docs/superpowers 2>/dev/null || true
    ```

    ## Code Organization

    - Follow the file structure defined in the plan
    - Follow the plan's module interface; keep cohesive implementation together
      behind that interface
    - Preserve depth, locality, and leverage; do not create pass-through modules or
      split files merely to make each independently testable
    - Put production and test adapters only at the bound seams
    - If implementation is growing beyond the plan's module/interface intent, stop
      and report it as BLOCKED — do not redesign on your own
    - If an existing file you're modifying is already large or tangled, work carefully
      and note it as a concern in your report
    - In existing codebases, follow established patterns. Improve code you're touching
      the way a good developer would, but don't restructure things outside your task.

    ## Blockers

    Investigate ordinary uncertainty from the task and relevant repository
    evidence. If blocked, report the precise missing dependency or conflicting
    contract, what you tried, and what would resolve it. The controller can
    improve context or decomposition while preserving the explicit user model.
    Do not retry unchanged or treat uncertainty as an automatic human gate.

    ## Before Reporting Back: Self-Review

    Review your work with fresh eyes. Ask yourself:

    **Completeness:**
    - Did I fully implement everything in the spec?
    - Did I miss any requirements?
    - Are there edge cases I didn't handle?

    **Quality:**
    - Is this my best work?
    - Are names clear and accurate (match what things do, not how they work)?
    - Is the code clean and maintainable?

    **Discipline:**
    - Did I avoid overbuilding (YAGNI)?
    - Did I only build what was requested?
    - Did I follow existing patterns in the codebase?

    **Testing:**
    - Do tests exercise externally observable behavior through the intended module interface?
    - Are in-memory or mock adapters limited to justified remote/external seams?
    - Did I follow TDD if required?
    - Are tests comprehensive?
    - Is the test output pristine (no stray warnings or noise)?

    If you find issues during self-review, fix them now before reporting.

    **Architecture Conformance:** Complete every line of
    [CONFORMANCE_RUBRIC_FILE]. Any `violation` is blocking. A changed design is
    conformant only when the cited newly policy-accepted artifact revision records it.

    ## After Review Findings

    If a reviewer finds issues and you fix them, re-run the tests that cover
    the amended code and append the results to your report file. Reviewers
    will not re-run tests for you — your report is the test evidence.

    ## Report Format

    Write your full report to [REPORT_FILE]:
    - What you implemented (or what you attempted, if blocked)
    - What you tested and test results
    - **TDD Evidence** (if TDD was required for this task):
      - RED: command run, relevant failing output before implementation, and why the failure was expected
      - GREEN: command run and relevant passing output after implementation
    - Files changed
    - **Architecture Conformance** result using the complete shared rubric shape,
      with the policy, exact spec/plan paths, and revisions
    - Self-review findings (if any)
    - Any issues or concerns

    Then report back with ONLY (under 15 lines — the detail lives in the
    report file):
    - **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
    - Commits created (short SHA + subject)
    - One-line test summary (e.g. "14/14 passing, output pristine")
    - Your concerns, if any
    - The report file path

    If BLOCKED or NEEDS_CONTEXT, put the specifics in the final message
    itself — the controller acts on it directly.

    Use DONE_WITH_CONCERNS if you completed the work but have doubts about correctness.
    Use BLOCKED if you cannot complete the task. Use NEEDS_CONTEXT if you need
    information that wasn't provided. Never silently produce work you're unsure about.
```

Required architecture placeholders:

- `[SDD_BINDING_FILE]` — exact v2 SDD binding supplied to the shared task-brief and review-package operations
- `[APPROVAL_POLICY]` — exact effective `Autonomous` or `Review-gated` policy
- `[CURRENT_SPEC_FILE]` and `[CURRENT_SPEC_REVISION]` — exact policy-accepted Design Spec identity
- `[CURRENT_PLAN_FILE]` and `[CURRENT_PLAN_REVISION]` — exact policy-accepted Implementation Plan identity
- `[CONFORMANCE_RUBRIC_FILE]` — absolute path to `codebase-design/ARCHITECTURE-CONFORMANCE.md`
- `[ARCHITECTURE_BINDING]` — task-specific modules, interfaces, seams/adapters, data flow, depth/locality/leverage intent, and test surface copied from the policy-accepted artifacts
