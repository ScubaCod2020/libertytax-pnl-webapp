# Run Context - Liberty Tax P&L Budget & Forecast Tool

## Repository Purpose & Layout

This repository contains a **dual-framework P&L Budget & Forecast Tool** for Liberty Tax franchisees, supporting both React (reference implementation) and Angular (active development) frameworks. The tool enables franchise owners to budget/forecast returns, pricing, and expenses with instant KPIs and coaching.

**Key Architecture:**

- **Root workspace**: Contains React reference app (`react-app-reference/`) and shared tooling
- **Angular workspace**: Located in `angular/` subfolder with standalone Angular 20.3.1 application
- **Dual development**: Both frameworks can run simultaneously (`npm run dev:dual`)
- **Shared resources**: Common scripts, testing infrastructure, and documentation

**Current Status (October 2025):**

- Angular app is 30% functional with major technical debt resolved
- React reference provides baseline functionality for comparison
- Active development on `feature/rebuild-angular` branch
- Focus on restoring September 30, 2025 baseline functionality

**Key Constraints:**

- No runtime code changes during this maintenance session
- Angular root must remain in `angular/` subfolder (not moved)
- Append-only documentation policy (no overwrites)
- All changes must be test-driven with rebuild verification

**Workspace Structure:**

- `angular/` - Angular 20.3.1 standalone app (port 4200)
- `react-app-reference/` - React reference implementation (port 3000)
- `scripts/` - Shared automation and testing tools
- `docs/` - Comprehensive documentation (101 files)
- `test/` - E2E testing infrastructure
- `public/` - Static assets and branding
- `tools/` - Excel generation and external tools

**Build Commands:**

- Angular: `npm run dev:angular` (port 4200)
- React: `npm run dev:react` (port 3000)
- Dual: `npm run dev:dual` (both frameworks)
- Tests: `npm run test:e2e:angular` / `npm run test:e2e:react`

**Session Date:** 2025-01-27T13:11:03Z
**Branch:** feature/rebuild-angular
**Focus:** Repository maintenance, documentation consolidation, handoff preparation
