import { describe, it, expect } from 'vitest';
import {
	normalizeEloScore,
	getBenchmarkScore,
	calculateCategoryScore,
	calculateOverallScore,
	rankModels,
	sortModels,
	filterModels,
	formatScore,
	formatPrice,
	formatSpeed,
	getUniqueProviders,
	imputeMissingScores,
	calculateSuperiorityRatio,
	getConfidenceLevel,
	MIN_SUPERIORITY_RATIO,
	MAX_SUPERIORITY_RATIO,
	DEFAULT_SUPERIORITY_RATIO
} from './ranking.js';
import type { Model, Category, Benchmark } from './types.js';

// Test fixtures
const mockBenchmark: Benchmark = {
	id: 'test_bench',
	name: 'Test Benchmark',
	type: 'percentage',
	weight: 0.5,
	url: 'https://test.com',
	description: 'Test description'
};

const mockEloBenchmark: Benchmark = {
	id: 'test_elo',
	name: 'Test Elo',
	type: 'elo',
	weight: 0.5,
	url: 'https://test.com',
	description: 'Test Elo description',
	elo_range: { min: 800, max: 1400 }
};

const mockCategory: Category = {
	id: 'coding',
	name: 'Coding',
	emoji: '💻',
	weight: 0.25,
	description: 'Coding tests',
	benchmarks: [mockBenchmark, mockEloBenchmark]
};

const mockModel: Model = {
	id: 'test-model',
	name: 'Test Model',
	provider: 'TestProvider',
	type: 'proprietary',
	release_date: '2025-01-01',
	pricing: {
		input_per_1m: 1.0,
		output_per_1m: 5.0,
		average_per_1m: 3.0
	},
	performance: {
		output_speed_tps: 100,
		latency_ttft_ms: 500,
		source: 'https://test.com'
	},
	editor_notes: 'Test notes',
	benchmark_scores: {
		test_bench: 80,
		test_elo: 1100
	}
};

describe('normalizeEloScore', () => {
	it('should normalize Elo score to 0-100 scale', () => {
		expect(normalizeEloScore(800, 800, 1400)).toBe(0);
		expect(normalizeEloScore(1400, 800, 1400)).toBe(100);
		expect(normalizeEloScore(1100, 800, 1400)).toBe(50);
	});

	it('should handle same min/max by returning 50', () => {
		expect(normalizeEloScore(1000, 1000, 1000)).toBe(50);
	});
});

describe('getBenchmarkScore', () => {
	it('should return percentage score directly', () => {
		const score = getBenchmarkScore(mockModel, mockBenchmark);
		expect(score).toBe(80);
	});

	it('should normalize Elo scores', () => {
		const score = getBenchmarkScore(mockModel, mockEloBenchmark);
		expect(score).toBe(50); // 1100 normalized between 800-1400
	});

	it('should return null for missing scores', () => {
		const modelWithMissing: Model = {
			...mockModel,
			benchmark_scores: {}
		};
		const score = getBenchmarkScore(modelWithMissing, mockBenchmark);
		expect(score).toBeNull();
	});

	it('should return null for null scores', () => {
		const modelWithNull: Model = {
			...mockModel,
			benchmark_scores: { test_bench: null as unknown as number }
		};
		const score = getBenchmarkScore(modelWithNull, mockBenchmark);
		expect(score).toBeNull();
	});
});

