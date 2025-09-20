# Environment Setup
Path: /docs

Purpose: How to run both apps locally with consistent ports and API access.

- Ports
  - React (Vite): http://localhost:3000
  - Angular (ng): http://localhost:4200

- API proxy
  - React: `vite.config.ts` proxies `/api` → `VITE_API_URL` (default http://localhost:5000)
  - Angular: `angular/proxy.conf.json` proxies `/api` → http://localhost:5000
  - Use a single base path in code: `/api/...` (no hardcoded server URLs)

- E2E baseURL overrides
  - `PW_BASEURL` env variable controls Playwright target
  - Scripts: `npm run test:e2e:react`, `npm run test:e2e:angular`

- Quick start
  - React: `npm run dev:react`
  - Angular: `npm run dev:angular`
  - Both: `npm run dev:dual`

- Notes
  - Repo blueprint ports take precedence for local runs.
  - If you need a `.env`, mirror these vars: `VITE_API_URL`, `PW_BASEURL`.
