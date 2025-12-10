<script lang="ts">
	import { Grid } from '@svar-ui/svelte-grid';
	import { store, updateModel } from '$lib/stores/data.svelte';
	import type { FlatModel } from '$lib/types';

	interface Props {
		theme?: 'light' | 'dark';
		onRowSelected?: (modelId: string | null) => void;
	}

	let { theme = 'light', onRowSelected }: Props = $props();

	let api: any = null;
	let selectedId = $state<string | null>(null);

	// Build column definitions from categories
	function buildColumns() {
		const cols: any[] = [
			// Fixed columns
			{
				id: 'name',
				header: 'Model',
				width: 200,
				editor: 'text',
				frozen: true
			},
			{
				id: 'provider',
				header: 'Provider',
				width: 120,
				editor: 'richselect',
				options: [
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
				],
				frozen: true
			},
			{
				id: 'type',
				header: 'Type',
				width: 110,
				editor: 'richselect',
				options: ['proprietary', 'open-source']
			},
			{
				id: 'release_date',
				header: 'Released',
				width: 110,
				editor: 'text'
			},
			// Pricing
			{
				id: 'pricing_input',
				header: '$/1M In',
				width: 85,
				editor: 'text',
				template: (v: number | null) => (v != null ? `$${v.toFixed(2)}` : '')
			},
			{
				id: 'pricing_output',
				header: '$/1M Out',
				width: 85,
				editor: 'text',
				template: (v: number | null) => (v != null ? `$${v.toFixed(2)}` : '')
			},
			{
				id: 'pricing_average',
				header: '$/1M Avg',
				width: 85,
				editor: 'text',
				template: (v: number | null) => (v != null ? `$${v.toFixed(2)}` : '')
			},
			// Performance
			{
				id: 'speed',
				header: 'Speed (tok/s)',
				width: 100,
				editor: 'text'
			},
			{
				id: 'latency',
				header: 'Latency (ms)',
				width: 100,
				editor: 'text'
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
					template: (v: number | null) => {
						if (v === null || v === undefined) return '';
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

						if (hasError) return 'cell-invalid';
						if (value === null || value === undefined) return 'cell-null';
						if (benchmark.type === 'percentage') {
							if (value >= 90) return 'cell-high-score';
							if (value < 50) return 'cell-low-score';
						}
						return '';
					}
				});
			}
		}

		// Editor notes at the end
		cols.push({
			id: 'editor_notes',
			header: 'Notes',
			width: 300,
			editor: 'text'
		});

		return cols;
	}

	const columns = $derived(buildColumns());

	// Initialize grid API
	function init(gridApi: any) {
		api = gridApi;

		// Handle cell updates
		api.on('update-cell', (ev: { id: string; key: string; value: any }) => {
			const { id, key, value } = ev;

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
		// Manual CSV export
		const headers = columns.map((c: any) => c.header).join(',');
		const rows = store.flatModels.map((row) =>
			columns
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
</script>

<div class="grid-wrapper" class:dark={theme === 'dark'}>
	<Grid data={store.flatModels} {columns} {init} />
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

	/* Cell styling */
	:global(.cell-invalid) {
		background-color: var(--error-bg, #f8d7da) !important;
		border-left: 3px solid var(--error-color, #dc3545) !important;
	}

	:global(.cell-null) {
		background-color: var(--bg-tertiary, #e9ecef) !important;
		font-style: italic;
		color: var(--text-muted, #6c757d) !important;
	}

	:global(.cell-high-score) {
		background-color: var(--success-bg, #d4edda) !important;
	}

	:global(.cell-low-score) {
		background-color: var(--error-bg, #f8d7da) !important;
	}

	.dark :global(.cell-null) {
		background-color: var(--bg-tertiary, #0f3460) !important;
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