describe('imputeMissingScores', () => {
	it('should impute missing percentage benchmark using category average', () => {
		const benchmark1: Benchmark = {
			id: 'bench1',
			name: 'Benchmark 1',
			type: 'percentage',
			weight: 0.4,
			url: 'https://test.com',
			description: 'Test'
		};
		const benchmark2: Benchmark = {
			id: 'bench2',
			name: 'Benchmark 2',
			type: 'percentage',
			weight: 0.3,
			url: 'https://test.com',
			description: 'Test'
		};
		const benchmark3: Benchmark = {
			id: 'bench3',
			name: 'Benchmark 3 (missing)',
			type: 'percentage',
			weight: 0.3,
			url: 'https://test.com',
			description: 'Test'
		};

		const category: Category = {
			id: 'test',
			name: 'Test Category',
			emoji: '🧪',
			weight: 0.25,
			description: 'Test',
			benchmarks: [benchmark1, benchmark2, benchmark3]
		};

		const model: Model = {
			...mockModel,
			benchmark_scores: {
				bench1: 80,
				bench2: 60,
				bench3: null as unknown as number
			}
		};

		const imputed = imputeMissingScores(model, [category]);

		// Average of 80 and 60 = 70
		expect(imputed.benchmark_scores.bench3).toBe(70);
		expect(imputed.imputed_metadata).toBeDefined();
		expect(imputed.imputed_metadata!.bench3).toBeDefined();
		expect(imputed.imputed_metadata!.bench3.imputed_value).toBe(70);
		expect(imputed.imputed_metadata!.bench3.method).toBe('category_average');
	});

	it('should impute missing Elo benchmark using normalized category average', () => {
		const bench1: Benchmark = {
			id: 'elo1',
			name: 'Elo 1',
			type: 'elo',
			weight: 0.5,
			url: 'https://test.com',
			description: 'Test',
			elo_range: { min: 1000, max: 1500 }
		};
		const bench2: Benchmark = {
			id: 'elo2',
			name: 'Elo 2 (missing)',
			type: 'elo',
			weight: 0.5,
			url: 'https://test.com',
			description: 'Test',
			elo_range: { min: 1000, max: 1500 }
		};

		const category: Category = {
			id: 'test',
			name: 'Test',
			emoji: '🧪',
			weight: 0.25,
			description: 'Test',
			benchmarks: [bench1, bench2]
		};

		const model: Model = {
			...mockModel,
			benchmark_scores: {
				elo1: 1250, // Normalized: 50
				elo2: null as unknown as number
			}
		};

		const imputed = imputeMissingScores(model, [category]);

		// elo1 normalized = (1250-1000)/(1500-1000)*100 = 50
		// Average = 50
		// Denormalized back: 50/100 * (1500-1000) + 1000 = 1250
		expect(imputed.benchmark_scores.elo2).toBe(1250);
		expect(imputed.imputed_metadata!.elo2.imputed_value).toBe(1250);
	});

	it('should not impute if no other benchmarks available in category', () => {
		const bench1: Benchmark = {
			id: 'lone_bench',
			name: 'Lone Benchmark',
			type: 'percentage',
			weight: 1.0,
			url: 'https://test.com',
			description: 'Test'
		};

		const category: Category = {
			id: 'test',
			name: 'Test',
			emoji: '🧪',
			weight: 0.25,
			description: 'Test',
			benchmarks: [bench1]
		};

		const model: Model = {
			...mockModel,
			benchmark_scores: {
				lone_bench: null as unknown as number
			}
		};

		const imputed = imputeMissingScores(model, [category]);

		// Should remain null since no other benchmarks
		expect(imputed.benchmark_scores.lone_bench).toBeNull();
		expect(imputed.imputed_metadata).toEqual({});
	});

	it('should not mutate original model', () => {
		const category: Category = {
			id: 'test',
			name: 'Test',
			emoji: '🧪',
			weight: 0.25,
			description: 'Test',
			benchmarks: [mockBenchmark, mockEloBenchmark]
		};

		const original: Model = {
			...mockModel,
			benchmark_scores: {
				test_bench: 80,
				test_elo: null as unknown as number
			}
		};

		const imputed = imputeMissingScores(original, [category]);

		// Original should be unchanged
		expect(original.benchmark_scores.test_elo).toBeNull();
		expect(original.imputed_metadata).toBeUndefined();

		// Imputed should have the value
		expect(imputed.benchmark_scores.test_elo).not.toBeNull();
		expect(imputed.imputed_metadata).toBeDefined();
	});

	it('should NOT impute if less than 50% of benchmarks have real values', () => {
		const bench1: Benchmark = {
			id: 'bench1',
			name: 'Benchmark 1',
			type: 'percentage',
			weight: 0.25,
			url: 'https://test.com',
			description: 'Test'
		};
		const bench2: Benchmark = {
			id: 'bench2',
			name: 'Benchmark 2 (missing)',
			type: 'percentage',
			weight: 0.25,
			url: 'https://test.com',
			description: 'Test'
		};
		const bench3: Benchmark = {
			id: 'bench3',
			name: 'Benchmark 3 (missing)',
			type: 'percentage',
			weight: 0.25,
			url: 'https://test.com',
			description: 'Test'
		};
		const bench4: Benchmark = {
			id: 'bench4',
			name: 'Benchmark 4 (missing)',
			type: 'percentage',
			weight: 0.25,
			url: 'https://test.com',
			description: 'Test'
		};

		const category: Category = {
			id: 'test',
			name: 'Test',
			emoji: '🧪',
			weight: 0.25,
			description: 'Test',
			benchmarks: [bench1, bench2, bench3, bench4]
		};

		const model: Model = {
			...mockModel,
			benchmark_scores: {
				bench1: 80, // Only 1 of 4 benchmarks (25% < 50%)
				bench2: null as unknown as number,
				bench3: null as unknown as number,
				bench4: null as unknown as number
			}
		};

		const imputed = imputeMissingScores(model, [category]);

		// Should NOT impute since only 25% of benchmarks have real values (need 50%)
		// ceil(4/2) = 2 required, only have 1
		expect(imputed.benchmark_scores.bench2).toBeNull();
		expect(imputed.benchmark_scores.bench3).toBeNull();
		expect(imputed.benchmark_scores.bench4).toBeNull();
		expect(imputed.imputed_metadata).toEqual({});
	});

	it('should impute if exactly 50% of benchmarks have real values', () => {
		const bench1: Benchmark = {
			id: 'bench1',
			name: 'Benchmark 1',
			type: 'percentage',
			weight: 0.5,
			url: 'https://test.com',
			description: 'Test'
		};
		const bench2: Benchmark = {
			id: 'bench2',
			name: 'Benchmark 2 (missing)',
			type: 'percentage',
			weight: 0.5,
			url: 'https://test.com',
			description: 'Test'
		};

		const category: Category = {
			id: 'test',
			name: 'Test',
			emoji: '🧪',
			weight: 0.25,
			description: 'Test',
			benchmarks: [bench1, bench2]
		};

		const model: Model = {
			...mockModel,
			benchmark_scores: {
				bench1: 80, // 1 of 2 benchmarks (50%)
				bench2: null as unknown as number
			}
		};

		const imputed = imputeMissingScores(model, [category]);

		// SHOULD impute since 50% of benchmarks have real values
		// ceil(2/2) = 1 required, we have 1
		expect(imputed.benchmark_scores.bench2).toBe(80);
		expect(imputed.imputed_metadata!.bench2).toBeDefined();
	});

	it('should handle multiple categories correctly', () => {
		const category1: Category = {
			id: 'cat1',
			name: 'Category 1',
			emoji: '1️⃣',
			weight: 0.5,
			description: 'Test',
			benchmarks: [
				{
					id: 'cat1_bench1',
					name: 'Cat1 Bench1',
					type: 'percentage',
					weight: 0.5,
					url: 'https://test.com',
					description: 'Test'
				},
				{
					id: 'cat1_bench2',
					name: 'Cat1 Bench2 (missing)',
					type: 'percentage',
					weight: 0.5,
					url: 'https://test.com',
					description: 'Test'
				}
			]
		};

		const category2: Category = {
			id: 'cat2',
			name: 'Category 2',
			emoji: '2️⃣',
			weight: 0.5,
			description: 'Test',
			benchmarks: [
				{
					id: 'cat2_bench1',
					name: 'Cat2 Bench1',
					type: 'percentage',
					weight: 0.5,
					url: 'https://test.com',
					description: 'Test'
				},
				{
					id: 'cat2_bench2',
					name: 'Cat2 Bench2 (missing)',
					type: 'percentage',
					weight: 0.5,
					url: 'https://test.com',
					description: 'Test'
				}
			]
		};

		const model: Model = {
			...mockModel,
			benchmark_scores: {
				cat1_bench1: 90,
				cat1_bench2: null as unknown as number,
				cat2_bench1: 50,
				cat2_bench2: null as unknown as number
			}
		};

		const imputed = imputeMissingScores(model, [category1, category2]);

		// cat1_bench2 should be imputed from cat1_bench1 (90)
		expect(imputed.benchmark_scores.cat1_bench2).toBe(90);

		// cat2_bench2 should be imputed from cat2_bench1 (50)
		expect(imputed.benchmark_scores.cat2_bench2).toBe(50);

		expect(Object.keys(imputed.imputed_metadata!)).toHaveLength(2);
	});
});

