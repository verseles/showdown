/**
 * Core ranking calculation engine for Showdown
 * Handles normalization, weighted averages, and null-safe scoring logic
 *
 * ## Design Philosophy
 *
 * ### Missing Benchmark Handling
 * Models with missing benchmarks are intentionally **penalized** rather than having
 * their weights renormalized. This encourages complete benchmark coverage and prevents
 * models with only favorable benchmarks from gaming the system.
 *
 * - Missing benchmarks contribute **0** to the weighted sum
 * - Category score = weightedSum / totalWeight (not presentWeight)
 * - This means a model missing 50% of benchmarks in a category could score ~50% of
 *   what it would score with complete data
 *
 * ### Minimum Coverage Requirements
 * - **Category scores** require at least 50% weighted coverage to be valid
 * - **Overall scores** require at least 4 categories with valid scores
 * - These thresholds prevent unreliable rankings from incomplete data
 *
 * ### Imputation Strategy
 * When imputation is enabled, missing benchmarks are estimated using the category
 * average of other benchmarks the model has in the same category. This only applies
 * when at least 50% of benchmarks in the category have real values.
 */

import type { Model, Category, Benchmark, RankedModel } from './types.js';

// ============================================
// Configuration Constants
// ============================================

/**
 * Minimum weighted coverage required for a category score to be valid.
 * If a model has less than this coverage in a category, the category score is null.
 * Value of 0.5 means at least 50% of benchmark weights must have scores.
 */
export const MIN_CATEGORY_COVERAGE = 0.5;

/**
 * Minimum number of categories with valid scores required for overall score.
 * If a model has scores in fewer categories, the overall score is null.
 * This prevents unfair rankings from models with very incomplete data.
 */
export const MIN_CATEGORIES_FOR_OVERALL = 4;

/**
 * Minimum proportion of benchmarks (by count) required for imputation.
 * Only impute missing values if at least this proportion have real data.
 * Uses Math.ceil(totalBenchmarks * MIN_IMPUTATION_COVERAGE) as threshold.
 */
export const MIN_IMPUTATION_COVERAGE = 0.5;

/**
 * Valid methods for imputation in imputed_metadata
 */
export const VALID_IMPUTATION_METHODS = [
	'category_average',
	'superior_of',
	'cross_model_average',
	'estimated',
	'manual'
] as const;

/**
 * Minimum superiority ratio (2% improvement minimum)
 */
export const MIN_SUPERIORITY_RATIO = 1.02;

/**
 * Maximum superiority ratio (20% improvement maximum)
 */
export const MAX_SUPERIORITY_RATIO = 1.2;

/**
 * Default superiority ratio when no shared benchmarks exist (5% improvement)
 */
export const DEFAULT_SUPERIORITY_RATIO = 1.05;

/**
 * Normalize an Elo score to a 0-100 scale.
 * @param elo - The raw Elo score
 * @param min - Minimum expected Elo in the range
 * @param max - Maximum expected Elo in the range
 * @returns Normalized score between 0-100
 */
export function normalizeEloScore(elo: number, min: number, max: number): number {
	if (max === min) return 50; // Avoid division by zero
	return ((elo - min) / (max - min)) * 100;
}

/**
 * Calculate the superiority ratio between a superior model and its base model.
 * Uses benchmarks where BOTH models have real values to determine the ratio.
 *
 * Algorithm:
 * 1. Find all benchmarks where both models have real scores
 * 2. For each, calculate ratio = superior_score / inferior_score
 * 3. Only consider ratios >= 1.0 (ignore cases where base is better)
 * 4. Return average of ratios, clamped to [MIN_SUPERIORITY_RATIO, MAX_SUPERIORITY_RATIO]
 *
 * @param superiorModel - The enhanced/thinking model
 * @param inferiorModel - The base model
 * @param categories - All benchmark categories
 * @returns Superiority ratio between MIN and MAX
 */
