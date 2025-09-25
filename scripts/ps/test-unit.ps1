Param([int]$TimeoutMinutes = 10)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/build.ps1" | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$logDir = Join-Path 'run-reports' 'unit'
$log = Join-Path $logDir "unit-$timestamp.log"
$script = { npm run test:domain }
Invoke-WithWatchdog -Script $script -LogPath $log -TimeoutMinutes $TimeoutMinutes
if ($global:__wd_stalled) { Add-Content docs/SESSION_LOG.md "[$(Get-Date -Format o)] test-unit.ps1 stalled twice; see $log" }
