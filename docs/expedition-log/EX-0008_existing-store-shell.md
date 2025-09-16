# EX-0008 Existing Store Shell

## Terrain
- Routed a dedicated existing-store playground that swaps out the legacy dashboard view when `/existing-store` is requested.
- Shell coordinates prior-year normalization with downstream goals form while keeping region and store-type toggles in one control bar.

## Artifacts
- `existing-store` route lazy-loads the standalone shell component for experimentation without touching the dashboard flow.
- Shell stitches `app-prior-year-performance` raw inputs and `app-income-drivers` goals panel, feeding prior-year metrics directly into the reactive goals form.
- Prior-year calculator emits rounded metrics from shared calc utilities and models the alias pair for `lastYearGrossFees` ↔ `lastYearRevenue`.

## Fault Lines
- Navigation chrome lacks a link into `/existing-store`, so manual URL entry is required for now.
- Goals snapshot dumps raw form JSON without formatting, which may overwhelm non-technical reviewers.

## Hypotheses
- Wiring a footer/header hook into the new route will let stakeholders jump between legacy dashboard and existing-store parity views quickly.
- Formatting the snapshot (or piping it through a formatter) will make validation of preserved field values easier during demos.

## Evidence
- Route definition for the experimental shell.【F:src/app/app.routes.ts†L1-L11】
- App component toggles between legacy content and router outlet based on the active URL, unsubscribing on destroy.【F:src/app/app.ts†L39-L129】【F:src/app/app.ts†L200-L330】
- Existing store shell hosts region/store selectors, prior-year component, goals component, and emits form snapshots.【F:src/app/components/existing-store-shell/existing-store-shell.component.ts†L14-L174】
- Prior-year component normalizes raw answers into metrics via calc util helpers before emitting.【F:src/app/components/prior-year-performance/prior-year-performance.component.ts†L18-L208】
- Income drivers apply prior-year aliases so `lastYearRevenue` mirrors `lastYearGrossFees` inputs.【F:src/app/components/income-drivers/income-drivers.component.ts†L246-L266】

## Trail Marker
1. Expose a navigation affordance (header link or debug toggle) into the existing-store shell.
2. Add formatted snapshots (table or key metrics) to replace the raw JSON dump.
3. Expand shell coverage with persistence plumbing once stakeholder data-entry flows are finalized.
