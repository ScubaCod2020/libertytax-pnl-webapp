# EX-0006 Income Drivers

## Terrain
- Standalone IncomeDriversComponent composes a reactive form from schemaFor, the field dictionary, and calc util derivations, keeping template markup display-only.【F:src/app/components/income-drivers/income-drivers.component.ts†L46-L466】

## Artifacts
- Field dictionary lists income-driver keys, validators, and deriveFrom wiring consumed by the builder.【F:src/app/existing-store/shared/fields.dictionary.ts†L1-L197】
- Goals schema maps mode×region×storeType to field arrays with TODO rules for TaxRush and growth presets.【F:src/app/existing-store/income-drivers/goals.config.ts†L1-L134】
- Calc util adds gross tax prep, revenue, and expense helpers leveraged by derived controls.【F:src/app/existing-store/shared/calc.util.ts†L3-L137】
- Spec suite exercises the helpers alongside legacy parity vectors and normalization fallbacks.【F:src/app/existing-store/shared/calc.util.spec.ts†L1-L211】

## Fault Lines
- Discount amount is now locked behind deriveFrom; confirm whether UX still needs manual override symmetry with the percent field.【F:src/app/existing-store/shared/fields.dictionary.ts†L101-L123】【F:src/app/components/income-drivers/income-drivers.component.ts†L422-L426】
- Last-year revenue derivation depends on injected priorYear discounts/other income; future API payloads must surface those values explicitly.【F:src/app/components/income-drivers/income-drivers.component.ts†L439-L445】

## Evidence
- Derived control subscriptions debounce dependency changes before writing back util results into disabled form controls.【F:src/app/components/income-drivers/income-drivers.component.ts†L306-L358】
- Form state emitter packages raw values, validity, and touch state on every value/status change for shell listeners.【F:src/app/components/income-drivers/income-drivers.component.ts†L361-L387】
- Gross-fee and expense helpers validated with 76% benchmark vectors to hold parity.【F:src/app/existing-store/shared/calc.util.spec.ts†L84-L155】

## Trail Marker
1. Cross-check schema field coverage against live wizard toggles to catch missing conditions.
2. Add UX affordance for manual discount amount overrides if parity testing flags regressions.
3. Integrate the component into the shell demo once region/store selectors are ready.
