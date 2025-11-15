# CI/CD Setup Script for DataStory AI (PowerShell)
# This script helps configure GitHub Actions secrets and verify the setup

$ErrorActionPreference = "Stop"

Write-Host "🚀 DataStory AI - CI/CD Setup Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
try {
    $null = Get-Command gh -ErrorAction Stop
    Write-Host "✅ GitHub CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI (gh) is not installed" -ForegroundColor Red
    Write-Host "Please install it from: https://cli.github.com/"
    exit 1
}

# Check if user is authenticated
try {
    gh auth status 2>$null
    Write-Host "✅ GitHub CLI is authenticated" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not authenticated with GitHub CLI" -ForegroundColor Yellow
    Write-Host "Running: gh auth login"
    gh auth login
}

Write-Host ""

# Check if Vercel CLI is installed
try {
    $null = Get-Command vercel -ErrorAction Stop
    Write-Host "✅ Vercel CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI is not installed" -ForegroundColor Yellow
    Write-Host "Install it with: npm i -g vercel"
    $continue = Read-Host "Do you want to continue without Vercel CLI? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "📝 Setting up GitHub Secrets" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Function to set a secret
function Set-GitHubSecret {
    param(
        [string]$SecretName,
        [string]$Description
    )
    
    Write-Host "Setting up: $SecretName" -ForegroundColor Yellow
    Write-Host "Description: $Description"
    
    # Check if secret already exists
    $existingSecrets = gh secret list | Out-String
    if ($existingSecrets -match $SecretName) {
        $overwrite = Read-Host "Secret $SecretName already exists. Overwrite? (y/n)"
        if ($overwrite -ne "y") {
            Write-Host "Skipping $SecretName"
            Write-Host ""
            return
        }
    }
    
    $secretValue = Read-Host "Enter value for $SecretName" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretValue)
    $plainValue = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    if ([string]::IsNullOrWhiteSpace($plainValue)) {
        Write-Host "⚠️  Skipping empty value" -ForegroundColor Yellow
        Write-Host ""
        return
    }
    
    $plainValue | gh secret set $SecretName
    Write-Host "✅ Secret $SecretName set successfully" -ForegroundColor Green
    Write-Host ""
}

# Set required secrets
Write-Host "Required secrets for Vercel deployment:"
Write-Host ""

Set-GitHubSecret -SecretName "VERCEL_TOKEN" -Description "Get from: https://vercel.com/account/tokens"
Set-GitHubSecret -SecretName "VERCEL_ORG_ID" -Description "Run 'vercel link' and check .vercel/project.json"
Set-GitHubSecret -SecretName "VERCEL_PROJECT_ID" -Description "Run 'vercel link' and check .vercel/project.json"

Write-Host ""
Write-Host "Optional secrets:"
Write-Host ""

$setupSlack = Read-Host "Do you want to set up Slack notifications? (y/n)"
if ($setupSlack -eq "y") {
    Set-GitHubSecret -SecretName "SLACK_WEBHOOK_URL" -Description "Get from: https://api.slack.com/messaging/webhooks"
}

Write-Host ""
Write-Host "🔒 Setting up Branch Protection" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$setupBranchProtection = Read-Host "Do you want to set up branch protection for 'main'? (y/n)"
if ($setupBranchProtection -eq "y") {
    Write-Host "Setting up branch protection..."
    
    try {
        $protection = @{
            required_status_checks = @{
                strict = $true
                contexts = @("lint-frontend", "test-frontend", "lint-python", "test-python", "build-frontend")
            }
            enforce_admins = $true
            required_pull_request_reviews = @{
                required_approving_review_count = 1
            }
            restrictions = $null
        } | ConvertTo-Json -Depth 10
        
        gh api repos/:owner/:repo/branches/main/protection --method PUT --input - <<< $protection 2>$null
        Write-Host "✅ Branch protection enabled" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not enable branch protection (requires admin access)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🌍 Setting up GitHub Environments" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$setupEnvironments = Read-Host "Do you want to create GitHub environments? (y/n)"
if ($setupEnvironments -eq "y") {
    Write-Host "Creating staging environment..."
    try {
        gh api repos/:owner/:repo/environments/staging --method PUT 2>$null
        Write-Host "✅ Staging environment created" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not create staging environment" -ForegroundColor Yellow
    }
    
    Write-Host "Creating production environment..."
    try {
        gh api repos/:owner/:repo/environments/production --method PUT 2>$null
        Write-Host "✅ Production environment created" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not create production environment" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""

$repoInfo = gh repo view --json nameWithOwner | ConvertFrom-Json
$repoName = $repoInfo.nameWithOwner

Write-Host "Next steps:"
Write-Host "1. Verify secrets in: https://github.com/$repoName/settings/secrets/actions"
Write-Host "2. Review branch protection: https://github.com/$repoName/settings/branches"
Write-Host "3. Check environments: https://github.com/$repoName/settings/environments"
Write-Host "4. Create a test PR to verify CI pipeline"
Write-Host ""
Write-Host "📚 Documentation: .github/workflows/README.md"
Write-Host ""
