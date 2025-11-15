#!/bin/bash

# End-to-End Test Runner Script
# This script sets up the environment and runs e2e tests

echo -e "\033[36mDataStory AI - End-to-End Test Runner\033[0m"
echo -e "\033[36m======================================\033[0m"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "\033[31mError: .env.local file not found\033[0m"
    echo -e "\033[33mPlease create .env.local with required environment variables\033[0m"
    exit 1
fi

# Load environment variables
echo -e "\033[33mLoading environment variables...\033[0m"
export $(cat .env.local | grep -v '^#' | xargs)

# Check if MongoDB is accessible
echo -e "\033[33mChecking MongoDB connection...\033[0m"
if [ -z "$MONGODB_URI" ]; then
    echo -e "\033[31mError: MONGODB_URI not set in environment\033[0m"
    exit 1
fi

# Check if development server is running
echo -e "\033[33mChecking if development server is running...\033[0m"
if curl -s -f -o /dev/null "http://localhost:3000/api/health"; then
    echo -e "\033[32m✓ Development server is running\033[0m"
else
    echo -e "\033[31m✗ Development server is not running\033[0m"
    echo -e "\033[33mPlease start the development server with: npm run dev\033[0m"
    exit 1
fi

# Run the tests
echo ""
echo -e "\033[36mRunning end-to-end tests...\033[0m"
echo ""

npm run test -- __tests__/e2e.test.ts --run

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "\033[32m✓ All tests passed!\033[0m"
else
    echo -e "\033[31m✗ Some tests failed\033[0m"
fi

echo ""
echo -e "\033[36mFor manual testing, see: docs/e2e-testing-checklist.md\033[0m"

exit $EXIT_CODE
