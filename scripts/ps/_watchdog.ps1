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
        # Start the job directly from the provided scriptblock to avoid serialization issues
        $job = Start-Job -ScriptBlock $Script

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
            $job2 = Start-Job -ScriptBlock $Script
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

