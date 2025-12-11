/**
 * Core ranking calculation engine for Showdown
 * Handles normalization, weighted averages, and null-safe scoring logic
 */

import type { Model, Category, Benchmark, RankedModel } from './types.js';

/**
 * Normalize an Elo score to a 0-100 scale
 */
export function normalizeEloScore(elo: number, min: number, max: number): number {
	if (max === min) return 50; // Avoid division by zero
	return ((elo - min) / (max - min)) * 100;
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
	if (weightedCoverage < 0.5) {
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
	if (categoryScores.length < 4) {
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
	// Calculate scores for all models
	const modelsWithScores = models.map((model) => ({
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
