#!/bin/bash

# ========================================
# PRECOMMIT VALIDATION SCRIPT
# ========================================
# This script runs all CI checks locally before committing
# It ensures code quality and prevents CI failures
# ========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   PRECOMMIT VALIDATION - STARTING      ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to print step header
print_step() {
    echo ""
    echo -e "${YELLOW}▶ Step $1: $2${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Install dependencies
print_step "1/6" "Installing dependencies"
npm ci
print_success "Dependencies installed"

# Step 2: Lint
print_step "2/6" "Running linter"
npm run lint
print_success "Linting passed"

# Step 3: Generate Paraglide files (i18n)
print_step "3/6" "Generating Paraglide translation files"
npx @inlang/paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide
print_success "Translation files generated"

# Step 4: Type check
print_step "4/6" "Running TypeScript type check"
npm run check
print_success "Type check passed"

# Step 5: Build
print_step "5/6" "Building project"
npm run build
print_success "Build successful"

# Step 6: Validate JSON data
print_step "6/6" "Validating JSON data"
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

// Validate benchmark IDs in models exist in categories
const benchmarkIds = new Set();
for (const cat of categories) {
  for (const bench of cat.benchmarks) {
    benchmarkIds.add(bench.id);
  }
}

for (const model of models) {
  for (const benchId of Object.keys(model.benchmark_scores)) {
    if (!benchmarkIds.has(benchId)) {
      throw new Error('Unknown benchmark ' + benchId + ' in model ' + model.id);
    }
  }
}

console.log('Validation passed: ' + models.length + ' models, ' + categories.length + ' categories');
"
print_success "JSON validation passed"

# All checks passed
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   ✓ ALL CHECKS PASSED SUCCESSFULLY     ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✓ Your code is ready to commit!${NC}"
echo ""
