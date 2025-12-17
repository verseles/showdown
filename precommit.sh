#!/bin/bash

# Pre-commit validation script for Showdown
# This script runs all validation checks before allowing a commit

set -e  # Exit on any error

echo "🔍 Running Showdown pre-commit validation..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Function to run a command and report its status
run_check() {
    local check_name=$1
    shift
    echo "▶️  Running: $check_name..."

    if "$@"; then
        echo "✅ $check_name passed"
        echo ""
        return 0
    else
        echo "❌ $check_name failed"
        echo ""
        return 1
    fi
}

# Track if any check fails
CHECKS_PASSED=true

# 1. JSON syntax validation
if ! run_check "JSON Syntax Check" node -e "require('./data/showdown.json')"; then
    CHECKS_PASSED=false
fi

# 2. Lint (code formatting)
if ! run_check "Lint Check" npm run lint; then
    CHECKS_PASSED=false
fi

# 3. Type Check (TypeScript types)
if ! run_check "Type Check" npm run check; then
    CHECKS_PASSED=false
fi

# 4. Build (SSG compilation)
if ! run_check "Build Check" npm run build; then
    CHECKS_PASSED=false
fi

# Final result
if [ "$CHECKS_PASSED" = true ]; then
    echo "🎉 All validation checks passed!"
    echo ""
    echo "You can now commit your changes."
    exit 0
else
    echo "💥 Some validation checks failed!"
    echo ""
    echo "Please fix the errors above before committing."
    echo ""
    echo "For data updates, see UPDATE.md for guidelines."
    exit 1
fi
