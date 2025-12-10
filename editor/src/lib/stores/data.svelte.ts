/**
 * Reactive data store for Showdown Editor
 * Uses Svelte 5 runes for state management
 */

import type {
	ShowdownData,
	Model,
	FlatModel,
	ValidationError,
	HistoryEntry,
	GitStatus,
	Notification
} from '../types';

// State
let data = $state<ShowdownData | null>(null);
let isLoading = $state(true);
let hasUnsavedChanges = $state(false);
let history = $state<HistoryEntry[]>([]);
let historyIndex = $state(-1);
let gitStatus = $state<GitStatus | null>(null);
let notifications = $state<Notification[]>([]);
let validationErrors = $state<ValidationError[]>([]);

const MAX_HISTORY = 50;

// Derived state
const models = $derived(data?.models ?? []);
const categories = $derived(data?.categories ?? []);
const meta = $derived(data?.meta ?? null);

// Get all benchmark IDs from categories
const allBenchmarkIds = $derived(
	categories.flatMap((cat) => cat.benchmarks.map((b) => b.id))
);

// Get providers list
const providers = $derived([...new Set(models.map((m) => m.provider))].sort());

// Convert model to flat structure for grid
function flattenModel(model: Model): FlatModel {
	const flat: FlatModel = {
		id: model.id,
		name: model.name,
		provider: model.provider,
		type: model.type,
		release_date: model.release_date,
		pricing_input: model.pricing.input_per_1m,
		pricing_output: model.pricing.output_per_1m,
		pricing_average: model.pricing.average_per_1m,
		speed: model.performance.output_speed_tps,
		latency: model.performance.latency_ttft_ms,
		speed_source: model.performance.source,
		editor_notes: model.editor_notes
	};

	// Add all benchmark scores
	for (const [key, value] of Object.entries(model.benchmark_scores)) {
		flat[key] = value;
	}

	return flat;
}

// Convert flat structure back to model
function unflattenModel(flat: FlatModel, existingModel?: Model): Model {
	const benchmarkScores: Record<string, number | null> = {};

	// Extract benchmark scores (all keys not in base fields)
	const baseFields = new Set([
		'id',
		'name',
		'provider',
		'type',
		'release_date',
		'pricing_input',
		'pricing_output',
		'pricing_average',
		'speed',
		'latency',
		'speed_source',
		'editor_notes'
	]);

	for (const [key, value] of Object.entries(flat)) {
		if (!baseFields.has(key)) {
			benchmarkScores[key] = value as number | null;
		}
	}

	return {
		id: flat.id,
		name: flat.name,
		provider: flat.provider,
		type: flat.type as 'proprietary' | 'open-source',
		release_date: flat.release_date,
		pricing: {
			input_per_1m: flat.pricing_input,
			output_per_1m: flat.pricing_output,
			average_per_1m: flat.pricing_average
		},
		performance: {
			output_speed_tps: flat.speed,
			latency_ttft_ms: flat.latency,
			source: flat.speed_source
		},
		editor_notes: flat.editor_notes,
		benchmark_scores: existingModel
			? { ...existingModel.benchmark_scores, ...benchmarkScores }
			: benchmarkScores
	};
}

// Get flat models for grid
const flatModels = $derived(models.map(flattenModel));

// API functions
async function loadData(): Promise<void> {
	isLoading = true;
	try {
		const response = await fetch('/api/data');
		if (!response.ok) {
			throw new Error('Failed to load data');
		}
		data = await response.json();
		hasUnsavedChanges = false;
		validationErrors = [];
		history = [];
		historyIndex = -1;
	} catch (error) {
		console.error('Failed to load data:', error);
		addNotification('error', 'Failed to load data from server');
		throw error;
	} finally {
		isLoading = false;
	}
}

async function saveData(): Promise<boolean> {
	if (!data) return false;

	try {
		const response = await fetch('/api/data', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || 'Failed to save');
		}

		const result = await response.json();
		if (data) {
			data.meta = result.meta;
		}
		hasUnsavedChanges = false;
		addNotification('success', 'Data saved successfully');
		return true;
	} catch (error) {
		console.error('Failed to save data:', error);
		addNotification('error', 'Failed to save data');
		return false;
	}
}

async function refreshGitStatus(): Promise<void> {
	try {
		const response = await fetch('/api/git/status');
		if (response.ok) {
			gitStatus = await response.json();
		}
	} catch (error) {
		console.error('Failed to get git status:', error);
	}
}

