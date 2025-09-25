Param(
  [int]$TimeoutMinutes = 10
)

$ErrorActionPreference = 'Stop'

function Invoke-WithWatchdog {
  Param(
    [Parameter(Mandatory)] [scriptblock]$Script,
    [Parameter(Mandatory)] [string]$LogPath,
    [int]$TimeoutMinutes = 10
  )
  New-Item -ItemType Directory -Force -Path (Split-Path $LogPath) | Out-Null
  $lastOutput = Get-Date
  $global:__wd_stalled = $false

  Start-Transcript -Path $LogPath -Force | Out-Null
  try {
    $job = Start-Job -ScriptBlock {
      Param($sb)
      & $sb
    } -ArgumentList $Script

    while ($true) {
      Receive-Job $job -Keep | Tee-Object -Variable line | Out-Default
      if ($line) { $lastOutput = Get-Date }
      if ($job.State -ne 'Running') { break }
      if ((Get-Date) -gt $lastOutput.AddMinutes($TimeoutMinutes)) {
        $global:__wd_stalled = $true
        Stop-Job $job -Force
        break
      }
      Start-Sleep -Seconds 5
    }

    if ($global:__wd_stalled) {
      Write-Warning "Watchdog timeout hit. Attempting one retry..."
      $global:__wd_stalled = $false
      $lastOutput = Get-Date
      $job2 = Start-Job -ScriptBlock { Param($sb) & $sb } -ArgumentList $Script
      while ($true) {
        Receive-Job $job2 -Keep | Tee-Object -Variable line2 | Out-Default
        if ($line2) { $lastOutput = Get-Date }
        if ($job2.State -ne 'Running') { break }
        if ((Get-Date) -gt $lastOutput.AddMinutes($TimeoutMinutes)) {
          $global:__wd_stalled = $true
          Stop-Job $job2 -Force
          break
        }
        Start-Sleep -Seconds 5
      }
    }
  }
  finally {
    Stop-Transcript | Out-Null
  }
}

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