describe('calculateCategoryScore', () => {
	it('should calculate weighted average of benchmarks', () => {
		const score = calculateCategoryScore(mockModel, mockCategory);
		// (80 * 0.5 + 50 * 0.5) / 1.0 = 65
		expect(score).toBe(65);
	});

	it('should return null when all benchmarks are missing', () => {
		const modelNoScores: Model = {
			...mockModel,
			benchmark_scores: {}
		};
		const score = calculateCategoryScore(modelNoScores, mockCategory);
		expect(score).toBeNull();
	});

	it('should penalize missing benchmarks by counting them as zero', () => {
		const modelPartial: Model = {
			...mockModel,
			benchmark_scores: { test_bench: 80 }
		};
		const score = calculateCategoryScore(modelPartial, mockCategory);
		// test_bench (weight 0.5) has score 80, test_elo (weight 0.5) is missing
		// presentWeight = 0.5, totalWeight = 1.0, coverage = 50% (exactly threshold)
		// weightedSum = 80 * 0.5 = 40, score = 40 / 1.0 = 40
		expect(score).toBe(40);
	});
});

describe('calculateOverallScore', () => {
	it('should calculate weighted average of categories when 4+ categories present', () => {
		// Need 4 categories minimum for overall score
		const cat1: Category = { ...mockCategory, id: 'cat1', weight: 0.25 };
		const cat2: Category = { ...mockCategory, id: 'cat2', weight: 0.25 };
		const cat3: Category = { ...mockCategory, id: 'cat3', weight: 0.25 };
		const cat4: Category = { ...mockCategory, id: 'cat4', weight: 0.25 };
		const categories: Category[] = [cat1, cat2, cat3, cat4];

		// Model with scores for all benchmarks in mockCategory (test_bench=80, test_elo=1100)
		// Each category score = (80 * 0.5 + 50 * 0.5) / 1.0 = 65
		const score = calculateOverallScore(mockModel, categories);
		expect(score).toBe(65);
	});

	it('should return null when no categories have scores', () => {
		const modelNoScores: Model = {
			...mockModel,
			benchmark_scores: {}
		};
		const categories: Category[] = [mockCategory];
		const score = calculateOverallScore(modelNoScores, categories);
		expect(score).toBeNull();
	});
});

describe('rankModels', () => {
	it('should rank models by overall score', () => {
		// Need 4 categories for overall score to be calculated
		const cat1: Category = { ...mockCategory, id: 'cat1', weight: 0.25 };
		const cat2: Category = { ...mockCategory, id: 'cat2', weight: 0.25 };
		const cat3: Category = { ...mockCategory, id: 'cat3', weight: 0.25 };
		const cat4: Category = { ...mockCategory, id: 'cat4', weight: 0.25 };
		const categories: Category[] = [cat1, cat2, cat3, cat4];

		const model1: Model = {
			...mockModel,
			id: 'model1',
			benchmark_scores: { test_bench: 90, test_elo: 1300 }
		};
		const model2: Model = {
			...mockModel,
			id: 'model2',
			benchmark_scores: { test_bench: 70, test_elo: 900 }
		};

		const ranked = rankModels([model2, model1], categories);

		expect(ranked[0].model.id).toBe('model1');
		expect(ranked[1].model.id).toBe('model2');
		expect(ranked[0].rank).toBe(1);
		expect(ranked[1].rank).toBe(2);
	});

	it('should handle models with null scores', () => {
		// Need 4 categories for overall score
		const cat1: Category = { ...mockCategory, id: 'cat1', weight: 0.25 };
		const cat2: Category = { ...mockCategory, id: 'cat2', weight: 0.25 };
		const cat3: Category = { ...mockCategory, id: 'cat3', weight: 0.25 };
		const cat4: Category = { ...mockCategory, id: 'cat4', weight: 0.25 };
		const categories: Category[] = [cat1, cat2, cat3, cat4];

		const model1: Model = { ...mockModel, id: 'model1' };
		const modelNoScores: Model = { ...mockModel, id: 'model2', benchmark_scores: {} };

		const ranked = rankModels([modelNoScores, model1], categories);

		expect(ranked[0].model.id).toBe('model1');
		expect(ranked[1].model.id).toBe('model2');
		expect(ranked[1].rank).toBeNull();
	});

	it('should sort multiple models with null scores by tie-breakers', () => {
		// Need 4 categories for overall score
		const cat1: Category = { ...mockCategory, id: 'cat1', weight: 0.25 };
		const cat2: Category = { ...mockCategory, id: 'cat2', weight: 0.25 };
		const cat3: Category = { ...mockCategory, id: 'cat3', weight: 0.25 };
		const cat4: Category = { ...mockCategory, id: 'cat4', weight: 0.25 };
		const categories: Category[] = [cat1, cat2, cat3, cat4];

		const modelNull1: Model = {
			...mockModel,
			id: 'modelNull1',
			name: 'Zeta',
			benchmark_scores: {}
		};
		const modelNull2: Model = {
			...mockModel,
			id: 'modelNull2',
			name: 'Alpha',
			benchmark_scores: {}
		};
		const modelScore: Model = {
			...mockModel,
			id: 'modelScore',
			name: 'Best',
			benchmark_scores: { test_bench: 100, test_elo: 1400 }
		};

		// Pass in mixed order
		const ranked = rankModels([modelNull1, modelScore, modelNull2], categories);

		expect(ranked[0].model.id).toBe('modelScore'); // Score comes first
		expect(ranked[1].model.id).toBe('modelNull2'); // Alpha (null)
		expect(ranked[2].model.id).toBe('modelNull1'); // Zeta (null)

		expect(ranked[1].rank).toBeNull();
		expect(ranked[2].rank).toBeNull();
	});
});

