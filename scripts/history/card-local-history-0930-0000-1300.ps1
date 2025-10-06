$ErrorActionPreference = 'Stop'

# ---- Time Window (ET) ----
$since = Get-Date "09/30/2025 00:00:00 -04:00"
$until = Get-Date "09/30/2025 13:00:00 -04:00"

# ---- Output folders ----
$ROOT = ".\.restored\local_history_0930_0000_1300"
$FILES = Join-Path $ROOT "files"
$STITCH = Join-Path $ROOT "stitched"
$LOGS = Join-Path $ROOT "logs"
New-Item -ItemType Directory -Force -Path $FILES, $STITCH, $LOGS | Out-Null
"Window: $($since) to $($until) ET" | Tee-Object (Join-Path $ROOT "summary.md")

# ---- Locate history roots for Cursor/VS Code (Windows/macOS/Linux) ----
$possibleRoots = @(
    # Cursor (Windows/macOS/Linux)
    "$env:APPDATA\Cursor\User\History",
    "$HOME\AppData\Roaming\Cursor\User\History",
    "$HOME/Library/Application Support/Cursor/User/History",
    "$HOME/.config/Cursor/User/History",
    # VS Code fallbacks (just in case)
    "$env:APPDATA\Code\User\History",
    "$HOME\AppData\Roaming\Code\User\History",
    "$HOME/Library/Application Support/Code/User/History",
    "$HOME/.config/Code/User/History"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

$possibleRoots | Set-Content (Join-Path $LOGS "history_roots.txt")
if (-not $possibleRoots) {
    "No Local History roots found. Stop." | Tee-Object (Join-Path $ROOT "summary.md") -Append
    exit 0
}

# Helper: ensure folder exists
function Ensure-Dir([string]$p) {
    $d = Split-Path -Parent $p
    if ($d -and -not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }
}

# Helper: write text (as-is)
function Write-Text([string]$path, [string]$text) {
    Ensure-Dir $path
    [System.IO.File]::WriteAllText($path, $text, [System.Text.Encoding]::UTF8)
}

# Helper: join nested relative path safely under a base
function Join-NestedPath([string]$base, [string]$relative) {
    $current = $base
    $parts = ($relative -split '[\\/]+') | Where-Object { $_ -ne '' }
    foreach ($part in $parts) {
        $current = Join-Path -Path $current -ChildPath $part
    }
    return $current
}

# Manifest rows
$rows = New-Object System.Collections.Generic.List[object]

# -------- 1) Built-in Local History format --------
# Each subfolder is usually a hash of the original path, containing entries.json & snapshots
foreach ($root in $possibleRoots) {
    $dirs = @(Get-ChildItem -LiteralPath ([string]$root) -Directory -ErrorAction SilentlyContinue)
    foreach ($dir in $dirs) {
        $hashDir = $dir.FullName
        $entriesPath = Join-Path $hashDir "entries.json"
        $snapshotsCopied = 0

        if (Test-Path $entriesPath) {
            try {
                $entriesJson = Get-Content -Raw $entriesPath | ConvertFrom-Json
            }
            catch {
                $entriesJson = $null
            }

            $origResource = $entriesJson.resource # e.g., "file:///c%3A/…"
            $origPath = $null
            if ($origResource -and $origResource -like "file://*") {
                # Decode URI to file path (best effort)
                $uri = [System.Uri]$origResource
                $origPath = $uri.LocalPath
            }

            # Each entry has an id, timestamp; the content file often named by id/ts
            foreach ($e in @($entriesJson.entries)) {
                # timestamp expected ms since epoch; convert
                $ts = $null
                try { $ts = [DateTimeOffset]::FromUnixTimeMilliseconds([int64]$e.timestamp).DateTime } catch { $ts = $null }
                if ($ts -and ($ts -ge $since) -and ($ts -le $until)) {
                    # snapshot file can be named by id or more; try common patterns
                    $eid = [string]$e.id
                    $candFiles = @(
                        (Join-Path -Path $hashDir -ChildPath $eid),
                        (Join-Path -Path $hashDir -ChildPath ($eid + '.txt')),
                        (Join-Path -Path $hashDir -ChildPath ($eid + '.log')),
                        (Join-Path -Path $hashDir -ChildPath ($eid + '.json'))
                    ) + (Get-ChildItem -LiteralPath $hashDir -File | Where-Object { $_.Name -like ("*" + $eid + "*") }).FullName

                    $snap = $candFiles | Where-Object { Test-Path $_ } | Select-Object -First 1
                    if (-not $snap) { continue }

                    if ($origPath) {
                        $safeRel = ([string]$origPath)
                        $safeRel = $safeRel -replace '^[\\/]+', ''
                        $safeRel = $safeRel -replace ':', '_'
                        $destRelDir = Join-NestedPath -base $FILES -relative $safeRel
                    }
                    else {
                        $unmapped = Join-Path -Path $FILES -ChildPath 'unmapped'
                        $destRelDir = Join-Path -Path $unmapped -ChildPath ($dir.Name)
                    }
                    # Ensure parent for the final file path (dest)
                    $stamp = (Get-Date $ts -Format "yyyyMMdd-HHmmss")
                    $base = $origPath ? (Split-Path -Leaf $origPath) : "snapshot"
                    $dest = Join-Path $destRelDir ("{0}__{1}__{2}" -f $stamp, $e.id, $base)
                    Ensure-Dir $dest

                    Copy-Item -LiteralPath $snap -Destination $dest -Force
                    $size = (Get-Item $dest).Length
                    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $dest).Hash
                    $rows.Add([PSCustomObject]@{
                            SourceRoot = $root
                            HashDir    = $hashDir
                            Commit     = ""
                            Date       = $ts
                            FilePath   = $origPath
                            Snapshot   = $dest
                            Size       = $size
                            SHA256     = $hash
                            Kind       = "LocalHistory"
                        })
                    $snapshotsCopied++
                }
            }
        }
        else {
            # Fallback: if no entries.json, still grab files by LastWriteTime in window
            Get-ChildItem -LiteralPath $hashDir -File -ErrorAction SilentlyContinue | Where-Object {
                $_.LastWriteTime -ge $since -and $_.LastWriteTime -le $until
            } | ForEach-Object {
                $snap = $_.FullName
                $unmappedNo = Join-Path -Path $FILES -ChildPath 'unmapped_no_entries'
                $destName = ("{0}__{1}" -f ($_.LastWriteTime.ToString("yyyyMMdd-HHmmss")), $_.Name)
                $dest = Join-Path -Path $unmappedNo -ChildPath $destName
                Ensure-Dir $dest
                Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
                $size = (Get-Item $dest).Length
                $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $dest).Hash
                $rows.Add([PSCustomObject]@{
                        SourceRoot = $root
                        HashDir    = ""
                        Commit     = ""
                        Date       = $_.LastWriteTime
                        FilePath   = $null
                        Snapshot   = $dest
                        Size       = $size
                        SHA256     = $hash
                        Kind       = "LocalHistory(NoEntries)"
                    })
            }
        }

        if ($snapshotsCopied -gt 0) {
            "$snapshotsCopied snapshots from $hashDir" | Tee-Object (Join-Path $LOGS "harvest.log") -Append
        }
    }
}

