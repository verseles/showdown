/**
 * Type definitions for Showdown Editor
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

export interface ShowdownMeta {
	version: string;
	last_update: string;
	schema_version: string;
}

export interface ShowdownData {
	meta: ShowdownMeta;
	models: Model[];
	categories: Category[];
}

export interface GitStatus {
	modified: string[];
	staged: string[];
	ahead: number;
	behind: number;
	current: string;
	isClean: boolean;
}

export interface ValidationError {
	modelId: string;
	modelName: string;
	field: string;
	message: string;
	value: unknown;
}

export interface HistoryEntry {
	timestamp: number;
	action: 'update' | 'add' | 'delete';
	modelId: string;
	field?: string;
	oldValue?: unknown;
	newValue?: unknown;
}

export interface FlatModel {
	id: string;
	name: string;
	provider: string;
	type: 'proprietary' | 'open-source';
	release_date: string;
	pricing_input: number;
	pricing_output: number;
	pricing_average: number;
	speed: number;
	latency: number;
	speed_source: string;
	editor_notes: string;
	[key: string]: string | number | null; // For benchmark scores
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	timestamp: number;
}
