# Architecture Conformance

Use this rubric when planning, implementing, testing, or reviewing work from an
Approved Design Spec and Implementation Plan. Read both artifacts at their
exact Approved revisions before judging the implementation.

## Architecture Conformance

- **Modules:** preserved | changed with approved revision | violation
- **Interfaces:** preserved | changed with approved revision | violation
- **Seams and adapters:** justified production/test adapters at approved seams; no leaked host/runtime policy
- **Data flow:** matches the approved source-to-sink sequence
- **Depth, locality, leverage:** complexity remains hidden behind the intended interface; no pass-through decomposition
- **Test surface:** observable behavior is tested through the intended module interface; internal helpers are directly tested only when they expose an independent behavioral contract
- **Design escalation:** implementation-discovered design changes returned the controlling artifact to Draft and user review

Any `violation` is blocking. A design change is conformant only when a newly
Approved artifact revision records the changed module, interface, seam,
adapter, data flow, or test surface. Conversation agreement, a code comment, or
an implementation report does not replace artifact lifecycle approval.

## Review Method

1. Identify the exact Approved spec and plan paths/revisions.
2. Copy the binding modules, interfaces, seams, adapters, data flow, depth
   intent, locality/leverage expectations, and test surface into the review
   input.
3. Compare the implementation and tests to each line of the result shape.
4. Mark preserved behavior, cite a newly Approved revision for a recorded
   change, or report a blocking violation with file/line evidence.
5. If implementation revealed a necessary design change that is not approved,
   stop. Return the controlling artifact to Draft and the user review gate.

## Adapter and Test Guidance

Test observable behavior through the module interface. Use real
local-substitutable adapters where practical; use in-memory or mock adapters
only at justified remote/external seams; never assert that a test double itself
was called unless that interaction is the interface contract.

A private helper is not automatically a test surface. Directly test it only
when it exposes an independent behavioral contract. Otherwise exercise its
behavior through the owning module interface so refactoring the implementation
does not break callers or tests.
