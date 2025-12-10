/**
 * Type definitions for Showdown LLM Rankings
 */

export interface Pricing {
	input_per_1m: number;
	output_per_1m: number;
	average_per_1m: number;
}

export interface Performance {
	output_speed_tps: number;
	latency_ttft_ms: number;
	source: string;
}

export interface Model {
	id: string;
	name: string;
	provider: string;
	type: 'proprietary' | 'open-source';
	release_date: string;
	pricing: Pricing;
	performance: Performance;
	editor_notes: string;
	benchmark_scores: Record<string, number | null>;
}

export interface EloRange {
	min: number;
	max: number;
}

export interface Benchmark {
	id: string;
	name: string;
	type: 'percentage' | 'elo';
	weight: number;
	url: string;
	description: string;
	elo_range?: EloRange;
}

export interface Category {
	id: string;
	name: string;
	emoji: string;
	weight: number;
	description: string;
	benchmarks: Benchmark[];
}

export interface ShowdownData {
	meta: {
		version: string;
		last_update: string;
		schema_version: string;
	};
	models: Model[];
	categories: Category[];
}

export interface RankedModel {
	rank: number | null;
	model: Model;
	overallScore: number | null;
	categoryScores: Record<string, number | null>;
	coverage: number;
}

export interface FilterState {
	providers: string[];
	types: string[];
	priceRange: [number, number];
	speedRange: [number, number];
	dateRange: 'all' | '30d' | '90d' | '180d';
	favoritesOnly: boolean;
}

export interface SortState {
	sortBy: string;
	sortOrder: 'asc' | 'desc';
}

export interface ColumnVisibility {
	rank: boolean;
	provider: boolean;
	model: boolean;
	type: boolean;
	coding: boolean;
	reasoning: boolean;
	agents: boolean;
	conversation: boolean;
	math: boolean;
	multimodal: boolean;
	multilingual: boolean;
	price: boolean;
	speed: boolean;
	latency: boolean;
	release_date: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type Locale = 'en' | 'pt' | 'zh' | 'es' | 'ar' | 'id' | 'ru' | 'de' | 'fr' | 'ja';
