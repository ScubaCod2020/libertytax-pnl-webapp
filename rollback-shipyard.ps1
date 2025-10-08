# === ROLLBACK ANGULAR DEPLOYMENT ===
# Emergency rollback script for Liberty Tax PnL Angular webapp
# Reverts to previous version when deployment fails

param(
    [string]$HubUrlBase = "/shipyard",
    [string]$AppSlug = "pnl-web", 
    [string]$UnraidHost = "192.168.1.172",
    [int]$UnraidPort = 8082,
    [string]$SmbTarget = "\\192.168.1.172\Projects\apps\shipyard\pnl-web",
    [string]$RollbackTo = "",  # Specific version to rollback to (optional)
    [switch]$DryRun,
    [switch]$ListVersions
)

$ErrorActionPreference = "Stop"

# === RESOLVE VARIABLES ===
Write-Host "=== Rollback Angular Deployment ===" -ForegroundColor Red
$HubUrlBase = $HubUrlBase.TrimEnd('/')
$RootUrl = "http://${UnraidHost}:${UnraidPort}${HubUrlBase}/${AppSlug}/"

Write-Host "APP      : $AppSlug" -ForegroundColor Yellow
Write-Host "Hub base : $HubUrlBase" -ForegroundColor Yellow
Write-Host "UNC path : $SmbTarget" -ForegroundColor Yellow
Write-Host "Root URL : $RootUrl" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "DRY RUN MODE - No actual changes will be made" -ForegroundColor Magenta
}

# === LIST AVAILABLE VERSIONS ===
if ($ListVersions -or (-not $RollbackTo)) {
    Write-Host "=== Available versions ===" -ForegroundColor Green
    
    try {
        $versionDirs = Get-ChildItem -Path $SmbTarget -Directory -ErrorAction Stop | 
        Where-Object { $_.Name -match "^$AppSlug-\d{8}-\d{4}$" } |
        Sort-Object Name -Descending
        
        if ($versionDirs.Count -eq 0) {
            Write-Warning "No version directories found in $SmbTarget"
            exit 1
        }
        
        Write-Host "Found $($versionDirs.Count) version(s):" -ForegroundColor Gray
        for ($i = 0; $i -lt $versionDirs.Count; $i++) {
            $version = $versionDirs[$i]
            $created = $version.CreationTime.ToString("yyyy-MM-dd HH:mm")
            $isCurrent = ""
            
            # Check if this is the current version
            $latestPath = Join-Path $SmbTarget "LATEST.txt"
            if (Test-Path $latestPath) {
                $currentVersion = Get-Content $latestPath -Raw -ErrorAction SilentlyContinue
                if ($currentVersion.Trim() -eq $version.Name) {
                    $isCurrent = " (CURRENT)"
                }
            }
            
            Write-Host "  $($i + 1). $($version.Name) - $created$isCurrent" -ForegroundColor $(if ($isCurrent) { "Green" } else { "White" })
        }
        
        if ($ListVersions) {
            exit 0
        }
        
        if (-not $RollbackTo) {
            Write-Host ""
            $selection = Read-Host "Select version number to rollback to (1-$($versionDirs.Count))"
            try {
                $selectedIndex = [int]$selection - 1
                if ($selectedIndex -lt 0 -or $selectedIndex -ge $versionDirs.Count) {
                    throw "Invalid selection"
                }
                $RollbackTo = $versionDirs[$selectedIndex].Name
            }
            catch {
                Write-Error "Invalid selection: $selection"
                exit 1
            }
        }
    }
    catch {
        Write-Error "Failed to list versions: $_"
        exit 1
    }
}

# === VALIDATE ROLLBACK TARGET ===
Write-Host "=== Validate rollback target ===" -ForegroundColor Green
$RollbackPath = Join-Path $SmbTarget $RollbackTo

if (-not (Test-Path $RollbackPath)) {
    Write-Error "Rollback target not found: $RollbackPath"
    exit 1
}

