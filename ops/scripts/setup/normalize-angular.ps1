$ErrorActionPreference = 'Stop'

# 0) Confirm you’re in the Angular app
if (!(Test-Path .\angular.json)) { throw 'Run from the angular/ app root' }

# 1) Fix accidental nested duplicate: delete .\src\app\src\app subtree if present
$dup = 'src/app/src/app'
if (Test-Path $dup) {
  Write-Host "Found nested duplicate '$dup' → flattening into 'src/app'"
  $good = 'src/app'
  foreach ($name in @('pages','components','core')) {
    $from = Join-Path $dup $name
    if (Test-Path $from) {
      New-Item -ItemType Directory -Force -Path (Join-Path $good $name) | Out-Null
      Get-ChildItem -Force $from | Move-Item -Destination (Join-Path $good $name) -Force
    }
  }
  Remove-Item -Recurse -Force $dup
}

# 2) Remove stray non-".component.*" dashboard files
$dashDir = 'src/app/pages/dashboard'
$badDash = @('dashboard.ts','dashboard.html','dashboard.scss') | ForEach-Object { Join-Path $dashDir $_ }
$badDash | ForEach-Object { if (Test-Path $_) { Remove-Item $_ -Force } }

# 3) Remove old "components" that were actually pages from earlier runs
# Keep ONLY app-header, app-footer, form-toolbar, kpi-card under src/app/components
$sharedDir = 'src/app/components'
if (Test-Path $sharedDir) {
  Get-ChildItem $sharedDir -Directory | ForEach-Object {
    if ($_.Name -notin @('app-header','app-footer','form-toolbar','kpi-card')) {
      Write-Host "Removing legacy shared component folder: $($_.FullName)"
      Remove-Item -Recurse -Force $_.FullName
    }
  }
}

# 4) Ensure the page folders exist (no-op if already there)
$pages = @(
  'src/app/pages/dashboard',
  'src/app/pages/wizard/income-drivers',
  'src/app/pages/wizard/expenses',
  'src/app/pages/wizard/pnl'
)
$pages | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

# 5) Verify the correct component files exist (generate if missing)
function Ensure-Component { param($path, $selector)
  $cmp = "$path.component.ts"
  if (Test-Path $cmp) { return }
  npx -y @angular/cli@20 g c $path --standalone --skip-tests --style=scss --selector $selector | Out-Null
}
Ensure-Component 'src/app/pages/dashboard/dashboard' 'app-dashboard'
Ensure-Component 'src/app/pages/wizard/income-drivers/income-drivers' 'app-income-drivers'
Ensure-Component 'src/app/pages/wizard/expenses/expenses' 'app-expenses'
Ensure-Component 'src/app/pages/wizard/pnl/pnl' 'app-pnl'

# 6) Re-write routes to canonical page paths (surgical overwrite)
@'
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'wizard/income-drivers' },

  { path: 'wizard/income-drivers', loadComponent: () =>
      import('./pages/wizard/income-drivers/income-drivers.component')
        .then(m => m.IncomeDriversComponent) },

  { path: 'wizard/expenses', loadComponent: () =>
      import('./pages/wizard/expenses/expenses.component')
        .then(m => m.ExpensesComponent) },

  { path: 'wizard/pnl', loadComponent: () =>
      import('./pages/wizard/pnl/pnl.component')
        .then(m => m.PnlComponent) },

  { path: 'dashboard', loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent) },
];
'@ | Set-Content 'src/app/app.routes.ts' -Encoding UTF8

# 7) Re-write app shell to header + outlet + footer (keeps global look consistent)
@'
<app-header></app-header>
<router-outlet></router-outlet>
<app-footer></app-footer>
'@ | Set-Content 'src/app/app.component.html' -Encoding UTF8

Write-Host 'Normalize complete.'
