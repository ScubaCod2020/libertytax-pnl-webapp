Param(
    [int]$TimeoutMinutes = 10
)

$ErrorActionPreference = 'Stop'

# Share watchdog as a reusable script
. "$PSScriptRoot/_watchdog.ps1"

$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$logDir = Join-Path 'run-reports' "build"
$log = Join-Path $logDir "build-$timestamp.log"

$script = {
    if (Test-Path dist) { Remove-Item -Recurse -Force dist }
    npm ci
    npm run build
}

Invoke-WithWatchdog -Script $script -LogPath $log -TimeoutMinutes $TimeoutMinutes

if ($global:__wd_stalled) {
    Add-Content docs/SESSION_LOG.md "[$(Get-Date -Format o)] build.ps1 stalled twice; see $log"
}
