# Account Notification Preferences Design Spec

**Source:** Example local feature request
**Date:** 2026-06-19
**Artifact Type:** Design Spec
**Status:** Draft
**Revision:** sha256:454c4640dfc5589db9324b4b8375b0e17b6e9aa5bdec629e519c677dc9eb4b06
**Approved Revision:** none
**Approved At:** none

## Problem

Users receive all account emails because the app has no per-user notification preference model.

## Goal

Let users opt in or out of product updates and security alerts from an account settings screen.

## Non-Goals

- Do not build a marketing campaign system.
- Do not add per-channel delivery preferences.
- Do not change password reset or required legal emails.

## Design Understanding

### Phase Mode

**Selected Mode:** Automated fresh-session mode
**Reason:** The example demonstrates clean planning and implementation contexts from exact Approved artifacts.
**Durability:** Workflow-chain-local example

### Language

**Notification Preference**:
A stored user choice for a named account email category.
_Avoid_: email setting, toggle row

### Architecture

- **Modules involved:** account settings UI, user preferences persistence, notification preference reader.
- **Interfaces:** `NotificationPreferences` read/write interface exposed to settings and email senders.
- **Seams:** persistence seam between preference service and database adapter.
- **Adapters:** database-backed adapter in production, in-memory adapter in tests.
- **Data flow:** settings form updates preferences; email sender reads preferences before optional email categories.
- **Test surface:** preference service behavior and settings form submission.

### Key Decisions

- Security alerts remain required and cannot be disabled.
- Product updates can be disabled.
- The email sender reads preferences through the service interface, not directly from storage.

### Open Risks

- Existing email sender code may not have a single preference lookup point.

## User-Facing Behavior

Users see product update and security alert controls in account settings. Product updates are optional. Security alerts are visible as required.

## Implementation Shape

Add a preference service with a small read/write interface, wire settings UI to it, and update optional email sending to check the service.

## Testing Strategy

Test preference service behavior through its public interface. Test settings form submission updates preferences. Test optional email sending skips disabled categories.

## Acceptance Criteria

- Users can disable product update emails.
- Users cannot disable security alerts.
- Optional email sending checks preferences through the service interface.
