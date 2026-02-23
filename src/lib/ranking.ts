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

import type { Model, Category, Benchmark, RankedModel, ImputationConfidence } from './types.js';

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
	'inferior_of',
	'cross_model_average',
	'estimated',
	'manual'
] as const;

/**
 * Minimum superiority ratio (2% improvement minimum)
 */
export const MIN_SUPERIORITY_RATIO = 1.02;

/**
 * Maximum superiority ratio (10% improvement maximum)
 * Reduced from 1.20 to 1.10 to avoid artificially inflated imputed values
 */
export const MAX_SUPERIORITY_RATIO = 1.1;

/**
 * Default superiority ratio when no shared benchmarks exist (5% improvement)
 */
export const DEFAULT_SUPERIORITY_RATIO = 1.05;

/**
 * Ratio used when imputing BASE model scores from THINKING model values.
 * Base models without thinking are expected to perform ~10% worse.
 * Example: If thinking model has 78% on SWE-Bench, base gets 78 × 0.90 = 70.2%
 */
export const INFERIOR_OF_RATIO = 0.9;

/**
 * Maximum percentage for imputed values via superior_of method.
 * Prevents artificially perfect scores (100%) from imputation.
 * Set to 95% to ensure imputed values don't exceed realistic maximums.
 */
export const MAX_IMPUTED_PERCENTAGE = 95;

/**
 * Get confidence level based on number of benchmarks used
 * - 1-2 benchmarks: low confidence
 * - 3-5 benchmarks: medium confidence
 * - 6+ benchmarks: high confidence
 */
export function getConfidenceLevel(benchmarksUsed: number): ImputationConfidence {
	if (benchmarksUsed <= 2) return 'low';
	if (benchmarksUsed <= 5) return 'medium';
	return 'high';
}

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
 * Denormalize a 0-100 score back to Elo scale.
 * @param normalized - The normalized score (0-100)
 * @param min - Minimum expected Elo
 * @param max - Maximum expected Elo
 * @returns Raw Elo score
 */
export function denormalizeEloScore(normalized: number, min: number, max: number): number {
	return (normalized / 100) * (max - min) + min;
}

