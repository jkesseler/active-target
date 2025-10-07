# GitHub Workflows Testing Strategy

## Overview

This project now implements a **two-tier testing strategy** to optimize CI/CD performance while maintaining code quality:

1. **Pull Request Workflow**: Fast, selective quality checks
2. **Main Branch Workflow**: Comprehensive full test suite

## 📋 Workflow Details

### 🔍 PR Quality Checks (`.github/workflows/vitest.yml`)

**Triggers**: `pull_request` to `main` branch
**Purpose**: Fast feedback on PR changes

#### What it does:
- ✅ **Smart File Detection**: Uses `tj-actions/changed-files` to identify modified files
- 🔍 **TypeScript Type Checking**: Only runs if `.ts/.tsx` files changed
- 🧹 **ESLint**: Only lints changed files
- 🧪 **Selective Testing**: Runs only tests related to changed files
- 💬 **PR Comments**: Provides detailed feedback on what was checked

#### Test Detection Logic:
```bash
# Direct test files
src/**/*.{test,spec,snapshot}.{ts,tsx}

# For changed source files, finds:
- {dir}/__tests__/{basename}.test.tsx
- {dir}/__tests__/{basename}.spec.tsx
- {dir}/__tests__/{basename}.snapshot.tsx
- {dir}/{basename}.test.tsx
- {dir}/{basename}.spec.tsx
- {dir}/{basename}.snapshot.tsx
```

#### Performance Benefits:
- ⚡ Faster CI feedback (typically 2-5 minutes vs 15-30 minutes)
- 💰 Reduced GitHub Actions costs
- 🎯 Only tests what changed
- 🚫 Blocks PRs if quality checks fail

### 🚀 Full Test Suite (`.github/workflows/playwright.yml`)

**Triggers**: `push` to `main` branch (after PR merge)
**Purpose**: Comprehensive quality assurance

#### What it does:
- 🔍 **Complete Type Checking**: All TypeScript files
- 🧹 **Full ESLint**: Entire codebase
- 🧪 **All Unit Tests**: Complete test suite with coverage
- 📸 **All Snapshot Tests**: Visual regression testing
- 🌐 **E2E Tests**: End-to-end browser testing with Playwright
- 📊 **Coverage Reports**: Comprehensive code coverage
- 🚨 **Failure Notifications**: Alerts on main branch issues

## 🎯 Testing Strategy Examples

### Example 1: Component Change
```
Changed: src/components/Header/HeaderSimple.tsx
PR Runs: src/components/Header/__tests__/HeaderSimple.snapshot.tsx
Main Runs: Full test suite including E2E tests
```

### Example 2: Feature Addition
```
Changed: src/features/users/usersSlice.ts
PR Runs: Any related test files found + type checking + linting
Main Runs: All tests to ensure no integration issues
```

### Example 3: Test File Only
```
Changed: src/components/Timer/__tests__/Timer.snapshot.tsx
PR Runs: That specific test file + type checking
Main Runs: Full suite to verify test changes don't break anything
```

## 🛡️ Quality Gates

### PR Requirements (Must Pass to Merge):
- ✅ TypeScript compilation (if TS files changed)
- ✅ ESLint rules (if lintable files changed)
- ✅ Relevant unit/snapshot tests
- ✅ No test failures

### Main Branch Validation:
- ✅ Complete type checking
- ✅ Full linting
- ✅ All unit tests with coverage
- ✅ All snapshot tests
- ✅ All E2E tests
- ✅ No regressions

## 📊 Performance Comparison

| Scenario | Before | PR Workflow | Main Workflow |
|----------|--------|-------------|---------------|
| Small component change | 15-20 min | 2-3 min | 15-25 min |
| Feature addition | 15-20 min | 3-5 min | 15-25 min |
| Test-only changes | 15-20 min | 1-2 min | 15-25 min |

## 🔧 Available Commands

```bash
# Local development
npm run test              # Unit tests
npm run test:e2e         # E2E tests
npm run test:e2e:headed  # E2E with browser UI
npm run lint             # ESLint
npm run typecheck        # TypeScript checking

# Production testing
npm run test:e2e:prod    # E2E against production build
```

## 🚨 Troubleshooting

### PR Workflow Issues:
1. **No tests found**: Normal if changes don't have corresponding tests
2. **Type errors**: Fix TypeScript issues in changed files
3. **Lint errors**: Run `npm run lint -- --fix` locally

### Main Branch Issues:
1. **E2E failures**: Check Playwright reports in artifacts
2. **Coverage drops**: Add tests for new code
3. **Integration issues**: Full test suite catches cross-feature problems

## 🎯 Benefits Summary

✅ **Faster PR feedback** - Developers get quick validation
✅ **Reduced CI costs** - Only run what's necessary on PRs
✅ **Complete coverage** - Full suite ensures main branch quality
✅ **Smart detection** - Automatically finds relevant tests
✅ **Scalable** - Performance improves as codebase grows
✅ **Safe** - Still catches integration issues on main branch