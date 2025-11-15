#!/bin/bash

# CI/CD Setup Script for DataStory AI
# This script helps configure GitHub Actions secrets and verify the setup

set -e

echo "🚀 DataStory AI - CI/CD Setup Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo "Running: gh auth login"
    gh auth login
fi

echo -e "${GREEN}✅ GitHub CLI is installed and authenticated${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI is not installed${NC}"
    echo "Install it with: npm i -g vercel"
    read -p "Do you want to continue without Vercel CLI? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Vercel CLI is installed${NC}"
fi

echo ""
echo "📝 Setting up GitHub Secrets"
echo "=============================="
echo ""

# Function to set a secret
set_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_value=""
    
    echo -e "${YELLOW}Setting up: $secret_name${NC}"
    echo "Description: $secret_description"
    
    # Check if secret already exists
    if gh secret list | grep -q "$secret_name"; then
        read -p "Secret $secret_name already exists. Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Skipping $secret_name"
            echo ""
            return
        fi
    fi
    
    read -sp "Enter value for $secret_name: " secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⚠️  Skipping empty value${NC}"
        echo ""
        return
    fi
    
    gh secret set "$secret_name" --body "$secret_value"
    echo -e "${GREEN}✅ Secret $secret_name set successfully${NC}"
    echo ""
}

# Set required secrets
echo "Required secrets for Vercel deployment:"
echo ""

set_secret "VERCEL_TOKEN" "Get from: https://vercel.com/account/tokens"
set_secret "VERCEL_ORG_ID" "Run 'vercel link' and check .vercel/project.json"
set_secret "VERCEL_PROJECT_ID" "Run 'vercel link' and check .vercel/project.json"

echo ""
echo "Optional secrets:"
echo ""

read -p "Do you want to set up Slack notifications? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    set_secret "SLACK_WEBHOOK_URL" "Get from: https://api.slack.com/messaging/webhooks"
fi

echo ""
echo "🔒 Setting up Branch Protection"
echo "================================"
echo ""

read -p "Do you want to set up branch protection for 'main'? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting up branch protection..."
    
    # Note: This requires admin permissions
    gh api repos/:owner/:repo/branches/main/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["lint-frontend","test-frontend","lint-python","test-python","build-frontend"]}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":1}' \
        --field restrictions=null \
        2>/dev/null && echo -e "${GREEN}✅ Branch protection enabled${NC}" || echo -e "${YELLOW}⚠️  Could not enable branch protection (requires admin access)${NC}"
fi

echo ""
echo "🌍 Setting up GitHub Environments"
echo "=================================="
echo ""

read -p "Do you want to create GitHub environments? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating staging environment..."
    gh api repos/:owner/:repo/environments/staging --method PUT 2>/dev/null && \
        echo -e "${GREEN}✅ Staging environment created${NC}" || \
        echo -e "${YELLOW}⚠️  Could not create staging environment${NC}"
    
    echo "Creating production environment..."
    gh api repos/:owner/:repo/environments/production --method PUT 2>/dev/null && \
        echo -e "${GREEN}✅ Production environment created${NC}" || \
        echo -e "${YELLOW}⚠️  Could not create production environment${NC}"
fi

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Verify secrets in: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/secrets/actions"
echo "2. Review branch protection: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/branches"
echo "3. Check environments: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/settings/environments"
echo "4. Create a test PR to verify CI pipeline"
echo ""
echo "📚 Documentation: .github/workflows/README.md"
echo ""
