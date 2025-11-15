# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated testing, linting, and deployment of the DataStory AI platform.

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Trigger:** Pull requests and pushes to `main` and `develop` branches

**Jobs:**
- **lint-frontend**: Runs ESLint, Prettier, and TypeScript type checking on the Next.js frontend
- **test-frontend**: Executes Jest unit tests for frontend components and API routes
- **lint-python**: Runs Black and Flake8 on the Python analysis service
- **test-python**: Executes pytest with coverage reporting for Python service
- **build-frontend**: Builds the Next.js application to verify production build succeeds
- **ci-success**: Final check that all jobs passed

**Purpose:** Ensures code quality and prevents broken code from being merged

### 2. Deploy to Staging (`deploy-staging.yml`)

**Trigger:** Pushes to `develop` branch

**Jobs:**
- **deploy-staging**: Deploys to Vercel staging environment
- **smoke-test-staging**: Runs basic health checks on deployed staging environment

**Purpose:** Automatically deploy and test changes in a staging environment before production

**Required Secrets:**
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `SLACK_WEBHOOK_URL`: (Optional) Slack webhook for notifications

### 3. Deploy to Production (`deploy-production.yml`)

**Trigger:** Pushes to `main` branch or manual workflow dispatch

**Jobs:**
- **pre-deployment-checks**: Runs linting, tests, and builds before deployment
- **deploy-production**: Deploys to Vercel production environment
- **smoke-test-production**: Runs comprehensive health checks on production
- **notify-deployment**: Sends notifications and creates GitHub release

**Purpose:** Deploy validated code to production with safety checks

**Required Secrets:**
- `VERCEL_TOKEN`: Vercel authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `SLACK_WEBHOOK_URL`: (Optional) Slack webhook for notifications

**Manual Deployment:**
You can trigger a manual deployment from the Actions tab with an option to skip tests for emergency deployments.

## Setup Instructions

### 1. Configure GitHub Secrets

Navigate to your repository settings → Secrets and variables → Actions, and add:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
SLACK_WEBHOOK_URL=<your-slack-webhook> (optional)
```

**Getting Vercel credentials:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login`
3. Run `vercel link` in your project directory
4. Get token from: https://vercel.com/account/tokens
5. Get org and project IDs from `.vercel/project.json`

### 2. Configure Branch Protection

Recommended branch protection rules for `main`:

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
  - Required checks: `lint-frontend`, `test-frontend`, `lint-python`, `test-python`, `build-frontend`
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging

### 3. Set Up Environments

Create two environments in GitHub repository settings:

**Staging Environment:**
- Name: `staging`
- No deployment protection rules needed

**Production Environment:**
- Name: `production`
- ✅ Required reviewers (recommended)
- ✅ Wait timer: 5 minutes (optional)

## Workflow Diagram

```
┌─────────────────┐
│  Pull Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CI Pipeline   │
│  - Lint (JS/TS) │
│  - Lint (Python)│
│  - Test (Jest)  │
│  - Test (pytest)│
│  - Build        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Merge to       │
│  develop        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy Staging  │
│  - Deploy       │
│  - Smoke Tests  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Merge to main  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Deploy Production│
│  - Pre-checks   │
│  - Deploy       │
│  - Smoke Tests  │
│  - Notify       │
└─────────────────┘
```

## Local Development

### Running Linters Locally

**Frontend:**
```bash
npm run lint          # Run ESLint
npm run format:check  # Check Prettier formatting
npm run format        # Fix Prettier formatting
npm run type-check    # TypeScript type checking
```

**Python:**
```bash
cd python-service
pip install black flake8
black .               # Format code
black --check .       # Check formatting
flake8 .              # Lint code
```

### Running Tests Locally

**Frontend:**
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

**Python:**
```bash
cd python-service
pip install -r requirements-test.txt
pytest                # Run all tests
pytest --cov          # Run with coverage
```

## Troubleshooting

### CI Pipeline Failing

1. **Linting errors:** Run linters locally and fix issues
2. **Test failures:** Run tests locally to reproduce and fix
3. **Build failures:** Check for missing environment variables or dependencies

### Deployment Failing

1. **Vercel authentication:** Verify secrets are correctly set
2. **Build errors:** Check Vercel build logs in the Actions tab
3. **Smoke tests failing:** Check deployed application logs in Vercel dashboard

### Rollback Procedure

If production deployment fails:

1. Go to Vercel dashboard
2. Find the previous successful deployment
3. Click "Promote to Production"
4. Or revert the commit and push to `main`

## Best Practices

1. **Always create pull requests** - Never push directly to `main` or `develop`
2. **Wait for CI to pass** - Don't merge PRs with failing checks
3. **Review staging deployments** - Test changes in staging before merging to main
4. **Monitor production deployments** - Check Slack notifications and Vercel logs
5. **Use semantic commit messages** - Helps with automated release notes

## Monitoring

- **GitHub Actions:** Monitor workflow runs in the Actions tab
- **Vercel Dashboard:** Monitor deployments and logs
- **Slack Notifications:** Receive real-time deployment status (if configured)

## Future Enhancements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Implement automated database migrations
- [ ] Add performance testing with Lighthouse CI
- [ ] Set up automated security scanning
- [ ] Implement blue-green deployments
- [ ] Add automated rollback on critical errors
