# Quick PATH setup for development
# Copy and paste this into PowerShell whenever you start a new session

$env:Path = $env:Path + ';D:\Dev\nodejs;D:\Dev\nvm;C:\Users\scodl\AppData\Local\GitHubDesktop\app-3.5.2\resources\app\git\cmd'

Write-Host "✅ Development paths added to current session!" -ForegroundColor Green
Write-Host "Now you can use: node, npm, git" -ForegroundColor Yellow

# Test the tools
Write-Host "`n🔧 Testing tools:" -ForegroundColor Cyan
node --version
npm --version  
git --version