export function calculateSuperiorityRatio(
	superiorModel: Model,
	inferiorModel: Model,
	categories: Category[]
): number {
	const ratios: number[] = [];

	for (const category of categories) {
		for (const benchmark of category.benchmarks) {
			const superiorScore = superiorModel.benchmark_scores[benchmark.id];
			const inferiorScore = inferiorModel.benchmark_scores[benchmark.id];

			// Both must have real values (not null/undefined)
			if (superiorScore == null || inferiorScore == null) continue;
			if (inferiorScore <= 0) continue; // Avoid division by zero

			// Normalize for fair comparison
			let superiorNorm = superiorScore;
			let inferiorNorm = inferiorScore;

			if (benchmark.type === 'elo' && benchmark.elo_range) {
				superiorNorm = normalizeEloScore(
					superiorScore,
					benchmark.elo_range.min,
					benchmark.elo_range.max
				);
				inferiorNorm = normalizeEloScore(
					inferiorScore,
					benchmark.elo_range.min,
					benchmark.elo_range.max
				);
			}

			if (inferiorNorm > 0) {
				const ratio = superiorNorm / inferiorNorm;
				// Only consider ratios >= 1.0 (superior is equal or better)
				if (ratio >= 1.0) {
					ratios.push(ratio);
				}
			}
		}
	}

	// If no shared benchmarks, use default ratio
	if (ratios.length === 0) {
		return DEFAULT_SUPERIORITY_RATIO;
	}

	// Calculate average ratio
	const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;

	// Clamp to [MIN, MAX]
	return Math.min(MAX_SUPERIORITY_RATIO, Math.max(MIN_SUPERIORITY_RATIO, avgRatio));
}

/**
 * Impute missing benchmark scores using two strategies:
 * 1. superior_of: If model has a base model, estimate missing values as superior to base
 * 2. category_average: Fallback using average of other benchmarks in same category
 *
 * Creates a new model object with imputed values and metadata tracking.
 *
 * IMPORTANT: Only imputes if at least 50% (ceil) of benchmarks in the category
 * have real values. Otherwise, leaves as null (old method handles this).
 *
 * @param model - The model to impute
 * @param categories - All benchmark categories
 * @param allModels - All models (needed for superior_of lookup)
 * @returns New model with imputed scores and metadata
 */
