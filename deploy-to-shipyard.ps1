# === DEPLOY ANGULAR TO NGINX SHIPYARD ===
# Bishop deployment script for Liberty Tax PnL Angular webapp
# Deploy to versioned folders with safe rollback capability

param(
    [string]$HubUrlBase = "/shipyard",
    [string]$AppSlug = "pnl-web", 
    [string]$UnraidHost = "192.168.1.172",
    [int]$UnraidPort = 8082,
    [string]$SmbTarget = "\\192.168.1.172\Projects\apps\shipyard\pnl-web",
    [string]$AngularProject = "angular",
    [string]$BuildConfig = "production",
    [switch]$SkipBuild,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# === RESOLVE VARIABLES ===
Write-Host "=== Deploy Angular to NGINX Shipyard ===" -ForegroundColor Cyan
$HubUrlBase = $HubUrlBase.TrimEnd('/')
$Stamp = Get-Date -Format "yyyyMMdd-HHmm"
$Version = "$AppSlug-$Stamp"
$VersionUrl = "http://${UnraidHost}:${UnraidPort}${HubUrlBase}/${AppSlug}/${Version}/"
$RootUrl = "http://${UnraidHost}:${UnraidPort}${HubUrlBase}/${AppSlug}/"

Write-Host "APP      : $AppSlug" -ForegroundColor Yellow
Write-Host "VERSION  : $Version" -ForegroundColor Yellow  
Write-Host "Hub base : $HubUrlBase" -ForegroundColor Yellow
Write-Host "UNC path : $SmbTarget" -ForegroundColor Yellow
Write-Host "Check URL: $VersionUrl" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "DRY RUN MODE - No actual changes will be made" -ForegroundColor Magenta
}

