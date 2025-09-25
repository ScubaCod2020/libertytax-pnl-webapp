Param([int]$TimeoutMinutes = 10)
$ErrorActionPreference = 'Stop'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$logDir = Join-Path 'run-reports' 'parity'
$log = Join-Path $logDir "parity-$timestamp.log"
. "$PSScriptRoot/build.ps1" | Out-Null

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$script = {
    node scripts/build-parity-bundles.cjs
    node scripts/parity-runner.ts
}

Invoke-WithWatchdog -Script $script -LogPath $log -TimeoutMinutes $TimeoutMinutes
if ($global:__wd_stalled) { Add-Content docs/SESSION_LOG.md "[$(Get-Date -Format o)] parity.ps1 stalled twice; see $log" }
