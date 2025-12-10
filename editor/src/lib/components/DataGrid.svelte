<script lang="ts">
	import { Grid } from '@svar-ui/svelte-grid';
	import { store, updateModel, deleteModel, duplicateModel } from '$lib/stores/data.svelte';
	import type { FlatModel } from '$lib/types';

	interface Props {
		theme?: 'light' | 'dark';
		onRowSelected?: (modelId: string | null) => void;
		highlightEmpty?: boolean;
		visibleColumns?: Set<string>;
	}

	let { theme = 'light', onRowSelected, highlightEmpty = false, visibleColumns }: Props = $props();

	let api: any = null;
	let selectedId = $state<string | null>(null);

	// Get unique providers from existing data
	const providers = $derived(() => {
		const existing = new Set(store.models.map((m) => m.provider).filter(Boolean));
		const common = [
			'Anthropic',
			'OpenAI',
			'Google',
			'DeepSeek',
			'Meta',
			'xAI',
			'Alibaba',
			'Mistral',
			'MiniMax',
			'Moonshot AI',
			'Meituan'
		];
		common.forEach((p) => existing.add(p));
		return Array.from(existing).sort();
	});

	// Get all column definitions
	function getAllColumns() {
		const cols: any[] = [
			// Actions column (frozen)
			{
				id: '_actions',
				header: '',
				width: 70,
				frozen: true,
				template: (_: unknown, row: FlatModel) => {
					return `<div class="row-actions">
						<button class="action-btn delete-btn" data-action="delete" data-id="${row.id}" title="Delete">🗑</button>
						<button class="action-btn duplicate-btn" data-action="duplicate" data-id="${row.id}" title="Duplicate">📋</button>
					</div>`;
				}
			},
			// Model name
			{
				id: 'name',
				header: 'Model',
				width: 200,
				editor: 'text',
				sort: true,
				frozen: true,
				css: (row: FlatModel) => (selectedId === row.id ? 'row-selected' : '')
			},
			// Provider with dynamic options
			{
				id: 'provider',
				header: 'Provider',
				width: 120,
				editor: 'combo',
				sort: true,
				options: providers(),
				suggest: true
			},
			// Type
			{
				id: 'type',
				header: 'Type',
				width: 110,
				editor: 'combo',
				sort: true,
				options: ['proprietary', 'open-source']
			},
			// Release date
			{
				id: 'release_date',
				header: 'Released',
				width: 110,
				editor: 'text',
				sort: true
			},
			// Pricing
			{
				id: 'pricing_input',
				header: '$/1M In',
				width: 85,
				editor: 'text',
				sort: true,
				template: (v: unknown) =>
					typeof v === 'number' ? `$${v.toFixed(2)}` : v != null ? String(v) : '',
				css: (row: FlatModel) => getCellClass(row, 'pricing_input')
			},
			{
				id: 'pricing_output',
				header: '$/1M Out',
				width: 85,
				editor: 'text',
				sort: true,
				template: (v: unknown) =>
					typeof v === 'number' ? `$${v.toFixed(2)}` : v != null ? String(v) : '',
				css: (row: FlatModel) => getCellClass(row, 'pricing_output')
			},
			{
				id: 'pricing_average',
				header: '$/1M Avg',
				width: 85,
				editor: 'text',
				sort: true,
				template: (v: unknown) =>
					typeof v === 'number' ? `$${v.toFixed(2)}` : v != null ? String(v) : '',
				css: (row: FlatModel) => getCellClass(row, 'pricing_average')
			},
			// Performance
			{
				id: 'speed',
				header: 'Speed (tok/s)',
				width: 100,
				editor: 'text',
				sort: true,
				css: (row: FlatModel) => getCellClass(row, 'speed')
			},
			{
				id: 'latency',
				header: 'Latency (ms)',
				width: 100,
				editor: 'text',
				sort: true,
				css: (row: FlatModel) => getCellClass(row, 'latency')
			}
		];

		// Add benchmark columns from categories
		for (const category of store.categories) {
			for (const benchmark of category.benchmarks) {
				cols.push({
					id: benchmark.id,
					header: `${category.emoji} ${benchmark.name.replace(' Verified', '').replace('LMArena ', '')}`,
					width: 95,
					editor: 'text',
					sort: true,
					categoryUrl: benchmark.url,
					template: (v: unknown) => {
						if (v === null || v === undefined) return '';
						if (typeof v !== 'number') return String(v);
						if (benchmark.type === 'percentage') {
							return `${v.toFixed(1)}%`;
						}
						return v.toString();
					},
					css: (row: FlatModel) => {
						const value = row[benchmark.id] as number | null;
						const hasError = store.validationErrors.some(
							(e) => e.modelId === row.id && e.field === benchmark.id
						);

						const classes: string[] = [];
						if (hasError) classes.push('cell-invalid');
						else if (value === null || value === undefined) {
							classes.push('cell-null');
							if (highlightEmpty) classes.push('cell-empty-highlight');
						} else if (benchmark.type === 'percentage') {
							if (value >= 90) classes.push('cell-high-score');
							else if (value < 50) classes.push('cell-low-score');
						}
						return classes.join(' ');
					}
				});
			}
		}

		// Editor notes at the end
		cols.push({
			id: 'editor_notes',
			header: 'Notes',
			width: 300,
			editor: 'text',
			sort: true
		});

		return cols;
	}

	// Get cell class based on state
	function getCellClass(row: FlatModel, field: string): string {
		const value = row[field as keyof FlatModel];
		const classes: string[] = [];

		if (value === null || value === undefined || value === '') {
			classes.push('cell-null');
			if (highlightEmpty) classes.push('cell-empty-highlight');
		}

		return classes.join(' ');
	}

	// Filter columns based on visibility settings
	const columns = $derived(() => {
		const all = getAllColumns();
		if (!visibleColumns || visibleColumns.size === 0) return all;
		return all.filter((c) => c.id === '_actions' || visibleColumns.has(c.id));
	});

	// Store column URL mapping for double-click
	const columnUrls = $derived(() => {
		const urls: Record<string, string> = {};
		for (const category of store.categories) {
			for (const benchmark of category.benchmarks) {
				if (benchmark.url) {
					urls[benchmark.id] = benchmark.url;
				}
			}
		}
		return urls;
	});

	// Handle action button clicks (delegated event)
	function handleGridClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const actionBtn = target.closest('[data-action]') as HTMLElement;

		if (actionBtn) {
			const action = actionBtn.dataset.action;
			const id = actionBtn.dataset.id;

			if (action === 'delete' && id) {
				const model = store.models.find((m) => m.id === id);
				if (model && confirm(`Delete "${model.name}"? This cannot be undone.`)) {
					deleteModel(id);
				}
			} else if (action === 'duplicate' && id) {
				duplicateModel(id);
			}
		}
	}

	// Handle double-click to open category URL
	function handleGridDblClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const cell = target.closest('[data-col]') as HTMLElement;

		if (cell) {
			const colId = cell.dataset.col;
			if (colId && columnUrls()[colId]) {
				window.open(columnUrls()[colId], '_blank');
			}
		}
	}

	// Initialize grid API
	function init(gridApi: any) {
		api = gridApi;

		// Handle cell updates
		api.on('update-cell', (ev: { id: string; key: string; value: any }) => {
			const { id, key, value } = ev;

			// Skip actions column
			if (key === '_actions') return;

			// Parse numeric values
			let parsedValue = value;
			if (
				key.startsWith('pricing_') ||
				key === 'speed' ||
				key === 'latency' ||
				store.categories.some((c) => c.benchmarks.some((b) => b.id === key))
			) {
				if (value === '' || value === null) {
					parsedValue = null;
				} else {
					const num = parseFloat(value);
					parsedValue = isNaN(num) ? null : num;
				}
			}

			updateModel(id, key, parsedValue);
		});

		// Handle row selection
		api.on('select-row', (ev: { id: string }) => {
			selectedId = ev.id;
			onRowSelected?.(ev.id);
		});
	}

	// Export methods for parent components
	export function getSelectedId(): string | null {
		return selectedId;
	}

	export function selectRow(id: string): void {
		api?.exec('select-row', { id });
	}

	export function exportToCsv(): void {
		const visibleCols = columns().filter((c: any) => c.id !== '_actions');
		const headers = visibleCols.map((c: any) => c.header).join(',');
		const rows = store.flatModels.map((row) =>
			visibleCols
				.map((c: any) => {
					const val = row[c.id as keyof FlatModel];
					if (val === null || val === undefined) return '';
					if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
					return val;
				})
				.join(',')
		);
		const csv = [headers, ...rows].join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `showdown-export-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Get list of all column IDs for visibility selector
	export function getColumnIds(): { id: string; header: string }[] {
		return getAllColumns()
			.filter((c) => c.id !== '_actions')
			.map((c) => ({ id: c.id, header: c.header }));
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="grid-wrapper"
	class:dark={theme === 'dark'}
	onclick={handleGridClick}
	ondblclick={handleGridDblClick}
>
	<Grid data={store.flatModels} columns={columns()} {init} />
</div>

<style>
	.grid-wrapper {
		width: 100%;
		height: 100%;
		--wx-font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		--wx-font-size: 13px;
	}

	/* Light theme variables */
	.grid-wrapper {
		--wx-background: var(--bg-primary, #ffffff);
		--wx-background-alt: var(--bg-secondary, #f8f9fa);
		--wx-color: var(--text-primary, #212529);
		--wx-color-secondary: var(--text-secondary, #495057);
		--wx-border-color: var(--border-color, #dee2e6);
	}

	/* Dark theme variables */
	.grid-wrapper.dark {
		--wx-background: var(--bg-primary, #1a1a2e);
		--wx-background-alt: var(--bg-secondary, #16213e);
		--wx-color: var(--text-primary, #e4e6eb);
		--wx-color-secondary: var(--text-secondary, #b0b3b8);
		--wx-border-color: var(--border-color, #3a3b3c);
	}

	/* Row actions buttons */
	:global(.row-actions) {
		display: flex;
		gap: 4px;
		justify-content: center;
		align-items: center;
	}

	:global(.action-btn) {
		padding: 2px 6px;
		font-size: 12px;
		background: transparent;
		border: 1px solid var(--border-color, #dee2e6);
		border-radius: 3px;
		cursor: pointer;
		opacity: 0.7;
		transition: all 0.15s ease;
	}

	:global(.action-btn:hover) {
		opacity: 1;
		background: var(--bg-hover, #f1f3f5);
	}

	:global(.delete-btn:hover) {
		background: var(--error-bg, #f8d7da);
		border-color: var(--error-color, #dc3545);
	}

	:global(.duplicate-btn:hover) {
		background: var(--info-bg, #d1ecf1);
		border-color: var(--info-color, #17a2b8);
	}

	.dark :global(.action-btn:hover) {
		background: var(--bg-hover, #1f4068);
	}

	.dark :global(.delete-btn:hover) {
		background: rgba(255, 107, 107, 0.2);
	}

	.dark :global(.duplicate-btn:hover) {
		background: rgba(77, 171, 247, 0.2);
	}

	/* Selected row styling */
	:global(.row-selected) {
		background-color: var(--accent-color, #0066cc) !important;
		color: white !important;
	}

	/* Cell styling */
	:global(.cell-invalid) {
		background-color: var(--error-bg, #f8d7da) !important;
		border-left: 3px solid var(--error-color, #dc3545) !important;
	}

	:global(.cell-null) {
		font-style: italic;
		color: var(--text-muted, #6c757d) !important;
	}

	:global(.cell-empty-highlight) {
		background-color: var(--warning-bg, #fff3cd) !important;
	}

	:global(.cell-high-score) {
		background-color: var(--success-bg, #d4edda) !important;
	}

	:global(.cell-low-score) {
		background-color: var(--error-bg, #f8d7da) !important;
	}

	/* Editing cell border highlight */
	:global(.wx-grid .wx-cell.wx-editing) {
		outline: 2px solid var(--accent-color, #0066cc) !important;
		outline-offset: -1px;
		box-shadow: 0 0 4px var(--accent-color, #0066cc);
	}

	.dark :global(.cell-null) {
		color: var(--text-muted, #8a8d91) !important;
	}

	.dark :global(.cell-empty-highlight) {
		background-color: rgba(252, 196, 25, 0.2) !important;
	}

	.dark :global(.cell-high-score) {
		background-color: rgba(81, 207, 102, 0.15) !important;
	}

	.dark :global(.cell-low-score) {
		background-color: rgba(255, 107, 107, 0.15) !important;
	}

	.dark :global(.cell-invalid) {
		background-color: rgba(255, 107, 107, 0.15) !important;
	}
</style>
