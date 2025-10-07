# Segregation Dry-Run Report

**Generated:** 2025-01-27T13:11:03Z  
**Purpose:** Identify non-runtime assets for segregation to `/_meta/` directory

## Keep in Runtime (Required for Application Function)

| Asset                  | Location                 | Rationale                                                   |
| ---------------------- | ------------------------ | ----------------------------------------------------------- |
| `angular/`             | `/angular/`              | **CRITICAL** - Angular workspace root, must remain in place |
| `react-app-reference/` | `/react-app-reference/`  | **CRITICAL** - Reference implementation for comparison      |
| `src/`                 | `/src/`                  | **CRITICAL** - React app source code                        |
| `public/`              | `/public/`               | **CRITICAL** - Static assets served at runtime              |
| `package.json`         | `/package.json`          | **CRITICAL** - Root workspace configuration                 |
| `package-lock.json`    | `/package-lock.json`     | **CRITICAL** - Dependency lock file                         |
| `angular.json`         | `/angular/angular.json`  | **CRITICAL** - Angular workspace configuration              |
| `tsconfig.json`        | `/tsconfig.json`         | **CRITICAL** - TypeScript configuration                     |
| `vite.config.ts`       | `/vite.config.ts`        | **CRITICAL** - Vite build configuration                     |
| `playwright.config.*`  | `/playwright.*.config.*` | **CRITICAL** - E2E testing configuration                    |
| `vitest.*.config.ts`   | `/vitest.*.config.ts`    | **CRITICAL** - Testing configuration                        |
| `vercel.json`          | `/vercel.json`           | **CRITICAL** - Deployment configuration                     |
| `lighthouserc.js`      | `/lighthouserc.js`       | **CRITICAL** - Performance testing configuration            |
| `openapi/`             | `/openapi/`              | **CRITICAL** - API specification                            |
| `test/`                | `/test/`                 | **CRITICAL** - E2E test files                               |
| `config/`              | `/config/`               | **CRITICAL** - Runtime configuration files                  |
| `.github/`             | `/.github/`              | **CRITICAL** - CI/CD workflows                              |
| `node_modules/`        | `/node_modules/`         | **CRITICAL** - Dependencies                                 |
| `dist/`                | `/dist/`                 | **CRITICAL** - Build output                                 |
| `coverage/`            | `/coverage/`             | **CRITICAL** - Test coverage reports                        |

## Move to /\_meta/ (Non-Runtime Assets)

