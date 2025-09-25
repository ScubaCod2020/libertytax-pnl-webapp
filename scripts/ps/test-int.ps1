Param([int]$TimeoutMinutes = 15)
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot/build.ps1" | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$logDir = Join-Path 'run-reports' 'integration'
$log = Join-Path $logDir "integration-$timestamp.log"
$script = { npm run test:integration }
Invoke-WithWatchdog -Script $script -LogPath $log -TimeoutMinutes $TimeoutMinutes
if ($global:__wd_stalled) { Add-Content docs/SESSION_LOG.md "[$(Get-Date -Format o)] test-int.ps1 stalled twice; see $log" }
