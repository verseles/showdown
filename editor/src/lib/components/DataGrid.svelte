<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createGrid, type GridApi, type GridOptions, type ColDef, type ColGroupDef, type CellValueChangedEvent, type RowSelectedEvent } from 'ag-grid-community';
	import 'ag-grid-community/styles/ag-grid.css';
	import 'ag-grid-community/styles/ag-theme-alpine.css';
	import {
		flatModels,
		categories,
		updateModel,
		validationErrors,
		allBenchmarkIds
	} from '$lib/stores/data.svelte';
	import type { FlatModel, Category, Benchmark } from '$lib/types';

	interface Props {
		theme?: 'light' | 'dark';
		onRowSelected?: (modelId: string | null) => void;
		onCellContextMenu?: (event: MouseEvent, modelId: string, field: string) => void;
	}

	let { theme = 'light', onRowSelected, onCellContextMenu }: Props = $props();

	let gridContainer: HTMLDivElement;
	let gridApi: GridApi<FlatModel> | null = null;

	// Build column definitions from categories
	function buildColumnDefs(): (ColDef<FlatModel> | ColGroupDef<FlatModel>)[] {
		const columns: (ColDef<FlatModel> | ColGroupDef<FlatModel>)[] = [
			// Fixed columns
			{
				field: 'name',
				headerName: 'Model',
				pinned: 'left',
				width: 200,
				editable: true,
				cellClass: (params) => {
					const errors = validationErrors.filter(
						(e) => e.modelId === params.data?.id && e.field === 'name'
					);
					return errors.length > 0 ? 'cell-invalid' : '';
				}
			},
			{
				field: 'provider',
				headerName: 'Provider',
				pinned: 'left',
				width: 120,
				editable: true,
				cellEditor: 'agSelectCellEditor',
				cellEditorParams: {
					values: ['Anthropic', 'OpenAI', 'Google', 'DeepSeek', 'Meta', 'xAI', 'Alibaba', 'Mistral', 'MiniMax', 'Moonshot AI', 'Meituan']
				}
			},
			{
				field: 'type',
				headerName: 'Type',
				width: 110,
				editable: true,
				cellEditor: 'agSelectCellEditor',
				cellEditorParams: {
					values: ['proprietary', 'open-source']
				}
			},
			{
				field: 'release_date',
				headerName: 'Released',
				width: 110,
				editable: true
			},
			// Pricing group
			{
				headerName: '💰 Pricing ($/1M)',
				children: [
					{
						field: 'pricing_input',
						headerName: 'Input',
						width: 80,
						editable: true,
						type: 'numericColumn',
						valueFormatter: (params) =>
							params.value != null ? `$${params.value.toFixed(2)}` : '',
						cellClass: (params) => {
							const errors = validationErrors.filter(
								(e) => e.modelId === params.data?.id && e.field === 'pricing_input'
							);
							return errors.length > 0 ? 'cell-invalid' : '';
						}
					},
					{
						field: 'pricing_output',
						headerName: 'Output',
						width: 80,
						editable: true,
						type: 'numericColumn',
						valueFormatter: (params) =>
							params.value != null ? `$${params.value.toFixed(2)}` : ''
					},
					{
						field: 'pricing_average',
						headerName: 'Avg',
						width: 80,
						editable: true,
						type: 'numericColumn',
						valueFormatter: (params) =>
							params.value != null ? `$${params.value.toFixed(2)}` : ''
					}
				]
			},
			// Performance group
			{
				headerName: '⚡ Performance',
				children: [
					{
						field: 'speed',
						headerName: 'Speed (tok/s)',
						width: 100,
						editable: true,
						type: 'numericColumn'
					},
					{
						field: 'latency',
						headerName: 'Latency (ms)',
						width: 100,
						editable: true,
						type: 'numericColumn'
					}
				]
			}
		];

		// Add benchmark columns grouped by category
		for (const category of categories) {
			const categoryColumns: ColDef<FlatModel>[] = category.benchmarks.map(
				(benchmark: Benchmark) => ({
					field: benchmark.id,
					headerName: benchmark.name.replace(' Verified', '').replace('LMArena ', ''),
					width: 90,
					editable: true,
					type: 'numericColumn',
					headerTooltip: benchmark.description,
					valueFormatter: (params) => {
						if (params.value === null || params.value === undefined) return '';
						if (benchmark.type === 'percentage') {
							return `${params.value.toFixed(1)}%`;
						}
						return params.value.toString();
					},
					valueParser: (params) => {
						if (params.newValue === '' || params.newValue === null) return null;
						const num = parseFloat(params.newValue);
						return isNaN(num) ? params.oldValue : num;
					},
					cellClass: (params) => {
						const value = params.value;
						const errors = validationErrors.filter(
							(e) => e.modelId === params.data?.id && e.field === benchmark.id
						);

						const classes: string[] = [];

						if (errors.length > 0) {
							classes.push('cell-invalid');
						} else if (value === null || value === undefined) {
							classes.push('cell-null');
						} else if (benchmark.type === 'percentage') {
							if (value >= 90) classes.push('cell-high-score');
							else if (value < 50) classes.push('cell-low-score');
						}

						return classes.join(' ');
					}
				})
			);

			columns.push({
				headerName: `${category.emoji} ${category.name}`,
				children: categoryColumns
			});
		}

		// Editor notes at the end
		columns.push({
			field: 'editor_notes',
			headerName: 'Notes',
			width: 300,
			editable: true,
			cellEditor: 'agLargeTextCellEditor',
			cellEditorPopup: true
		});

		return columns;
	}

	function handleCellValueChanged(event: CellValueChangedEvent<FlatModel>) {
		if (!event.data || !event.colDef.field) return;

		const modelId = event.data.id;
		const field = event.colDef.field;
		const newValue = event.newValue;

		updateModel(modelId, field, newValue);
	}

	function handleRowSelected(event: RowSelectedEvent<FlatModel>) {
		if (event.node.isSelected() && event.data) {
			onRowSelected?.(event.data.id);
		} else {
			onRowSelected?.(null);
		}
	}

	function handleContextMenu(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const cell = target.closest('.ag-cell');
		const row = target.closest('.ag-row');

		if (cell && row && gridApi) {
			const rowIndex = parseInt(row.getAttribute('row-index') || '0');
			const colId = cell.getAttribute('col-id') || '';
			const rowNode = gridApi.getDisplayedRowAtIndex(rowIndex);

			if (rowNode?.data) {
				event.preventDefault();
				onCellContextMenu?.(event, rowNode.data.id, colId);
			}
		}
	}

	onMount(() => {
		const gridOptions: GridOptions<FlatModel> = {
			columnDefs: buildColumnDefs(),
			rowData: flatModels,
			defaultColDef: {
				sortable: true,
				filter: true,
				resizable: true,
				suppressMovable: false
			},
			rowSelection: 'single',
			animateRows: true,
			enableCellTextSelection: true,
			suppressRowClickSelection: false,
			onCellValueChanged: handleCellValueChanged,
			onRowSelected: handleRowSelected,
			getRowId: (params) => params.data.id,
			suppressContextMenu: true,
			tooltipShowDelay: 500
		};

		gridApi = createGrid(gridContainer, gridOptions);

		// Add context menu listener
		gridContainer.addEventListener('contextmenu', handleContextMenu);
	});

	onDestroy(() => {
		if (gridApi) {
			gridApi.destroy();
		}
		gridContainer?.removeEventListener('contextmenu', handleContextMenu);
	});

	// Update row data when flatModels changes
	$effect(() => {
		if (gridApi && flatModels) {
			gridApi.setGridOption('rowData', flatModels);
		}
	});

	// Update column definitions when categories change
	$effect(() => {
		if (gridApi && categories.length > 0) {
			gridApi.setGridOption('columnDefs', buildColumnDefs());
		}
	});

	// Export methods for parent components
	export function getSelectedRows(): FlatModel[] {
		return gridApi?.getSelectedRows() || [];
	}

	export function selectAll(): void {
		gridApi?.selectAll();
	}

	export function deselectAll(): void {
		gridApi?.deselectAll();
	}

	export function exportToCsv(): void {
		gridApi?.exportDataAsCsv({
			fileName: `showdown-export-${new Date().toISOString().split('T')[0]}.csv`
		});
	}

	export function sizeColumnsToFit(): void {
		gridApi?.sizeColumnsToFit();
	}

	export function refreshCells(): void {
		gridApi?.refreshCells({ force: true });
	}
</script>

<div
	bind:this={gridContainer}
	class={theme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine'}
	style="width: 100%; height: 100%;"
></div>
