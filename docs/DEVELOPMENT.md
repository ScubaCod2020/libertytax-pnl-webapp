# Development Guide

## 🎯 Our Development Philosophy

> "Code is read more often than it's written" - Focus on clarity and documentation

### Core Principles:

1. **Document Everything** - Future you will thank present you
2. **Small, Frequent Commits** - Deploy often, fail fast, recover quickly
3. **Branch Per Feature** - Keep changes isolated and focused
4. **Test Before Merge** - Every deployment should work

## 📝 Commit Message System

### Quick Setup:

```bash
# Windows
setup-commit-template.bat

# Mac/Linux
chmod +x setup-commit-template.sh
./setup-commit-template.sh
```

### Commit Types:

- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code improvements (no functional changes)
- `docs:` Documentation updates
- `style:` Formatting, no logic changes
- `test:` Adding/updating tests
- `chore:` Build, dependencies, maintenance

### Example Commit Messages:

#### ✅ Good Examples:

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

#### ❌ Bad Examples:

```
fix stuff              # Too vague
updated files          # What files? Why?
working on wizard      # Not describing the actual change
```

## 📊 Changelog System

### Location: `CHANGELOG.md`

### Structure:

- **Unreleased** - Current development work
- **[Version] - Date** - Released versions
- **Added/Changed/Fixed** - Categorized changes
- **Technical Details** - Implementation specifics

### Maintenance:

1. Add changes to **Unreleased** as you work
2. Move to versioned section when deploying
3. Include dates and version numbers
4. Link to commits/PRs for complex changes

## 🏗️ Architecture Decisions

### Current Structure (v0.5):

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

### Modularization Goals:

- **App.tsx**: Currently 1267 lines → Target: ~100 lines
- **Extract UI**: Dashboard, InputsPanel, Header components
- **Extract Logic**: Calculation, persistence, state management hooks
- **Improve Maintainability**: Smaller, focused files

## 🚀 Deployment Strategy

### Branch Strategy:

- `main` - Production-ready code
- `feat/feature-name` - Individual features
- `fix/issue-description` - Bug fixes
- `refactor/component-name` - Code improvements

### Deployment Flow:

1. **Create feature branch**: `git checkout -b feat/new-feature`
2. **Develop & commit**: Use detailed commit messages
3. **Test frequently**: Deploy to staging often
4. **Update changelog**: Document changes as you go
5. **Merge to main**: When feature is complete
6. **Deploy to production**: Final deployment

### Testing Strategy:

- **Build verification**: `npm run build` before every commit
- **Functional testing**: Manual verification of key features
- **Deployment testing**: Verify on staging before production

## 🧠 Learning Resources

### JSX Understanding:

- JSX = JavaScript + XML-like syntax
- Every `{` needs a matching `}`
- Every `<tag>` needs a matching `</tag>`
- Only one root element per return

### React Patterns:

- **Hooks**: `useState`, `useEffect`, `useMemo`
- **Components**: Functional components with TypeScript
- **Props**: Type-safe component interfaces
- **State Management**: Local state with persistence

### TypeScript Benefits:

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete, refactoring
- **Self-Documenting**: Types serve as documentation
- **Easier Refactoring**: Compiler helps track changes

## 🔧 Development Tools

### Recommended VS Code Extensions:

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### Useful Commands:

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

## 💡 Pro Tips

### For Future You:

1. **Write code like you're explaining it to someone else**
2. **If you're confused now, you'll be more confused later**
3. **Document the "why", not just the "what"**
4. **Small commits are easier to debug than big ones**

### When Things Break:

1. **Read the error message carefully** - It usually tells you exactly what's wrong
2. **Check recent changes** - What did you change last?
3. **Use git to compare** - `git diff` shows what changed
4. **Deploy frequently** - Smaller changes are easier to debug

### Learning Strategy:

1. **Understand before copying** - Don't just copy-paste code
2. **Break things intentionally** - Learn by experimenting
3. **Use AI tools effectively** - Ask "why" questions, not just "how"
4. **Document your discoveries** - Write down what you learn

---

_Remember: Every expert was once a beginner. You're building great habits that will serve you well throughout your coding journey!_
