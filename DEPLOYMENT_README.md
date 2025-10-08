# Deploy Liberty Tax PnL Angular App to NGINX Shipyard

This directory contains deployment scripts for deploying the Liberty Tax PnL Angular webapp to an NGINX-hosted SMB share with versioned deployments and rollback capabilities.

## Files

- `deploy-to-shipyard.ps1` - Main deployment script with built-in rollback
- `rollback-shipyard.ps1` - Emergency rollback script
- `deploy-wrapper.ps1` - Convenient wrapper with common configurations

## Quick Start

### 1. Deploy Latest Build

```powershell
.\deploy-to-shipyard.ps1
```

### 2. Deploy with Custom Settings

```powershell
.\deploy-to-shipyard.ps1 -AppSlug "pnl-web" -BuildConfig "production"
```

### 3. Dry Run (Test Without Changes)

```powershell
.\deploy-to-shipyard.ps1 -DryRun
```

### 4. Emergency Rollback

```powershell
.\rollback-shipyard.ps1 -ListVersions
.\rollback-shipyard.ps1 -RollbackTo "pnl-web-20241008-1430"
```

## Configuration

The scripts use these default values (can be overridden with parameters):

- **HubUrlBase**: `/shipyard` - Base path served by NGINX
- **AppSlug**: `pnl-web` - Application subdirectory
- **UnraidHost**: `192.168.1.172` - Unraid server IP
- **UnraidPort**: `8082` - Host to container port mapping
- **SmbTarget**: `\\192.168.1.172\Projects\apps\shipyard\pnl-web` - UNC share path
- **AngularProject**: `angular` - Angular project name (from angular.json)
- **BuildConfig**: `production` - Angular build configuration

## How It Works

### Versioned Deployment

1. **Build**: Angular app is built with versioned base-href
2. **Deploy**: Files copied to timestamped folder (e.g., `pnl-web-20241008-1430/`)
3. **Redirect**: Root `index.html` redirects to current version
4. **Verify**: HTTP checks ensure deployment succeeded
5. **Activate**: `LATEST.txt` updated to point to new version

### Directory Structure

```
\\192.168.1.172\Projects\apps\shipyard\pnl-web\
├── index.html                    # Redirect to current version
├── LATEST.txt                   # Current version pointer
├── pnl-web-20241008-1430/      # Version 1 (timestamped)
│   ├── index.html
│   ├── main-*.js
│   └── assets/
├── pnl-web-20241008-1445/      # Version 2 (newer)
│   ├── index.html
│   ├── main-*.js
│   └── assets/
```

### URL Structure

- **Root**: `http://192.168.1.172:8082/shipyard/pnl-web/` (redirects)
- **Version**: `http://192.168.1.172:8082/shipyard/pnl-web/pnl-web-20241008-1430/`

## Safety Features

- **Atomic Deployment**: New version created before switching traffic
- **HTTP Verification**: Checks deployment before making it live
- **Automatic Rollback**: Reverts to previous version if verification fails
- **Manual Rollback**: Emergency rollback script for post-deployment issues
- **Dry Run Mode**: Test deployments without making changes

## Troubleshooting

### Build Fails

```powershell
# Check Angular project structure
Get-ChildItem angular\dist -Recurse | Where-Object Name -eq "browser"

# Manual build
cd angular
npx ng build --configuration production
```

### Deployment Fails

```powershell
# Check SMB access
Test-Path "\\192.168.1.172\Projects\apps\shipyard\pnl-web"

# Check network connectivity
Test-NetConnection 192.168.1.172 -Port 8082
```

### HTTP Verification Fails

```powershell
# Check NGINX status
curl -I http://192.168.1.172:8082/shipyard/pnl-web/

# Manual rollback
.\rollback-shipyard.ps1 -ListVersions
```

## Parameters Reference

### deploy-to-shipyard.ps1

- `-HubUrlBase` - NGINX base path (default: `/shipyard`)
- `-AppSlug` - App subdirectory (default: `pnl-web`)
- `-UnraidHost` - Server IP (default: `192.168.1.172`)
- `-UnraidPort` - HTTP port (default: `8082`)
- `-SmbTarget` - UNC share path
- `-AngularProject` - Project name (default: `angular`)
- `-BuildConfig` - Build config (default: `production`)
- `-SkipBuild` - Use existing build
- `-DryRun` - Test mode

### rollback-shipyard.ps1

- `-ListVersions` - Show available versions
- `-RollbackTo` - Specific version to restore
- `-DryRun` - Test mode

## Examples

### Production Deployment

```powershell
.\deploy-to-shipyard.ps1 -BuildConfig "production"
```

### Development Deployment

```powershell
.\deploy-to-shipyard.ps1 -BuildConfig "development" -AppSlug "pnl-dev"
```

### Emergency Situations

```powershell
# Quick rollback to previous version
.\rollback-shipyard.ps1

# Rollback to specific version
.\rollback-shipyard.ps1 -RollbackTo "pnl-web-20241008-1200"

# Check what versions are available
.\rollback-shipyard.ps1 -ListVersions
```
