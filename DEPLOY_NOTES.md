# DEPLOY_NOTES — NGINX, CORS, and Versioned Drops

**Project:** Liberty Tax P&L (Angular)  
**Host Web Server:** NGINX (not IIS)  
**SMB Drop:** `\\192.168.1.172\Projects\apps\shipyard\pnl-web`  
**Branch:** `feature/office-2025-10-08-nginx-env`  
**Status:** ✅ Production build successful, proxy configured, NGINX config ready

---

## 1) Angular Build Commands

```bash
# Navigate to Angular project directory
cd angular

# Development (with proxy for local API)
npm run start -- --proxy-config ../proxy.conf.json

# Production build (AOT + optimizer)
npm run build -- --configuration production

# Test production build locally
cd .. && npx http-server angular/dist/angular -p 4209
```

Verify output in `angular/dist/angular/browser/` then run a quick local serve:

```bash
npx http-server angular/dist/angular/browser -p 4209
# open http://localhost:4209
```

---

## 2) File Replacements (angular.json)

Ensure configurations map correctly:

```jsonc
"build": {
  "options": { "outputPath": "dist" },
  "configurations": {
    "development": {
      "fileReplacements": [
        { "replace": "src/environments/environment.ts", "with": "src/environments/environment.ts" }
      ]
    },
    "staging": {
      "fileReplacements": [
        { "replace": "src/environments/environment.ts", "with": "src/environments/environment.staging.ts" }
      ]
    },
    "production": {
      "fileReplacements": [
        { "replace": "src/environments/environment.ts", "with": "src/environments/environment.prod.ts" }
      ],
      "optimization": true,
      "buildOptimizer": true
    }
  }
}
```

---

## 3) NGINX Configuration

**Ready-to-use config:** `nginx-pnl-site.conf` (in project root)

This configuration includes:

- ✅ SPA routing with `try_files $uri $uri/ /index.html`
- ✅ Static asset caching (7 days for JS/CSS/images)
- ✅ Security headers
- ✅ API proxy with CORS handling
- ✅ Health check endpoint
- ✅ Gzip compression
- ✅ HTTPS ready (commented section)

---

## 4) NGINX — SPA + Placeholder Replacement

Symptoms observed: placeholder page still visible after deploy.  
**Likely cause:** site `root`/`alias` still points to placeholder directory or `try_files` falls back there.

**Action plan:**

1. Back up existing config:
   ```bash
   sudo cp /etc/nginx/sites-available/pnl.conf /etc/nginx/sites-available/pnl.conf.bak.$(date +%Y%m%d-%H%M%S)
   ```
2. Update the site to point to Angular `dist` (or a versioned symlink):

   ```nginx
   server {
     listen 80;
     server_name pnl.local; # adjust

     root /var/www/pnl/current; # symlink to latest dist folder
     index index.html;

     # Single Page App routing
     location / {
       try_files $uri $uri/ /index.html;
     }

     # (Optional) Static assets caching
     location ~* \.(?:js|css|woff2?|ttf|eot|svg)$ {
       expires 7d;
       access_log off;
     }

     # API reverse proxy (if API is on same host)
     location /api/ {
       proxy_pass http://api_upstream; # define upstream elsewhere
       add_header Access-Control-Allow-Origin "https://YOUR-SITE-HOST" always;
       add_header Access-Control-Allow-Methods "GET,POST,PUT,PATCH,DELETE,OPTIONS" always;
       add_header Access-Control-Allow-Headers "Authorization,Content-Type,Accept,Origin" always;
       if ($request_method = OPTIONS) { return 204; }
     }
   }
   ```

3. Reload NGINX:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

**NOTE:** Keep CORS on the API host. Avoid `*`; explicitly set allowed origin(s).

---

## 5) Versioned Drop Strategy (SMB -> server)

On your Windows workstation (PowerShell), create a versioned drop:

```powershell
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$drop = "dist"
$target = "\\192.168.1.172\Projects\apps\shipyard\pnl-web\pnl-dev-$ts"
robocopy $drop $target /MIR
```

On the server, update a stable symlink that NGINX serves (e.g., `/var/www/pnl/current` -> latest):

```bash
ln -sfn /var/www/pnl/releases/pnl-dev-2025... /var/www/pnl/current
```

---

## 6) Smoke Tests

- App boots with no console errors
- Network calls hit the expected `apiBaseUrl` for the environment
- Deep links like `/reports` and `/dashboard` reload correctly (NGINX `try_files` works)
- First API call returns `200`

---

## 7) Environment Configuration

**Current setup:**

- ✅ `src/environments/environment.ts` - Development (uses proxy)
- ✅ `src/environments/environment.staging.ts` - Staging API URL
- ✅ `src/environments/environment.prod.ts` - Production API URL
- ✅ `angular.json` configured with file replacements
- ✅ `proxy.conf.json` for local development CORS avoidance

**API URLs configured:**

- Dev: `/api` (proxied to localhost:5001)
- Staging: `https://staging.api.example.com/api`
- Production: `https://prod.api.example.com/api`

## 8) Env Tokens

Keep secrets out of source. If you prefer `.env.*` files, inject at build-time into the Angular `environment.*.ts` files via a small pre-build script (Node/TS).

---

_Author: Bishop (Office Session 2025-10-08)_
