---
name: test-driven-development
description: Use before changing code behavior to establish a meaningful failing test, then implement and refactor.
---

# Test-Driven Development

Resolve Approval Policy and the exact policy-accepted spec/plan before writing
tests. Draft never authorizes implementation. Preserve the bound goal,
acceptance criteria, architecture, and public test surface. Apply
[Architecture Conformance](../codebase-design/ARCHITECTURE-CONFORMANCE.md).

## Contract and Retirement

Read [product-evolution.md](../using-superpowers/references/product-evolution.md)
for primary categories: Product behavior,
Safety/security invariant, External compatibility contract, Temporary migration
test, and Implementation detail. Every new or substantively changed durable
test names its primary category and active contract in a title/comment or
adjacent inventory. A uniform suite annotation suffices; mixed suites identify
exceptions. No tagging framework or reclassification of untouched tests.

Pre-beta primarily protects product/safety behavior; actual external obligations
need evidence. At touched boundaries inspect old tests/fixtures. Remove only
explicitly retired obligations under the selected accepted successor, retaining
coverage of active behavior and safety. Replace private-detail assertions with
interface coverage unless an independent contract warrants reclassification.
Temporary tests follow their mechanism's sunset and concrete cleanup task.
Assert absence only when it is observable; otherwise check retained behavior
and removed references. A category, failed test or budget alone permits no purge.

## Red, Green, Refactor

1. Write a focused test for the required observable behavior through the intended
   module interface. For a bug, reproduce the original symptom.
2. Run it before implementation. Confirm it fails for the missing behavior,
   rather than a syntax, fixture, or environment error. If it already passes,
   determine whether the requirement already works or the test misses it.
3. Make the smallest coherent implementation change that satisfies the contract.
4. Run the focused test and applicable regression checks. Investigate failures;
   do not weaken a valid assertion to obtain green output.
5. Refactor while tests stay green. Repeat for remaining behavior.

Record the red command, expected failure, green command, and result. Existing
coverage can support behavior-preserving refactoring; new behavior needs a
meaningful red check. Use the project's actual test commands.

Tests assert observable behavior. Use real local-substitutable adapters where
practical; substitute only justified remote/external seams. Assert calls to a
test double only when the interaction itself is the interface contract. Directly
test a private helper only if it exposes an independent behavioral contract.

When adding mocks or test utilities, read
[testing-anti-patterns.md](testing-anti-patterns.md). If setup is difficult,
inspect the bound interface and seams before adding test-only production APIs
or pass-through modules.

## Exceptions and Recovery

For throwaway prototypes, generated code, configuration, or low-impact prose,
a failing behavioral test may provide no meaningful evidence. Record why and
use the strongest relevant replacement check. The controller owns ordinary
test-strategy choices under either policy; an exception cannot weaken acceptance
criteria or safety constraints.

If code was written before the test, preserve user work, disclose the missing
red evidence, and establish a regression that fails against the pre-change
behavior in an isolated fixture when feasible. Do not delete work as punishment
or call a test-first gap verified without evidence.

An in-scope architecture/test-surface correction preserves accepted bytes and
uses distinct Draft successor spec/plan files, refresh and review. Autonomous
marks Ready; Review-gated requires real successor approval. Stop divergent work
until the controller selects the compatible accepted pair and rebinds. Unplanned
test adapters or material time/budget growth use the shared four-outcome checkpoint.

## Completion

Check required behavior, errors, and edge cases; record warnings, failures,
skips, and gaps accurately. Use the unchanged-evidence rules in
[verification-before-completion](../verification-before-completion/SKILL.md).
A passing test alone does not prove all acceptance criteria or conformance.
