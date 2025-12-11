<script lang="ts">
	import { onMount } from 'svelte';
	import DataGrid from '$lib/components/DataGrid.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import StatsPanel from '$lib/components/StatsPanel.svelte';
	import { store, loadData, removeNotification } from '$lib/stores/data.svelte';

	let theme = $state<'light' | 'dark'>('light');
	let sidebarOpen = $state(true);
	let selectedModelId = $state<string | null>(null);
	let gridComponent = $state<DataGrid | null>(null);
	let highlightEmpty = $state(false);
	let frozenColumns = $state(true);
	let showColumnSelector = $state(false);
	let visibleColumns = $state<Set<string>>(new Set());
	let allColumns = $state<{ id: string; header: string }[]>([]);

	onMount(async () => {
		// Load theme preference
		const saved = localStorage.getItem('editor-theme');
		if (saved === 'dark' || saved === 'light') {
			theme = saved;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}
		document.documentElement.classList.toggle('dark', theme === 'dark');

		// Load sidebar preference
		const sidebarPref = localStorage.getItem('editor-sidebar');
		if (sidebarPref === 'closed') {
			sidebarOpen = false;
		}

		// Load highlight empty preference
		const highlightPref = localStorage.getItem('editor-highlight-empty');
		if (highlightPref === 'true') {
			highlightEmpty = true;
		}

		// Load frozen columns preference
		const frozenPref = localStorage.getItem('editor-frozen-columns');
		if (frozenPref === 'false') {
			frozenColumns = false;
		}

		// Load visible columns preference
		const colsPref = localStorage.getItem('editor-visible-columns');
		if (colsPref) {
			try {
				const cols = JSON.parse(colsPref);
				visibleColumns = new Set(cols);
			} catch {
				// Ignore invalid JSON
			}
		}

		// Load data
		try {
			await loadData();
		} catch (error) {
			console.error('Failed to load data:', error);
		}
	});

	// Get column list after grid is mounted
	$effect(() => {
		if (gridComponent) {
			allColumns = gridComponent.getColumnIds();
		}
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('editor-theme', theme);
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
		localStorage.setItem('editor-sidebar', sidebarOpen ? 'open' : 'closed');
	}

	function toggleHighlightEmpty() {
		highlightEmpty = !highlightEmpty;
		localStorage.setItem('editor-highlight-empty', String(highlightEmpty));
	}

	function toggleFrozenColumns() {
		frozenColumns = !frozenColumns;
		localStorage.setItem('editor-frozen-columns', String(frozenColumns));
	}

	function handleRowSelected(modelId: string | null) {
		selectedModelId = modelId;
	}

	function handleExportCsv() {
		gridComponent?.exportToCsv();
	}

	function handleShowColumnSelector() {
		showColumnSelector = true;
	}

	function toggleColumnVisibility(columnId: string) {
		const newSet = new Set(visibleColumns);
		if (newSet.has(columnId)) {
			newSet.delete(columnId);
		} else {
			newSet.add(columnId);
		}
		visibleColumns = newSet;
		localStorage.setItem('editor-visible-columns', JSON.stringify(Array.from(newSet)));
	}

	function showAllColumns() {
		visibleColumns = new Set();
		localStorage.removeItem('editor-visible-columns');
	}

	function closeColumnSelector() {
		showColumnSelector = false;
	}
</script>

<div class="editor-container">
	{#if store.isLoading}
		<div class="loading-screen">
			<div class="loading-spinner"></div>
			<p>Loading data...</p>
		</div>
	{:else}
		<Toolbar
			{theme}
			onToggleTheme={toggleTheme}
			onToggleSidebar={toggleSidebar}
			{sidebarOpen}
			{selectedModelId}
			onExportCsv={handleExportCsv}
			{highlightEmpty}
			onToggleHighlightEmpty={toggleHighlightEmpty}
			{frozenColumns}
			onToggleFrozenColumns={toggleFrozenColumns}
			onShowColumnSelector={handleShowColumnSelector}
		/>

		<div class="main-content">
			<div class="grid-container">
				<DataGrid
					bind:this={gridComponent}
					{theme}
					onRowSelected={handleRowSelected}
					{highlightEmpty}
					{frozenColumns}
					visibleColumns={visibleColumns.size > 0 ? visibleColumns : undefined}
				/>
			</div>

			{#if sidebarOpen}
				<aside class="sidebar">
					<StatsPanel />
				</aside>
			{/if}
		</div>
	{/if}

	<!-- Notifications -->
	<div class="notifications-container">
		{#each store.notifications as notification (notification.id)}
			<div class="notification {notification.type}" role="alert">
				<span>{notification.message}</span>
				<button
					class="notification-close"
					onclick={() => removeNotification(notification.id)}
					aria-label="Dismiss"
				>
					✕
				</button>
			</div>
		{/each}
	</div>

	<!-- Column Selector Modal -->
	{#if showColumnSelector}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="modal-overlay"
			role="dialog"
			aria-modal="true"
			aria-labelledby="column-selector-title"
			tabindex="-1"
			onclick={closeColumnSelector}
			onkeydown={(e) => e.key === 'Escape' && closeColumnSelector()}
		>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="modal column-selector-modal"
				role="document"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div class="modal-header">
					<h3 class="modal-title" id="column-selector-title">Select Visible Columns</h3>
					<button class="icon-only" onclick={closeColumnSelector}>✕</button>
				</div>
				<div class="modal-body">
					<div class="column-selector-actions">
						<button class="small" onclick={showAllColumns}>Show All</button>
						<span class="text-muted">
							{visibleColumns.size > 0 ? `${visibleColumns.size} selected` : 'All visible'}
						</span>
					</div>
					<div class="column-list">
						{#each allColumns as column}
							<label class="column-item">
								<input
									type="checkbox"
									checked={visibleColumns.size === 0 || visibleColumns.has(column.id)}
									onchange={() => toggleColumnVisibility(column.id)}
								/>
								<span>{column.header}</span>
							</label>
						{/each}
					</div>
				</div>
				<div class="modal-footer">
					<button onclick={closeColumnSelector}>Done</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		gap: 16px;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--border-color);
		border-top-color: var(--accent-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.notifications-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		z-index: 1000;
	}

	.notification {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		box-shadow: var(--shadow-md);
		animation: slideIn 0.2s ease;
	}

	.notification.success {
		border-left: 4px solid var(--success-color);
	}

	.notification.error {
		border-left: 4px solid var(--error-color);
	}

	.notification.warning {
		border-left: 4px solid var(--warning-color);
	}

	.notification.info {
		border-left: 4px solid var(--info-color);
	}

	.notification-close {
		padding: 4px 8px;
		font-size: 12px;
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
	}

	.notification-close:hover {
		color: var(--text-primary);
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	/* Column Selector Modal Styles */
	.column-selector-modal {
		max-width: 500px;
		max-height: 80vh;
	}

	.column-selector-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border-color);
	}

	.column-list {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		max-height: 400px;
		overflow-y: auto;
	}

	.column-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: 13px;
	}

	.column-item:hover {
		background: var(--bg-hover);
	}

	.column-item input {
		cursor: pointer;
	}

	.text-muted {
		color: var(--text-muted);
		font-size: 12px;
	}
</style>
