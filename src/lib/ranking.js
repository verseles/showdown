/**
 * Ranking calculation engine for LLM comparison
 * Handles normalization, weighted averages, and null-safe logic
 */

/**
 * Normalize Elo scores from range [min, max] to percentage scale [0, 100]
 * @param {number|null} elo - Elo score
 * @param {number|null} min - Minimum Elo range
 * @param {number|null} max - Maximum Elo range
 * @returns {number|null} Normalized score (0-100) or null
 */
export function normalizeEloScore(elo, min, max) {
  if (elo == null || min == null || max == null) return null;
  if (min >= max) return null;
  return ((elo - min) / (max - min)) * 100;
}

/**
 * Calculate weighted average for a category, handling nulls
 * @param {Object} model - Model object with benchmark_scores
 * @param {Object} category - Category object with benchmarks array
 * @returns {number|null} Category score (0-100) or null if no valid scores
 */
export function calculateCategoryScore(model, category) {
  const { benchmarks } = /** @type {{ benchmarks: Array<{id: string, weight: number}> }} */ (category);
  let totalWeight = 0;
  let weightedSum = 0;

  for (const benchmark of benchmarks) {
    const rawScore = /** @type {any} */ (model).benchmark_scores[benchmark.id];

    if (rawScore == null) {
      continue; // Skip null scores
    }

    let normalizedScore;

    if (benchmark.type === 'elo') {
      const eloRange = benchmark.elo_range || { min: 800, max: 1400 };
      normalizedScore = normalizeEloScore(rawScore, eloRange.min, eloRange.max);
    } else {
      // Percentage type, already normalized
      normalizedScore = rawScore;
    }

    if (normalizedScore != null) {
      totalWeight += benchmark.weight;
      weightedSum += normalizedScore * benchmark.weight;
    }
  }

  if (totalWeight === 0) {
    return null; // No valid scores in this category
  }

  return weightedSum / totalWeight;
}

/**
 * Calculate overall score using category weights
 * @param {Object} model - Model object
 * @param {Array<Object>} categories - Array of category objects
 * @returns {number|null} Overall score (0-100) or null if no valid categories
 */
export function calculateOverallScore(model, categories) {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const category of categories) {
    const categoryScore = calculateCategoryScore(model, category);

    if (categoryScore != null) {
      totalWeight += /** @type {any} */ (category).weight;
      weightedSum += categoryScore * /** @type {any} */ (category).weight;
    }
  }

  if (totalWeight === 0) {
    return null; // No valid category scores
  }

  return weightedSum / totalWeight;
}

/**
 * Rank models by overall score with tie-breaking
 * @param {Array} models - Array of model objects
 * @param {Array} categories - Array of category objects
 * @returns {Array} Ranked models with rank positions
 */
export function rankModels(models, categories) {
  // Calculate scores for each model
  const modelsWithScores = models.map(model => {
    const overallScore = calculateOverallScore(model, categories);

    // Calculate individual category scores for display
    const categoryScores = {};
    for (const category of categories) {
      categoryScores[category.id] = calculateCategoryScore(model, category);
    }

    return {
      ...model,
      overall_score: overallScore,
      category_scores: categoryScores
    };
  });

  // Sort by overall score (descending), then by name (alphabetical) for ties
  const sorted = modelsWithScores.sort((a, b) => {
    // Handle null scores (put at bottom)
    if (a.overall_score == null && b.overall_score == null) return 0;
    if (a.overall_score == null) return 1;
    if (b.overall_score == null) return -1;

    // Primary sort: overall score (descending)
    if (Math.abs(a.overall_score - b.overall_score) > 0.1) {
      return b.overall_score - a.overall_score;
    }

    // Tie-breaker: alphabetical by name
    return a.name.localeCompare(b.name);
  });

  // Add rank positions
  let currentRank = 0;
  let previousScore = null;

  return sorted.map((model, index) => {
    if (previousScore == null || Math.abs(model.overall_score - previousScore) > 0.1) {
      currentRank = index + 1;
    }

    return {
      ...model,
      rank: model.overall_score != null ? currentRank : null
    };
  });
}

/**
 * Get category score breakdown for a model
 * @param {Object} model - Model object
 * @param {Object} category - Category object
 * @returns {Array} Breakdown of benchmark scores
 */
export function getCategoryBreakdown(model, category) {
  const breakdown = [];

  for (const benchmark of category.benchmarks) {
    const rawScore = model.benchmark_scores[benchmark.id];

    if (rawScore == null) {
      breakdown.push({
        id: benchmark.id,
        name: benchmark.name,
        score: null,
        normalizedScore: null,
        type: benchmark.type,
        url: benchmark.url
      });
      continue;
    }

    let normalizedScore;
    if (benchmark.type === 'elo') {
      const eloRange = benchmark.elo_range || { min: 800, max: 1400 };
      normalizedScore = normalizeEloScore(rawScore, eloRange.min, eloRange.max);
    } else {
      normalizedScore = rawScore;
    }

    breakdown.push({
      id: benchmark.id,
      name: benchmark.name,
      score: rawScore,
      normalizedScore: normalizedScore,
      type: benchmark.type,
      url: benchmark.url
    });
  }

  return breakdown;
}

/**
 * Get validation statistics for a model
 * @param {Object} model - Model object
 * @param {Array} categories - Array of category objects
 * @returns {Object} Statistics about data completeness
 */
export function getModelStats(model, categories) {
  let totalBenchmarks = 0;
  let presentBenchmarks = 0;
  const categoryStats = {};

  for (const category of categories) {
    let categoryTotal = 0;
    let categoryPresent = 0;

    for (const benchmark of category.benchmarks) {
      totalBenchmarks++;
      categoryTotal++;

      if (model.benchmark_scores[benchmark.id] != null) {
        presentBenchmarks++;
        categoryPresent++;
      }
    }

    categoryStats[category.id] = {
      total: categoryTotal,
      present: categoryPresent,
      percentage: categoryTotal > 0 ? (categoryPresent / categoryTotal) * 100 : 0
    };
  }

  return {
    total: totalBenchmarks,
    present: presentBenchmarks,
    missing: totalBenchmarks - presentBenchmarks,
    percentage: totalBenchmarks > 0 ? (presentBenchmarks / totalBenchmarks) * 100 : 0,
    categories: categoryStats
  };
}
