#!/bin/bash

# ========================================
# PRECOMMIT VALIDATION SCRIPT
# ========================================
# This script runs all CI checks locally before committing
# It ensures code quality and prevents CI failures
# 
# Usage:
#   ./precommit.sh         # Check only mode
#   ./precommit.sh --fix   # Auto-fix formatting issues
# ========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse arguments
FIX_MODE=false
if [[ "$1" == "--fix" ]] || [[ "$1" == "-f" ]]; then
    FIX_MODE=true
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if $FIX_MODE; then
    echo -e "${BLUE}   PRECOMMIT VALIDATION - FIX MODE      ${NC}"
else
    echo -e "${BLUE}   PRECOMMIT VALIDATION - STARTING      ${NC}"
fi
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Track total time
TOTAL_START=$(date +%s)

# Function to print step header
print_step() {
    STEP_START=$(date +%s)
    echo ""
    echo -e "${YELLOW}▶ Step $1: $2${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success with time
print_success() {
    local STEP_END=$(date +%s)
    local ELAPSED=$((STEP_END - STEP_START))
    echo -e "${GREEN}✓ $1${NC} ${CYAN}(${ELAPSED}s)${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Install dependencies
print_step "1/7" "Installing dependencies"
npm ci
print_success "Dependencies installed"

# Step 2: Format (fix or check)
print_step "2/7" "Checking/Fixing code formatting"
if $FIX_MODE; then
    npx prettier --write .
    print_success "Formatting fixed"
else
    npm run lint
    print_success "Linting passed"
fi

# Step 3: Generate Paraglide files (i18n)
print_step "3/7" "Generating Paraglide translation files"
npx @inlang/paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide
print_success "Translation files generated"

# Step 4: Type check
print_step "4/7" "Running TypeScript type check"
npm run check
print_success "Type check passed"

# Step 5: Build
print_step "5/7" "Building project"
npm run build
print_success "Build successful"

# Step 6: Run tests (if configured)
print_step "6/7" "Running tests"
if npm run test 2>/dev/null; then
    print_success "Tests passed"
else
    echo -e "${CYAN}ℹ No tests configured or tests skipped${NC}"
fi

# Step 7: Validate JSON data
print_step "7/7" "Validating JSON data"
node -e "
const data = require('./data/showdown.json');
const models = data.models;
const categories = data.categories;

// Validate models have required fields
for (const model of models) {
  if (!model.id || !model.name || !model.provider) {
    throw new Error('Model missing required fields: ' + model.id);
  }
  if (!model.benchmark_scores) {
    throw new Error('Model missing benchmark_scores: ' + model.id);
  }
}

// Validate category weights sum to 1
const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
if (Math.abs(totalWeight - 1) > 0.01) {
  throw new Error('Category weights do not sum to 1: ' + totalWeight);
}

// Validate benchmark weights within each category sum to ~1
for (const cat of categories) {
  const benchWeight = cat.benchmarks.reduce((sum, b) => sum + b.weight, 0);
  if (Math.abs(benchWeight - 1) > 0.01) {
    throw new Error('Benchmark weights in category ' + cat.id + ' do not sum to 1: ' + benchWeight);
  }
}

// Collect all valid benchmark IDs from categories
const benchmarkIds = new Set();
for (const cat of categories) {
  for (const bench of cat.benchmarks) {
    benchmarkIds.add(bench.id);
  }
}

// Validate new required benchmarks exist in categories
const requiredBenchmarks = ['swe_bench', 'gpqa_diamond', 'livebench', 'ifeval', 'mmlu_pro', 'simpleqa'];
for (const req of requiredBenchmarks) {
  if (!benchmarkIds.has(req)) {
    throw new Error('Required benchmark missing from categories: ' + req);
  }
}

// Validate benchmark IDs in models exist in categories
for (const model of models) {
  for (const benchId of Object.keys(model.benchmark_scores)) {
    if (!benchmarkIds.has(benchId)) {
      throw new Error('Unknown benchmark ' + benchId + ' in model ' + model.id);
    }
  }
}

// Validate imputed_metadata references valid benchmarks
for (const model of models) {
  if (model.imputed_metadata) {
    for (const benchId of Object.keys(model.imputed_metadata)) {
      if (!benchmarkIds.has(benchId)) {
        throw new Error('Unknown imputed benchmark ' + benchId + ' in model ' + model.id);
      }
      // Validate imputed_metadata structure
      const meta = model.imputed_metadata[benchId];
      if (meta.imputed_value === undefined) {
        throw new Error('imputed_metadata missing imputed_value for ' + benchId + ' in model ' + model.id);
      }
    }
  }
}

console.log('Validation passed: ' + models.length + ' models, ' + categories.length + ' categories');
"
print_success "JSON validation passed"

# Calculate total time
TOTAL_END=$(date +%s)
TOTAL_ELAPSED=$((TOTAL_END - TOTAL_START))

# All checks passed
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ ALL CHECKS PASSED SUCCESSFULLY     ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✓ Your code is ready to commit!${NC} ${CYAN}(Total: ${TOTAL_ELAPSED}s)${NC}"
echo ""