async function commitChanges(message: string): Promise<boolean> {
	try {
		const response = await fetch('/api/git/commit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message })
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || 'Commit failed');
		}

		addNotification('success', `Committed: ${result.commit?.slice(0, 7) || 'success'}`);
		await refreshGitStatus();
		return true;
	} catch (error) {
		console.error('Commit failed:', error);
		const msg = error instanceof Error ? error.message : 'Unknown error';
		addNotification('error', `Commit failed: ${msg}`);
		return false;
	}
}

async function pushChanges(): Promise<boolean> {
	try {
		const response = await fetch('/api/git/push', {
			method: 'POST'
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || 'Push failed');
		}

		addNotification('success', 'Pushed to remote. Site will rebuild shortly.');
		await refreshGitStatus();
		return true;
	} catch (error) {
		console.error('Push failed:', error);
		const msg = error instanceof Error ? error.message : 'Unknown error';
		addNotification('error', `Push failed: ${msg}`);
		return false;
	}
}

// Data modification functions
function recordHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
	// Truncate future history if we're not at the end
	if (historyIndex < history.length - 1) {
		history = history.slice(0, historyIndex + 1);
	}

	history = [
		...history.slice(-MAX_HISTORY + 1),
		{ ...entry, timestamp: Date.now() }
	];
	historyIndex = history.length - 1;
}

function updateModel(modelId: string, field: string, value: unknown): void {
	if (!data) return;

	const modelIndex = data.models.findIndex((m) => m.id === modelId);
	if (modelIndex === -1) return;

	const model = data.models[modelIndex];
	let oldValue: unknown;

	// Handle nested fields
	if (field.startsWith('pricing_')) {
		const subField = field.replace('pricing_', '') as keyof Model['pricing'];
		if (subField === 'input_per_1m' || subField === 'output_per_1m' || subField === 'average_per_1m') {
			oldValue = model.pricing[subField];
			model.pricing[subField] = value as number;
		}
	} else if (field === 'speed') {
		oldValue = model.performance.output_speed_tps;
		model.performance.output_speed_tps = value as number;
	} else if (field === 'latency') {
		oldValue = model.performance.latency_ttft_ms;
		model.performance.latency_ttft_ms = value as number;
	} else if (field === 'speed_source') {
		oldValue = model.performance.source;
		model.performance.source = value as string;
	} else if (field in model.benchmark_scores || allBenchmarkIds.includes(field)) {
		oldValue = model.benchmark_scores[field];
		model.benchmark_scores[field] = value as number | null;
	} else if (field === 'name' || field === 'provider' || field === 'type' || field === 'release_date' || field === 'editor_notes') {
		oldValue = model[field];
		(model as Record<string, unknown>)[field] = value;
	}

	recordHistory({
		action: 'update',
		modelId,
		field,
		oldValue,
		newValue: value
	});

	hasUnsavedChanges = true;
	validateModel(model);
}

function addModel(template?: Partial<Model>): Model {
	if (!data) throw new Error('Data not loaded');

	// Generate unique ID
	let baseId = template?.id || `new-model-${Date.now()}`;
	let id = baseId;
	let counter = 1;
	while (data.models.some((m) => m.id === id)) {
		id = `${baseId}-${counter++}`;
	}

	// Create model with all benchmarks initialized to null
	const benchmarkScores: Record<string, number | null> = {};
	for (const cat of data.categories) {
		for (const b of cat.benchmarks) {
			benchmarkScores[b.id] = template?.benchmark_scores?.[b.id] ?? null;
		}
	}

	const newModel: Model = {
		id,
		name: template?.name || 'New Model',
		provider: template?.provider || '',
		type: template?.type || 'proprietary',
		release_date: template?.release_date || new Date().toISOString().split('T')[0],
		pricing: template?.pricing || {
			input_per_1m: 0,
			output_per_1m: 0,
			average_per_1m: 0
		},
		performance: template?.performance || {
			output_speed_tps: 0,
			latency_ttft_ms: 0,
			source: ''
		},
		editor_notes: template?.editor_notes || '',
		benchmark_scores: benchmarkScores
	};

	data.models = [...data.models, newModel];

	recordHistory({
		action: 'add',
		modelId: id
	});

	hasUnsavedChanges = true;
	return newModel;
}

