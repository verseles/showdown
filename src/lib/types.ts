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

export type ImputationConfidence = 'low' | 'medium' | 'high';

export interface ImputedMetadata {
	original_value: null;
	imputed_value: number;
	method:
		| 'category_average'
		| 'superior_of'
		| 'inferior_of'
		| 'cross_model_average'
		| 'estimated'
		| 'manual';
	imputed_date: string;
	note: string;
	/** ID of the inferior model (only when method='superior_of') */
	superior_of_model?: string;
	/** Calculated superiority ratio (only when method='superior_of') */
	superiority_ratio?: number;
	/** Confidence level based on data used for estimation */
	confidence?: ImputationConfidence;
	/** Number of benchmarks used to calculate the estimate */
	benchmarks_used?: number;
}

export interface Model {
	id: string;
	name: string;
	provider: string;
	type: 'proprietary' | 'open-source';
	release_date: string;
	/** If true, model is excluded from rankings and display */
	disabled?: boolean;
	/** ID of the base model this is superior to (for thinking/enhanced variants) */
	superior_of?: string;
	/** Alternative names for this model (for benchmark matching) */
	aka?: string[];
	pricing: Pricing;
	performance: Performance;
	editor_notes: string;
	benchmark_scores: Record<string, number | null>;
	imputed_metadata?: Record<string, ImputedMetadata>;
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
	searchQuery: string;
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
	knowledge: boolean;
	price: boolean;
	speed: boolean;
	latency: boolean;
	release_date: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type Locale = 'en' | 'pt' | 'zh' | 'es' | 'ar' | 'id' | 'ru' | 'de' | 'fr' | 'ja';
