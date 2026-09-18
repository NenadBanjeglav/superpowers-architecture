---
name: systematic-debugging
description: Use for a bug, failing test, broken build, or unexpected behavior before proposing a fix.
---

# Systematic Debugging

Investigate the cause before fixing the symptom. Resolve Approval Policy and
the bound goal, acceptance criteria, and architecture before repair. Autonomous
owns in-scope investigation and repairs; ask only for a consequential goal or
constraint change, unavailable required input/access, or action beyond authority.

Read [product-evolution.md](../using-superpowers/references/product-evolution.md)
and check the authoritative current
selection against exact bindings. Evaluate actual stage/consumer evidence,
retirements, test categories, sunset and budget through the shared rubric.
An obsolete test or advisory finding cannot retire an active obligation.
Unplanned mechanisms or material duration/budget growth require the shared
Simplify/Replace/Defer/Revise checkpoint before divergent repairs.

## Investigate

Read the actual error and complete relevant trace. Establish repeatable steps
and inspect recent code, dependency, configuration, and environment changes.
If reproduction is intermittent, gather evidence instead of guessing.

For a system spanning components, inspect data entering and leaving the
relevant boundaries and verify configuration propagation to locate the failing
component. Record presence and safe diagnostics without exposing secret values.
Trace a bad value back to its source; use
[root-cause-tracing.md](root-cause-tracing.md) for a deep call chain.

## Compare and Test a Hypothesis

Find a working example in the project. Read the relevant reference implementation
and its dependencies completely enough to understand the contract. Compare
differences in inputs, state, environment, and assumptions.

State one causal hypothesis with supporting evidence. Test it with the smallest
change or observation that distinguishes it from alternatives. Change one
variable at a time. Reject failed hypotheses explicitly before another attempt;
do not stack speculative fixes.

## Repair and Verify

Use `test-driven-development` to establish a failing regression or justified
observable red check. Fix the established cause within scope. Verify the
original symptom and applicable regressions, then use
`verification-before-completion` before claiming success.

If a fix fails, record the new evidence and return to investigation. After
three failed hypotheses, stop the local patch loop and examine the architecture:
shared state, coupling, misplaced seams, and changes that create new symptoms.
Three failures establish an inadequate causal model, not a proven replacement.

If the bound module, interface, seam, adapter, data flow, or test surface needs
an in-scope correction, preserve accepted bytes and create distinct Draft
successor spec/plan files for review and Ready under Autonomous, or genuine
successor approval under Review-gated. Select and rebind before divergent work. Preserve constraints and continue independent
work. Repeated technical failure does not create a human approval gate.

If evidence points to an external, timing, or environmental cause, document
what was ruled out and what remains uncertain. Add justified handling and
diagnostics; do not present a provisional conclusion as a proven cause.

## Conditional Techniques

- [defense-in-depth.md](defense-in-depth.md): validation at justified boundaries
  after identifying the cause.
- [condition-based-waiting.md](condition-based-waiting.md): observable condition
  polling when timing is involved.
