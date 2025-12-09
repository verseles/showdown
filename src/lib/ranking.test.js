import { describe, it, expect } from 'vitest';
import {
  normalizeEloScore,
  calculateCategoryScore,
  calculateOverallScore,
  rankModels,
  getCategoryBreakdown,
  getModelStats
} from './ranking.js';

describe('Ranking Engine', () => {
  describe('normalizeEloScore', () => {
    it('should normalize Elo 800 to 0%', () => {
      expect(normalizeEloScore(800, 800, 1400)).toBe(0);
    });

    it('should normalize Elo 1400 to 100%', () => {
      expect(normalizeEloScore(1400, 800, 1400)).toBe(100);
    });

    it('should normalize Elo 1100 to 50%', () => {
      expect(normalizeEloScore(1100, 800, 1400)).toBe(50);
    });

    it('should return null for null values', () => {
      expect(normalizeEloScore(null, 800, 1400)).toBeNull();
      expect(normalizeEloScore(1100, null, 1400)).toBeNull();
      expect(normalizeEloScore(1100, 800, null)).toBeNull();
    });
  });

  describe('calculateCategoryScore', () => {
    const mockModel = {
      benchmark_scores: {
        benchmark_1: 85,
        benchmark_2: 90,
        benchmark_3: null
      }
    };

    const mockCategory = {
      id: 'test',
      benchmarks: [
        { id: 'benchmark_1', type: 'percentage', weight: 0.5 },
        { id: 'benchmark_2', type: 'percentage', weight: 0.3 },
        { id: 'benchmark_3', type: 'percentage', weight: 0.2 }
      ]
    };

    it('should calculate weighted average with all values present', () => {
      const score = calculateCategoryScore(mockModel, mockCategory);
      // (85 * 0.5 + 90 * 0.3) / (0.5 + 0.3) = 86.875
      expect(score).toBeCloseTo(86.88, 1);
    });

    it('should renormalize weights when some benchmarks are null', () => {
      mockModel.benchmark_scores.benchmark_2 = null;
      const score = calculateCategoryScore(mockModel, mockCategory);
      // (85 * 0.5) / 0.5 = 85
      expect(score).toBe(85);
    });

    it('should return null when all benchmarks are null', () => {
      mockModel.benchmark_scores.benchmark_1 = null;
      const score = calculateCategoryScore(mockModel, mockCategory);
      expect(score).toBeNull();
    });

    it('should handle Elo benchmarks', () => {
      const modelWithElo = {
        benchmark_scores: {
          benchmark_1: 1200,
          benchmark_2: 1100,
          benchmark_3: null
        }
      };
      const categoryWithElo = {
        id: 'test',
        benchmarks: [
          { id: 'benchmark_1', type: 'elo', weight: 0.5, elo_range: { min: 800, max: 1400 } },
          { id: 'benchmark_2', type: 'elo', weight: 0.3, elo_range: { min: 800, max: 1400 } },
          { id: 'benchmark_3', type: 'percentage', weight: 0.2 }
        ]
      };

      const score = calculateCategoryScore(modelWithElo, categoryWithElo);
      // (66.67 * 0.5 + 50 * 0.3) / 0.8 = 60.42
      expect(score).toBeCloseTo(60.42, 1);
    });
  });

  describe('calculateOverallScore', () => {
    const mockModel = {
      benchmark_scores: {
        coding_1: 80,
        reasoning_1: 90,
        agents_1: null
      }
    };

    const mockCategories = [
      {
        id: 'coding',
        weight: 0.5,
        benchmarks: [{ id: 'coding_1', type: 'percentage', weight: 1.0 }]
      },
      {
        id: 'reasoning',
        weight: 0.3,
        benchmarks: [{ id: 'reasoning_1', type: 'percentage', weight: 1.0 }]
      },
      {
        id: 'agents',
        weight: 0.2,
        benchmarks: [{ id: 'agents_1', type: 'percentage', weight: 1.0 }]
      }
    ];

    it('should calculate overall score with weighted categories', () => {
      const score = calculateOverallScore(mockModel, mockCategories);
      // (80 * 0.5 + 90 * 0.3) / (0.5 + 0.3) = 83.75
      expect(score).toBeCloseTo(83.75, 1);
    });

    it('should exclude null categories and renormalize', () => {
      mockModel.benchmark_scores.reasoning_1 = null;
      const score = calculateOverallScore(mockModel, mockCategories);
      // (80 * 0.5) / 0.5 = 80
      expect(score).toBe(80);
    });

    it('should return null when all categories are null', () => {
      mockModel.benchmark_scores.coding_1 = null;
      const score = calculateOverallScore(mockModel, mockCategories);
      expect(score).toBeNull();
    });
  });

  describe('rankModels', () => {
    const mockCategories = [
      {
        id: 'coding',
        weight: 1.0,
        benchmarks: [{ id: 'coding_1', type: 'percentage', weight: 1.0 }]
      }
    ];

    it('should sort models by score in descending order', () => {
      const mockModels = [
        { id: 'model_a', name: 'Model A', benchmark_scores: { coding_1: 80 } },
        { id: 'model_b', name: 'Model B', benchmark_scores: { coding_1: 95 } },
        { id: 'model_c', name: 'Model C', benchmark_scores: { coding_1: 70 } }
      ];

      const ranked = rankModels(mockModels, mockCategories);

      expect(ranked[0].name).toBe('Model B');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].name).toBe('Model A');
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].name).toBe('Model C');
      expect(ranked[2].rank).toBe(3);
    });

    it('should break ties alphabetically', () => {
      const mockModels = [
        { id: 'model_z', name: 'Model Z', benchmark_scores: { coding_1: 90 } },
        { id: 'model_a', name: 'Model A', benchmark_scores: { coding_1: 90 } }
      ];

      const ranked = rankModels(mockModels, mockCategories);

      expect(ranked[0].name).toBe('Model A');
      expect(ranked[1].name).toBe('Model Z');
    });

    it('should handle null scores', () => {
      const mockModels = [
        { id: 'model_a', name: 'Model A', benchmark_scores: { coding_1: 80 } },
        { id: 'model_b', name: 'Model B', benchmark_scores: { coding_1: null } }
      ];

      const ranked = rankModels(mockModels, mockCategories);

      expect(ranked[0].name).toBe('Model A');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].name).toBe('Model B');
      expect(ranked[1].rank).toBeNull();
    });
  });

  describe('getCategoryBreakdown', () => {
    const mockModel = {
      benchmark_scores: {
        benchmark_1: 1200,
        benchmark_2: 85,
        benchmark_3: null
      }
    };

    const mockCategory = {
      id: 'test',
      benchmarks: [
        { id: 'benchmark_1', name: 'Benchmark 1', type: 'elo', weight: 0.5, url: 'http://example.com' },
        { id: 'benchmark_2', name: 'Benchmark 2', type: 'percentage', weight: 0.3, url: 'http://example.com' },
        { id: 'benchmark_3', name: 'Benchmark 3', type: 'percentage', weight: 0.2, url: 'http://example.com' }
      ]
    };

    it('should return breakdown with normalized scores', () => {
      const breakdown = getCategoryBreakdown(mockModel, mockCategory);

      expect(breakdown).toHaveLength(3);
      expect(breakdown[0].id).toBe('benchmark_1');
      expect(breakdown[0].name).toBe('Benchmark 1');
      expect(breakdown[0].score).toBe(1200);
      expect(breakdown[0].normalizedScore).toBeCloseTo(66.67, 1);
      expect(breakdown[0].type).toBe('elo');
      expect(breakdown[0].url).toBe('http://example.com');

      expect(breakdown[1].id).toBe('benchmark_2');
      expect(breakdown[1].name).toBe('Benchmark 2');
      expect(breakdown[1].score).toBe(85);
      expect(breakdown[1].normalizedScore).toBe(85);
      expect(breakdown[1].type).toBe('percentage');
      expect(breakdown[1].url).toBe('http://example.com');

      expect(breakdown[2].id).toBe('benchmark_3');
      expect(breakdown[2].name).toBe('Benchmark 3');
      expect(breakdown[2].score).toBe(null);
      expect(breakdown[2].normalizedScore).toBe(null);
      expect(breakdown[2].type).toBe('percentage');
      expect(breakdown[2].url).toBe('http://example.com');
    });
  });

  describe('getModelStats', () => {
    const mockModel = {
      benchmark_scores: {
        benchmark_1: 85,
        benchmark_2: null,
        benchmark_3: 90
      }
    };

    const mockCategories = [
      {
        id: 'category_1',
        benchmarks: [
          { id: 'benchmark_1', type: 'percentage', weight: 1.0 }
        ]
      },
      {
        id: 'category_2',
        benchmarks: [
          { id: 'benchmark_2', type: 'percentage', weight: 0.5 },
          { id: 'benchmark_3', type: 'percentage', weight: 0.5 }
        ]
      }
    ];

    it('should calculate completeness statistics', () => {
      const stats = getModelStats(mockModel, mockCategories);

      expect(stats.total).toBe(3);
      expect(stats.present).toBe(2);
      expect(stats.missing).toBe(1);
      expect(stats.percentage).toBeCloseTo(66.67, 1);
      expect(stats.categories).toEqual({
        category_1: { total: 1, present: 1, percentage: 100 },
        category_2: { total: 2, present: 1, percentage: 50 }
      });
    });
  });
});
