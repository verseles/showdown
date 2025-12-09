// Global type declarations for Svelte components

declare global {
	interface Window {
		[key: string]: any;
	}
}

// Model type
export interface Model {
	id: string;
	name: string;
	provider: string;
	type: 'open-source' | 'proprietary';
	release_date: string;
	pricing: {
		input_per_1m: number;
		output_per_1m: number;
		average_per_1m: number;
	};
	performance: {
		output_speed_tps: number;
		latency_ttft_ms: number;
	};
	category_scores: Record<string, number>;
	benchmark_scores: Record<string, number>;
	overall_score?: number;
	rank?: number;
	editor_notes?: string;
}

// Category type
export interface Category {
	id: string;
	name: string;
	description: string;
	weight: number;
	emoji: string;
	benchmarks: Array<{
		id: string;
		name: string;
		type: 'elo' | 'score' | 'percentage';
		url: string;
		weight: number;
	}>;
}

// Benchmark type
export interface Benchmark {
	id: string;
	name: string;
	type: 'elo' | 'score' | 'percentage';
	url: string;
	weight: number;
}

// Data type
export interface ShowdownData {
	models: Model[];
	categories: Category[];
	meta: {
		version: string;
		last_update: string;
	};
}

export {};