function deleteModel(modelId: string): boolean {
	if (!data) return false;

	const modelIndex = data.models.findIndex((m) => m.id === modelId);
	if (modelIndex === -1) return false;

	const deletedModel = data.models[modelIndex];

	recordHistory({
		action: 'delete',
		modelId,
		oldValue: deletedModel
	});

	data.models = data.models.filter((m) => m.id !== modelId);
	hasUnsavedChanges = true;

	// Remove validation errors for deleted model
	validationErrors = validationErrors.filter((e) => e.modelId !== modelId);

	return true;
}

function duplicateModel(modelId: string): Model | null {
	if (!data) return null;

	const model = data.models.find((m) => m.id === modelId);
	if (!model) return null;

	return addModel({
		...model,
		id: `${model.id}-copy`,
		name: `${model.name} (Copy)`
	});
}

// Undo/Redo
function canUndo(): boolean {
	return historyIndex >= 0;
}

function canRedo(): boolean {
	return historyIndex < history.length - 1;
}

function undo(): void {
	if (!canUndo() || !data) return;

	const entry = history[historyIndex];

	if (entry.action === 'update' && entry.field) {
		const model = data.models.find((m) => m.id === entry.modelId);
		if (model) {
			// Restore old value without recording history
			const field = entry.field;
			if (field.startsWith('pricing_')) {
				const subField = field.replace('pricing_', '') as keyof Model['pricing'];
				if (subField === 'input_per_1m' || subField === 'output_per_1m' || subField === 'average_per_1m') {
					model.pricing[subField] = entry.oldValue as number;
				}
			} else if (field === 'speed') {
				model.performance.output_speed_tps = entry.oldValue as number;
			} else if (field === 'latency') {
				model.performance.latency_ttft_ms = entry.oldValue as number;
			} else if (field in model.benchmark_scores) {
				model.benchmark_scores[field] = entry.oldValue as number | null;
			} else {
				(model as Record<string, unknown>)[field] = entry.oldValue;
			}
		}
	} else if (entry.action === 'add') {
		data.models = data.models.filter((m) => m.id !== entry.modelId);
	} else if (entry.action === 'delete' && entry.oldValue) {
		data.models = [...data.models, entry.oldValue as Model];
	}

	historyIndex--;
	hasUnsavedChanges = true;
}

function redo(): void {
	if (!canRedo() || !data) return;

	historyIndex++;
	const entry = history[historyIndex];

	if (entry.action === 'update' && entry.field) {
		const model = data.models.find((m) => m.id === entry.modelId);
		if (model) {
			const field = entry.field;
			if (field.startsWith('pricing_')) {
				const subField = field.replace('pricing_', '') as keyof Model['pricing'];
				if (subField === 'input_per_1m' || subField === 'output_per_1m' || subField === 'average_per_1m') {
					model.pricing[subField] = entry.newValue as number;
				}
			} else if (field === 'speed') {
				model.performance.output_speed_tps = entry.newValue as number;
			} else if (field === 'latency') {
				model.performance.latency_ttft_ms = entry.newValue as number;
			} else if (field in model.benchmark_scores) {
				model.benchmark_scores[field] = entry.newValue as number | null;
			} else {
				(model as Record<string, unknown>)[field] = entry.newValue;
			}
		}
	} else if (entry.action === 'add' && entry.oldValue) {
		data.models = [...data.models, entry.oldValue as Model];
	} else if (entry.action === 'delete') {
		data.models = data.models.filter((m) => m.id !== entry.modelId);
	}

	hasUnsavedChanges = true;
}

