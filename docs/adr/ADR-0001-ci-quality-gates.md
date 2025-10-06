# ADR-0001: CI Quality Gates and Workflow Policy

Date: 2025-09-27
Status: Accepted

## Context

Recent incidents showed flaky and non-blocking checks allowed regressions to reach stakeholders. We need clear, enforced quality gates while keeping legacy React checks advisory during migration to Angular.

## Decision

- Code quality workflow blocks on:
  - `npm audit --audit-level high` failures
  - Excessive `console.*` usage (>10 occurrences)
- Build & Test workflow can be triggered manually and from Code Quality success.
- CI policy per framework:
  - Angular: lint, type-check, unit tests, and Playwright E2E are blocking
  - React: unit tests and Playwright E2E are advisory (non-blocking) with artifacts uploaded
- OpenAPI lint is blocking when `openapi/**` changes
- Wiki sync is automated post-production deploy, and available on demand

## Consequences

- Faster feedback on security and bundle quality issues
- Angular becomes the reliability bar; React remains observable until retirement
- Clearer release confidence via staging/production validations

## Alternatives Considered

- Make all tests blocking (rejected: legacy React churn would slow delivery)
- Keep current permissive gates (rejected: risk too high)

## Follow-ups

- Track flaky tests; quarantine with an expiration and owner
- Revisit React advisory status upon deprecation/removal
