# Contributing to DataStory AI

Thank you for contributing to DataStory AI! This guide will help you understand our development workflow and CI/CD pipeline.

## Development Workflow

### 1. Branch Strategy

We use a Git Flow-inspired branching model:

- `main` - Production-ready code, automatically deployed to production
- `develop` - Integration branch, automatically deployed to staging
- `feature/*` - Feature branches, created from `develop`
- `bugfix/*` - Bug fix branches, created from `develop`
- `hotfix/*` - Emergency fixes, created from `main`

### 2. Creating a Feature

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code, commit, repeat ...

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request to develop
```

### 3. Pull Request Process

1. **Create PR** - Open a pull request from your feature branch to `develop`
2. **CI Checks** - Wait for automated checks to pass:
   - ✅ ESLint & Prettier (Frontend)
   - ✅ Black & Flake8 (Python)
   - ✅ Jest tests (Frontend)
   - ✅ pytest tests (Python)
   - ✅ Build verification
3. **Code Review** - Request review from team members
4. **Address Feedback** - Make requested changes
5. **Merge** - Once approved and CI passes, merge to `develop`

### 4. Deployment Process

**Staging Deployment:**
- Automatic when PR is merged to `develop`
- Test your changes at the staging URL
- Verify functionality before promoting to production

**Production Deployment:**
- Create PR from `develop` to `main`
- Follow same review process
- Merge triggers automatic production deployment
- Monitor deployment notifications in Slack

## Code Quality Standards

### Frontend (TypeScript/React)

**Linting:**
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

**Formatting:**
```bash
npm run format:check  # Check formatting
npm run format        # Fix formatting
```

**Type Checking:**
```bash
npm run type-check    # Verify TypeScript types
```

**Testing:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
```

### Python Service

**Formatting:**
```bash
cd python-service
black .               # Format all Python files
black --check .       # Check without modifying
```

**Linting:**
```bash
flake8 .              # Check code quality
```

**Testing:**
```bash
pytest                # Run all tests
pytest --cov          # Run with coverage report
pytest -v             # Verbose output
```

## Pre-commit Hooks

We use Husky for pre-commit hooks that automatically:
- Run ESLint on staged JavaScript/TypeScript files
- Run Prettier on staged files
- Prevent commits with linting errors

If you need to bypass hooks (not recommended):
```bash
git commit --no-verify -m "your message"
```

## Writing Tests

### Frontend Tests (Jest)

**Location:** `__tests__/` directory

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Python Tests (pytest)

**Location:** `python-service/tests/` directory

**Example:**
```python
import pytest
from services.analyzer import Analyzer

def test_analyzer_basic():
    analyzer = Analyzer()
    result = analyzer.analyze(data)
    assert result is not None
    assert len(result.trends) > 0
```

## Commit Message Guidelines

We follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality

fix(upload): handle large file uploads correctly

docs(readme): update installation instructions

test(analyzer): add tests for correlation detection
```

## CI/CD Pipeline

### Continuous Integration (CI)

Runs on every pull request and push:

1. **Linting** - Ensures code follows style guidelines
2. **Testing** - Runs all unit tests
3. **Building** - Verifies production build succeeds

**Status:** Check the PR page for CI status badges

### Continuous Deployment (CD)

**Staging:**
- Automatic on merge to `develop`
- Deploys to: `https://datastory-ai-staging.vercel.app`
- Runs smoke tests after deployment

**Production:**
- Automatic on merge to `main`
- Deploys to: `https://datastory-ai.vercel.app`
- Runs comprehensive smoke tests
- Creates GitHub release
- Sends Slack notification

## Troubleshooting

### CI Failing

**Linting errors:**
```bash
npm run lint:fix      # Fix frontend issues
cd python-service && black .  # Fix Python formatting
```

**Test failures:**
```bash
npm test              # Run tests locally
pytest -v             # Run Python tests with verbose output
```

**Build errors:**
- Check for missing environment variables
- Verify all dependencies are in package.json
- Check TypeScript errors with `npm run type-check`

### Deployment Issues

**Staging deployment failed:**
1. Check GitHub Actions logs
2. Verify Vercel secrets are set correctly
3. Check Vercel dashboard for build logs

**Production deployment failed:**
1. Check smoke test results in Actions
2. Review Vercel production logs
3. Consider rolling back if critical

## Getting Help

- **Documentation:** Check `.github/workflows/README.md`
- **Issues:** Create a GitHub issue with the `help wanted` label
- **Slack:** Ask in #engineering channel
- **Code Review:** Tag team members in PR comments

## Best Practices

1. ✅ **Write tests** for new features
2. ✅ **Keep PRs small** - Easier to review and merge
3. ✅ **Update documentation** when changing functionality
4. ✅ **Test locally** before pushing
5. ✅ **Review your own PR** before requesting review
6. ✅ **Respond to feedback** promptly
7. ✅ **Keep commits atomic** - One logical change per commit
8. ✅ **Rebase on develop** before merging to avoid conflicts

## Code Review Guidelines

### As a Reviewer

- Be constructive and respectful
- Explain the "why" behind suggestions
- Approve when code meets standards
- Request changes for critical issues
- Comment for minor suggestions

### As an Author

- Respond to all comments
- Ask questions if unclear
- Make requested changes promptly
- Thank reviewers for their time
- Mark conversations as resolved

## Release Process

1. Merge feature branches to `develop`
2. Test thoroughly in staging
3. Create release PR from `develop` to `main`
4. Update version in package.json
5. Update CHANGELOG.md
6. Get approval from team lead
7. Merge to `main`
8. Monitor production deployment
9. Verify production health checks pass

## Emergency Hotfixes

For critical production issues:

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# Make minimal fix
# ... code and commit ...

# Push and create PR to main
git push origin hotfix/critical-issue

# After merge, also merge to develop
git checkout develop
git merge main
git push origin develop
```

## Questions?

If you have questions about the development workflow or CI/CD pipeline, please:
1. Check this documentation
2. Review `.github/workflows/README.md`
3. Ask in the team Slack channel
4. Create a GitHub discussion

Happy coding! 🚀