export function imputeMissingScores(
	model: Model,
	categories: Category[],
	allModels: Model[] = []
): Model {
	// Create a copy of the model to avoid mutation
	const imputedModel: Model = {
		...model,
		benchmark_scores: { ...model.benchmark_scores },
		imputed_metadata: model.imputed_metadata ? { ...model.imputed_metadata } : {}
	};

	const today = new Date().toISOString().split('T')[0];

	// Build a map: benchmark_id -> category for quick lookup
	const benchmarkToCategory = new Map<string, Category>();
	// Also build benchmark_id -> benchmark for quick lookup
	const benchmarkById = new Map<string, { benchmark: Benchmark; category: Category }>();
	for (const category of categories) {
		for (const benchmark of category.benchmarks) {
			benchmarkToCategory.set(benchmark.id, category);
			benchmarkById.set(benchmark.id, { benchmark, category });
		}
	}

	// Track which benchmarks were imputed via superior_of (to skip in category_average)
	const imputedViaSuperior = new Set<string>();

	// STEP 1: Try superior_of imputation first
	if (model.superior_of && allModels.length > 0) {
		const inferiorModel = allModels.find((m) => m.id === model.superior_of);
		if (inferiorModel) {
			const ratio = calculateSuperiorityRatio(model, inferiorModel, categories);

			// Find missing benchmarks that the inferior model has
			for (const [benchmarkId, score] of Object.entries(model.benchmark_scores)) {
				if (score !== null) continue; // Skip non-null values

				const inferiorValue = inferiorModel.benchmark_scores[benchmarkId];
				if (inferiorValue == null) continue; // Inferior doesn't have it either

				const benchmarkInfo = benchmarkById.get(benchmarkId);
				if (!benchmarkInfo) continue;

				const { benchmark } = benchmarkInfo;

				// Calculate imputed value using superiority ratio
				let imputedValue = inferiorValue * ratio;

				// Limit to maximum possible value
				if (benchmark.type === 'percentage') {
					imputedValue = Math.min(100, imputedValue);
				} else if (benchmark.type === 'elo' && benchmark.elo_range) {
					imputedValue = Math.min(benchmark.elo_range.max, imputedValue);
				}

				// Update the benchmark score
				imputedModel.benchmark_scores[benchmarkId] = imputedValue;

				// Store metadata about the imputation
				imputedModel.imputed_metadata![benchmarkId] = {
					original_value: null,
					imputed_value: imputedValue,
					method: 'superior_of',
					imputed_date: today,
					note: `Estimated as superior to ${inferiorModel.name} (ratio: ${ratio.toFixed(3)}, base: ${inferiorValue.toFixed(1)})`,
					superior_of_model: model.superior_of,
					superiority_ratio: ratio
				};

				imputedViaSuperior.add(benchmarkId);
			}
		}
	}

	// STEP 2: category_average for remaining missing benchmarks
	for (const [benchmarkId, score] of Object.entries(model.benchmark_scores)) {
		if (score !== null) continue; // Skip non-null values
		if (imputedViaSuperior.has(benchmarkId)) continue; // Already imputed via superior_of

		const category = benchmarkToCategory.get(benchmarkId);
		if (!category) continue; // Skip if category not found

		// Count total benchmarks in category
		const totalBenchmarks = category.benchmarks.length;

		// Count how many benchmarks have values (real or imputed via superior_of)
		let valuesCount = 0;
		for (const benchmark of category.benchmarks) {
			const rawScore = imputedModel.benchmark_scores[benchmark.id];
			if (rawScore !== null && rawScore !== undefined) {
				valuesCount++;
			}
		}

		// Only impute if we have at least 50% (ceil) of benchmarks with values
		// Example: 5 benchmarks total, need at least 3 values (ceil(5/2) = 3)
		const minRequired = Math.ceil(totalBenchmarks / 2);
		if (valuesCount < minRequired) {
			// Not enough data, skip imputation
			continue;
		}

		// Get all OTHER benchmarks in the same category (excluding the current missing one)
		const categoryBenchmarks = category.benchmarks.filter((b) => b.id !== benchmarkId);

		// Collect normalized scores from the same category (using imputedModel to include superior_of values)
		const availableScores: number[] = [];
		for (const benchmark of categoryBenchmarks) {
			const rawScore = imputedModel.benchmark_scores[benchmark.id];
			if (rawScore !== null && rawScore !== undefined) {
				// Normalize if needed
				let normalizedScore = rawScore;
				if (benchmark.type === 'elo' && benchmark.elo_range) {
					normalizedScore = normalizeEloScore(
						rawScore,
						benchmark.elo_range.min,
						benchmark.elo_range.max
					);
				}
				availableScores.push(normalizedScore);
			}
		}

		// Sanity check: should have at least 1 other score due to minRequired check
		if (availableScores.length === 0) continue;

		// Calculate average of available scores in the category
		const average = availableScores.reduce((sum, s) => sum + s, 0) / availableScores.length;

		// Find the benchmark to check if we need to denormalize for Elo types
		const currentBenchmark = category.benchmarks.find((b) => b.id === benchmarkId);
		if (!currentBenchmark) continue;

		// Store the imputed value (keep it normalized in 0-100 scale for percentage types,
		// or denormalize back to Elo scale for Elo types)
		let imputedValue = average;

		if (currentBenchmark.type === 'elo' && currentBenchmark.elo_range) {
			// Denormalize back to Elo scale for storage
			const { min, max } = currentBenchmark.elo_range;
			imputedValue = (average / 100) * (max - min) + min;
		}

		// Update the benchmark score
		imputedModel.benchmark_scores[benchmarkId] = imputedValue;

		// Store metadata about the imputation
		imputedModel.imputed_metadata![benchmarkId] = {
			original_value: null,
			imputed_value: imputedValue,
			method: 'category_average',
			imputed_date: today,
			note: `Estimated from ${availableScores.length} other benchmark${availableScores.length > 1 ? 's' : ''} in ${category.name} category (avg: ${average.toFixed(2)})`
		};
	}

	return imputedModel;
}

/**
 * Get benchmark score, normalized if Elo type
 */
