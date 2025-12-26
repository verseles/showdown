<script lang="ts">
	interface Props {
		options: string[];
		selected: string[];
		placeholder?: string;
		onchange?: (selected: string[]) => void;
	}

	let { options, selected = $bindable([]), placeholder = 'Select...', onchange }: Props = $props();

	let isOpen = $state(false);
	let searchTerm = $state('');

	const filteredOptions = $derived(
		options.filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	function toggleOption(option: string) {
		if (selected.includes(option)) {
			selected = selected.filter((s) => s !== option);
		} else {
			selected = [...selected, option];
		}
		onchange?.(selected);
	}

	function clearAll() {
		selected = [];
		onchange?.(selected);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.simple-multiselect')) {
			isOpen = false;
			searchTerm = '';
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="simple-multiselect" class:open={isOpen}>
	<button
		class="select-trigger"
		type="button"
		onclick={() => {
			isOpen = !isOpen;
		}}
	>
		<span class="selected-text">
			{#if selected.length === 0}
				<span class="placeholder">{placeholder}</span>
			{:else if selected.length === 1}
				{selected[0]}
			{:else}
				{selected.length} selected
			{/if}
		</span>
		<span class="arrow">{isOpen ? '▲' : '▼'}</span>
	</button>

	{#if isOpen}
		<div class="dropdown">
			<div class="search-box">
				<input type="text" bind:value={searchTerm} placeholder="Search..." class="search-input" />
			</div>

			<div class="options-list">
				{#if selected.length > 0}
					<button type="button" class="clear-btn" onclick={clearAll}> Clear all </button>
				{/if}

				{#each filteredOptions as option (option)}
					<label class="option-item">
						<input
							type="checkbox"
							checked={selected.includes(option)}
							onchange={() => toggleOption(option)}
						/>
						<span class="option-label">{option}</span>
					</label>
				{/each}

				{#if filteredOptions.length === 0}
					<div class="no-results">No results found</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.simple-multiselect {
		position: relative;
		width: 100%;
		z-index: 1;
	}

	.simple-multiselect.open {
		z-index: 1000;
	}

	.select-trigger {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		background: var(--bg-primary);
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		transition: all 0.15s;
	}

	.select-trigger:hover {
		border-color: var(--accent-primary);
	}

	.select-trigger:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.placeholder {
		color: var(--text-muted);
	}

	.arrow {
		font-size: 0.75rem;
		color: var(--text-muted);
		transition: transform 0.15s;
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 0;
		right: 0;
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		max-height: 300px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		z-index: 2001;
	}

	.search-box {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.search-input {
		width: 100%;
		padding: 0.375rem 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.25rem;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 0.875rem;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent-primary);
	}

	.options-list {
		overflow-y: auto;
		max-height: 240px;
	}

	.clear-btn {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: none;
		border-bottom: 1px solid var(--border-color);
		background: var(--bg-primary);
		color: var(--accent-primary);
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: left;
	}

	.clear-btn:hover {
		background: var(--bg-hover);
	}

	.option-item {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		transition: background-color 0.1s;
	}

	.option-item:hover {
		background: var(--bg-hover);
	}

	.option-item input[type='checkbox'] {
		margin-right: 0.5rem;
		cursor: pointer;
	}

	.option-label {
		color: var(--text-primary);
		font-size: 0.875rem;
	}

	.no-results {
		padding: 1rem;
		text-align: center;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	/* Scrollbar styling */
	.options-list::-webkit-scrollbar {
		width: 6px;
	}

	.options-list::-webkit-scrollbar-track {
		background: var(--bg-secondary);
	}

	.options-list::-webkit-scrollbar-thumb {
		background: var(--border-color);
		border-radius: 3px;
	}

	.options-list::-webkit-scrollbar-thumb:hover {
		background: var(--text-muted);
	}
</style>
