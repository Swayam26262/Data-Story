# End-to-End Test Runner Script
# This script sets up the environment and runs e2e tests

Write-Host "DataStory AI - End-to-End Test Runner" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Error: .env.local file not found" -ForegroundColor Red
    Write-Host "Please create .env.local with required environment variables" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Write-Host "Loading environment variables..." -ForegroundColor Yellow
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Check if MongoDB is accessible
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
$mongoUri = [Environment]::GetEnvironmentVariable("MONGODB_URI")
if (-not $mongoUri) {
    Write-Host "Error: MONGODB_URI not set in environment" -ForegroundColor Red
    exit 1
}

# Check if development server is running
Write-Host "Checking if development server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Development server is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Development server is not running" -ForegroundColor Red
    Write-Host "Please start the development server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Run the tests
Write-Host ""
Write-Host "Running end-to-end tests..." -ForegroundColor Cyan
Write-Host ""

npm run test -- __tests__/e2e.test.ts --run

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "For manual testing, see: docs/e2e-testing-checklist.md" -ForegroundColor Cyan

exit $exitCode
