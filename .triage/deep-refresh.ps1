$ErrorActionPreference = 'Stop'

function Ensure-Dir { param([string]$Path) if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Path $Path | Out-Null } }

$root = Get-Location
$tri = Join-Path $root '.triage'
$tsdir = Join-Path $tri 'tsconfigs'
Ensure-Dir $tri
Ensure-Dir $tsdir

# 1) Reset outputs (safe)
Get-ChildItem -Path $tri -Recurse -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# 2) Config & basics
if (Test-Path (Join-Path $root 'package.json')) { Copy-Item (Join-Path $root 'package.json') (Join-Path $tri 'pkg.root.json') -Force }
if (Test-Path (Join-Path $root 'angular/angular.json')) { Copy-Item (Join-Path $root 'angular/angular.json') (Join-Path $tri 'angular.json') -Force }
Get-ChildItem -Path (Join-Path $root 'angular') -File -Filter 'tsconfig*.json' -ErrorAction SilentlyContinue | ForEach-Object { Copy-Item $_.FullName (Join-Path $tsdir $_.Name) -Force }

# 3) File tree & LOC
$src = Join-Path $root 'angular/src'
$treeTxt = Join-Path $tri 'tree.txt'
$locCsv = Join-Path $tri 'loc.csv'
if (Test-Path $src) {
  $maxDepth = 6
  function Write-Tree {
    param([string]$dir, [int]$depth)
    if ($depth -gt $maxDepth) { return }
    Get-ChildItem -Path $dir | Sort-Object Name | ForEach-Object {
      $indent = '  ' * $depth
      if ($_.PsIsContainer) {
        Add-Content -Path $treeTxt -Value ("$indent/" + $_.Name)
        Write-Tree -dir $_.FullName -depth ($depth + 1)
      } else {
        Add-Content -Path $treeTxt -Value ("$indent" + $_.Name)
      }
    }
  }
  Remove-Item -ErrorAction SilentlyContinue $treeTxt; New-Item -ItemType File -Path $treeTxt | Out-Null
  Write-Tree -dir $src -depth 0

  $locRows = New-Object System.Collections.Generic.List[string]
  $locRows.Add('path,ext,lines') | Out-Null
  Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
    try {
      $lines = (Get-Content $_.FullName).Length
      $rel = [IO.Path]::GetRelativePath($root, $_.FullName) -replace '\\','/'
      $locRows.Add("$rel,$($_.Extension),$lines") | Out-Null
    } catch {}
  }
  $locRows | Set-Content -Path $locCsv
}

# 4) Routes/modules/components
$routesTxt = Join-Path $tri 'routes.txt'
$modulesTxt = Join-Path $tri 'modules.txt'
$componentsCsv = Join-Path $tri 'components.csv'
$routesOut = New-Object System.Collections.Generic.List[string]
$modulesOut = New-Object System.Collections.Generic.List[string]
$compRows = New-Object System.Collections.Generic.List[string]
$compRows.Add('file,selector,templateUrl,styleUrls,standalone') | Out-Null

function Add-RoutesFromFile { param([string]$File)
  $text = Get-Content $File -Raw
  if ($text -notmatch '\bpath\s*:') { return }
  $rel = [IO.Path]::GetRelativePath($root, $File) -replace '\\','/'
  $regex = '\bpath\s*:\s*(?:''|\")([^''\"]+)(?:''|\")[\s\S]*?(?:component\s*:\s*([A-Za-z0-9_$.]+)|loadChildren\s*:\s*([^,}\r\n]+)|redirectTo\s*:\s*(?:''|\")([^''\"]+)(?:''|\"))'
  $matches = [regex]::Matches($text, $regex)
  if ($matches.Count -gt 0) {
    $routesOut.Add("// $rel") | Out-Null
    foreach ($m in $matches) {
      $p = $m.Groups[1].Value; $comp = $m.Groups[2].Value; $lazy = $m.Groups[3].Value; $redir = $m.Groups[4].Value
      $target = if ($comp) { "component $comp" } elseif ($lazy) { "loadChildren $($lazy.Trim())" } elseif ($redir) { "redirectTo $redir" } else { '' }
      if ($p -ne '' -and $target -ne '') { $routesOut.Add("$p -> $target") | Out-Null }
    }
  }
}

