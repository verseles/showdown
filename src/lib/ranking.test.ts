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
	getUniqueProviders
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

	it('should renormalize weights when some benchmarks are missing', () => {
		const modelPartial: Model = {
			...mockModel,
			benchmark_scores: { test_bench: 80 }
		};
		const score = calculateCategoryScore(modelPartial, mockCategory);
		// Only test_bench available, so score should be 80
		expect(score).toBe(80);
	});
});

describe('calculateOverallScore', () => {
	it('should calculate weighted average of categories', () => {
		const categories: Category[] = [mockCategory];
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
		const categories: Category[] = [mockCategory];

		const ranked = rankModels([model2, model1], categories);

		expect(ranked[0].model.id).toBe('model1');
		expect(ranked[1].model.id).toBe('model2');
		expect(ranked[0].rank).toBe(1);
		expect(ranked[1].rank).toBe(2);
	});

	it('should handle models with null scores', () => {
		const model1: Model = { ...mockModel, id: 'model1' };
		const modelNoScores: Model = { ...mockModel, id: 'model2', benchmark_scores: {} };
		const categories: Category[] = [mockCategory];

		const ranked = rankModels([modelNoScores, model1], categories);

		expect(ranked[0].model.id).toBe('model1');
		expect(ranked[1].model.id).toBe('model2');
		expect(ranked[1].rank).toBeNull();
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
