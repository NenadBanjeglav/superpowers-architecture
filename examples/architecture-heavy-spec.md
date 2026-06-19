# Subscription Renewal Retry Handling Design Spec

**Source:** Example local architecture-heavy feature request
**Date:** 2026-06-19
**Status:** Example public spec

## Problem

Subscription renewal retries are spread across billing jobs, payment callbacks, and account state updates. Each new retry rule requires edits in multiple places.

## Goal

Create a deeper renewal retry module that owns retry scheduling, retry state transitions, and payment adapter calls behind one interface.

## Non-Goals

- Do not replace the payment provider.
- Do not redesign subscription plans.
- Do not build a new billing dashboard.

## Design Understanding

### Language

**Renewal Attempt**:
A single scheduled try to renew a subscription after a failed payment.
_Avoid_: retry job, billing retry, payment loop

**Retry Policy**:
The rule set that decides whether another renewal attempt should be scheduled.
_Avoid_: retry config, payment setting

### Architecture

- **Modules involved:** renewal retry orchestrator, retry policy, payment adapter, subscription repository, scheduler adapter.
- **Interfaces:** `RenewalRetryService.scheduleFailedRenewal(subscriptionId, failureReason)` and `RenewalRetryService.runDueAttempt(attemptId)`.
- **Seams:** payment provider seam, scheduler seam, subscription persistence seam.
- **Adapters:** Stripe payment adapter, database subscription repository, job scheduler adapter, in-memory test adapters.
- **Data flow:** payment failure enters retry service, retry policy chooses next attempt, scheduler stores due work, due attempt calls payment adapter, result updates subscription state.
- **Test surface:** retry service interface with in-memory adapters for policy, payment, scheduler, and repository behavior.

### Key Decisions

- Retry policy is internal to the renewal retry module.
- Payment provider details stay behind a payment adapter.
- Callers do not construct retry jobs directly.
- Tests verify service behavior through `RenewalRetryService`, not private policy helpers.

### Open Risks

- Existing jobs may bypass a central subscription state transition path.
- Payment callbacks may need a compatibility adapter during migration.

## User-Facing Behavior

Users with failed renewal payments receive the same account status and notifications, but retries become consistent and easier to reason about.

## Implementation Shape

Introduce the renewal retry module beside existing billing code, route new retry scheduling through it, then migrate existing retry job entry points to the service interface.

## Testing Strategy

Create failing tests for scheduling after a failed payment, running a due retry, stopping after policy exhaustion, and updating subscription state. Tests use adapters through the public service interface.

## Acceptance Criteria

- Failed renewals schedule retry attempts through `RenewalRetryService`.
- Due retries call the payment adapter through the retry module.
- Exhausted retries update subscription state once.
- Existing callers no longer create retry jobs directly.