describe('sortModels', () => {
	it('should sort by specified column', () => {
		const model1: Model = { ...mockModel, id: 'model1', name: 'Beta' };
		const model2: Model = { ...mockModel, id: 'model2', name: 'Alpha' };
		const categories: Category[] = [mockCategory];
		const ranked = rankModels([model1, model2], categories);

		const sortedAsc = sortModels(ranked, 'name', 'asc');
		expect(sortedAsc[0].model.name).toBe('Alpha');

		const sortedDesc = sortModels(ranked, 'name', 'desc');
		expect(sortedDesc[0].model.name).toBe('Beta');
	});
});

describe('filterModels', () => {
	it('should filter by provider', () => {
		const model1: Model = { ...mockModel, id: 'model1', provider: 'Anthropic' };
		const model2: Model = { ...mockModel, id: 'model2', provider: 'OpenAI' };
		const categories: Category[] = [mockCategory];
		const ranked = rankModels([model1, model2], categories);

		const filtered = filterModels(ranked, { providers: ['Anthropic'] });

		expect(filtered).toHaveLength(1);
		expect(filtered[0].model.provider).toBe('Anthropic');
	});

	it('should filter by type', () => {
		const model1: Model = { ...mockModel, id: 'model1', type: 'proprietary' };
		const model2: Model = { ...mockModel, id: 'model2', type: 'open-source' };
		const categories: Category[] = [mockCategory];
		const ranked = rankModels([model1, model2], categories);

		const filtered = filterModels(ranked, { types: ['open-source'] });

		expect(filtered).toHaveLength(1);
		expect(filtered[0].model.type).toBe('open-source');
	});

	it('should filter by favorites', () => {
		const model1: Model = { ...mockModel, id: 'model1' };
		const model2: Model = { ...mockModel, id: 'model2' };
		const categories: Category[] = [mockCategory];
		const ranked = rankModels([model1, model2], categories);

		const filtered = filterModels(ranked, { favoritesOnly: true, favoriteIds: ['model1'] });

		expect(filtered).toHaveLength(1);
		expect(filtered[0].model.id).toBe('model1');
	});

	it('should filter by aka (alternative names)', () => {
		const model1: Model = {
			...mockModel,
			id: 'model1',
			name: 'Original Name',
			aka: ['Alias Name']
		};
		const model2: Model = { ...mockModel, id: 'model2', name: 'Other Name' };
		const categories: Category[] = [mockCategory];
		const ranked = rankModels([model1, model2], categories);

		// Use FilterState-like object partially since filterModels accepts a shape with optional fields
		const filtered = filterModels(ranked, {
			searchQuery: 'alias',
			providers: [],
			types: [],
			priceRange: [0, 100], // unused but required by type in some contexts, though here implementation treats optional
			speedRange: [0, 10000],
			dateRange: 'all',
			favoritesOnly: false
		});

		expect(filtered).toHaveLength(1);
		expect(filtered[0].model.id).toBe('model1');
	});

	it('should filter by date range using referenceDate', () => {
		const modelOld: Model = { ...mockModel, id: 'old', release_date: '2025-01-01' };
		const modelNew: Model = { ...mockModel, id: 'new', release_date: '2026-01-10' };
		const categories: Category[] = [mockCategory];
		const ranked = rankModels([modelOld, modelNew], categories);

		// Reference date: 2026-01-20
		// modelNew is 10 days old (Passes 30d filter)
		// modelOld is > 1 year old (Fails 30d filter)

		const filtered = filterModels(ranked, {
			dateRange: '30d',
			referenceDate: '2026-01-20',
			// Required fields by type
			searchQuery: '',
			providers: [],
			types: [],
			priceRange: [0, 100],
			speedRange: [0, 10000],
			favoritesOnly: false
		});

		expect(filtered).toHaveLength(1);
		expect(filtered[0].model.id).toBe('new');
	});
});

describe('formatScore', () => {
	it('should format score with percentage', () => {
		expect(formatScore(85.5)).toBe('85.5%');
	});

	it('should return dash for null', () => {
		expect(formatScore(null)).toBe('—');
	});

	it('should respect decimal places', () => {
		expect(formatScore(85.567, 2)).toBe('85.57%');
	});
});

describe('formatPrice', () => {
	it('should format price with dollar sign', () => {
		expect(formatPrice(5.5)).toBe('$5.50');
	});

	it('should show Free for zero price', () => {
		expect(formatPrice(0)).toBe('Free');
	});
});

describe('formatSpeed', () => {
	it('should format speed normally', () => {
		expect(formatSpeed(100)).toBe('100');
	});

	it('should use k suffix for thousands', () => {
		expect(formatSpeed(2500)).toBe('2.5k');
	});
});

describe('getUniqueProviders', () => {
	it('should return unique providers sorted', () => {
		const models: Model[] = [
			{ ...mockModel, provider: 'OpenAI' },
			{ ...mockModel, provider: 'Anthropic' },
			{ ...mockModel, provider: 'OpenAI' }
		];
		const providers = getUniqueProviders(models);
		expect(providers).toEqual(['Anthropic', 'OpenAI']);
	});
});

