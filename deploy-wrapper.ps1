# === DEPLOY WRAPPER FOR LIBERTY TAX PNL ===
# Convenient wrapper script with preset configurations

param(
    [ValidateSet("production", "development", "staging")]
    [string]$Environment = "production",
    
    [switch]$DryRun,
    [switch]$SkipBuild,
    [switch]$Rollback,
    [switch]$ListVersions
)

# === ENVIRONMENT CONFIGURATIONS ===
$configs = @{
    "production" = @{
        AppSlug = "pnl-web"
        BuildConfig = "production"
        SmbTarget = "\\192.168.1.172\Projects\apps\shipyard\pnl-web"
    }
    "development" = @{
        AppSlug = "pnl-dev"
        BuildConfig = "development"  
        SmbTarget = "\\192.168.1.172\Projects\apps\shipyard\pnl-dev"
    }
    "staging" = @{
        AppSlug = "pnl-staging"
        BuildConfig = "production"
        SmbTarget = "\\192.168.1.172\Projects\apps\shipyard\pnl-staging"
    }
}

$config = $configs[$Environment]

Write-Host "=== Liberty Tax PnL Deployment Wrapper ===" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "App Slug: $($config.AppSlug)" -ForegroundColor Yellow
Write-Host "Build Config: $($config.BuildConfig)" -ForegroundColor Yellow

# === ROLLBACK MODE ===
if ($Rollback -or $ListVersions) {
    $rollbackArgs = @{
        AppSlug = $config.AppSlug
        SmbTarget = $config.SmbTarget
    }
    
    if ($ListVersions) { $rollbackArgs.ListVersions = $true }
    if ($DryRun) { $rollbackArgs.DryRun = $true }
    
    & ".\rollback-shipyard.ps1" @rollbackArgs
    exit $LASTEXITCODE
}

# === DEPLOYMENT MODE ===
$deployArgs = @{
    AppSlug = $config.AppSlug
    BuildConfig = $config.BuildConfig
    SmbTarget = $config.SmbTarget
}

if ($DryRun) { $deployArgs.DryRun = $true }
if ($SkipBuild) { $deployArgs.SkipBuild = $true }

& ".\deploy-to-shipyard.ps1" @deployArgs
exit $LASTEXITCODE