# -------- 2) Workspace “.history” folders (legacy extension) --------
# If you ever used the Local History extension that writes .history inside the workspace,
# copy everything in the window.
Get-ChildItem -Recurse -Directory -Filter ".history" -ErrorAction SilentlyContinue | ForEach-Object {
    $histDir = $_.FullName
    Get-ChildItem -Recurse -File -Path $histDir | Where-Object {
        $_.LastWriteTime -ge $since -and $_.LastWriteTime -le $until
    } | ForEach-Object {
        $rel = $_.FullName.Substring($histDir.Length).TrimStart('\\', '/')
        $wsHist = Join-Path -Path $FILES -ChildPath '_workspace_dot_history'
        $dest = Join-Path -Path $wsHist -ChildPath ($rel -replace '[:*?"<>|]', '_')
        Ensure-Dir $dest
        Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
        $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $dest).Hash
        $rows.Add([PSCustomObject]@{
                SourceRoot = $histDir
                HashDir    = ""
                Commit     = ""
                Date       = $_.LastWriteTime
                FilePath   = $null
                Snapshot   = $dest
                Size       = (Get-Item $dest).Length
                SHA256     = $hash
                Kind       = ".history"
            })
    }
}

# -------- 3) Write manifest & stitched previews --------
$manifest = Join-Path $ROOT "manifest.csv"
$rows | Sort-Object Date, FilePath, Snapshot | Export-Csv -NoTypeInformation -Path $manifest
"Manifest: $manifest" | Tee-Object (Join-Path $ROOT "summary.md") -Append

# Build stitched previews grouped by FilePath (or by source bucket for unmapped)
$groups = $rows | Group-Object { if ($_.FilePath) { $_.FilePath } else { "$( $_.Kind ):$( $_.SourceRoot )" } }
$stitchedCount = 0
foreach ($g in $groups) {
    $outName = ($g.Name -replace '[:*?"<>|]', '_') -replace '\\', '__'
    $outPath = Join-Path $STITCH ("{0}.stitched.txt" -f $outName)
    Ensure-Dir $outPath
    $sb = New-Object System.Text.StringBuilder
    foreach ($r in ($g.Group | Sort-Object Date)) {
        $hdr = "/* ===== BEGIN {0} | {1} | {2} ===== */" -f ($r.FilePath ?? "(unmapped)"), $r.Date, (Split-Path -Leaf $r.Snapshot)
        $end = "/* ===== END ===== */"
        [void]$sb.AppendLine($hdr)
        try {
            $text = Get-Content -Raw -LiteralPath $r.Snapshot
        }
        catch { $text = "<binary or unreadable>" }
        [void]$sb.AppendLine($text)
        [void]$sb.AppendLine($end)
        [void]$sb.AppendLine("")
    }
    [System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
    $stitchedCount++
}
"Stitched previews: $stitchedCount" | Tee-Object (Join-Path $ROOT "summary.md") -Append

"Done. Working tree unchanged." | Tee-Object (Join-Path $ROOT "summary.md") -Append