describe('Benchmark Modernization 2025', () => {
	it('should handle Knowledge category (renamed from multilingual)', () => {
		const knowledgeCategory: Category = {
			id: 'knowledge',
			name: 'Knowledge',
			emoji: '🧠',
			weight: 0.03,
			description: 'Knowledge assessment',
			benchmarks: [
				{
					id: 'mmlu_pro',
					name: 'MMLU-Pro',
					type: 'percentage',
					weight: 0.4,
					url: '',
					description: ''
				},
				{ id: 'mmmlu', name: 'MMMLU', type: 'percentage', weight: 0.4, url: '', description: '' }
			]
		};

		const model: Model = {
			...mockModel,
			benchmark_scores: { mmlu_pro: 80, mmmlu: 75 }
		};

		const score = calculateCategoryScore(model, knowledgeCategory);
		expect(score).toBe(77.5);
	});

	it('should handle Reasoning with LiveBench and HLE', () => {
		const reasoningCategory: Category = {
			id: 'reasoning',
			name: 'Reasoning',
			emoji: '🧠',
			weight: 0.25,
			description: 'Reasoning tests',
			benchmarks: [
				{
					id: 'gpqa_diamond',
					name: 'GPQA',
					type: 'percentage',
					weight: 0.4,
					url: '',
					description: ''
				},
				{
					id: 'livebench',
					name: 'LiveBench',
					type: 'percentage',
					weight: 0.1,
					url: '',
					description: ''
				},
				{
					id: 'humanity_last_exam',
					name: 'HLE',
					type: 'percentage',
					weight: 0.05,
					url: '',
					description: ''
				}
			]
		};

		const model: Model = {
			...mockModel,
			benchmark_scores: { gpqa_diamond: 90, livebench: 70, humanity_last_exam: 20 }
		};

		const score = calculateCategoryScore(model, reasoningCategory);
		// Sum of available weights = 0.4 + 0.1 + 0.05 = 0.55
		// Weighted sum = 90*0.4 + 70*0.1 + 20*0.05 = 36 + 7 + 1 = 44
		// Final = 44 / 0.55 = 80
		expect(score).toBeCloseTo(80);
	});
});

// ============================================
// getConfidenceLevel Tests
// ============================================

describe('getConfidenceLevel', () => {
	it('should return low for 0-2 benchmarks', () => {
		expect(getConfidenceLevel(0)).toBe('low');
		expect(getConfidenceLevel(1)).toBe('low');
		expect(getConfidenceLevel(2)).toBe('low');
	});

	it('should return medium for 3-5 benchmarks', () => {
		expect(getConfidenceLevel(3)).toBe('medium');
		expect(getConfidenceLevel(4)).toBe('medium');
		expect(getConfidenceLevel(5)).toBe('medium');
	});

	it('should return high for 6+ benchmarks', () => {
		expect(getConfidenceLevel(6)).toBe('high');
		expect(getConfidenceLevel(10)).toBe('high');
		expect(getConfidenceLevel(20)).toBe('high');
	});
});

// ============================================
// calculateSuperiorityRatio Tests
// ============================================

describe('calculateSuperiorityRatio', () => {
	const benchPercent1: Benchmark = {
		id: 'percent1',
		name: 'Percent 1',
		type: 'percentage',
		weight: 0.5,
		url: '',
		description: ''
	};

	const benchPercent2: Benchmark = {
		id: 'percent2',
		name: 'Percent 2',
		type: 'percentage',
		weight: 0.5,
		url: '',
		description: ''
	};

	const benchElo: Benchmark = {
		id: 'elo1',
		name: 'Elo 1',
		type: 'elo',
		weight: 0.5,
		url: '',
		description: '',
		elo_range: { min: 1000, max: 1500 }
	};

	const testCategory: Category = {
		id: 'test',
		name: 'Test',
		emoji: '🧪',
		weight: 1.0,
		description: 'Test',
		benchmarks: [benchPercent1, benchPercent2, benchElo]
	};

	it('should calculate ratio correctly for percentage benchmarks', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { percent1: 80, percent2: 60 }
		};

		const superiorModel: Model = {
			...mockModel,
			id: 'superior',
			benchmark_scores: { percent1: 88, percent2: 66 } // 10% better on both
		};

		const result = calculateSuperiorityRatio(superiorModel, baseModel, [testCategory]);
		// 88/80 = 1.1, 66/60 = 1.1 => average = 1.1
		expect(result.ratio).toBeCloseTo(1.1);
		expect(result.benchmarksUsed).toBe(2);
	});

	it('should clamp ratio to MIN when calculated ratio is too low', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { percent1: 80, percent2: 80 }
		};

		const superiorModel: Model = {
			...mockModel,
			id: 'superior',
			benchmark_scores: { percent1: 80, percent2: 80.5 } // Only 0.625% better
		};

		const result = calculateSuperiorityRatio(superiorModel, baseModel, [testCategory]);
		// (1.0 + 1.00625) / 2 = ~1.003 => clamped to MIN_SUPERIORITY_RATIO (1.02)
		expect(result.ratio).toBe(MIN_SUPERIORITY_RATIO);
		expect(result.benchmarksUsed).toBe(2);
	});

	it('should clamp ratio to MAX when calculated ratio is too high', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { percent1: 50, percent2: 50 }
		};

		const superiorModel: Model = {
			...mockModel,
			id: 'superior',
			benchmark_scores: { percent1: 75, percent2: 75 } // 50% better
		};

		const result = calculateSuperiorityRatio(superiorModel, baseModel, [testCategory]);
		// 75/50 = 1.5 => clamped to MAX_SUPERIORITY_RATIO (1.2)
		expect(result.ratio).toBe(MAX_SUPERIORITY_RATIO);
		expect(result.benchmarksUsed).toBe(2);
	});

	it('should return DEFAULT when no shared benchmarks exist', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { percent1: 80 }
		};

		const superiorModel: Model = {
			...mockModel,
			id: 'superior',
			benchmark_scores: { percent2: 85 } // No overlap
		};

		const result = calculateSuperiorityRatio(superiorModel, baseModel, [testCategory]);
		expect(result.ratio).toBe(DEFAULT_SUPERIORITY_RATIO);
		expect(result.benchmarksUsed).toBe(0);
	});

	it('should handle Elo benchmarks by normalizing before ratio', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { elo1: 1200 } // normalized: (1200-1000)/(1500-1000)*100 = 40
		};

		const superiorModel: Model = {
			...mockModel,
			id: 'superior',
			benchmark_scores: { elo1: 1300 } // normalized: (1300-1000)/(1500-1000)*100 = 60
		};

		const result = calculateSuperiorityRatio(superiorModel, baseModel, [testCategory]);
		// 60/40 = 1.5 => clamped to MAX
		expect(result.ratio).toBe(MAX_SUPERIORITY_RATIO);
		expect(result.benchmarksUsed).toBe(1);
	});

	it('should ignore benchmarks where superior is worse (ratio < 1.0)', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { percent1: 80, percent2: 70 }
		};

		const superiorModel: Model = {
			...mockModel,
			id: 'superior',
			benchmark_scores: { percent1: 72, percent2: 84 } // worse on percent1, 20% better on percent2
		};

		const result = calculateSuperiorityRatio(superiorModel, baseModel, [testCategory]);
		// percent1: 72/80 = 0.9 (ignored), percent2: 84/70 = 1.2
		// Only 84/70 = 1.2 is used => clamped to MAX (1.2)
		expect(result.ratio).toBe(MAX_SUPERIORITY_RATIO);
		expect(result.benchmarksUsed).toBe(1); // Only percent2 was used
	});

	it('should skip benchmarks where base has zero or null values', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { percent1: 0, percent2: null as unknown as number }
		};

		const superiorModel: Model = {
			...mockModel,
			id: 'superior',
			benchmark_scores: { percent1: 80, percent2: 90 }
		};

		const result = calculateSuperiorityRatio(superiorModel, baseModel, [testCategory]);
		// No valid comparisons => DEFAULT
		expect(result.ratio).toBe(DEFAULT_SUPERIORITY_RATIO);
		expect(result.benchmarksUsed).toBe(0);
	});
});

