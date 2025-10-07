# Liberty Tax P&L Budget & Forecast Tool — v0.6.4 (Web Application)

This repository contains a **dual-framework P&L Budget & Forecast Tool** for Liberty Tax franchisees, supporting both React (reference implementation) and Angular (active development) frameworks.

## What's in this package

### Core Applications

- **Angular App** (`angular/`) — Active development on Angular 20.3.1 (port 4200)
- **React Reference** (`react-app-reference/`) — Reference implementation for comparison (port 3000)
- **Shared Tooling** — Common scripts, testing infrastructure, and documentation

### Key Features

- **Welcome Wizard** — Region selection, planned returns, KPI thresholds
- **Input Management** — Drivers, expense percentages, scenario presets
- **Region Logic** — U.S./Canada support with TaxRush integration
- **Dashboard** — KPI cards, practice progress, expense mix charts
- **Practice Prompts** — Training system with progress tracking
- **Pro Tips** — Contextual coaching for KPI optimization

## Quick Start

### Development (Dual Framework)

```bash
# Install dependencies
npm install
npm install --prefix angular

# Run both frameworks simultaneously
npm run dev:dual
# React: http://localhost:3000
# Angular: http://localhost:4200
```

### Angular Only

```bash
npm run dev:angular
# Angular: http://localhost:4200
```

### React Reference Only

```bash
npm run dev:react
# React: http://localhost:3000
```

## Testing

```bash
# E2E Tests
npm run test:e2e:angular  # Angular E2E tests
npm run test:e2e:react    # React E2E tests

# Unit Tests
npm run test:unit         # Vitest unit tests
npm run test:integration  # Integration tests

# Mobile Testing
npm run test:mobile       # Mobile-specific tests
```

## Repository Layout & Handoff Notes

### Runtime Structure

- `angular/` — Angular 20.3.1 standalone application
- `react-app-reference/` — React reference implementation
- `src/` — React app source code
- `public/` — Static assets and branding
- `test/` — E2E testing infrastructure
- `config/` — Runtime configuration files

### Development & Maintenance

- `scripts/` — Shared automation and testing tools
- `tools/` — Excel generation and external tools
- `docs/` — Comprehensive documentation (101 files)
- `ops/` — Operational setup and deployment scripts

### Non-Runtime Assets

- `/_meta/` — Process documentation, AI tools, research materials, and archives
- See `/_meta/README.md` for complete structure and usage guidelines

### Key Documentation

- `docs/SCOPE.md` — Full scope & product definition
- `docs/ARCHITECTURE.md` — Modular architecture guide
- `docs/CURRENT_ISSUES.md` — Current development status
- `MASTER_INDEX.md` — Complete documentation index

## Current Status

**Development Branch:** `feature/rebuild-angular`  
**Angular Status:** 30% functional, major technical debt resolved  
**Focus:** Restoring September 30, 2025 baseline functionality

### Recent Accomplishments ✅

- Dashboard calculation errors resolved
- Event handling and subscription optimization
- P&L styling restoration
- State management consistency

### Outstanding Issues 🔍

- Triple emission on app load (investigation needed)
- Full UX/UI restoration to baseline
- Comprehensive user workflow validation

## Versioning

- **v0.6.4** — Current dual-framework web application
- **v0.5** — Previous Excel-based tool (archived in `/_meta/archive/excel-tools/`)

## License

MIT — see `LICENSE`.
