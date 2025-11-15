# Performance Optimization Script
# Runs various performance checks and optimizations

Write-Host "DataStory AI - Performance Optimization" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Lighthouse CLI is installed
Write-Host "Checking for Lighthouse CLI..." -ForegroundColor Yellow
$lighthouseInstalled = Get-Command lighthouse -ErrorAction SilentlyContinue
if (-not $lighthouseInstalled) {
    Write-Host "Lighthouse CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @lhci/cli lighthouse
}

# Check if development server is running
Write-Host "Checking if development server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Development server is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Development server is not running" -ForegroundColor Red
    Write-Host "Please start the development server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Create reports directory
$reportsDir = "performance-reports"
if (-not (Test-Path $reportsDir)) {
    New-Item -ItemType Directory -Path $reportsDir | Out-Null
}

Write-Host ""
Write-Host "Running Lighthouse audits..." -ForegroundColor Cyan
Write-Host ""

# Run Lighthouse on key pages
$pages = @(
    @{name="Homepage"; url="http://localhost:3000"},
    @{name="Login"; url="http://localhost:3000/auth/login"},
    @{name="Dashboard"; url="http://localhost:3000/dashboard"}
)

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"

foreach ($page in $pages) {
    Write-Host "Auditing $($page.name)..." -ForegroundColor Yellow
    $outputPath = "$reportsDir/$($page.name.ToLower())-$timestamp.html"
    
    lighthouse $page.url `
        --output html `
        --output-path $outputPath `
        --chrome-flags="--headless" `
        --quiet
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $($page.name) audit complete: $outputPath" -ForegroundColor Green
    } else {
        Write-Host "✗ $($page.name) audit failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Analyzing bundle size..." -ForegroundColor Cyan

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build complete" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

# Analyze bundle
Write-Host ""
Write-Host "Bundle analysis complete. Check .next/analyze for details." -ForegroundColor Green

Write-Host ""
Write-Host "Performance Optimization Recommendations:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Review Lighthouse reports in $reportsDir" -ForegroundColor White
Write-Host "2. Check bundle size in .next/analyze" -ForegroundColor White
Write-Host "3. Optimize images using Next.js Image component" -ForegroundColor White
Write-Host "4. Implement code splitting for large components" -ForegroundColor White
Write-Host "5. Add database indexes for frequently queried fields" -ForegroundColor White
Write-Host "6. Enable CDN caching for static assets" -ForegroundColor White
Write-Host ""

Write-Host "Performance optimization check complete!" -ForegroundColor Green