| Asset                                                  | Current Location      | Proposed Location               | Rationale                     | NEEDS-REVIEW |
| ------------------------------------------------------ | --------------------- | ------------------------------- | ----------------------------- | ------------ |
| **AI/Development Tools**                               |                       |                                 |                               |              |
| `scripts/ai-test-generator.js`                         | `/scripts/`           | `/_meta/ai/scripts/`            | AI-generated test automation  | ✅           |
| `scripts/automated-accessibility-audit.js`             | `/scripts/`           | `/_meta/ai/scripts/`            | AI accessibility auditing     | ✅           |
| `scripts/automated-performance-monitor.js`             | `/scripts/`           | `/_meta/ai/scripts/`            | AI performance monitoring     | ✅           |
| `scripts/automated-debug-sync/`                        | `/scripts/`           | `/_meta/ai/debug-tools/`        | AI debugging infrastructure   | ✅           |
| **Research & Analysis**                                |                       |                                 |                               |              |
| `scripts/comprehensive-*.js`                           | `/scripts/`           | `/_meta/research/analysis/`     | Research and analysis scripts | ✅           |
| `scripts/expense-calculation-debugger.js`              | `/scripts/`           | `/_meta/research/analysis/`     | Debugging research tool       | ✅           |
| `scripts/kpi-debugging-script.js`                      | `/scripts/`           | `/_meta/research/analysis/`     | KPI research tool             | ✅           |
| `scripts/regression-test.js`                           | `/scripts/`           | `/_meta/research/testing/`      | Research testing tool         | ✅           |
| **Process & Workflow**                                 |                       |                                 |                               |              |
| `scripts/deploy-staging.sh`                            | `/scripts/`           | `/_meta/process/deployment/`    | Deployment process script     | ✅           |
| `scripts/monitor-deployment.ps1`                       | `/scripts/`           | `/_meta/process/deployment/`    | Deployment monitoring         | ✅           |
| `scripts/stabilize.ps1`                                | `/scripts/`           | `/_meta/process/maintenance/`   | Maintenance process           | ✅           |
| `scripts/history/`                                     | `/scripts/`           | `/_meta/process/history/`       | Process history tracking      | ✅           |
| **Documentation & Reports**                            |                       |                                 |                               |              |
| `docs/ui-snapshots/`                                   | `/docs/`              | `/_meta/archive/ui-snapshots/`  | Historical UI screenshots     | ✅           |
| `docs/run-reports/`                                    | `/docs/`              | `/_meta/archive/run-reports/`   | Historical run reports        | ✅           |
| `docs/growth/`                                         | `/docs/`              | `/_meta/archive/growth/`        | Historical growth tracking    | ✅           |
| `docs/session-*.md`                                    | `/docs/`              | `/_meta/archive/sessions/`      | Session summaries             | ✅           |
| `docs/blueprints/`                                     | `/docs/`              | `/_meta/process/blueprints/`    | Process blueprints            | ✅           |
| `docs/runbooks/`                                       | `/docs/`              | `/_meta/process/runbooks/`      | Operational runbooks          | ✅           |
| **Design & Branding**                                  |                       |                                 |                               |              |
| `docs/Liberty-*.pdf`                                   | `/docs/`              | `/_meta/process/design/`        | Brand guidelines              | ✅           |
| `docs/draft 2 Liberty Tax • P&L Budget & Forecast.pdf` | `/docs/`              | `/_meta/process/design/`        | Design drafts                 | ✅           |
| `docs/architecture/components-graph.*`                 | `/docs/architecture/` | `/_meta/process/design/`        | Design diagrams               | ✅           |
| **Debug & Development Images**                         |                       |                                 |                               |              |
| `*-dashboard.png`                                      | `/`                   | `/_meta/archive/debug-images/`  | Debug screenshots             | ✅           |
| `*-expenses.png`                                       | `/`                   | `/_meta/archive/debug-images/`  | Debug screenshots             | ✅           |
| `*-homepage.png`                                       | `/`                   | `/_meta/archive/debug-images/`  | Debug screenshots             | ✅           |
| `*-pnl.png`                                            | `/`                   | `/_meta/archive/debug-images/`  | Debug screenshots             | ✅           |
| `debug-*.png`                                          | `/`                   | `/_meta/archive/debug-images/`  | Debug screenshots             | ✅           |
| `debug-*.js`                                           | `/`                   | `/_meta/archive/debug-scripts/` | Debug scripts                 | ✅           |
| **Configuration & Blueprints**                         |                       |                                 |                               |              |
| `libertytax-pnl-blueprint*.yml`                        | `/`                   | `/_meta/process/blueprints/`    | Process blueprints            | ✅           |
| `repo-blueprint.yml`                                   | `/`                   | `/_meta/process/blueprints/`    | Repository blueprint          | ✅           |
| `context-digest.md`                                    | `/`                   | `/_meta/process/context/`       | Context documentation         | ✅           |
| `debug-checklist.md`                                   | `/`                   | `/_meta/process/checklists/`    | Process checklist             | ✅           |
| **Testing & Reports**                                  |                       |                                 |                               |              |
| `playwright-report*/`                                  | `/`                   | `/_meta/archive/test-reports/`  | Test report artifacts         | ✅           |
| `playwright-results.*`                                 | `/`                   | `/_meta/archive/test-reports/`  | Test result artifacts         | ✅           |
| `test-results/`                                        | `/`                   | `/_meta/archive/test-reports/`  | Test result artifacts         | ✅           |
| `run-reports/`                                         | `/`                   | `/_meta/archive/test-reports/`  | Test run reports              | ✅           |
| **Archive & External**                                 |                       |                                 |                               |              |
| `archive/`                                             | `/archive/`           | `/_meta/archive/external/`      | External archive pointer      | ✅           |
| `tools/excel_v5/`                                      | `/tools/`             | `/_meta/archive/excel-tools/`   | Legacy Excel tools            | ✅           |

## Keep in Runtime (Development Tools)

| Asset                                | Location    | Rationale                                      |
| ------------------------------------ | ----------- | ---------------------------------------------- |
| `scripts/generate-*.js`              | `/scripts/` | **KEEP** - Code generation tools used in build |
| `scripts/docs-index-validate.js`     | `/scripts/` | **KEEP** - Documentation validation tool       |
| `scripts/validate-progress-log.js`   | `/scripts/` | **KEEP** - Progress validation tool            |
| `scripts/github-test-integration.js` | `/scripts/` | **KEEP** - GitHub integration tool             |
| `scripts/fix-md-headings.js`         | `/scripts/` | **KEEP** - Documentation maintenance tool      |
| `ops/`                               | `/ops/`     | **KEEP** - Operational setup scripts           |

## Summary

- **Total assets to move:** 45+ files/directories
- **Critical runtime assets preserved:** 20+ core files
- **Development tools preserved:** 6 essential scripts
- **Estimated cleanup:** ~30% reduction in root directory clutter

## Next Steps

1. **Review flagged items** (NEEDS-REVIEW ✅)
2. **Create detailed move plan** with git commands
3. **Test build after moves** to ensure no runtime impact
4. **Update documentation** to reflect new structure
5. **Create handoff documentation** for new structure

## Risk Assessment

- **LOW RISK:** Moving debug images, reports, and research tools
- **MEDIUM RISK:** Moving some scripts (need to verify no build dependencies)
- **HIGH RISK:** Moving any files in `angular/`, `src/`, or root config files (NOT MOVING)

## Rollback Plan

All moves will use `git mv` to preserve history. Rollback via:

```bash
git checkout HEAD~1 -- <moved-file>
```