# === ANGULAR BUILD ===
if (-not $SkipBuild) {
    Write-Host "=== Angular build (versioned base-href) ===" -ForegroundColor Green
    $BaseHref = "${HubUrlBase}/${AppSlug}/${Version}/"
    
    # Change to angular directory for build
    Push-Location "angular"
    try {
        $buildCmd = "npx ng build --configuration $BuildConfig --base-href `"$BaseHref`" --deploy-url `"$BaseHref`""
        Write-Host "Running: $buildCmd" -ForegroundColor Gray
        
        if (-not $DryRun) {
            Invoke-Expression $buildCmd
            if ($LASTEXITCODE -ne 0) {
                throw "Angular build failed with exit code $LASTEXITCODE"
            }
        }
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "=== Skipping build (using existing) ===" -ForegroundColor Yellow
}

# === LOCATE BROWSER BUILD ===
Write-Host "=== Locate browser build ===" -ForegroundColor Green
$OutDir = "angular\dist\$AngularProject\browser"

if (-not (Test-Path "$OutDir\index.html")) {
    # Fallback: find first browser folder
    $BrowserDirs = Get-ChildItem -Path "angular\dist" -Recurse -Directory -Name "browser" -ErrorAction SilentlyContinue
    if ($BrowserDirs) {
        $OutDir = Join-Path "angular\dist" $BrowserDirs[0]
        $OutDir = Split-Path -Parent $OutDir
        $OutDir = Join-Path $OutDir "browser"
    }
}

if (-not (Test-Path "$OutDir\index.html")) {
    throw "Build output not found: $OutDir\index.html missing"
}

Write-Host "OUTDIR: $OutDir" -ForegroundColor Yellow

# === CREATE VERSIONED FOLDER ON SMB SHARE ===
Write-Host "=== Create versioned folder on SMB share ===" -ForegroundColor Green
$VersionPath = Join-Path $SmbTarget $Version

if (-not $DryRun) {
    try {
        New-Item -ItemType Directory -Force -Path $VersionPath | Out-Null
        Write-Host "Created directory: $VersionPath" -ForegroundColor Gray
    }
    catch {
        throw "Failed to create directory $VersionPath : $_"
    }
}
else {
    Write-Host "[DRY RUN] Would create: $VersionPath" -ForegroundColor Magenta
}

# === COPY BUILD CONTENTS TO VERSIONED FOLDER ===  
Write-Host "=== Copy build contents to versioned folder ===" -ForegroundColor Green
$SourcePath = Resolve-Path $OutDir

if (-not $DryRun) {
    try {
        # Use robocopy for reliable copying to UNC path
        $robocopyArgs = @(
            "`"$SourcePath`"",
            "`"$VersionPath`"", 
            "/MIR",
            "/NFL", "/NDL", "/NJH", "/NJS", "/NP"
        )
        
        Write-Host "Running: robocopy $($robocopyArgs -join ' ')" -ForegroundColor Gray
        $result = Start-Process -FilePath "robocopy" -ArgumentList $robocopyArgs -Wait -PassThru -NoNewWindow
        
        # Robocopy exit codes: 0-7 are success, 8+ are errors
        if ($result.ExitCode -gt 7) {
            throw "Robocopy failed with exit code $($result.ExitCode)"
        }
        
        Write-Host "Successfully copied build to $VersionPath" -ForegroundColor Gray
    }
    catch {
        throw "Failed to copy build contents: $_"
    }
}
else {
    Write-Host "[DRY RUN] Would copy: $SourcePath -> $VersionPath" -ForegroundColor Magenta
}

# === CREATE ROOT REDIRECT ===
Write-Host "=== Create root redirect (index.html) to current version ===" -ForegroundColor Green
$RedirectHtml = @"
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0;url=./$Version/">
    <title>Redirecting to Liberty Tax PnL...</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
               text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; 
                    padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #007acc; 
                  border-radius: 50%; width: 40px; height: 40px; 
                  animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h2>Liberty Tax P&amp;L</h2>
        <div class="spinner"></div>
        <p>Redirecting to latest version...</p>
        <p><a href="./$Version/">Click here if not redirected automatically</a></p>
        <small style="color: #666;">Version: $Version</small>
    </div>
</body>
</html>
"@

$RootIndexPath = Join-Path $SmbTarget "index.html"

if (-not $DryRun) {
    try {
        Set-Content -Path $RootIndexPath -Value $RedirectHtml -Encoding UTF8
        Write-Host "Created redirect: $RootIndexPath" -ForegroundColor Gray
    }
    catch {
        throw "Failed to create root redirect: $_"
    }
}
else {
    Write-Host "[DRY RUN] Would create redirect: $RootIndexPath" -ForegroundColor Magenta
}

# === VERIFY OVER HTTP ===
Write-Host "=== Verify over HTTP ===" -ForegroundColor Green

if (-not $DryRun) {
    try {
        # Check version URL
        Write-Host "Checking: $VersionUrl" -ForegroundColor Gray
        $response1 = Invoke-WebRequest -Uri "${VersionUrl}index.html" -Method Head -TimeoutSec 30
        if ($response1.StatusCode -ne 200) {
            throw "Version URL check failed: $($response1.StatusCode)"
        }
        
        # Check root URL  
        Write-Host "Checking: $RootUrl" -ForegroundColor Gray
        $response2 = Invoke-WebRequest -Uri $RootUrl -Method Head -TimeoutSec 30 -MaximumRedirection 1
        if ($response2.StatusCode -ne 200) {
            throw "Root URL check failed: $($response2.StatusCode)"
        }
        
        Write-Host "HTTP verification successful" -ForegroundColor Gray
    }
    catch {
        Write-Error "HTTP verification failed: $_"
        Write-Host "=== STARTING ROLLBACK ===" -ForegroundColor Red
        
        # Read previous LATEST if present
        $LatestPath = Join-Path $SmbTarget "LATEST.txt"
        $PreviousVersion = $null
        
        if (Test-Path $LatestPath) {
            $PreviousVersion = Get-Content $LatestPath -Raw -ErrorAction SilentlyContinue
            $PreviousVersion = $PreviousVersion.Trim()
        }
        
        if ($PreviousVersion) {
            Write-Host "Rolling back to previous version: $PreviousVersion" -ForegroundColor Yellow
            
            $RollbackRedirect = $RedirectHtml -replace $Version, $PreviousVersion
            Set-Content -Path $RootIndexPath -Value $RollbackRedirect -Encoding UTF8
            
            # Test rollback
            try {
                $rollbackUrl = "http://${UnraidHost}:${UnraidPort}${HubUrlBase}/${AppSlug}/"
                Invoke-WebRequest -Uri $rollbackUrl -Method Head -TimeoutSec 30 -MaximumRedirection 1 | Out-Null
                Write-Host "Rollback successful to $PreviousVersion" -ForegroundColor Green
            }
            catch {
                Write-Warning "Rollback verification failed: $_"
            }
        }
        else {
            Write-Warning "No previous version found - leaving current files for manual review"
        }
        
        throw "Deployment failed and rollback completed"
    }
}
else {
    Write-Host "[DRY RUN] Would verify: $VersionUrl and $RootUrl" -ForegroundColor Magenta
}

# === UPDATE LATEST.TXT POINTER ===
Write-Host "=== Update LATEST.txt pointer ===" -ForegroundColor Green
$LatestPath = Join-Path $SmbTarget "LATEST.txt"

if (-not $DryRun) {
    try {
        Set-Content -Path $LatestPath -Value $Version -Encoding ASCII -NoNewline
        Write-Host "Updated LATEST.txt: $Version" -ForegroundColor Gray
    }
    catch {
        Write-Warning "Failed to update LATEST.txt: $_"
    }
}
else {
    Write-Host "[DRY RUN] Would update LATEST.txt: $Version" -ForegroundColor Magenta
}

# === SUCCESS ===
Write-Host "=== SUCCESS — $Version is live ===" -ForegroundColor Green
Write-Host "Version URL: $VersionUrl" -ForegroundColor Cyan
Write-Host "Root URL   : $RootUrl" -ForegroundColor Cyan
Write-Host "Deploy completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