// ============================================
// imputeMissingScores with superior_of Tests
// ============================================

describe('imputeMissingScores with superior_of', () => {
	const bench1: Benchmark = {
		id: 'bench1',
		name: 'Benchmark 1',
		type: 'percentage',
		weight: 0.5,
		url: '',
		description: ''
	};

	const bench2: Benchmark = {
		id: 'bench2',
		name: 'Benchmark 2',
		type: 'percentage',
		weight: 0.5,
		url: '',
		description: ''
	};

	const benchElo: Benchmark = {
		id: 'elo_bench',
		name: 'Elo Benchmark',
		type: 'elo',
		weight: 0.5,
		url: '',
		description: '',
		elo_range: { min: 1000, max: 1500 }
	};

	const testCategory: Category = {
		id: 'test',
		name: 'Test',
		emoji: '🧪',
		weight: 1.0,
		description: 'Test',
		benchmarks: [bench1, bench2, benchElo]
	};

	it('should impute missing benchmark using superior_of relationship', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base-model',
			name: 'Base Model',
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking-model',
			name: 'Thinking Model',
			superior_of: 'base-model',
			benchmark_scores: { bench1: 88, bench2: null as unknown as number } // 10% better on bench1
		};

		const imputed = imputeMissingScores(thinkingModel, [testCategory], [baseModel, thinkingModel]);

		// Ratio: 88/80 = 1.1, imputed bench2 = 70 * 1.1 = 77
		expect(imputed.benchmark_scores.bench2).toBeCloseTo(77);
		expect(imputed.imputed_metadata).toBeDefined();
		expect(imputed.imputed_metadata!.bench2.method).toBe('superior_of');
		expect(imputed.imputed_metadata!.bench2.superior_of_model).toBe('base-model');
		expect(imputed.imputed_metadata!.bench2.superiority_ratio).toBeCloseTo(1.1);
	});

	it('should cap percentage values at 100', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base-model',
			benchmark_scores: { bench1: 95, bench2: 92 }
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking-model',
			superior_of: 'base-model',
			benchmark_scores: { bench1: 99, bench2: null as unknown as number }
		};

		const imputed = imputeMissingScores(thinkingModel, [testCategory], [baseModel, thinkingModel]);

		// Ratio: 99/95 = ~1.042, imputed bench2 = 92 * 1.042 = ~95.9
		// But if ratio was higher (e.g., 1.2), 92 * 1.2 = 110.4 => capped at 100
		expect(imputed.benchmark_scores.bench2).toBeLessThanOrEqual(100);
	});

	it('should cap Elo values at elo_range.max', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base-model',
			benchmark_scores: { elo_bench: 1450 }
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking-model',
			superior_of: 'base-model',
			benchmark_scores: {
				bench1: 85, // shared benchmark for ratio calculation
				elo_bench: null as unknown as number
			}
		};

		// Also add bench1 to base for ratio calc
		baseModel.benchmark_scores.bench1 = 80;

		const imputed = imputeMissingScores(thinkingModel, [testCategory], [baseModel, thinkingModel]);

		// Ratio: 85/80 = 1.0625
		// imputed elo = 1450 * 1.0625 = 1540.625 => capped at 1500
		expect(imputed.benchmark_scores.elo_bench).toBe(1500);
	});

	it('should prioritize superior_of over category_average', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base-model',
			benchmark_scores: { bench1: 80, bench2: 60 }
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking-model',
			superior_of: 'base-model',
			benchmark_scores: { bench1: 88, bench2: null as unknown as number } // Missing bench2
		};

		const imputed = imputeMissingScores(thinkingModel, [testCategory], [baseModel, thinkingModel]);

		// Should use superior_of (method: 'superior_of'), not category_average
		expect(imputed.imputed_metadata!.bench2.method).toBe('superior_of');

		// If it had used category_average, it would be 88 (same as bench1)
		// But with superior_of ratio 1.1, it should be 66
		expect(imputed.benchmark_scores.bench2).toBeCloseTo(66);
	});

	it('should fall back to category_average when base model lacks data', () => {
		// Use a category with only 2 benchmarks so 1 value = 50% coverage
		const simpleBench1: Benchmark = {
			id: 'simple1',
			name: 'Simple 1',
			type: 'percentage',
			weight: 0.5,
			url: '',
			description: ''
		};

		const simpleBench2: Benchmark = {
			id: 'simple2',
			name: 'Simple 2',
			type: 'percentage',
			weight: 0.5,
			url: '',
			description: ''
		};

		const simpleCategory: Category = {
			id: 'simple',
			name: 'Simple',
			emoji: '🧪',
			weight: 1.0,
			description: 'Test',
			benchmarks: [simpleBench1, simpleBench2]
		};

		const baseModel: Model = {
			...mockModel,
			id: 'base-model',
			benchmark_scores: { simple1: 80 } // Missing simple2
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking-model',
			superior_of: 'base-model',
			benchmark_scores: { simple1: 88, simple2: null as unknown as number }
		};

		const imputed = imputeMissingScores(
			thinkingModel,
			[simpleCategory],
			[baseModel, thinkingModel]
		);

		// Cannot use superior_of for simple2 (base doesn't have it)
		// Falls back to category_average using simple1 value (88)
		// With 2 benchmarks, 1 value = 50% coverage (ceil(2/2)=1)
		expect(imputed.benchmark_scores.simple2).toBe(88);
		expect(imputed.imputed_metadata!.simple2.method).toBe('category_average');
	});

	it('should handle missing superior_of model gracefully', () => {
		// Use a category with only 2 benchmarks so 1 value = 50% coverage
		const simpleBench1: Benchmark = {
			id: 'simple1',
			name: 'Simple 1',
			type: 'percentage',
			weight: 0.5,
			url: '',
			description: ''
		};

		const simpleBench2: Benchmark = {
			id: 'simple2',
			name: 'Simple 2',
			type: 'percentage',
			weight: 0.5,
			url: '',
			description: ''
		};

		const simpleCategory: Category = {
			id: 'simple',
			name: 'Simple',
			emoji: '🧪',
			weight: 1.0,
			description: 'Test',
			benchmarks: [simpleBench1, simpleBench2]
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking-model',
			superior_of: 'non-existent-model', // Model not in allModels
			benchmark_scores: { simple1: 88, simple2: null as unknown as number }
		};

		const imputed = imputeMissingScores(thinkingModel, [simpleCategory], [thinkingModel]);

		// Superior model not found, should fall back to category_average
		// With 2 benchmarks, 1 value = 50% coverage (ceil(2/2)=1)
		expect(imputed.benchmark_scores.simple2).toBe(88);
		expect(imputed.imputed_metadata!.simple2.method).toBe('category_average');
	});

	it('should store complete metadata for superior_of imputation', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'claude-base',
			name: 'Claude Base',
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'claude-thinking',
			name: 'Claude Thinking',
			superior_of: 'claude-base',
			benchmark_scores: { bench1: 88, bench2: null as unknown as number }
		};

		const imputed = imputeMissingScores(thinkingModel, [testCategory], [baseModel, thinkingModel]);

		const metadata = imputed.imputed_metadata!.bench2;

		expect(metadata.original_value).toBeNull();
		expect(metadata.imputed_value).toBeCloseTo(77);
		expect(metadata.method).toBe('superior_of');
		expect(metadata.imputed_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(metadata.note).toContain('Claude Base');
		expect(metadata.note).toContain('ratio');
		expect(metadata.superior_of_model).toBe('claude-base');
		expect(metadata.superiority_ratio).toBeCloseTo(1.1);
		expect(metadata.confidence).toBe('low'); // Only 1 shared benchmark
		expect(metadata.benchmarks_used).toBe(1);
	});

	it('should include confidence in category_average imputation', () => {
		// Use a category with only 2 benchmarks so 1 value = 50% coverage
		const simpleBench1: Benchmark = {
			id: 'simple1',
			name: 'Simple 1',
			type: 'percentage',
			weight: 0.5,
			url: '',
			description: ''
		};

		const simpleBench2: Benchmark = {
			id: 'simple2',
			name: 'Simple 2',
			type: 'percentage',
			weight: 0.5,
			url: '',
			description: ''
		};

		const simpleCategory: Category = {
			id: 'simple',
			name: 'Simple',
			emoji: '🧪',
			weight: 1.0,
			description: 'Test',
			benchmarks: [simpleBench1, simpleBench2]
		};

		const model: Model = {
			...mockModel,
			id: 'test-model',
			benchmark_scores: { simple1: 88, simple2: null as unknown as number }
		};

		const imputed = imputeMissingScores(model, [simpleCategory], [model]);

		const metadata = imputed.imputed_metadata!.simple2;

		expect(metadata.method).toBe('category_average');
		expect(metadata.confidence).toBe('low'); // Only 1 benchmark used
		expect(metadata.benchmarks_used).toBe(1);
	});

	it('should cascade through superior_of chain to find values', () => {
		// Simulates: pro -> thinking -> base chain
		// base has bench2, thinking doesn't, pro doesn't
		const baseModel: Model = {
			...mockModel,
			id: 'base-model',
			name: 'Base Model',
			benchmark_scores: { bench1: 80, bench2: 70 } // Has bench2
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking-model',
			name: 'Thinking Model',
			superior_of: 'base-model',
			benchmark_scores: { bench1: 88, bench2: null as unknown as number } // Missing bench2
		};

		const proModel: Model = {
			...mockModel,
			id: 'pro-model',
			name: 'Pro Model',
			superior_of: 'thinking-model',
			benchmark_scores: { bench1: 92, bench2: null as unknown as number } // Missing bench2
		};

		const imputed = imputeMissingScores(
			proModel,
			[testCategory],
			[baseModel, thinkingModel, proModel]
		);

		// pro looks at thinking for bench2 -> null
		// Cascades to base -> 70
		// Ratio based on pro vs thinking: 92/88 = 1.045
		// Imputed = 70 * 1.045 = ~73.2
		expect(imputed.benchmark_scores.bench2).toBeCloseTo(73.2, 0);
		expect(imputed.imputed_metadata!.bench2.method).toBe('superior_of');
		expect(imputed.imputed_metadata!.bench2.superior_of_model).toBe('base-model');
		expect(imputed.imputed_metadata!.bench2.note).toContain('via');
	});

	it('should not mutate original model when using superior_of', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const original: Model = {
			...mockModel,
			id: 'thinking',
			superior_of: 'base',
			benchmark_scores: { bench1: 88, bench2: null as unknown as number }
		};

		const imputed = imputeMissingScores(original, [testCategory], [baseModel, original]);

		// Original should be unchanged
		expect(original.benchmark_scores.bench2).toBeNull();
		expect(original.imputed_metadata).toBeUndefined();

		// Imputed should have values
		expect(imputed.benchmark_scores.bench2).not.toBeNull();
		expect(imputed.imputed_metadata).toBeDefined();
	});
});

