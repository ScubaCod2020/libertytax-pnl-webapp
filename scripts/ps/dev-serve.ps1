Param([int]$TimeoutMinutes = 60)
$ErrorActionPreference = 'Stop'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$logDir = Join-Path 'run-reports' 'dev'
$log = Join-Path $logDir "dev-$timestamp.log"
$script = { npm run dev }
Invoke-WithWatchdog -Script $script -LogPath $log -TimeoutMinutes $TimeoutMinutes
if ($global:__wd_stalled) { Add-Content docs/SESSION_LOG.md "[$(Get-Date -Format o)] dev-serve.ps1 stalled twice; see $log" }