export function getBenchmarkScore(model: Model, benchmark: Benchmark): number | null {
	const rawScore = model.benchmark_scores[benchmark.id];

	if (rawScore === null || rawScore === undefined) {
		return null;
	}

	if (benchmark.type === 'elo' && benchmark.elo_range) {
		return normalizeEloScore(rawScore, benchmark.elo_range.min, benchmark.elo_range.max);
	}

	return rawScore;
}

/**
 * Calculate weighted score for a category with a weighted coverage penalty.
 * Benchmarks with null scores contribute 0 to the sum.
 * If weighted coverage is less than 50%, the category score is null.
 */
export function calculateCategoryScore(model: Model, category: Category): number | null {
	let weightedSum = 0;
	let presentWeight = 0;
	const totalWeight = category.benchmarks.reduce((sum, b) => sum + b.weight, 0);

	for (const benchmark of category.benchmarks) {
		const score = getBenchmarkScore(model, benchmark);
		if (score !== null) {
			weightedSum += score * benchmark.weight;
			presentWeight += benchmark.weight;
		}
	}

	// If no benchmarks have scores, return null
	if (presentWeight === 0) {
		return null;
	}

	// Calculate weighted coverage. Assumes totalWeight of benchmarks in a category is ~1.0
	const weightedCoverage = totalWeight > 0 ? presentWeight / totalWeight : 0;

	// If weighted coverage is less than 0.5 (50%), return null as there's insufficient data.
	if (weightedCoverage < MIN_CATEGORY_COVERAGE) {
		return null;
	}

	// The final score is the weighted sum of present scores.
	// This inherently penalizes models for missing benchmarks, as they contribute 0.
	// We divide by totalWeight to normalize the score back to a 0-100 scale,
	// but since totalWeight is ~1.0, this is equivalent to just returning weightedSum.
	return weightedSum / totalWeight;
}

/**
 * Get detailed benchmark breakdown for a category
 */
export function getCategoryBreakdown(
	model: Model,
	category: Category
): {
	benchmark: Benchmark;
	rawScore: number | null;
	normalizedScore: number | null;
}[] {
	return category.benchmarks.map((benchmark) => {
		const rawScore = model.benchmark_scores[benchmark.id] ?? null;
		const normalizedScore = getBenchmarkScore(model, benchmark);
		return { benchmark, rawScore, normalizedScore };
	});
}

/**
 * Calculate overall score from category scores.
 * Excludes null categories and renormalizes weights.
 * Returns null if fewer than 4 categories have a valid score.
 */
export function calculateOverallScore(model: Model, categories: Category[]): number | null {
	const categoryScores: { score: number; weight: number }[] = [];

	for (const category of categories) {
		const score = calculateCategoryScore(model, category);
		if (score !== null) {
			categoryScores.push({ score, weight: category.weight });
		}
	}

	// If fewer than 4 categories have scores, return null
	if (categoryScores.length < MIN_CATEGORIES_FOR_OVERALL) {
		return null;
	}

	// Renormalize weights for present categories
	const totalWeight = categoryScores.reduce((sum, c) => sum + c.weight, 0);

	if (totalWeight === 0) {
		return null;
	}

	// Calculate weighted average
	const weightedSum = categoryScores.reduce((sum, c) => sum + c.score * c.weight, 0);

	return weightedSum / totalWeight;
}

/**
 * Get all category scores for a model
 */
export function getAllCategoryScores(
	model: Model,
	categories: Category[]
): Record<string, number | null> {
	const scores: Record<string, number | null> = {};

	for (const category of categories) {
		scores[category.id] = calculateCategoryScore(model, category);
	}

	return scores;
}

/**
 * Count available benchmarks for a category
 */
export function countAvailableBenchmarks(
	model: Model,
	category: Category
): { available: number; total: number } {
	let available = 0;
	const total = category.benchmarks.length;

	for (const benchmark of category.benchmarks) {
		const score = model.benchmark_scores[benchmark.id];
		if (score !== null && score !== undefined) {
			available++;
		}
	}

	return { available, total };
}

/**
 * Calculate benchmark coverage percentage for a model
 */
