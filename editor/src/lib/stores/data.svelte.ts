/**
 * Reactive data store for Showdown Editor
 * Uses Svelte 5 runes with getter pattern for exports
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

// Internal state (not exported directly)
let _data = $state<ShowdownData | null>(null);
let _isLoading = $state(true);
let _hasUnsavedChanges = $state(false);
let _history = $state<HistoryEntry[]>([]);
let _historyIndex = $state(-1);
let _gitStatus = $state<GitStatus | null>(null);
let _notifications = $state<Notification[]>([]);
let _validationErrors = $state<ValidationError[]>([]);

const MAX_HISTORY = 50;

// Export state through a store object with getters
export const store = {
	get data() {
		return _data;
	},
	get isLoading() {
		return _isLoading;
	},
	get hasUnsavedChanges() {
		return _hasUnsavedChanges;
	},
	get history() {
		return _history;
	},
	get historyIndex() {
		return _historyIndex;
	},
	get gitStatus() {
		return _gitStatus;
	},
	get notifications() {
		return _notifications;
	},
	get validationErrors() {
		return _validationErrors;
	},
	get models() {
		return _data?.models ?? [];
	},
	get categories() {
		return _data?.categories ?? [];
	},
	get meta() {
		return _data?.meta ?? null;
	},
	get allBenchmarkIds() {
		return (_data?.categories ?? []).flatMap((cat) => cat.benchmarks.map((b) => b.id));
	},
	get providers() {
		const models = _data?.models ?? [];
		return [...new Set(models.map((m) => m.provider))].sort();
	},
	get flatModels() {
		return (_data?.models ?? []).map(flattenModel);
	}
};

// Convert model to flat structure for grid
export function flattenModel(model: Model): FlatModel {
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
export function unflattenModel(flat: FlatModel, existingModel?: Model): Model {
	const benchmarkScores: Record<string, number | null> = {};

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

// API functions
export async function loadData(): Promise<void> {
	_isLoading = true;
	try {
		const response = await fetch('/api/data');
		if (!response.ok) {
			throw new Error('Failed to load data');
		}
		_data = await response.json();
		_hasUnsavedChanges = false;
		_validationErrors = [];
		_history = [];
		_historyIndex = -1;
	} catch (error) {
		console.error('Failed to load data:', error);
		addNotification('error', 'Failed to load data from server');
		throw error;
	} finally {
		_isLoading = false;
	}
}

export async function saveData(): Promise<boolean> {
	if (!_data) return false;

	try {
		const response = await fetch('/api/data', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(_data)
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || 'Failed to save');
		}

		const result = await response.json();
		if (_data) {
			_data.meta = result.meta;
		}
		_hasUnsavedChanges = false;
		addNotification('success', 'Data saved successfully');
		return true;
	} catch (error) {
		console.error('Failed to save data:', error);
		addNotification('error', 'Failed to save data');
		return false;
	}
}

export async function refreshGitStatus(): Promise<void> {
	try {
		const response = await fetch('/api/git/status');
		if (response.ok) {
			_gitStatus = await response.json();
		}
	} catch (error) {
		console.error('Failed to get git status:', error);
	}
}

export async function commitChanges(message: string): Promise<boolean> {
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

export async function pushChanges(): Promise<boolean> {
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
	if (_historyIndex < _history.length - 1) {
		_history = _history.slice(0, _historyIndex + 1);
	}

	_history = [..._history.slice(-MAX_HISTORY + 1), { ...entry, timestamp: Date.now() }];
	_historyIndex = _history.length - 1;
}

export function updateModel(modelId: string, field: string, value: unknown): void {
	if (!_data) return;

	const modelIndex = _data.models.findIndex((m) => m.id === modelId);
	if (modelIndex === -1) return;

	const model = _data.models[modelIndex];
	let oldValue: unknown;

	// Handle nested fields
	if (field.startsWith('pricing_')) {
		const subField = field.replace('pricing_', '') as keyof Model['pricing'];
		if (
			subField === 'input_per_1m' ||
			subField === 'output_per_1m' ||
			subField === 'average_per_1m'
		) {
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
	} else if (field in model.benchmark_scores || store.allBenchmarkIds.includes(field)) {
		oldValue = model.benchmark_scores[field];
		model.benchmark_scores[field] = value as number | null;
	} else if (field === 'name') {
		oldValue = model.name;
		model.name = value as string;
	} else if (field === 'provider') {
		oldValue = model.provider;
		model.provider = value as string;
	} else if (field === 'type') {
		oldValue = model.type;
		model.type = value as 'proprietary' | 'open-source';
	} else if (field === 'release_date') {
		oldValue = model.release_date;
		model.release_date = value as string;
	} else if (field === 'editor_notes') {
		oldValue = model.editor_notes;
		model.editor_notes = value as string;
	}

	recordHistory({
		action: 'update',
		modelId,
		field,
		oldValue,
		newValue: value
	});

	_hasUnsavedChanges = true;
	validateModel(model);
}

export function addModel(template?: Partial<Model>): Model {
	if (!_data) throw new Error('Data not loaded');

	let baseId = template?.id || `new-model-${Date.now()}`;
	let id = baseId;
	let counter = 1;
	while (_data.models.some((m) => m.id === id)) {
		id = `${baseId}-${counter++}`;
	}

	const benchmarkScores: Record<string, number | null> = {};
	for (const cat of _data.categories) {
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

	_data.models = [..._data.models, newModel];

	recordHistory({
		action: 'add',
		modelId: id
	});

	_hasUnsavedChanges = true;
	return newModel;
}

export function deleteModel(modelId: string): boolean {
	if (!_data) return false;

	const modelIndex = _data.models.findIndex((m) => m.id === modelId);
	if (modelIndex === -1) return false;

	const deletedModel = _data.models[modelIndex];

	recordHistory({
		action: 'delete',
		modelId,
		oldValue: deletedModel
	});

	_data.models = _data.models.filter((m) => m.id !== modelId);
	_hasUnsavedChanges = true;
	_validationErrors = _validationErrors.filter((e) => e.modelId !== modelId);

	return true;
}

export function duplicateModel(modelId: string): Model | null {
	if (!_data) return null;

	const model = _data.models.find((m) => m.id === modelId);
	if (!model) return null;

	return addModel({
		...model,
		id: `${model.id}-copy`,
		name: `${model.name} (Copy)`
	});
}

// Undo/Redo
export function canUndo(): boolean {
	return _historyIndex >= 0;
}

export function canRedo(): boolean {
	return _historyIndex < _history.length - 1;
}

export function undo(): void {
	if (!canUndo() || !_data) return;

	const entry = _history[_historyIndex];

	if (entry.action === 'update' && entry.field) {
		const model = _data.models.find((m) => m.id === entry.modelId);
		if (model) {
			const field = entry.field;
			if (field.startsWith('pricing_')) {
				const subField = field.replace('pricing_', '') as keyof Model['pricing'];
				if (
					subField === 'input_per_1m' ||
					subField === 'output_per_1m' ||
					subField === 'average_per_1m'
				) {
					model.pricing[subField] = entry.oldValue as number;
				}
			} else if (field === 'speed') {
				model.performance.output_speed_tps = entry.oldValue as number;
			} else if (field === 'latency') {
				model.performance.latency_ttft_ms = entry.oldValue as number;
			} else if (field in model.benchmark_scores) {
				model.benchmark_scores[field] = entry.oldValue as number | null;
			} else if (field === 'name') {
				model.name = entry.oldValue as string;
			} else if (field === 'provider') {
				model.provider = entry.oldValue as string;
			} else if (field === 'type') {
				model.type = entry.oldValue as 'proprietary' | 'open-source';
			} else if (field === 'release_date') {
				model.release_date = entry.oldValue as string;
			} else if (field === 'editor_notes') {
				model.editor_notes = entry.oldValue as string;
			}
		}
	} else if (entry.action === 'add') {
		_data.models = _data.models.filter((m) => m.id !== entry.modelId);
	} else if (entry.action === 'delete' && entry.oldValue) {
		_data.models = [..._data.models, entry.oldValue as Model];
	}

	_historyIndex--;
	_hasUnsavedChanges = true;
}

export function redo(): void {
	if (!canRedo() || !_data) return;

	_historyIndex++;
	const entry = _history[_historyIndex];

	if (entry.action === 'update' && entry.field) {
		const model = _data.models.find((m) => m.id === entry.modelId);
		if (model) {
			const field = entry.field;
			if (field.startsWith('pricing_')) {
				const subField = field.replace('pricing_', '') as keyof Model['pricing'];
				if (
					subField === 'input_per_1m' ||
					subField === 'output_per_1m' ||
					subField === 'average_per_1m'
				) {
					model.pricing[subField] = entry.newValue as number;
				}
			} else if (field === 'speed') {
				model.performance.output_speed_tps = entry.newValue as number;
			} else if (field === 'latency') {
				model.performance.latency_ttft_ms = entry.newValue as number;
			} else if (field in model.benchmark_scores) {
				model.benchmark_scores[field] = entry.newValue as number | null;
			} else if (field === 'name') {
				model.name = entry.newValue as string;
			} else if (field === 'provider') {
				model.provider = entry.newValue as string;
			} else if (field === 'type') {
				model.type = entry.newValue as 'proprietary' | 'open-source';
			} else if (field === 'release_date') {
				model.release_date = entry.newValue as string;
			} else if (field === 'editor_notes') {
				model.editor_notes = entry.newValue as string;
			}
		}
	} else if (entry.action === 'add' && entry.oldValue) {
		_data.models = [..._data.models, entry.oldValue as Model];
	} else if (entry.action === 'delete') {
		_data.models = _data.models.filter((m) => m.id !== entry.modelId);
	}

	_hasUnsavedChanges = true;
}

// Validation
export function validateModel(model: Model): ValidationError[] {
	const errors: ValidationError[] = [];

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

	if (_data) {
		for (const cat of _data.categories) {
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

	_validationErrors = [..._validationErrors.filter((e) => e.modelId !== model.id), ...errors];

	return errors;
}

export function validateAllModels(): ValidationError[] {
	if (!_data) return [];

	_validationErrors = [];
	for (const model of _data.models) {
		validateModel(model);
	}
	return _validationErrors;
}

// Notifications
export function addNotification(type: Notification['type'], message: string): void {
	const notification: Notification = {
		id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
		type,
		message,
		timestamp: Date.now()
	};

	_notifications = [..._notifications, notification];

	setTimeout(() => {
		removeNotification(notification.id);
	}, 5000);
}

export function removeNotification(id: string): void {
	_notifications = _notifications.filter((n) => n.id !== id);
}

// Statistics
export function getStats() {
	if (!_data) return null;

	const totalModels = _data.models.length;
	const allBenchmarks = store.allBenchmarkIds;
	const totalBenchmarks = allBenchmarks.length;

	const coverageByModel = _data.models.map((model) => {
		const filled = Object.values(model.benchmark_scores).filter(
			(v) => v !== null && v !== undefined
		).length;
		return {
			model: model.name,
			coverage: totalBenchmarks > 0 ? (filled / totalBenchmarks) * 100 : 0
		};
	});

	const coverageByCategory = _data.categories.map((cat) => {
		const benchmarkIds = cat.benchmarks.map((b) => b.id);
		let total = 0;
		let filled = 0;

		for (const model of _data!.models) {
			for (const bid of benchmarkIds) {
				total++;
				if (model.benchmark_scores[bid] !== null && model.benchmark_scores[bid] !== undefined) {
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

	let totalScores = 0;
	let filledScores = 0;
	for (const model of _data.models) {
		for (const bid of allBenchmarks) {
			totalScores++;
			if (model.benchmark_scores[bid] !== null && model.benchmark_scores[bid] !== undefined) {
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