// Validation
function validateModel(model: Model): ValidationError[] {
	const errors: ValidationError[] = [];

	// Required fields
	if (!model.name.trim()) {
		errors.push({
			modelId: model.id,
			modelName: model.name,
			field: 'name',
			message: 'Name is required',
			value: model.name
		});
	}

	if (!model.provider.trim()) {
		errors.push({
			modelId: model.id,
			modelName: model.name,
			field: 'provider',
			message: 'Provider is required',
			value: model.provider
		});
	}

	// Pricing validation
	if (model.pricing.input_per_1m < 0) {
		errors.push({
			modelId: model.id,
			modelName: model.name,
			field: 'pricing_input',
			message: 'Input price cannot be negative',
			value: model.pricing.input_per_1m
		});
	}

	if (model.pricing.output_per_1m < 0) {
		errors.push({
			modelId: model.id,
			modelName: model.name,
			field: 'pricing_output',
			message: 'Output price cannot be negative',
			value: model.pricing.output_per_1m
		});
	}

	// Benchmark score validation
	if (data) {
		for (const cat of data.categories) {
			for (const benchmark of cat.benchmarks) {
				const score = model.benchmark_scores[benchmark.id];
				if (score === null || score === undefined) continue;

				if (benchmark.type === 'percentage') {
					if (score < 0 || score > 100) {
						errors.push({
							modelId: model.id,
							modelName: model.name,
							field: benchmark.id,
							message: `${benchmark.name} must be between 0-100%`,
							value: score
						});
					}
				} else if (benchmark.type === 'elo' && benchmark.elo_range) {
					if (score < benchmark.elo_range.min || score > benchmark.elo_range.max) {
						errors.push({
							modelId: model.id,
							modelName: model.name,
							field: benchmark.id,
							message: `${benchmark.name} must be between ${benchmark.elo_range.min}-${benchmark.elo_range.max}`,
							value: score
						});
					}
				}
			}
		}
	}

	// Update global validation errors
	validationErrors = [
		...validationErrors.filter((e) => e.modelId !== model.id),
		...errors
	];

	return errors;
}

function validateAllModels(): ValidationError[] {
	if (!data) return [];

	validationErrors = [];
	for (const model of data.models) {
		validateModel(model);
	}
	return validationErrors;
}

// Notifications
function addNotification(type: Notification['type'], message: string): void {
	const notification: Notification = {
		id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		type,
		message,
		timestamp: Date.now()
	};

	notifications = [...notifications, notification];

	// Auto-remove after 5 seconds
	setTimeout(() => {
		removeNotification(notification.id);
	}, 5000);
}

function removeNotification(id: string): void {
	notifications = notifications.filter((n) => n.id !== id);
}

// Statistics
function getStats() {
	if (!data) return null;

	const totalModels = data.models.length;
	const totalBenchmarks = allBenchmarkIds.length;

	// Calculate coverage per model
	const coverageByModel = data.models.map((model) => {
		const filled = Object.values(model.benchmark_scores).filter(
			(v) => v !== null && v !== undefined
		).length;
		return {
			model: model.name,
			coverage: (filled / totalBenchmarks) * 100
		};
	});

	// Calculate coverage per category
	const coverageByCategory = data.categories.map((cat) => {
		const benchmarkIds = cat.benchmarks.map((b) => b.id);
		let total = 0;
		let filled = 0;

		for (const model of data.models) {
			for (const bid of benchmarkIds) {
				total++;
				if (
					model.benchmark_scores[bid] !== null &&
					model.benchmark_scores[bid] !== undefined
				) {
					filled++;
				}
			}
		}

		return {
			category: cat.name,
			emoji: cat.emoji,
			coverage: total > 0 ? (filled / total) * 100 : 0
		};
	});

	// Overall coverage
	let totalScores = 0;
	let filledScores = 0;
	for (const model of data.models) {
		for (const bid of allBenchmarkIds) {
			totalScores++;
			if (
				model.benchmark_scores[bid] !== null &&
				model.benchmark_scores[bid] !== undefined
			) {
				filledScores++;
			}
		}
	}

	return {
		totalModels,
		totalBenchmarks,
		overallCoverage: totalScores > 0 ? (filledScores / totalScores) * 100 : 0,
		coverageByModel,
		coverageByCategory,
		modelsWithLowCoverage: coverageByModel
			.filter((m) => m.coverage < 50)
			.sort((a, b) => a.coverage - b.coverage)
	};
}

// Export everything
export {
	// State (getters)
	data,
	isLoading,
	hasUnsavedChanges,
	history,
	historyIndex,
	gitStatus,
	notifications,
	validationErrors,
	// Derived
	models,
	categories,
	meta,
	allBenchmarkIds,
	providers,
	flatModels,
	// Functions
	loadData,
	saveData,
	refreshGitStatus,
	commitChanges,
	pushChanges,
	updateModel,
	addModel,
	deleteModel,
	duplicateModel,
	canUndo,
	canRedo,
	undo,
	redo,
	validateModel,
	validateAllModels,
	addNotification,
	removeNotification,
	getStats,
	flattenModel,
	unflattenModel
};