export function calculateBenchmarkCoverage(model: Model, categories: Category[]): number {
	let totalBenchmarks = 0;
	let availableBenchmarks = 0;

	for (const category of categories) {
		const { available, total } = countAvailableBenchmarks(model, category);
		availableBenchmarks += available;
		totalBenchmarks += total;
	}

	if (totalBenchmarks === 0) return 0;
	return (availableBenchmarks / totalBenchmarks) * 100;
}

/**
 * Rank all models and return sorted array with positions
 */
export function rankModels(models: Model[], categories: Category[]): RankedModel[] {
	// First, impute missing scores for all models (pass all models for superior_of lookup)
	const imputedModels = models.map((model) => imputeMissingScores(model, categories, models));

	// Calculate scores for all models (using imputed values)
	const modelsWithScores = imputedModels.map((model) => ({
		model,
		overallScore: calculateOverallScore(model, categories),
		categoryScores: getAllCategoryScores(model, categories),
		coverage: calculateBenchmarkCoverage(model, categories)
	}));

	// Sort by:
	// 1. Overall score (descending)
	// 2. Benchmark coverage (descending)
	// 3. Release date (descending)
	// 4. Name (alphabetical, ascending)
	modelsWithScores.sort((a, b) => {
		// Null scores go to the end
		if (a.overallScore === null) return 1;
		if (b.overallScore === null) return -1;

		// 1. Sort by score descending
		const scoreDiff = b.overallScore - a.overallScore;
		if (Math.abs(scoreDiff) > 0.001) {
			return scoreDiff;
		}

		// 2. Tie-breaker: benchmark coverage
		const coverageDiff = b.coverage - a.coverage;
		if (Math.abs(coverageDiff) > 0.001) {
			return coverageDiff;
		}

		// 3. Tie-breaker: release date
		const dateA = new Date(a.model.release_date).getTime();
		const dateB = new Date(b.model.release_date).getTime();
		if (dateA !== dateB) {
			return dateB - dateA; // Newer first
		}

		// 4. Tie-breaker: alphabetical by name
		return a.model.name.localeCompare(b.model.name);
	});

	// Assign ranks (handle ties)
	let currentRank = 1;
	let previousScore: number | null = null;

	return modelsWithScores.map((item, index) => {
		if (item.overallScore !== null) {
			if (item.overallScore !== previousScore) {
				currentRank = index + 1;
			}
			previousScore = item.overallScore;
		}

		return {
			rank: item.overallScore === null ? null : currentRank,
			model: item.model,
			overallScore: item.overallScore,
			categoryScores: item.categoryScores,
			coverage: item.coverage
		};
	});
}

/**
 * Find the top score for each category (for highlighting)
 */
export function findTopScores(
	rankedModels: RankedModel[],
	categories: Category[]
): {
	overall: number | null;
	categories: Record<string, number | null>;
} {
	let topOverall: number | null = null;
	const topCategories: Record<string, number | null> = {};

	// Initialize category tops
	for (const category of categories) {
		topCategories[category.id] = null;
	}

	for (const ranked of rankedModels) {
		// Check overall
		if (ranked.overallScore !== null) {
			if (topOverall === null || ranked.overallScore > topOverall) {
				topOverall = ranked.overallScore;
			}
		}

		// Check each category
		for (const category of categories) {
			const score = ranked.categoryScores[category.id];
			if (score !== null) {
				if (topCategories[category.id] === null || score > topCategories[category.id]!) {
					topCategories[category.id] = score;
				}
			}
		}
	}

	return { overall: topOverall, categories: topCategories };
}

/**
 * Sort models by a specific column
 */
