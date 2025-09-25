Param([int]$TimeoutMinutes = 10)
$ErrorActionPreference = 'Stop'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmm'
$logDir = Join-Path 'run-reports' 'parity'
$log = Join-Path $logDir "parity-$timestamp.log"
$csv = Join-Path $logDir "parity-diff-$timestamp.csv"
$script = {
  # TODO: Implement Node script to load golden inputs and compare React vs Angular calc outputs.
  # For now, create an empty CSV with header.
  New-Item -ItemType Directory -Force -Path (Split-Path $csv) | Out-Null
  Set-Content -Path $csv -Value "case,react_totalRevenue,angular_totalRevenue,diff"
}
. "$PSScriptRoot/build.ps1" | Out-Null
Invoke-WithWatchdog -Script $script -LogPath $log -TimeoutMinutes $TimeoutMinutes
if ($global:__wd_stalled) { Add-Content docs/SESSION_LOG.md "[$(Get-Date -Format o)] parity.ps1 stalled twice; see $log" }
