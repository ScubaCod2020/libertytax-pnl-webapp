# React → Angular Parity Checklist

Path: /docs

Purpose: Track parity items to migrate from React to Angular.

## Wizard & Inputs

- [ ] Shell navigation mirrors React (WizardShell flow)
- [ ] Sections: New Store, Existing Store, Strategic Analysis
- [ ] Form fields and validation parity (required, ranges, formats)
- [ ] Debounce and change tracking behavior

## KPIs & Visualization

- [ ] KPI Stoplight logic parity
- [ ] Projected Performance panel parity
- [ ] Net Income Summary parity

## Data Contracts

- [ ] Types/Contracts align (income drivers, expenses, toggles)
- [ ] Calculations match (Wizard/calculations.ts logic)

## UX/Accessibility

- [ ] Keyboard navigation and focus order
- [ ] Labels/ARIA for inputs and toggles
- [ ] Error messages and hint text

## Testing

- [ ] Validation tests
- [ ] A11y checks in CI
- [ ] Visual baselines for key pages

Notes:

- Use MAPPING.md and COMPONENTS_TREE.md to expand this list.
- Link failing parity items to GitHub issues during migration.
