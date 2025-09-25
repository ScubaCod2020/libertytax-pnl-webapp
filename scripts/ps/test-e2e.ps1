Param([int]$TimeoutMinutes = 20)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/build.ps1" | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$logDir = Join-Path 'run-reports' 'e2e'
$log = Join-Path $logDir "e2e-$timestamp.log"
$script = { npm run test:e2e }
Invoke-WithWatchdog -Script $script -LogPath $log -TimeoutMinutes $TimeoutMinutes
if ($global:__wd_stalled) { Add-Content docs/SESSION_LOG.md "[$(Get-Date -Format o)] test-e2e.ps1 stalled twice; see $log" }
