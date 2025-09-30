# Testing Strategy

## Philosophy

- Angular is the primary app: all tests are blocking.
- Legacy React is advisory: tests run, failures are logged and artifacted.

## Layers

- Linting and type checking
- Unit tests for pure logic and components
- Playwright E2E for core user journeys (Angular, blocking)

## Blocking vs Advisory

- Angular: lint, type-check, unit, E2E → blocking
- React: unit, E2E → non-blocking with artifacts

## E2E Conventions

- Use deterministic selectors (data-testid)
- Prefer role-based queries for accessibility
- Quarantine flaky tests with owner and expiry
