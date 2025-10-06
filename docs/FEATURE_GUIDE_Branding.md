# Branding Feature Guide (React → Angular)

## React sources

- Hook: `react-app-reference/src/hooks/useBranding.ts`
- Config: `react-app-reference/src/styles/branding.ts`
- Assets: `react-app-reference/src/assets/brands/*`

## Angular counterparts

- Service: `angular/src/app/services/branding.service.ts`
- Assets registry: `angular/src/app/lib/brands.ts`
- Assets: `angular/src/assets/{brands,icons}/**/*`

## Behavior

- On region change (SettingsService), apply CSS custom properties to `document.documentElement`.
- Update document title and favicon based on region.
- Typography variables available:
  - `--font-base`, `--fw-regular|medium|semibold|extrabold`, `--headline-spacing`.

## Editing assets

- Replace files under `angular/src/assets/brands/{us,ca}`.
- Update `BrandAssets` paths if filenames change.

## Notes

- Typography is shared across regions; logos/watermarks differ by region.
- UI should reference CSS vars, not hard-coded colors/fonts.