// ============================================
// rankModels integration with superior_of Tests
// ============================================

describe('rankModels with superior_of integration', () => {
	const bench1: Benchmark = {
		id: 'bench1',
		name: 'Benchmark 1',
		type: 'percentage',
		weight: 0.5,
		url: '',
		description: ''
	};

	const bench2: Benchmark = {
		id: 'bench2',
		name: 'Benchmark 2',
		type: 'percentage',
		weight: 0.5,
		url: '',
		description: ''
	};

	const createCategory = (id: string): Category => ({
		id,
		name: `Category ${id}`,
		emoji: '🧪',
		weight: 0.25,
		description: 'Test',
		benchmarks: [bench1, bench2]
	});

	// Need 4 categories for overall score
	const categories = [
		createCategory('cat1'),
		createCategory('cat2'),
		createCategory('cat3'),
		createCategory('cat4')
	];

	it('should rank superior model higher when using imputed values', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base-model',
			name: 'Base Model',
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking-model',
			name: 'Thinking Model',
			superior_of: 'base-model',
			benchmark_scores: { bench1: 88, bench2: null as unknown as number }
		};

		const ranked = rankModels([baseModel, thinkingModel], categories);

		// Thinking model should be ranked higher (imputed bench2 = 70 * 1.1 = 77)
		// Thinking: (88 + 77) / 2 = 82.5 per category
		// Base: (80 + 70) / 2 = 75 per category
		expect(ranked[0].model.id).toBe('thinking-model');
		expect(ranked[1].model.id).toBe('base-model');
	});

	it('should include imputed_metadata in ranked model', () => {
		const baseModel: Model = {
			...mockModel,
			id: 'base',
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const thinkingModel: Model = {
			...mockModel,
			id: 'thinking',
			superior_of: 'base',
			benchmark_scores: { bench1: 88, bench2: null as unknown as number }
		};

		const ranked = rankModels([baseModel, thinkingModel], categories);

		const rankedThinking = ranked.find((r) => r.model.id === 'thinking')!;

		expect(rankedThinking.model.imputed_metadata).toBeDefined();
		expect(rankedThinking.model.imputed_metadata!.bench2).toBeDefined();
		expect(rankedThinking.model.imputed_metadata!.bench2.method).toBe('superior_of');
	});
});

