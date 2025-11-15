# CI/CD Setup Checklist

Use this checklist to verify your CI/CD pipeline is properly configured.

## Prerequisites

- [ ] GitHub repository created
- [ ] Vercel account created
- [ ] Project linked to Vercel
- [ ] GitHub CLI installed (`gh`)
- [ ] Vercel CLI installed (`vercel`)

## GitHub Secrets Configuration

### Required Secrets

- [ ] `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- [ ] `VERCEL_ORG_ID` - Found in `.vercel/project.json` after running `vercel link`
- [ ] `VERCEL_PROJECT_ID` - Found in `.vercel/project.json` after running `vercel link`

### Optional Secrets

- [ ] `SLACK_WEBHOOK_URL` - For deployment notifications

**Verify secrets:**
```bash
gh secret list
```

## Branch Protection

- [ ] Branch protection enabled for `main`
- [ ] Require pull request reviews before merging
- [ ] Require status checks to pass:
  - [ ] `lint-frontend`
  - [ ] `test-frontend`
  - [ ] `lint-python`
  - [ ] `test-python`
  - [ ] `build-frontend`
- [ ] Require branches to be up to date before merging
- [ ] Require conversation resolution before merging

**Verify protection:**
```bash
gh api repos/:owner/:repo/branches/main/protection
```

## GitHub Environments

- [ ] `staging` environment created
- [ ] `production` environment created
- [ ] Production environment has required reviewers (recommended)

**Verify environments:**
```bash
gh api repos/:owner/:repo/environments
```

## Workflow Files

- [ ] `.github/workflows/ci.yml` exists
- [ ] `.github/workflows/deploy-staging.yml` exists
- [ ] `.github/workflows/deploy-production.yml` exists
- [ ] All workflow files have valid YAML syntax

**Verify workflows:**
```bash
ls -la .github/workflows/
```

## Python Configuration

- [ ] `python-service/.flake8` exists
- [ ] `python-service/pyproject.toml` exists
- [ ] Black and Flake8 installed in Python environment

**Test Python linting:**
```bash
cd python-service
pip install black flake8
black --check .
flake8 .
```

## Frontend Configuration

- [ ] ESLint configured
- [ ] Prettier configured
- [ ] TypeScript configured
- [ ] Jest configured

**Test frontend linting:**
```bash
npm run lint
npm run format:check
npm run type-check
```

## Testing

### Frontend Tests

- [ ] Jest tests exist in `__tests__/` directory
- [ ] Tests run successfully locally

**Run tests:**
```bash
npm test
```

### Python Tests

- [ ] pytest tests exist in `python-service/tests/` directory
- [ ] Tests run successfully locally

**Run tests:**
```bash
cd python-service
pytest
```

## Documentation

- [ ] `.github/workflows/README.md` exists
- [ ] `.github/CONTRIBUTING.md` exists
- [ ] `docs/ci-cd-implementation.md` exists
- [ ] Main `README.md` updated with CI/CD information

## Verification Steps

### 1. Test CI Pipeline

- [ ] Create a test branch
- [ ] Make a small change
- [ ] Push to GitHub
- [ ] Create pull request to `develop`
- [ ] Verify all CI checks pass
- [ ] Check GitHub Actions tab for workflow runs

**Commands:**
```bash
git checkout -b test/ci-pipeline
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: verify CI pipeline"
git push origin test/ci-pipeline
gh pr create --base develop --title "Test CI Pipeline"
```

### 2. Test Staging Deployment

- [ ] Merge test PR to `develop`
- [ ] Verify staging deployment workflow runs
- [ ] Check deployment URL in workflow output
- [ ] Verify application is accessible at staging URL
- [ ] Check smoke tests pass

**Monitor:**
```bash
gh run list --workflow=deploy-staging.yml
gh run view <run-id>
```

### 3. Test Production Deployment

- [ ] Create PR from `develop` to `main`
- [ ] Verify CI checks pass
- [ ] Get approval (if required)
- [ ] Merge to `main`
- [ ] Verify production deployment workflow runs
- [ ] Check deployment URL
- [ ] Verify smoke tests pass
- [ ] Check GitHub release created

**Monitor:**
```bash
gh run list --workflow=deploy-production.yml
gh run view <run-id>
```

## Troubleshooting

### CI Pipeline Issues

**Linting failures:**
```bash
# Fix frontend
npm run lint:fix
npm run format

# Fix Python
cd python-service
black .
```

**Test failures:**
```bash
# Debug frontend tests
npm test -- --verbose

# Debug Python tests
cd python-service
pytest -v
```

**Build failures:**
```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run type-check
```

### Deployment Issues

**Vercel authentication:**
- [ ] Verify `VERCEL_TOKEN` is valid
- [ ] Check token has correct permissions
- [ ] Regenerate token if needed

**Deployment failures:**
- [ ] Check Vercel dashboard for build logs
- [ ] Verify environment variables in Vercel
- [ ] Check GitHub Actions logs for errors

**Smoke test failures:**
- [ ] Check application logs in Vercel
- [ ] Verify health endpoints are working
- [ ] Test endpoints manually

## Post-Setup Tasks

- [ ] Delete test branch and PR
- [ ] Document any custom configuration
- [ ] Share setup documentation with team
- [ ] Schedule regular CI/CD review meetings
- [ ] Set up monitoring alerts
- [ ] Configure Slack notifications (if using)

## Automated Setup

Instead of manual setup, you can use the automated scripts:

**Linux/macOS:**
```bash
chmod +x .github/scripts/setup-ci.sh
./.github/scripts/setup-ci.sh
```

**Windows:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.github\scripts\setup-ci.ps1
```

## Success Criteria

✅ All checklist items completed
✅ CI pipeline runs successfully on PRs
✅ Staging deploys automatically on develop merge
✅ Production deploys automatically on main merge
✅ Smoke tests pass after deployments
✅ Team members can create and merge PRs
✅ Documentation is accessible and clear

## Next Steps

After completing this checklist:

1. **Train the team** on the new workflow
2. **Create a test PR** to familiarize everyone
3. **Monitor first few deployments** closely
4. **Gather feedback** and iterate
5. **Document any issues** and solutions
6. **Schedule regular reviews** of CI/CD performance

## Support

If you encounter issues:

1. Check [CI/CD Implementation Guide](../docs/ci-cd-implementation.md)
2. Review [Workflow Documentation](workflows/README.md)
3. Consult [Contributing Guide](CONTRIBUTING.md)
4. Create GitHub issue with `ci-cd` label
5. Ask in team Slack channel

---

**Last Updated:** November 15, 2025
**Maintained By:** Engineering Team