export interface SuperiorityResult {
	ratio: number;
	benchmarksUsed: number;
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
 * @returns Object with ratio and number of benchmarks used
 */
export function calculateSuperiorityRatio(
	superiorModel: Model,
	inferiorModel: Model,
	benchmarkById: Map<string, { benchmark: Benchmark; category: Category }>
): SuperiorityResult {
	let sumRatio = 0;
	let count = 0;

	for (const benchmarkId in superiorModel.benchmark_scores) {
		const superiorScore = superiorModel.benchmark_scores[benchmarkId];
		if (superiorScore === null) continue;

		const inferiorScore = inferiorModel.benchmark_scores[benchmarkId];

		// Both must have real values (not null/undefined)
		if (inferiorScore == null) continue;

		const benchmarkInfo = benchmarkById.get(benchmarkId);
		if (!benchmarkInfo) continue;
		const { benchmark } = benchmarkInfo;

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
				sumRatio += ratio;
				count++;
			}
		}
	}

	// If no shared benchmarks, use default ratio
	if (count === 0) {
		return { ratio: DEFAULT_SUPERIORITY_RATIO, benchmarksUsed: 0 };
	}

	// Calculate average ratio
	const avgRatio = sumRatio / count;

	// Clamp to [MIN, MAX]
	const clampedRatio = Math.min(MAX_SUPERIORITY_RATIO, Math.max(MIN_SUPERIORITY_RATIO, avgRatio));

	return { ratio: clampedRatio, benchmarksUsed: count };
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
	allModels: Model[] | Map<string, Model> = [],
	benchmarkToCategoryMap?: Map<string, Category>,
	benchmarkByIdMap?: Map<string, { benchmark: Benchmark; category: Category }>,
	imputationCache?: Map<string, Model>,
	baseToThinkingMap?: Map<string, Model>,
	todayDate?: string
): Model {
	// Check cache first
	if (imputationCache && imputationCache.has(model.id)) {
		return imputationCache.get(model.id)!;
	}

	// Create a copy of the model to avoid mutation
	const imputedModel: Model = {
		...model,
		benchmark_scores: { ...model.benchmark_scores },
		imputed_metadata: model.imputed_metadata ? { ...model.imputed_metadata } : {}
	};

	const today = todayDate ?? new Date().toISOString().slice(0, 10);

	// Ensure O(1) lookup
	const modelMap = Array.isArray(allModels) ? new Map(allModels.map((m) => [m.id, m])) : allModels;

	// Helper functions to abstract Map vs Array access
	const getModelById = (id: string): Model | undefined => {
		return modelMap.get(id);
	};

	const getAllModelsSize = (): number => {
		return modelMap.size;
	};

	const findModel = (predicate: (m: Model) => boolean): Model | undefined => {
		for (const m of modelMap.values()) {
			if (predicate(m)) return m;
		}
		return undefined;
	};

	// Use provided maps or build them if not provided (fallback/test mode)
	let benchmarkToCategory = benchmarkToCategoryMap;
	let benchmarkById = benchmarkByIdMap;

	if (!benchmarkToCategory || !benchmarkById) {
		benchmarkToCategory = new Map<string, Category>();
		benchmarkById = new Map<string, { benchmark: Benchmark; category: Category }>();
		for (const category of categories) {
			for (const benchmark of category.benchmarks) {
				benchmarkToCategory.set(benchmark.id, category);
				benchmarkById.set(benchmark.id, { benchmark, category });
			}
		}
	}

	// Helper: Walk up the superior_of chain to find a model with the benchmark value
	function findAncestorWithValue(
		benchmarkId: string,
		startModelId: string | undefined,
		maxDepth = 5
	): { model: Model; value: number } | null {
		let currentId = startModelId;
		let depth = 0;
		while (currentId && depth < maxDepth) {
			const ancestorModel = getModelById(currentId);
			if (!ancestorModel) break;

			const value = ancestorModel.benchmark_scores[benchmarkId];
			if (value != null) {
				return { model: ancestorModel, value };
			}

			currentId = ancestorModel.superior_of;
			depth++;
		}
		return null;
	}

	// STEP 1: Try superior_of imputation first (with cascade lookup)
	if (model.superior_of && getAllModelsSize() > 0) {
		const inferiorModel = getModelById(model.superior_of);
		if (inferiorModel) {
			const { ratio, benchmarksUsed } = calculateSuperiorityRatio(
				model,
				inferiorModel,
				benchmarkById
			);
			const confidence = getConfidenceLevel(benchmarksUsed);

			// Find missing benchmarks
			for (const benchmarkId of benchmarkById.keys()) {
				const score = model.benchmark_scores[benchmarkId];
				if (score !== null && score !== undefined) continue; // Skip non-null values

				// Try direct inferior first, then cascade up the chain
				let sourceModel = inferiorModel;
				let sourceValue = inferiorModel.benchmark_scores[benchmarkId];

				if (sourceValue == null) {
					// Cascade: look up the chain for an ancestor with this value
					const ancestor = findAncestorWithValue(benchmarkId, inferiorModel.superior_of, 4);
					if (ancestor) {
						sourceModel = ancestor.model;
						sourceValue = ancestor.value;
					}
				}

				if (sourceValue == null) continue; // No ancestor has it either

				const benchmarkInfo = benchmarkById.get(benchmarkId);
				if (!benchmarkInfo) continue;

				const { benchmark } = benchmarkInfo;

				// Calculate imputed value using superiority ratio
				let imputedValue: number;

				if (benchmark.type === 'elo' && benchmark.elo_range) {
					// For Elo scores, apply ratio to the NORMALIZED score
					const { min, max } = benchmark.elo_range;
					const normalizedSource = normalizeEloScore(sourceValue, min, max);
					const normalizedImputed = normalizedSource * ratio;

					// Denormalize back to Elo scale
					imputedValue = denormalizeEloScore(normalizedImputed, min, max);
					imputedValue = Math.min(max, imputedValue);
				} else {
					imputedValue = sourceValue * ratio;

					// Limit to maximum possible value
					// For percentage benchmarks, cap at MAX_IMPUTED_PERCENTAGE (95%) to avoid
					// artificially perfect scores from imputation
					if (benchmark.type === 'percentage') {
						imputedValue = Math.min(MAX_IMPUTED_PERCENTAGE, imputedValue);
					}
				}

				// Update the benchmark score
				imputedModel.benchmark_scores[benchmarkId] = imputedValue;

				// Note which model was the source
				const cascadeNote = sourceModel.id !== inferiorModel.id ? ` (via ${sourceModel.name})` : '';

				// Store metadata about the imputation
				imputedModel.imputed_metadata![benchmarkId] = {
					original_value: null,
					imputed_value: imputedValue,
					method: 'superior_of',
					imputed_date: today,
					note: `Estimated as superior to ${sourceModel.name}${cascadeNote} (ratio: ${ratio.toFixed(3)}, base: ${sourceValue.toFixed(1)})`,
					superior_of_model: sourceModel.id,
					superiority_ratio: ratio,
					confidence,
					benchmarks_used: benchmarksUsed
				};
			}
		}
	}

	// STEP 2: category_average for remaining missing benchmarks
	// Process per category to calculate average once and apply to all missing benchmarks
	// This ensures consistency and prevents order-dependent calculation (daisy-chaining)
	for (const category of categories) {
		let validSum = 0;
		let validCount = 0;
		let missingCount = 0;

		for (const benchmark of category.benchmarks) {
			// Only use values that are present in the original model OR imputed via superior_of
			// We do NOT use values imputed via category_average in the same pass
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
				validSum += normalizedScore;
				validCount++;
			} else {
				missingCount++;
			}
		}

		// If no missing benchmarks in this category, skip
		if (missingCount === 0) continue;

		// Count total benchmarks in category
		const totalBenchmarks = category.benchmarks.length;

		// Only impute if we have at least 50% (ceil) of benchmarks with values
		const minRequired = Math.ceil(totalBenchmarks * MIN_IMPUTATION_COVERAGE);
		if (validCount < minRequired) {
			continue;
		}

		// Calculate average of available scores in the category
		const average = validSum / validCount;
		const categoryConfidence = getConfidenceLevel(validCount);

		// Apply average to all missing benchmarks in this category
		for (const benchmark of category.benchmarks) {
			const rawScore = imputedModel.benchmark_scores[benchmark.id];

			// Skip benchmarks that already have values
			if (rawScore !== null && rawScore !== undefined) continue;

			const benchmarkId = benchmark.id;

			// Store the imputed value (keep it normalized in 0-100 scale for percentage types,
			// or denormalize back to Elo scale for Elo types)
			let imputedValue = average;

			if (benchmark.type === 'elo' && benchmark.elo_range) {
				// Denormalize back to Elo scale for storage
				const { min, max } = benchmark.elo_range;
				imputedValue = denormalizeEloScore(average, min, max);
			}

			// Update the benchmark score
			imputedModel.benchmark_scores[benchmarkId] = imputedValue;

			// Store metadata about the imputation
			imputedModel.imputed_metadata![benchmarkId] = {
				original_value: null,
				imputed_value: imputedValue,
				method: 'category_average',
				imputed_date: today,
				note: `Estimated from ${validCount} other benchmark${validCount > 1 ? 's' : ''} in ${category.name} category (avg: ${average.toFixed(2)})`,
				confidence: categoryConfidence,
				benchmarks_used: validCount
			};
		}
	}

	// STEP 3: inferior_of - Impute BASE model scores from THINKING (superior) models
	// If this model is referenced as superior_of by another model, use that model's values × INFERIOR_OF_RATIO
	if (getAllModelsSize() > 0) {
		let superiorModelRaw: Model | undefined;
		if (baseToThinkingMap) {
			superiorModelRaw = baseToThinkingMap.get(model.id);
		} else {
			superiorModelRaw = findModel((m) => m.superior_of === model.id);
		}

		if (superiorModelRaw) {
			// Recursively impute the superior model to ensure we have access to its imputed values
			// This allows the base model to inherit values that were imputed on the thinking model
			const superiorModel = imputeMissingScores(
				superiorModelRaw,
				categories,
				modelMap,
				benchmarkToCategory,
				benchmarkById,
				imputationCache,
				baseToThinkingMap,
				today
			);

			for (const benchmarkId in superiorModel.benchmark_scores) {
				const superiorValue = superiorModel.benchmark_scores[benchmarkId];
				const score = imputedModel.benchmark_scores[benchmarkId];
				if (score !== null && score !== undefined) continue; // Skip non-null values
				if (superiorValue == null) continue;

				const benchmarkInfo = benchmarkById.get(benchmarkId);
				if (!benchmarkInfo) continue;

				const { benchmark } = benchmarkInfo;

				let imputedValue: number;

				if (benchmark.type === 'elo' && benchmark.elo_range) {
					// For Elo scores, apply ratio to the NORMALIZED score
					const { min, max } = benchmark.elo_range;
					const normalizedSuperior = normalizeEloScore(superiorValue, min, max);
					const normalizedImputed = normalizedSuperior * INFERIOR_OF_RATIO;

					// Denormalize back to Elo scale
					imputedValue = denormalizeEloScore(normalizedImputed, min, max);
					imputedValue = Math.max(min, imputedValue);
				} else {
					imputedValue = superiorValue * INFERIOR_OF_RATIO;
				}

				imputedModel.benchmark_scores[benchmarkId] = imputedValue;

				imputedModel.imputed_metadata![benchmarkId] = {
					original_value: null,
					imputed_value: imputedValue,
					method: 'inferior_of',
					imputed_date: today,
					note: `Estimated as base of ${superiorModel.name} (${superiorValue.toFixed(1)} × ${INFERIOR_OF_RATIO})`,
					confidence: 'medium',
					benchmarks_used: 1
				};
			}
		}
	}

	if (imputationCache) {
		imputationCache.set(model.id, imputedModel);
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
export function calculateCategoryScore(
	model: Model,
	category: Category,
	totalWeightArg?: number
): number | null {
	let weightedSum = 0;
	let presentWeight = 0;
	const totalWeight = totalWeightArg ?? category.benchmarks.reduce((sum, b) => sum + b.weight, 0);

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
export function calculateOverallScore(
	model: Model,
	categories: Category[],
	precalculatedScores?: Record<string, number | null>
): number | null {
	let weightedSum = 0;
	let totalWeight = 0;
	let validCount = 0;

	for (const category of categories) {
		const score = precalculatedScores
			? (precalculatedScores[category.id] ?? null)
			: calculateCategoryScore(model, category);

		if (score !== null) {
			weightedSum += score * category.weight;
			totalWeight += category.weight;
			validCount++;
		}
	}

	// If fewer than 4 categories have scores, return null
	if (validCount < MIN_CATEGORIES_FOR_OVERALL) {
		return null;
	}

	if (totalWeight === 0) {
		return null;
	}

	return weightedSum / totalWeight;
}

/**
 * Get all category scores for a model
 */
export function getAllCategoryScores(
	model: Model,
	categories: Category[],
	categoryWeights?: Map<string, number>
): Record<string, number | null> {
	const scores: Record<string, number | null> = {};

	for (const category of categories) {
		const weight = categoryWeights?.get(category.id);
		scores[category.id] = calculateCategoryScore(model, category, weight);
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
	// Pre-compute lookup maps to avoid rebuilding them for every model
	const benchmarkToCategory = new Map<string, Category>();
	const benchmarkById = new Map<string, { benchmark: Benchmark; category: Category }>();
	const categoryWeights = new Map<string, number>();

	for (const category of categories) {
		categoryWeights.set(
			category.id,
			category.benchmarks.reduce((sum, b) => sum + b.weight, 0)
		);
		for (const benchmark of category.benchmarks) {
			benchmarkToCategory.set(benchmark.id, category);
			benchmarkById.set(benchmark.id, { benchmark, category });
		}
	}

	const baseToThinkingMap = new Map<string, Model>();
	for (const model of models) {
		if (model.superior_of) {
			baseToThinkingMap.set(model.superior_of, model);
		}
	}

	// First, impute missing scores and calculate metrics only for enabled models
	// We still pass the full 'models' array to imputeMissingScores for dependency lookups (superior_of)
	const imputationCache = new Map<string, Model>();
	const modelMap = new Map(models.map((m) => [m.id, m]));
	const today = new Date().toISOString().slice(0, 10);

	// Optimize: Combined filter and map into a single loop to avoid intermediate array allocation
	const activeModels: Omit<RankedModel, 'rank'>[] = [];

	for (const model of models) {
		if (model.disabled) continue;

		const imputedModel = imputeMissingScores(
			model,
			categories,
			modelMap,
			benchmarkToCategory,
			benchmarkById,
			imputationCache,
			baseToThinkingMap,
			today
		);

		const categoryScores = getAllCategoryScores(imputedModel, categories, categoryWeights);
		const overallScore = calculateOverallScore(imputedModel, categories, categoryScores);

		activeModels.push({
			model: imputedModel,
			overallScore,
			categoryScores,
			coverage: calculateBenchmarkCoverage(imputedModel, categories)
		});
	}

	// Sort by:
	// 1. Overall score (descending)
	// 2. Benchmark coverage (descending)
	// 3. Release date (descending)
	// 4. Name (alphabetical, ascending)
	activeModels.sort((a, b) => {
		// Null scores go to the end
		const aScore = a.overallScore;
		const bScore = b.overallScore;

		if (aScore !== null && bScore !== null) {
			// 1. Sort by score descending
			const scoreDiff = bScore - aScore;
			if (Math.abs(scoreDiff) > 0.001) {
				return scoreDiff;
			}
		} else if (aScore === null && bScore !== null) {
			return 1;
		} else if (aScore !== null && bScore === null) {
			return -1;
		}
		// If both are null, fall through to tie-breakers

		// 2. Tie-breaker: benchmark coverage
		const coverageDiff = b.coverage - a.coverage;
		if (Math.abs(coverageDiff) > 0.001) {
			return coverageDiff;
		}

		// 3. Tie-breaker: release date
		if (a.model.release_date !== b.model.release_date) {
			// Newer first (descending order)
			return a.model.release_date < b.model.release_date ? 1 : -1;
		}

		// 4. Tie-breaker: alphabetical by name
		return a.model.name.localeCompare(b.model.name);
	});

	// Assign ranks (handle ties)
	let currentRank = 1;
	let previousScore: number | null = null;

	return activeModels.map((item, index) => {
		if (item.overallScore !== null) {
			// Check if score is effectively different from previous (considering epsilon)
			// Matches the sort logic tolerance of 0.001
			if (previousScore === null || Math.abs(item.overallScore - previousScore) > 0.001) {
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

	// Extract value retrieval logic outside the sort loop for performance
	let getValue: (item: RankedModel) => number | string | null;

	switch (sortBy) {
		case 'rank':
		case 'overall':
			getValue = (item) => item.overallScore;
			break;
		case 'name':
			getValue = (item) => item.model.name;
			break;
		case 'provider':
			getValue = (item) => item.model.provider;
			break;
		case 'type':
			getValue = (item) => item.model.type;
			break;
		case 'price':
			getValue = (item) => item.model.pricing.average_per_1m;
			break;
		case 'speed':
			getValue = (item) => item.model.performance.output_speed_tps;
			break;
		case 'latency':
			getValue = (item) => item.model.performance.latency_ttft_ms;
			break;
		case 'release_date':
			getValue = (item) => item.model.release_date;
			break;
		default:
			// Category scores
			getValue = (item) => item.categoryScores[sortBy] ?? null;
	}

	sorted.sort((a, b) => {
		const valueA = getValue(a);
		const valueB = getValue(b);

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
		searchQuery?: string;
		providers?: string[];
		types?: string[];
		priceRange?: [number, number];
		speedRange?: [number, number];
		dateRange?: 'all' | '30d' | '90d' | '180d';
		favoritesOnly?: boolean;
		favoriteIds?: string[];
		referenceDate?: string | Date;
	}
): RankedModel[] {
	const query = filters.searchQuery?.toLowerCase().trim();

	// Pre-calculate date filter values to avoid recalculation in loop
	let minReleaseDateString: string | null = null;

	if (filters.dateRange && filters.dateRange !== 'all') {
		const now = filters.referenceDate ? new Date(filters.referenceDate) : new Date();
		const maxDays = {
			'30d': 30,
			'90d': 90,
			'180d': 180
		}[filters.dateRange];

		// Calculate cutoff timestamp
		const cutoffTimestamp = now.getTime() - maxDays * 24 * 60 * 60 * 1000;
		// Convert to ISO string YYYY-MM-DD for string comparison
		minReleaseDateString = new Date(cutoffTimestamp).toISOString().slice(0, 10);
	}

	return rankedModels.filter((ranked) => {
		const model = ranked.model;

		// Search query filter
		if (query) {
			const matches =
				model.name.toLowerCase().includes(query) ||
				model.provider.toLowerCase().includes(query) ||
				(model.aka?.some((alias) => alias.toLowerCase().includes(query)) ?? false);

			if (!matches) return false;
		}

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
		if (minReleaseDateString !== null) {
			if (model.release_date < minReleaseDateString) return false;
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
	const providers = new Set<string>();
	for (const model of models) {
		providers.add(model.provider);
	}
	return Array.from(providers).sort();
}

/**
 * Get price range from models
 */
export function getPriceRange(models: Model[]): [number, number] {
	if (models.length === 0) return [0, 0];
	let min = Infinity;
	let max = -Infinity;
	for (const model of models) {
		const price = model.pricing.average_per_1m;
		if (price < min) min = price;
		if (price > max) max = price;
	}
	return [min, max];
}

/**
 * Get speed range from models
 */
export function getSpeedRange(models: Model[]): [number, number] {
	if (models.length === 0) return [0, 0];
	let min = Infinity;
	let max = -Infinity;
	for (const model of models) {
		const speed = model.performance.output_speed_tps;
		if (speed < min) min = speed;
		if (speed > max) max = speed;
	}
	return [min, max];
}
