$ErrorActionPreference = 'Stop'

# Folders
New-Item -ItemType Directory -Force .\.logs | Out-Null
New-Item -ItemType Directory -Force .\docs\run-reports | Out-Null

# Versions / commit
$sha = (git rev-parse HEAD)
"Commit: $sha" | Tee-Object -FilePath .\.logs\cursor-run.log -Append
node -v 2>&1 | Tee-Object -FilePath .\.logs\cursor-run.log -Append

# Angular CLI via npx (non-interactive)
npx --yes -p @angular/cli@latest ng version 2>&1 | Tee-Object -FilePath .\.logs\cursor-run.log -Append

"SHA:$sha"


