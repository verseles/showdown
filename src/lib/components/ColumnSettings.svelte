<script lang="ts">
	let {
		visibleColumns,
		onColumnsChange
	} = $props();

	// Panel visibility state
	let showSettings = $state(false);

	// Column definitions
	const allColumns = [
		{ id: 'rank', label: 'Rank', defaultVisible: true },
		{ id: 'provider', label: 'Provider', defaultVisible: true },
		{ id: 'model', label: 'Model', defaultVisible: true },
		{ id: 'type', label: 'Type', defaultVisible: true },
		{ id: 'coding', label: '💻 Coding', defaultVisible: true },
		{ id: 'reasoning', label: '🧠 Reasoning', defaultVisible: true },
		{ id: 'agents', label: '🤖 Agents', defaultVisible: true },
		{ id: 'conversation', label: '💬 Conversação', defaultVisible: true },
		{ id: 'math', label: '🔢 Math', defaultVisible: true },
		{ id: 'multimodal', label: '👁️ Multimodal', defaultVisible: true },
		{ id: 'multilingual', label: '🌐 Multilingual', defaultVisible: true },
		{ id: 'price', label: 'Price ($/1M)', defaultVisible: true },
		{ id: 'speed', label: 'Speed (tok/s)', defaultVisible: true },
		{ id: 'latency', label: 'Latency (ms)', defaultVisible: false },
		{ id: 'release', label: 'Release Date', defaultVisible: false }
	];

	// Handle column toggle
	function toggleColumn(columnId: string) {
		const newVisibleColumns = visibleColumns.includes(columnId)
			? visibleColumns.filter((id: string) => id !== columnId)
			: [...visibleColumns, columnId];

		onColumnsChange(newVisibleColumns);
	}

	// Show all columns
	function showAll() {
		onColumnsChange(allColumns.map(c => c.id));
	}

	// Hide all columns except essential ones
	function hideAll() {
		onColumnsChange(allColumns.filter(c => c.defaultVisible).map(c => c.id));
	}

	// Reset to defaults
	function resetDefaults() {
		onColumnsChange(allColumns.filter(c => c.defaultVisible).map(c => c.id));
	}
</script>

<div class="column-settings">
	<button class="toggle-settings" onclick={() => showSettings = !showSettings}>
		👁️ Columns
	</button>

	{#if showSettings}
		<div class="settings-panel">
			<div class="settings-header">
				<h4>Column Visibility</h4>
				<button class="close-button" onclick={() => showSettings = false}>✕</button>
			</div>

			<div class="column-list">
				{#each allColumns as column}
					<label class="column-option">
						<input
							type="checkbox"
							checked={visibleColumns.includes(column.id)}
							onchange={() => toggleColumn(column.id)}
						/>
						<span class="column-label">{column.label}</span>
						{#if column.defaultVisible}
							<span class="default-badge">Default</span>
						{/if}
					</label>
				{/each}
			</div>

			<div class="settings-actions">
				<button class="action-button" onclick={showAll}>
					Show All
				</button>
				<button class="action-button" onclick={hideAll}>
					Hide All
				</button>
				<button class="action-button primary" onclick={resetDefaults}>
					Reset to Default
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.column-settings {
		position: relative;
		margin-left: 1rem;
	}

	.toggle-settings {
		background: white;
		border: 1px solid #dee2e6;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-settings:hover {
		background: #f8f9fa;
		border-color: #adb5bd;
	}

	.settings-panel {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.5rem;
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 100;
		min-width: 300px;
		max-height: 500px;
		overflow-y: auto;
	}

	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #dee2e6;
		background: #f8f9fa;
		border-radius: 8px 8px 0 0;
	}

	.settings-header h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: #212529;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.2rem;
		color: #6c757d;
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.close-button:hover {
		background: #e9ecef;
	}

	.column-list {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.column-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.column-option:hover {
		background: #f8f9fa;
	}

	.column-option input[type="checkbox"] {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}

	.column-label {
		flex: 1;
		font-size: 0.9rem;
		color: #212529;
	}

	.default-badge {
		background: #e7f5ff;
		color: #1971c2;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 600;
	}

	.settings-actions {
		padding: 1rem;
		border-top: 1px solid #dee2e6;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.action-button {
		flex: 1;
		min-width: 100px;
		padding: 0.5rem;
		border: 1px solid #dee2e6;
		background: white;
		border-radius: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-button:hover {
		background: #f8f9fa;
		border-color: #adb5bd;
	}

	.action-button.primary {
		background: #1971c2;
		color: white;
		border-color: #1971c2;
	}

	.action-button.primary:hover {
		background: #1864ab;
		border-color: #1864ab;
	}

	@media (max-width: 768px) {
		.column-settings {
			margin-left: 0;
			margin-top: 0.5rem;
		}

		.settings-panel {
			right: auto;
			left: 0;
			min-width: calc(100vw - 2rem);
		}
	}
</style>
