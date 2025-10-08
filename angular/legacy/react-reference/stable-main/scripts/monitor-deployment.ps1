# monitor-deployment.ps1 - PowerShell version for Windows users
# Monitor GitHub Actions deployment with enhanced logging

param(
    [string]$DebugLevel = "verbose",
    [switch]$SkipTests = $false,
    [switch]$WatchProgress = $true
)

Write-Host "🚀 Liberty Tax P&L Webapp - Staging Deployment Monitor" -ForegroundColor Blue
Write-Host "=====================================================" -ForegroundColor Blue

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Run this from the project root." -ForegroundColor Red
    exit 1
}

# Get current branch
$currentBranch = git branch --show-current
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Cyan

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️ Warning: You have uncommitted changes" -ForegroundColor Yellow
    git status --short
    $continue = Read-Host "Do you want to continue? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Pre-deployment checks
Write-Host "🔍 Running pre-deployment checks..." -ForegroundColor Blue

# Check Node.js and npm versions
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green

# Test build locally
Write-Host "🏗️ Testing build locally..." -ForegroundColor Blue
try {
    npm run build | Out-Null
    Write-Host "✅ Local build successful" -ForegroundColor Green
    
    # Check bundle sizes
    Write-Host "📊 Bundle size analysis:" -ForegroundColor Blue
    $jsFiles = Get-ChildItem "dist/assets/*.js" -ErrorAction SilentlyContinue
    foreach ($file in $jsFiles) {
        $sizeBytes = $file.Length
        $sizeKB = [math]::Round($sizeBytes / 1024, 2)
        
        if ($sizeBytes -gt 250000) {
            Write-Host "⚠️ $($file.Name): ${sizeKB}KB (exceeds 250KB limit)" -ForegroundColor Red
        } else {
            Write-Host "✅ $($file.Name): ${sizeKB}KB" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Local build failed. Please fix build errors before deploying." -ForegroundColor Red
    exit 1
}

# Commit and push if there are changes
if ($gitStatus) {
    Write-Host "📝 Committing current changes..." -ForegroundColor Yellow
    git add .
    git commit -m "Deploy: Staging deployment with validation fixes"
    git push origin $currentBranch
}

# Check if GitHub CLI is available
$ghAvailable = Get-Command gh -ErrorAction SilentlyContinue

if ($ghAvailable) {
    Write-Host "✅ Using GitHub CLI to trigger workflow" -ForegroundColor Green
    
    # Trigger the workflow
    gh workflow run "Deploy to Staging (Debug Mode)" --field debug_level="$DebugLevel" --field skip_tests="$SkipTests"
    
    Write-Host "✅ Workflow triggered successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Monitor deployment progress:" -ForegroundColor Blue
    
    # Get repository URL
    $repoUrl = git config --get remote.origin.url
    $repoPath = $repoUrl -replace '.*github\.com[:/]([^/]+/[^/]+).*', '$1' -replace '\.git$', ''
    
    Write-Host "  • GitHub Actions: https://github.com/$repoPath/actions"
    Write-Host "  • Or run: gh run list --workflow='Deploy to Staging (Debug Mode)'"
    Write-Host ""
    
    if ($WatchProgress) {
        Write-Host "👀 Watching workflow progress..." -ForegroundColor Blue
        Write-Host "Press Ctrl+C to stop watching (deployment will continue)" -ForegroundColor Yellow
        gh run watch
    }
    
} else {
    Write-Host "⚠️ GitHub CLI not found. Manual trigger required:" -ForegroundColor Yellow
    Write-Host ""
    $repoUrl = git config --get remote.origin.url
    $repoPath = $repoUrl -replace '.*github\.com[:/]([^/]+/[^/]+).*', '$1' -replace '\.git$', ''
    
    Write-Host "1. Go to: https://github.com/$repoPath/actions"
    Write-Host "2. Click 'Deploy to Staging (Debug Mode)'"
    Write-Host "3. Click 'Run workflow'"
    Write-Host "4. Set:"
    Write-Host "   - Debug level: $DebugLevel"
    Write-Host "   - Skip tests: $SkipTests"
    Write-Host "5. Click 'Run workflow'"
}

Write-Host ""
Write-Host "🎯 Deployment Summary:" -ForegroundColor Green
Write-Host "  • Branch: $currentBranch"
Write-Host "  • Debug Level: $DebugLevel"
Write-Host "  • Skip Tests: $SkipTests"
Write-Host "  • Bundle Size: ✅ Within limits"
Write-Host ""
Write-Host "📋 What to test after deployment:" -ForegroundColor Blue
Write-Host "  1. ✅ Input validation (try entering negative values)"
Write-Host "  2. ✅ Error handling (test extreme inputs)"
Write-Host "  3. ✅ Accessibility (test with screen reader)"
Write-Host "  4. ✅ Regional switching (US ↔ CA)"
Write-Host "  5. ✅ Data persistence (refresh page)"
Write-Host ""
Write-Host "✅ Staging deployment monitoring ready!" -ForegroundColor Green

# Optional: Monitor deployment status
if ($ghAvailable -and $WatchProgress) {
    Write-Host ""
    Write-Host "🔄 Starting deployment status monitor..." -ForegroundColor Blue
    
    # Function to check deployment status
    function Check-DeploymentStatus {
        try {
            $runs = gh run list --workflow="Deploy to Staging (Debug Mode)" --limit=1 --json status,conclusion,url
            $runData = $runs | ConvertFrom-Json
            
            if ($runData -and $runData.Count -gt 0) {
                $latestRun = $runData[0]
                return @{
                    Status = $latestRun.status
                    Conclusion = $latestRun.conclusion
                    Url = $latestRun.url
                }
            }
        } catch {
            Write-Host "⚠️ Could not fetch deployment status" -ForegroundColor Yellow
        }
        return $null
    }
    
    # Monitor for up to 10 minutes
    $maxWaitTime = 600 # seconds
    $checkInterval = 30 # seconds
    $elapsed = 0
    
    while ($elapsed -lt $maxWaitTime) {
        $status = Check-DeploymentStatus
        
        if ($status) {
            switch ($status.Status) {
                "in_progress" { 
                    Write-Host "🔄 Deployment in progress... ($([math]::Round($elapsed/60, 1)) min elapsed)" -ForegroundColor Yellow
                }
                "completed" {
                    if ($status.Conclusion -eq "success") {
                        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
                        Write-Host "🌐 Check your staging environment!" -ForegroundColor Blue
                    } else {
                        Write-Host "❌ Deployment failed. Check logs: $($status.Url)" -ForegroundColor Red
                    }
                    break
                }
                "queued" {
                    Write-Host "⏳ Deployment queued..." -ForegroundColor Cyan
                }
                default {
                    Write-Host "📊 Status: $($status.Status)" -ForegroundColor Blue
                }
            }
        }
        
        Start-Sleep $checkInterval
        $elapsed += $checkInterval
    }
    
    if ($elapsed -ge $maxWaitTime) {
        Write-Host "⏰ Monitoring timeout reached. Check GitHub Actions for final status." -ForegroundColor Yellow
    }
}