function Add-ModuleFromFile { param([string]$File)
  $text = Get-Content $File -Raw
  if ($text -notmatch '@NgModule\(') { return }
  $clsMatch = [regex]::Match($text, 'export\s+class\s+([A-Za-z0-9_]+)')
  $name = if ($clsMatch.Success) { $clsMatch.Groups[1].Value } else { '(UnknownModule)' }
  $decMatch = [regex]::Match($text, 'declarations\s*:\s*\[([\s\S]*?)\]')
  $impMatch = [regex]::Match($text, 'imports\s*:\s*\[([\s\S]*?)\]')
  $declarations = if ($decMatch.Success) { ($decMatch.Groups[1].Value -split '[,\r\n]' | % { $_.Trim() } | ? { $_ }) -join ', ' } else { '' }
  $imports = if ($impMatch.Success) { ($impMatch.Groups[1].Value -split '[,\r\n]' | % { $_.Trim() } | ? { $_ }) -join ', ' } else { '' }
  $modulesOut.Add($name) | Out-Null
  if ($declarations) { $modulesOut.Add("  declarations: $declarations") | Out-Null }
  if ($imports) { $modulesOut.Add("  imports: $imports") | Out-Null }
  $modulesOut.Add('') | Out-Null
}

function Add-ComponentMeta { param([string]$File)
  $text = Get-Content $File -Raw
  if ($text -notmatch '@Component\(') { return }
  $selector = [regex]::Match($text, 'selector\s*:\s*[''\"`]([^''\"`]+)[''\"`]').Groups[1].Value
  $templateUrl = [regex]::Match($text, 'templateUrl\s*:\s*[''\"`]([^''\"`]+)[''\"`]').Groups[1].Value
  $stylesBlock = [regex]::Match($text, 'styleUrls\s*:\s*\[([\s\S]*?)\]').Groups[1].Value
  $styleUrls = if ($stylesBlock) { ([regex]::Matches($stylesBlock, '[''\"`]([^''\"`]+)[''\"`]') | % { $_.Groups[1].Value }) -join ';' } else { '' }
  $standalone = [regex]::IsMatch($text, 'standalone\s*:\s*true', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  $rel = [IO.Path]::GetRelativePath($root, $File) -replace '\\','/'
  $compRows.Add("$rel,$selector,$templateUrl,$styleUrls,$standalone") | Out-Null
}

if (Test-Path $src) {
  Get-ChildItem -Path $src -Recurse -File -Include '*.ts' | ForEach-Object {
    Add-RoutesFromFile -File $_.FullName
    Add-ModuleFromFile -File $_.FullName
  }
  Get-ChildItem -Path $src -Recurse -File -Include '*.component.ts' | ForEach-Object { Add-ComponentMeta -File $_.FullName }
}
$routesOut | Set-Content -Path $routesTxt
$modulesOut | Set-Content -Path $modulesTxt
$compRows | Set-Content -Path $componentsCsv

# 5) Template gotchas
$gotchasTemplates = Join-Path $tri 'gotchas.templates.txt'
$hits = New-Object System.Collections.Generic.List[string]
if (Test-Path $src) {
  Get-ChildItem -Path $src -Recurse -File -Include '*.html' | ForEach-Object {
    $path = $_.FullName
    $lines = Get-Content $path
    for ($i=0; $i -lt $lines.Count; $i++) {
      $ln = $lines[$i]
      if ($ln -match '\*ngFor="[^"]+\([^)]\)"') { $hits.Add("$([IO.Path]::GetRelativePath($root,$path) -replace '\\','/'):$($i+1): $($ln.Trim())") | Out-Null }
      if ($ln -match '\{\{\s*\w+\([^}]+\)\s*\}\}') { $hits.Add("$([IO.Path]::GetRelativePath($root,$path) -replace '\\','/'):$($i+1): $($ln.Trim())") | Out-Null }
      if ($ln -match '\[(ngClass|ngStyle)\]="\w+\([^)]\)"') { $hits.Add("$([IO.Path]::GetRelativePath($root,$path) -replace '\\','/'):$($i+1): $($ln.Trim())") | Out-Null }
    }
  }
}
if ($hits.Count -gt 0) { $hits | Set-Content -Path $gotchasTemplates }

# 6) CSS & font audit
$cssFonts = Join-Path $tri 'css.fonts.txt'
$cssLong = Join-Path $tri 'css.longfiles.txt'
$fonts = New-Object System.Collections.Generic.List[string]
$longs = New-Object System.Collections.Generic.List[string]
if (Test-Path $src) {
  Get-ChildItem -Path $src -Recurse -File -Include '*.scss','*.css' | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    $rel = [IO.Path]::GetRelativePath($root, $_.FullName) -replace '\\','/'
    if ([string]::IsNullOrEmpty($content)) { return }
    $matches = [regex]::Matches($content, 'font-size\s*:\s*([0-9]+)(px)?', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    foreach ($m in $matches) {
      $num = [int]$m.Groups[1].Value; $unit = $m.Groups[2].Value
      if (($unit -eq 'px' -and ($num -gt 18 -or $num -lt 12)) -or ($unit -eq '')) {
        $fonts.Add(("{0}: font-size={1}{2}" -f $rel, $num, $unit)) | Out-Null
      }
    }
    $lineCount = (Get-Content $_.FullName).Length
    if ($lineCount -gt 200) { $longs.Add("$rel ($lineCount lines)") | Out-Null }
  }
}
if ($fonts.Count -gt 0) { $fonts | Set-Content -Path $cssFonts }
if ($longs.Count -gt 0) { $longs | Set-Content -Path $cssLong }

# 7) Assets audit
$assetsCsv = Join-Path $tri 'assets.csv'
$assetsHeavy = Join-Path $tri 'assets.heavy.txt'
$assetRows = New-Object System.Collections.Generic.List[string]
$assetRows.Add('path,size') | Out-Null
$heavy = New-Object System.Collections.Generic.List[string]
$assetsDir = Join-Path $src 'assets'
if (Test-Path $assetsDir) {
  Get-ChildItem -Path $assetsDir -Recurse -File | ForEach-Object {
    $rel = [IO.Path]::GetRelativePath($root, $_.FullName) -replace '\\','/'
    $size = $_.Length
    $assetRows.Add("$rel,$size") | Out-Null
    if ($size -gt 204800) { $heavy.Add("$rel ($size bytes)") | Out-Null }
  }
}
$assetRows | Set-Content -Path $assetsCsv
if ($heavy.Count -gt 0) { $heavy | Set-Content -Path $assetsHeavy }

# 8) TODO/FIXME scan
$todosTxt = Join-Path $tri 'todos.txt'
if (Test-Path $src) {
  $todoHits = New-Object System.Collections.Generic.List[string]
  Get-ChildItem -Path $src -Recurse -File -Include '*.ts','*.html','*.scss','*.css' | ForEach-Object {
    $path = $_.FullName; $rel = [IO.Path]::GetRelativePath($root, $path) -replace '\\','/'
    $i = 0; Get-Content $path | ForEach-Object { $i = $i + 1; if ($_ -match '(TODO|FIXME|HACK)') { $todoHits.Add(("{0}:{1}: {2}" -f $rel, $i, $_)) | Out-Null } }
  }
  if ($todoHits.Count -gt 0) { $todoHits | Set-Content -Path $todosTxt }
}

# 9) Type & build snapshot
Push-Location (Join-Path $root 'angular')
try { (npx -y tsc --noEmit 2>&1 | Out-String) | Set-Content -Path (Join-Path $root '.triage/typecheck.txt') } catch { "Typecheck error: $($_)" | Set-Content -Path (Join-Path $root '.triage/typecheck.txt') }
try { (npx -y ng build 2>&1 | Out-String) | Set-Content -Path (Join-Path $root '.triage/build.txt') } catch { "Build error: $($_)" | Set-Content -Path (Join-Path $root '.triage/build.txt') }
Pop-Location

# PRINT: list with sizes & counts
$written = Get-ChildItem $tri -Recurse | Where-Object { -not $_.PsIsContainer }
foreach ($f in $written) {
  $rel = [IO.Path]::GetRelativePath($root, $f.FullName) -replace '\\','/'
  Write-Output ("$rel (`$($f.Length)` bytes)")
}

$componentCount = (Get-Content $componentsCsv | Measure-Object -Line).Lines - 1
$routesCount = (Get-Content $routesTxt | Measure-Object -Line).Lines
$gotchaCount = (Test-Path $gotchasTemplates) ? ((Get-Content $gotchasTemplates | Measure-Object -Line).Lines) : 0
$heavyCount = (Test-Path $assetsHeavy) ? ((Get-Content $assetsHeavy | Measure-Object -Line).Lines) : 0
$cssFontIssues = (Test-Path $cssFonts) ? ((Get-Content $cssFonts | Measure-Object -Line).Lines) : 0

Write-Output ("Components: $componentCount")
Write-Output ("Routes lines: $routesCount")
Write-Output ("Gotcha hits: $gotchaCount")
Write-Output ("Heavy assets: $heavyCount")
Write-Output ("CSS font issues: $cssFontIssues")