describe('rankModels with disabled models', () => {
	const bench1: Benchmark = {
		id: 'bench1',
		name: 'Benchmark 1',
		type: 'percentage',
		weight: 0.5,
		url: '',
		description: ''
	};

	const bench2: Benchmark = {
		id: 'bench2',
		name: 'Benchmark 2',
		type: 'percentage',
		weight: 0.5,
		url: '',
		description: ''
	};

	const createCategory = (id: string): Category => ({
		id,
		name: `Category ${id}`,
		emoji: '🧪',
		weight: 0.25,
		description: 'Test',
		benchmarks: [bench1, bench2]
	});

	const categories = [
		createCategory('cat1'),
		createCategory('cat2'),
		createCategory('cat3'),
		createCategory('cat4')
	];

	it('should exclude disabled models from ranking results', () => {
		const activeModel: Model = {
			...mockModel,
			id: 'active-model',
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const disabledModel: Model = {
			...mockModel,
			id: 'disabled-model',
			disabled: true,
			benchmark_scores: { bench1: 90, bench2: 85 }
		};

		const ranked = rankModels([activeModel, disabledModel], categories);

		expect(ranked).toHaveLength(1);
		expect(ranked[0].model.id).toBe('active-model');
	});

	it('should still use disabled models for superior_of imputation', () => {
		const disabledBase: Model = {
			...mockModel,
			id: 'base-disabled',
			disabled: true,
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const activeThinking: Model = {
			...mockModel,
			id: 'thinking-active',
			superior_of: 'base-disabled',
			benchmark_scores: { bench1: 88, bench2: null as unknown as number }
		};

		const ranked = rankModels([disabledBase, activeThinking], categories);

		expect(ranked).toHaveLength(1);
		expect(ranked[0].model.id).toBe('thinking-active');
		expect(ranked[0].model.benchmark_scores.bench2).toBeCloseTo(77);
		expect(ranked[0].model.imputed_metadata?.bench2?.method).toBe('superior_of');
	});

	it('should handle models with disabled: false as active', () => {
		const explicitlyActive: Model = {
			...mockModel,
			id: 'explicit-active',
			disabled: false,
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const ranked = rankModels([explicitlyActive], categories);

		expect(ranked).toHaveLength(1);
		expect(ranked[0].model.id).toBe('explicit-active');
	});

	it('should handle models without disabled field as active', () => {
		const implicitlyActive: Model = {
			...mockModel,
			id: 'implicit-active',
			benchmark_scores: { bench1: 80, bench2: 70 }
		};

		const ranked = rankModels([implicitlyActive], categories);

		expect(ranked).toHaveLength(1);
		expect(ranked[0].model.id).toBe('implicit-active');
	});
});
