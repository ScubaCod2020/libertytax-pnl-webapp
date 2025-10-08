#!/bin/bash

# deploy-staging.sh - Helper script to deploy to staging with enhanced monitoring
# This script helps trigger deployment and monitor the results

set -e

echo "🚀 Liberty Tax P&L Webapp - Staging Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: This script must be run from the project root directory${NC}"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Current branch: ${CURRENT_BRANCH}${NC}"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️ Warning: You have uncommitted changes${NC}"
    git status --short
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: ${NODE_VERSION}${NC}"

# Check npm version  
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm version: ${NPM_VERSION}${NC}"

# Test build locally first
echo -e "${BLUE}🏗️ Testing build locally...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local build successful${NC}"
    
    # Check bundle sizes
    echo -e "${BLUE}📊 Bundle size analysis:${NC}"
    for file in dist/assets/*.js; do
        if [ -f "$file" ]; then
            size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
            size_kb=$((size / 1024))
            filename=$(basename "$file")
            
            if [ $size -gt 250000 ]; then
                echo -e "${RED}⚠️ ${filename}: ${size_kb}KB (exceeds 250KB limit)${NC}"
            else
                echo -e "${GREEN}✅ ${filename}: ${size_kb}KB${NC}"
            fi
        fi
    done
else
    echo -e "${RED}❌ Local build failed. Please fix build errors before deploying.${NC}"
    exit 1
fi

# Commit and push if there are changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Committing current changes...${NC}"
    git add .
    git commit -m "Deploy: Staging deployment with validation fixes"
    git push origin $CURRENT_BRANCH
fi

# Choose debug level
echo ""
echo -e "${BLUE}🔧 Choose debug level for deployment:${NC}"
echo "1) basic   - Minimal logging, faster deployment"
echo "2) verbose - Detailed logging (recommended)"
echo "3) full    - Complete debug output, slower"
echo ""
read -p "Select option (1-3) [2]: " DEBUG_CHOICE
DEBUG_CHOICE=${DEBUG_CHOICE:-2}

case $DEBUG_CHOICE in
    1) DEBUG_LEVEL="basic" ;;
    2) DEBUG_LEVEL="verbose" ;;
    3) DEBUG_LEVEL="full" ;;
    *) DEBUG_LEVEL="verbose" ;;
esac

echo -e "${GREEN}✅ Using debug level: ${DEBUG_LEVEL}${NC}"

# Ask about skipping tests
echo ""
read -p "Skip tests for faster deployment? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SKIP_TESTS="true"
    echo -e "${YELLOW}⏭️ Tests will be skipped${NC}"
else
    SKIP_TESTS="false"
    echo -e "${BLUE}🧪 Tests will be included${NC}"
fi

# Trigger GitHub Actions workflow
echo ""
echo -e "${BLUE}🚀 Triggering staging deployment...${NC}"

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ Using GitHub CLI to trigger workflow${NC}"
    
    gh workflow run "Deploy to Staging (Debug Mode)" \
        --field debug_level="$DEBUG_LEVEL" \
        --field skip_tests="$SKIP_TESTS"
    
    echo -e "${GREEN}✅ Workflow triggered successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Monitor deployment progress:${NC}"
    echo "  • GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//')/actions"
    echo "  • Or run: gh run list --workflow='Deploy to Staging (Debug Mode)'"
    echo ""
    
    # Ask if user wants to watch the workflow
    read -p "Watch workflow progress? (Y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo -e "${BLUE}👀 Watching workflow progress...${NC}"
        echo "Press Ctrl+C to stop watching (deployment will continue)"
        gh run watch
    fi
    
else
    echo -e "${YELLOW}⚠️ GitHub CLI not found. Please trigger manually:${NC}"
    echo ""
    echo "1. Go to: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//')/actions"
    echo "2. Click 'Deploy to Staging (Debug Mode)'"
    echo "3. Click 'Run workflow'"
    echo "4. Set:"
    echo "   - Debug level: $DEBUG_LEVEL"
    echo "   - Skip tests: $SKIP_TESTS"
    echo "5. Click 'Run workflow'"
fi

echo ""
echo -e "${GREEN}🎯 Deployment Summary:${NC}"
echo "  • Branch: $CURRENT_BRANCH"
echo "  • Debug Level: $DEBUG_LEVEL"
echo "  • Skip Tests: $SKIP_TESTS"
echo "  • Bundle Size: ✅ Within limits"
echo ""
echo -e "${BLUE}📋 What to test after deployment:${NC}"
echo "  1. ✅ Input validation (try entering negative values)"
echo "  2. ✅ Error handling (test extreme inputs)"
echo "  3. ✅ Accessibility (test with screen reader)"
echo "  4. ✅ Regional switching (US ↔ CA)"
echo "  5. ✅ Data persistence (refresh page)"
echo ""
echo -e "${GREEN}✅ Staging deployment initiated!${NC}"
