# Development Guide - Liberty Tax P&L Webapp

## Overview

This document provides comprehensive development guidance for the Liberty Tax P&L webapp, including setup, workflow, coding standards, and deployment processes for corporate development teams.

## 1. 🚀 Quick Start

### 1.1 Development Environment Setup

#### **Ports Configuration**

- **React (Vite)**: http://localhost:3000
- **Angular (ng)**: http://localhost:4200

#### **API Proxy Configuration**

- **React**: `vite.config.ts` proxies `/api` → `VITE_API_URL` (default http://localhost:5000)
- **Angular**: `angular/proxy.conf.json` proxies `/api` → http://localhost:5000
- **Use single base path**: `/api/...` (no hardcoded server URLs)

#### **E2E Testing Configuration**

- **Base URL**: `PW_BASEURL` environment variable controls Playwright target
- **Scripts**: `npm run test:e2e:react`, `npm run test:e2e:angular`

#### **Quick Start Commands**

```bash
# React only
npm run dev:react

# Angular only
npm run dev:angular

# Both frameworks simultaneously
npm run dev:dual
```

### 1.2 Node.js Setup (Windows PowerShell)

#### **Installation Options**

**Option 1: Winget (Recommended)**

```powershell
# Install Node.js LTS version
winget install OpenJS.NodeJS

# Restart PowerShell or reload PATH
refreshenv

# Verify installation
node --version
npm --version
```

**Option 2: Official Installer**

1. Go to https://nodejs.org/
2. Download **LTS version** (recommended for most users)
3. Run installer with default settings
4. **Restart PowerShell** after installation
5. Verify: `node --version`

**Option 3: Chocolatey**

```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Restart PowerShell
# Verify: node --version
```

#### **PowerShell Command Fixes**

**WRONG:**

```powershell
cd "path" && npm run dev
```

**CORRECT:**

```powershell
# Option A: Separate commands
cd "E:\dev\libertytax-pnl-webapp"
npm run dev

# Option B: Use semicolon
cd "E:\dev\libertytax-pnl-webapp"; npm run dev

# Option C: Use PowerShell -c
powershell -c "cd 'E:\dev\libertytax-pnl-webapp'; npm run dev"
```

#### **Post-Installation Verification**

```powershell
# Verify installation
node --version    # Should show v18.x.x or v20.x.x
npm --version     # Should show 9.x.x or 10.x.x

# Test setup
cd "E:\dev\libertytax-pnl-webapp"
npm install
npm run dev
```

## 2. 🏗️ Development Philosophy

### 2.1 Core Principles

1. **Document Everything** - Future developers will thank present developers
2. **Small, Frequent Commits** - Deploy often, fail fast, recover quickly
3. **Branch Per Feature** - Keep changes isolated and focused
4. **Test Before Merge** - Every deployment should work

### 2.2 Code Quality Standards

> "Code is read more often than it's written" - Focus on clarity and documentation

#### **Writing Guidelines**

1. **Write code like you're explaining it to someone else**
2. **If you're confused now, you'll be more confused later**
3. **Document the "why", not just the "what"**
4. **Small commits are easier to debug than big ones**

## 3. 📝 Commit Message System

### 3.1 Commit Types

- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code improvements (no functional changes)
- `docs:` Documentation updates
- `style:` Formatting, no logic changes
- `test:` Adding/updating tests
- `chore:` Build, dependencies, maintenance

### 3.2 Commit Message Format

#### **✅ Good Examples:**

```
feat: add comprehensive 17-category expense wizard

PROBLEM:
- Users needed detailed expense input beyond basic categories
- No guided setup process for new users

SOLUTION:
- Created multi-step wizard (Welcome → Inputs → Review)
- Added 17 detailed expense fields with region-specific logic
- Integrated baseline saving for future reference

FILES CHANGED:
- src/types/expenses.ts: New expense field definitions
- src/components/WizardShell.tsx: Multi-step orchestrator
- src/App.tsx: Wizard integration and state management

TESTING:
- Run wizard, complete all steps, verify baseline saved
- Check expense calculations reflect all 17 categories
```

```
fix: resolve JSX structure errors in App.tsx

PROBLEM:
- Build failing with "character '}' is not valid inside JSX element"
- Mismatched braces from merge conflict resolution

SOLUTION:
- Fixed orphaned closing brace after Wizard button
- Added missing closing </div> tag for main container
- Corrected JSX nesting structure

TESTING:
- npm run build should complete without errors
- Deployment should succeed
```

#### **❌ Bad Examples:**

```
fix stuff              # Too vague
updated files          # What files? Why?
working on wizard      # Not describing the actual change
```

## 4. 🎨 Style Guide (Angular)

### 4.1 File Organization

#### **Where Styles Live**

- **Global app styles**: `angular/src/styles.scss` (imports partials in `angular/src/styles/*`)
- **Component styles**: In each component `.scss` next to `.ts` and `.html`
- **Do not add** page- or component-specific rules to global files

#### **Global Partials**

- `styles/_tokens.scss`: CSS variables and design tokens only
- `styles/_base.scss`: resets, base typography, small utilities
- `styles/_layout.scss`: layout primitives (`.container`, `.grid-2`, `.stack`, `.card`) and scoped layout helpers
- `styles/_kpi.scss`: KPI / badge visual patterns

### 4.2 Specificity & Scoping

- **Prefer component styles** over globals for page-specific visuals
- **If a global helper must target a section**, scope it under a wrapper (e.g., `.stack .input-row`) rather than changing a global class everywhere
- **Avoid id selectors** and `!important`

### 4.3 Naming Conventions

- **Use descriptive, purposeful class names** (`.stack`, `.grid-2`, `.kpi-vertical`)
- **Avoid abbreviations** unless widely recognized

### 4.4 Extending Styles

- **Add new tokens** to `_tokens.scss`
- **Add new layout primitives** to `_layout.scss`
- **Add new visual patterns** to a new partial (e.g., `_tables.scss`) and import in `styles.scss`

### 4.5 Typography System

#### **Font Tokens**

- **Families**: `--font-proxima`, `--font-base`
- **Weights**: `--fw-regular` (400), `--fw-medium` (500), `--fw-semibold` (600), `--fw-extrabold` (800)
- **Sizes**: `--fz-xs` (12px), `--fz-sm` (14px), `--fz-md` (16px), `--fz-lg` (18px), `--fz-xl` (24px), `--fz-2xl` (30px)

#### **Typography Utilities**

- **Headings**: `.h1`, `.h2`, `.h3`
- **Text sizes**: `.text-sm`, `.text-xs`
- **Weights**: `.regular`, `.medium`, `.semibold`

#### **Usage Rules**

- **Use `.h2.brand`** for primary page/app titles
- **Use `.text-xs`** for small metadata (version badges, helper notes)
- **Never set `font-family` directly** in components. Use `var(--font-base)` if needed
- **When importing UI from React reference**, replace hard-coded fonts with the utilities or tokens above

### 4.6 Angular-Specific Guidelines

- **Component styles** use ViewEncapsulation Emulated by default, so they override globals with equal specificity inside the component
- **Keep globals lightweight**; prefer component-scoped rules for behavior/layout tweaks

## 5. 🎨 Branding System

### 5.1 React to Angular Migration

#### **React Sources**

- **Hook**: `react-app-reference/src/hooks/useBranding.ts`
- **Config**: `react-app-reference/src/styles/branding.ts`
- **Assets**: `react-app-reference/src/assets/brands/*`

#### **Angular Counterparts**

- **Service**: `angular/src/app/services/branding.service.ts`
- **Assets registry**: `angular/src/app/lib/brands.ts`
- **Assets**: `angular/src/assets/{brands,icons}/**/*`

### 5.2 Branding Behavior

- **On region change** (SettingsService), apply CSS custom properties to `document.documentElement`
- **Update document title and favicon** based on region
- **Typography variables available**:
  - `--font-base`, `--fw-regular|medium|semibold|extrabold`, `--headline-spacing`

### 5.3 Asset Management

- **Replace files** under `angular/src/assets/brands/{us,ca}`
- **Update `BrandAssets` paths** if filenames change
- **Typography is shared** across regions; logos/watermarks differ by region
- **UI should reference CSS vars**, not hard-coded colors/fonts

## 6. 🏗️ Architecture & Structure

### 6.1 Current Structure (v0.5)

```
src/
├── components/          # React components
│   ├── Dashboard/       # Results display
│   └── wizard/          # Setup wizard components
├── hooks/               # Custom React hooks
│   ├── useCalculations.ts
│   ├── usePersistence.ts
│   └── usePresets.ts
├── lib/                 # Core logic
│   └── calcs.ts         # P&L calculations
├── types/               # TypeScript definitions
│   └── expenses.ts      # Expense system types
└── data/                # Static data
    └── presets.ts       # Scenario presets
```

### 6.2 Modularization Goals

- **App.tsx**: Currently 1267 lines → Target: ~100 lines
- **Extract UI**: Dashboard, InputsPanel, Header components
- **Extract Logic**: Calculation, persistence, state management hooks
- **Improve Maintainability**: Smaller, focused files

## 7. 🚀 Deployment Strategy

### 7.1 Branch Strategy

- `main` - Production-ready code
- `feat/feature-name` - Individual features
- `fix/issue-description` - Bug fixes
- `refactor/component-name` - Code improvements

### 7.2 Deployment Flow

1. **Create feature branch**: `git checkout -b feat/new-feature`
2. **Develop & commit**: Use detailed commit messages
3. **Test frequently**: Deploy to staging often
4. **Update changelog**: Document changes as you go
5. **Merge to main**: When feature is complete
6. **Deploy to production**: Final deployment

### 7.3 Testing Strategy

- **Build verification**: `npm run build` before every commit
- **Functional testing**: Manual verification of key features
- **Deployment testing**: Verify on staging before production

## 8. 📊 Changelog System

### 8.1 Location: `CHANGELOG.md`

### 8.2 Structure

- **Unreleased** - Current development work
- **[Version] - Date** - Released versions
- **Added/Changed/Fixed** - Categorized changes
- **Technical Details** - Implementation specifics

### 8.3 Maintenance

1. **Add changes to Unreleased** as you work
2. **Move to versioned section** when deploying
3. **Include dates and version numbers**
4. **Link to commits/PRs** for complex changes

## 9. 🧠 Development Resources

### 9.1 JSX Understanding

- **JSX = JavaScript + XML-like syntax**
- **Every `{` needs a matching `}`**
- **Every `<tag>` needs a matching `</tag>`**
- **Only one root element** per return

### 9.2 React Patterns

- **Hooks**: `useState`, `useEffect`, `useMemo`
- **Components**: Functional components with TypeScript
- **Props**: Type-safe component interfaces
- **State Management**: Local state with persistence

### 9.3 TypeScript Benefits

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete, refactoring
- **Self-Documenting**: Types serve as documentation
- **Easier Refactoring**: Compiler helps track changes

## 10. 🔧 Development Tools

### 10.1 Recommended VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### 10.2 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Git
git log --oneline       # See commit history
git status             # Check current changes
git diff               # See what changed
```

## 11. 🚨 Troubleshooting

### 11.1 Common Issues

#### **"node is not recognized" after installation**

- **Restart PowerShell completely**
- **Restart VS Code** if using VS Code terminal
- **Check PATH**: `$env:PATH -split ';' | Select-String node`
- **Manually add to PATH** if needed

#### **Permission errors**

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **Still not working?**

- Try **Command Prompt** instead of PowerShell
- Use **Git Bash** if you have Git installed
- Use **VS Code integrated terminal**

### 11.2 When Things Break

1. **Read the error message carefully** - It usually tells you exactly what's wrong
2. **Check recent changes** - What did you change last?
3. **Use git to compare** - `git diff` shows what changed
4. **Deploy frequently** - Smaller changes are easier to debug

### 11.3 Learning Strategy

1. **Understand before copying** - Don't just copy-paste code
2. **Break things intentionally** - Learn by experimenting
3. **Use AI tools effectively** - Ask "why" questions, not just "how"
4. **Document your discoveries** - Write down what you learn

## 12. 💡 Pro Tips

### 12.1 For Future Developers

1. **Write code like you're explaining it to someone else**
2. **If you're confused now, you'll be more confused later**
3. **Document the "why", not just the "what"**
4. **Small commits are easier to debug than big ones**

### 12.2 Alternative Testing Methods

#### **Browser Console Testing**

1. Open webapp in browser (usually http://localhost:5173)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Copy and paste test code
5. Press Enter to run tests

#### **Online JavaScript Runner**

- Go to https://replit.com/ or https://codepen.io/
- Create new JavaScript project
- Paste test code
- Run tests online

---

This comprehensive development guide ensures consistent, professional development practices across the Liberty Tax P&L webapp project.