if (-not (Test-Path (Join-Path $RollbackPath "index.html"))) {
    Write-Error "Invalid rollback target - missing index.html: $RollbackPath"
    exit 1
}

Write-Host "Rolling back to: $RollbackTo" -ForegroundColor Yellow
Write-Host "Target path: $RollbackPath" -ForegroundColor Gray

# === CREATE ROLLBACK REDIRECT ===
Write-Host "=== Create rollback redirect ===" -ForegroundColor Green

$RedirectHtml = @"
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0;url=./$RollbackTo/">
    <title>Liberty Tax PnL (Restored)</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
               text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; 
                    padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #ff6b35; 
                  border-radius: 50%; width: 40px; height: 40px; 
                  animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .restored { color: #ff6b35; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Liberty Tax P&amp;L</h2>
        <div class="spinner"></div>
        <p class="restored">Service Restored</p>
        <p>Redirecting to stable version...</p>
        <p><a href="./$RollbackTo/">Click here if not redirected automatically</a></p>
        <small style="color: #666;">Restored to: $RollbackTo<br>$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</small>
    </div>
</body>
</html>
"@

$RootIndexPath = Join-Path $SmbTarget "index.html"

if (-not $DryRun) {
    try {
        Set-Content -Path $RootIndexPath -Value $RedirectHtml -Encoding UTF8
        Write-Host "Created rollback redirect: $RootIndexPath" -ForegroundColor Gray
    }
    catch {
        throw "Failed to create rollback redirect: $_"
    }
}
else {
    Write-Host "[DRY RUN] Would create rollback redirect: $RootIndexPath" -ForegroundColor Magenta
}

# === VERIFY ROLLBACK ===
Write-Host "=== Verify rollback ===" -ForegroundColor Green

if (-not $DryRun) {
    try {
        Write-Host "Checking: $RootUrl" -ForegroundColor Gray
        $response = Invoke-WebRequest -Uri $RootUrl -Method Head -TimeoutSec 30 -MaximumRedirection 1
        if ($response.StatusCode -ne 200) {
            throw "Rollback verification failed: $($response.StatusCode)"
        }
        
        Write-Host "Rollback verification successful" -ForegroundColor Gray
    }
    catch {
        Write-Warning "Rollback verification failed: $_"
        Write-Host "Manual intervention may be required" -ForegroundColor Red
    }
}
else {
    Write-Host "[DRY RUN] Would verify: $RootUrl" -ForegroundColor Magenta
}

# === UPDATE LATEST.TXT ===
Write-Host "=== Update LATEST.txt pointer ===" -ForegroundColor Green
$LatestPath = Join-Path $SmbTarget "LATEST.txt"

if (-not $DryRun) {
    try {
        Set-Content -Path $LatestPath -Value $RollbackTo -Encoding ASCII -NoNewline
        Write-Host "Updated LATEST.txt: $RollbackTo" -ForegroundColor Gray
    }
    catch {
        Write-Warning "Failed to update LATEST.txt: $_"
    }
}
else {
    Write-Host "[DRY RUN] Would update LATEST.txt: $RollbackTo" -ForegroundColor Magenta
}

# === SUCCESS ===
Write-Host "=== ROLLBACK COMPLETE ===" -ForegroundColor Green
Write-Host "Active version: $RollbackTo" -ForegroundColor Cyan
Write-Host "Root URL: $RootUrl" -ForegroundColor Cyan
Write-Host "Rollback completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# === CLEANUP RECOMMENDATION ===
Write-Host ""
Write-Host "=== Cleanup Recommendation ===" -ForegroundColor Yellow
Write-Host "Consider removing failed deployment folders to save space:" -ForegroundColor Gray
Write-Host "Get-ChildItem '$SmbTarget' -Directory | Where-Object Name -match '^$AppSlug-' | Sort-Object CreationTime -Descending | Select-Object -Skip 5 | Remove-Item -Recurse -Force" -ForegroundColor DarkGray
