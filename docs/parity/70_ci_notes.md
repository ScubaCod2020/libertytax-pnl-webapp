# CI/CD Notes

- Some workflows may still grep for React's `<div id='app'>` or wrong dist paths. Verify selectors use Angular's output and correct `dist/libertytax-pnl-angular/browser`.
- Ensure previews build via `ng build` and serve from `dist/libertytax-pnl-angular/browser`.
- Production remains manual; no auto-push/deploy on `main`.