export function sortModels(
	rankedModels: RankedModel[],
	sortBy: string,
	sortOrder: 'asc' | 'desc'
): RankedModel[] {
	const sorted = [...rankedModels];

	sorted.sort((a, b) => {
		let valueA: number | string | null = null;
		let valueB: number | string | null = null;

		switch (sortBy) {
			case 'rank':
			case 'overall':
				valueA = a.overallScore;
				valueB = b.overallScore;
				break;
			case 'name':
				valueA = a.model.name;
				valueB = b.model.name;
				break;
			case 'provider':
				valueA = a.model.provider;
				valueB = b.model.provider;
				break;
			case 'type':
				valueA = a.model.type;
				valueB = b.model.type;
				break;
			case 'price':
				valueA = a.model.pricing.average_per_1m;
				valueB = b.model.pricing.average_per_1m;
				break;
			case 'speed':
				valueA = a.model.performance.output_speed_tps;
				valueB = b.model.performance.output_speed_tps;
				break;
			case 'latency':
				valueA = a.model.performance.latency_ttft_ms;
				valueB = b.model.performance.latency_ttft_ms;
				break;
			case 'release_date':
				valueA = a.model.release_date;
				valueB = b.model.release_date;
				break;
			default:
				// Category scores
				if (sortBy in a.categoryScores) {
					valueA = a.categoryScores[sortBy];
					valueB = b.categoryScores[sortBy];
				}
		}

		// Handle nulls
		if (valueA === null && valueB === null) return 0;
		if (valueA === null) return 1;
		if (valueB === null) return -1;

		// Compare
		let result: number;
		if (typeof valueA === 'string' && typeof valueB === 'string') {
			result = valueA.localeCompare(valueB);
		} else {
			result = (valueA as number) - (valueB as number);
		}

		return sortOrder === 'asc' ? result : -result;
	});

	return sorted;
}

/**
 * Filter models based on criteria
 */
export function filterModels(
	rankedModels: RankedModel[],
	filters: {
		providers?: string[];
		types?: string[];
		priceRange?: [number, number];
		speedRange?: [number, number];
		dateRange?: 'all' | '30d' | '90d' | '180d';
		favoritesOnly?: boolean;
		favoriteIds?: string[];
	}
): RankedModel[] {
	return rankedModels.filter((ranked) => {
		const model = ranked.model;

		// Provider filter
		if (filters.providers && filters.providers.length > 0) {
			if (!filters.providers.includes(model.provider)) return false;
		}

		// Type filter
		if (filters.types && filters.types.length > 0) {
			if (!filters.types.includes(model.type)) return false;
		}

		// Price range filter
		if (filters.priceRange) {
			const [min, max] = filters.priceRange;
			if (model.pricing.average_per_1m < min || model.pricing.average_per_1m > max) {
				return false;
			}
		}

		// Speed range filter
		if (filters.speedRange) {
			const [min, max] = filters.speedRange;
			if (model.performance.output_speed_tps < min || model.performance.output_speed_tps > max) {
				return false;
			}
		}

		// Date range filter
		if (filters.dateRange && filters.dateRange !== 'all') {
			const now = new Date();
			const releaseDate = new Date(model.release_date);
			const daysDiff = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

			const maxDays = {
				'30d': 30,
				'90d': 90,
				'180d': 180
			}[filters.dateRange];

			if (daysDiff > maxDays) return false;
		}

		// Favorites filter
		if (filters.favoritesOnly && filters.favoriteIds) {
			if (!filters.favoriteIds.includes(model.id)) return false;
		}

		return true;
	});
}

/**
 * Format score for display
 */
export function formatScore(score: number | null, decimals = 1): string {
	if (score === null) return '—';
	return score.toFixed(decimals) + '%';
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
	if (price === 0) return 'Free';
	if (price < 1) return `$${price.toFixed(2)}`;
	return `$${price.toFixed(2)}`;
}

/**
 * Format speed for display
 */
export function formatSpeed(tps: number): string {
	if (tps >= 1000) {
		return `${(tps / 1000).toFixed(1)}k`;
	}
	return tps.toString();
}

/**
 * Get unique providers from models
 */
export function getUniqueProviders(models: Model[]): string[] {
	const providers = new Set(models.map((m) => m.provider));
	return Array.from(providers).sort();
}

/**
 * Get price range from models
 */
export function getPriceRange(models: Model[]): [number, number] {
	const prices = models.map((m) => m.pricing.average_per_1m);
	return [Math.min(...prices), Math.max(...prices)];
}

/**
 * Get speed range from models
 */
export function getSpeedRange(models: Model[]): [number, number] {
	const speeds = models.map((m) => m.performance.output_speed_tps);
	return [Math.min(...speeds), Math.max(...speeds)];
}
