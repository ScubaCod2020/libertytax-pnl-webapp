# CSS / SCSS Style Guide (Angular)

## Where styles live

- Global app styles: `angular/src/styles.scss` (imports partials in `angular/src/styles/*`).
- Component styles: in each component `.scss` next to `.ts` and `.html`.
- Do not add page- or component-specific rules to global files.

## Global partials

- `styles/_tokens.scss`: CSS variables and design tokens only.
- `styles/_base.scss`: resets, base typography, small utilities.
- `styles/_layout.scss`: layout primitives (`.container`, `.grid-2`, `.stack`, `.card`) and scoped layout helpers.
- `styles/_kpi.scss`: KPI / badge visual patterns.

## Specificity & scoping

- Prefer component styles over globals for page-specific visuals.
- If a global helper must target a section, scope it under a wrapper (e.g., `.stack .input-row`) rather than changing a global class everywhere.
- Avoid id selectors and `!important`.

## Naming

- Use descriptive, purposeful class names (`.stack`, `.grid-2`, `.kpi-vertical`).
- Avoid abbreviations unless widely recognized.

## Extending

- Add new tokens to `_tokens.scss`.
- Add new layout primitives to `_layout.scss`.
- Add new visual patterns to a new partial (e.g., `_tables.scss`) and import in `styles.scss`.

## Dos and don'ts

- Do consolidate duplicate rules; keep one source of truth per selector.
- Do keep `font-family` fallbacks consistent via `--brand-font-stack`.
- Don't change global helpers to fix a one-off page—override in the component instead.
- Don't mix responsibilities in a single partial.

## Angular specifics

- Component styles use ViewEncapsulation Emulated by default, so they override globals with equal specificity inside the component.
- Keep globals lightweight; prefer component-scoped rules for behavior/layout tweaks.

## Typography

- Base font family: `--font-base` resolves to Proxima Nova with system fallbacks. Set in `styles/_tokens.scss`.
- Font tokens:
  - Families: `--font-proxima`, `--font-base`
  - Weights: `--fw-regular` (400), `--fw-medium` (500), `--fw-semibold` (600), `--fw-extrabold` (800)
  - Sizes: `--fz-xs` (12px), `--fz-sm` (14px), `--fz-md` (16px), `--fz-lg` (18px), `--fz-xl` (24px), `--fz-2xl` (30px)
- Utilities (from `styles/_base.scss`):
  - Headings: `.h1`, `.h2`, `.h3`
  - Text sizes: `.text-sm`, `.text-xs`
  - Weights: `.regular`, `.medium`, `.semibold`
- Usage rules:
  - Use `.h2.brand` for primary page/app titles.
  - Use `.text-xs` for small metadata (version badges, helper notes).
  - Never set `font-family` directly in components. Use `var(--font-base)` if needed.
  - When importing UI from React reference, replace hard-coded fonts with the utilities or tokens above.
- Debug Panel:
  - Uses `.h3` for the header title and standard body text for logs.
  - Keep contrast compliant; prefer dark ink on light background.
