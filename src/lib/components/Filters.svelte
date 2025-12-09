<script lang="ts">
	import { debounce } from '$lib/utils/debounce';

	let {
		filters,
		models,
		onFiltersChange
	} = $props();

	// Filter state
	let showFilters = $state(false);

	// Extract unique providers
	let providers = $derived(() => {
		if (!models || !Array.isArray(models)) return [];
		const unique = [...new Set(models.map((m: any) => m.provider))];
		return unique.sort();
	});

	// Price range
	let priceRange = $state(filters.priceRange || [0, 100]);

	// Speed range
	let speedRange = $state(filters.speedRange || [0, 200]);

	// Debounced filter change handlers to prevent excessive re-renders
	const debouncedPriceChange = debounce((newRange: number[]) => {
		onFiltersChange({
			...filters,
			priceRange: newRange
		});
	}, 300);

	const debouncedSpeedChange = debounce((newRange: number[]) => {
		onFiltersChange({
			...filters,
			speedRange: newRange
		});
	}, 300);

	// Handle provider toggle
	function toggleProvider(provider: string) {
		const newProviders = filters.providers.includes(provider)
			? filters.providers.filter((p: string) => p !== provider)
			: [...filters.providers, provider];

		onFiltersChange({
			...filters,
			providers: newProviders
		});
	}

	// Handle type toggle
	function toggleType(type: string) {
		const newTypes = filters.types.includes(type)
			? filters.types.filter((t: string) => t !== type)
			: [...filters.types, type];

		onFiltersChange({
			...filters,
			types: newTypes
		});
	}

	// Handle price range change
	function handlePriceRangeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseFloat(target.value);
		const index = parseInt(target.dataset.index || '0');

		const newRange = [...priceRange];
		newRange[index] = value;

		priceRange = newRange;
		debouncedPriceChange(newRange);
	}

	// Handle speed range change
	function handleSpeedRangeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseFloat(target.value);
		const index = parseInt(target.dataset.index || '0');

		const newRange = [...speedRange];
		newRange[index] = value;

		speedRange = newRange;
		debouncedSpeedChange(newRange);
	}

	// Handle favorites only toggle
	function toggleFavoritesOnly() {
		onFiltersChange({
			...filters,
			favoritesOnly: !filters.favoritesOnly
		});
	}

	// Reset all filters
	function resetFilters() {
		onFiltersChange({
			providers: [],
			types: [],
			priceRange: [0, 100],
			speedRange: [0, 200],
			favoritesOnly: false
		});
		priceRange = [0, 100];
		speedRange = [0, 200];
	}

	// Format price
	function formatPrice(price: number): string {
		return `$${price.toFixed(2)}`;
	}

	// Get filtered count
	let filteredCount = $derived(() => {
		if (!models || !Array.isArray(models)) return 0;

		let count = models.length;

		// Filter by providers
		if (filters.providers.length > 0) {
			count = count * (filters.providers.length / providers.length);
		}

		// Filter by types
		if (filters.types.length > 0) {
			count = count * (filters.types.length / 2);
		}

		return Math.round(count);
	});
</script>

<div class="filters-container">
	<div class="filters-header">
		<button class="toggle-filters" onclick={() => showFilters = !showFilters}>
			{showFilters ? '▼' : '▶'} Filters
		</button>
		<span class="filter-count">{filteredCount} of {(models && Array.isArray(models)) ? models.length : 0} models</span>
		<button class="reset-button" onclick={resetFilters}>
			Reset
		</button>
	</div>

	{#if showFilters}
		<div class="filters-panel">
			<!-- Provider Filter -->
			<div class="filter-group">
				<h4>🏢 Provider</h4>
				<div class="filter-options">
					{#each providers as provider}
						<label class="filter-option">
							<input
								type="checkbox"
								checked={filters.providers.includes(provider)}
								onchange={() => toggleProvider(provider)}
							/>
							<span>{provider}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- Type Filter -->
			<div class="filter-group">
				<h4>🔓 Type</h4>
				<div class="filter-options">
					<label class="filter-option">
						<input
							type="checkbox"
							checked={filters.types.includes('proprietary')}
							onchange={() => toggleType('proprietary')}
						/>
						<span>Proprietary</span>
					</label>
					<label class="filter-option">
						<input
							type="checkbox"
							checked={filters.types.includes('open-source')}
							onchange={() => toggleType('open-source')}
						/>
						<span>Open Source</span>
					</label>
				</div>
			</div>

			<!-- Price Range Filter -->
			<div class="filter-group">
				<h4>💰 Price Range ($/1M tokens)</h4>
				<div class="range-inputs">
					<div class="range-input">
						<label>Min:</label>
						<input
							type="number"
							min="0"
							max="100"
							step="0.1"
							value={priceRange[0]}
							data-index="0"
							oninput={handlePriceRangeChange}
						/>
						<span>{formatPrice(priceRange[0])}</span>
					</div>
					<div class="range-input">
						<label>Max:</label>
						<input
							type="number"
							min="0"
							max="100"
							step="0.1"
							value={priceRange[1]}
							data-index="1"
							oninput={handlePriceRangeChange}
						/>
						<span>{formatPrice(priceRange[1])}</span>
					</div>
				</div>
			</div>

			<!-- Speed Range Filter -->
			<div class="filter-group">
				<h4>⚡ Speed Range (tokens/s)</h4>
				<div class="range-inputs">
					<div class="range-input">
						<label>Min:</label>
						<input
							type="number"
							min="0"
							max="200"
							step="1"
							value={speedRange[0]}
							data-index="0"
							oninput={handleSpeedRangeChange}
						/>
						<span>{speedRange[0]} tok/s</span>
					</div>
					<div class="range-input">
						<label>Max:</label>
						<input
							type="number"
							min="0"
							max="200"
							step="1"
							value={speedRange[1]}
							data-index="1"
							oninput={handleSpeedRangeChange}
						/>
						<span>{speedRange[1]} tok/s</span>
					</div>
				</div>
			</div>

			<!-- Favorites Only Filter -->
			<div class="filter-group">
				<label class="filter-option favorite-toggle">
					<input
						type="checkbox"
						checked={filters.favoritesOnly}
						onchange={toggleFavoritesOnly}
					/>
					<span>⭐ Show only favorites</span>
				</label>
			</div>
		</div>
	{/if}
</div>

<style>
	.filters-container {
		margin-bottom: 1.5rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.filters-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px 8px 0 0;
	}

	.toggle-filters {
		background: none;
		border: none;
		font-size: 1rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-count {
		font-size: 0.9rem;
		color: #6c757d;
	}

	.reset-button {
		background: #e9ecef;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.reset-button:hover {
		background: #dee2e6;
	}

	.filters-panel {
		padding: 1.5rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.filter-group h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: #495057;
	}

	.filter-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.9rem;
		color: #212529;
	}

	.filter-option input[type="checkbox"] {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}

	.favorite-toggle {
		padding: 0.75rem;
		background: #fff3bf;
		border-radius: 6px;
	}

	.range-inputs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.range-input {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.range-input label {
		min-width: 40px;
		font-size: 0.85rem;
		color: #6c757d;
		font-weight: 600;
	}

	.range-input input[type="number"] {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.range-input span {
		min-width: 80px;
		font-size: 0.85rem;
		color: #495057;
		font-family: 'Courier New', monospace;
	}

	@media (max-width: 768px) {
		.filters-panel {
			grid-template-columns: 1fr;
		}

		.filters-header {
			flex-wrap: wrap;
			gap: 0.5rem;
		}
	}
</style>
