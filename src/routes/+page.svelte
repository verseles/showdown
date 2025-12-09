<script lang="ts">
	import { page } from '$app/stores';
	import ModelCard from '$lib/components/ModelCard.svelte';
	import Filters from '$lib/components/Filters.svelte';
	import ColumnSettings from '$lib/components/ColumnSettings.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import VirtualScroller from '$lib/components/VirtualScroller.svelte';
	import { memoize } from '$lib/utils/memoize';
	import { t, getCurrentLanguage } from '$lib/i18n/index';

	let { data } = $props();

	// Generate structured data for SEO
	const structuredData = $derived(() => {
		return {
			'@context': 'https://schema.org',
			'@type': 'Table',
			name: 'LLM Comparison Table',
			description: 'Comprehensive comparison of top language models including Claude, GPT-4, Gemini, and more across coding, reasoning, math, and other benchmarks.',
			url: 'https://showdown.best/',
			about: 'Language Model Comparison',
			isBasedOn: data.models.map((model: any) => ({
				'@type': 'SoftwareApplication',
				name: model.name,
				applicationCategory: 'AI Model',
				operatingSystem: 'Web API',
				provider: {
					'@type': 'Organization',
					name: model.provider
				}
			}))
		};
	});

	// Sorting state using Svelte 5 runes
	let sortBy = $state('overall');
	let sortOrder = $state('desc');

	// Tooltip state
	let showTooltip = $state(false);
	let tooltipContent = $state('');
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Favorites state
	let favorites = $state([]);

	// Load favorites from localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('favorites');
			if (stored) {
				try {
					favorites = JSON.parse(stored);
				} catch (e) {
					console.error('Failed to parse favorites:', e);
				}
			}
		}
	});

	// Save favorites to localStorage whenever they change
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('favorites', JSON.stringify(favorites));
		}
	});

	// Column visibility state
	let visibleColumns = $state(['rank', 'provider', 'model', 'type', 'coding', 'reasoning', 'agents', 'conversation', 'math', 'multimodal', 'multilingual', 'price', 'speed', 'latency', 'release']);

	// Load column visibility from localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('visibleColumns');
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					// Validate that all stored column IDs exist
					const validColumns = parsed.filter((id: string) =>
						columns.some(col => col.id === id)
					);
					if (validColumns.length > 0) {
						visibleColumns = validColumns;
					}
				} catch (e) {
					console.error('Failed to parse visible columns:', e);
				}
			}
		}
	});

	// Save column visibility to localStorage whenever they change
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
		}
	});

	// Filter state
	let filters = $state({
		providers: [],
		types: [],
		priceRange: [0, 100],
		speedRange: [0, 200],
		favoritesOnly: false
	});

	// Column definitions
	const columns = [
		{ id: 'rank', label: 'Rank', key: 'rank' },
		{ id: 'provider', label: 'Provider', key: 'provider' },
		{ id: 'model', label: 'Model', key: 'name' },
		{ id: 'type', label: 'Type', key: 'type' },
		{ id: 'coding', label: '💻 Coding', key: 'coding' },
		{ id: 'reasoning', label: '🧠 Reasoning', key: 'reasoning' },
		{ id: 'agents', label: '🤖 Agents', key: 'agents' },
		{ id: 'conversation', label: '💬 Conversação', key: 'conversation' },
		{ id: 'math', label: '🔢 Math', key: 'math' },
		{ id: 'multimodal', label: '👁️ Multimodal', key: 'multimodal' },
		{ id: 'multilingual', label: '🌐 Multilingual', key: 'multilingual' },
		{ id: 'price', label: 'Price ($/1M)', key: 'price' },
		{ id: 'speed', label: 'Speed (tok/s)', key: 'speed' },
		{ id: 'latency', label: 'Latency (ms)', key: 'latency' },
		{ id: 'release', label: 'Release Date', key: 'release' }
	];

	// Handle sort click
	function handleSort(columnKey: string) {
		if (sortBy === columnKey) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = columnKey;
			sortOrder = 'desc';
		}
	}

	// Get sort icon
	function getSortIcon(columnKey: string) {
		if (sortBy !== columnKey) return '↕️';
		return sortOrder === 'asc' ? '↑' : '↓';
	}

	// Derived filtered and sorted models
	let filteredAndSortedModels = $derived(() => {
		let filtered = data.models.filter((model: any) => {
			// Filter by providers
			if (filters.providers.length > 0 && !filters.providers.includes(model.provider)) {
				return false;
			}

			// Filter by types
			if (filters.types.length > 0 && !filters.types.includes(model.type)) {
				return false;
			}

			// Filter by price range
			const price = model.pricing.average_per_1m;
			if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
				return false;
			}

			// Filter by speed range
			const speed = model.performance.output_speed_tps;
			if (speed < filters.speedRange[0] || speed > filters.speedRange[1]) {
				return false;
			}

			// Filter by favorites
			if (filters.favoritesOnly && !favorites.includes(model.id)) {
				return false;
			}

			return true;
		});

		// Sort filtered models
		const sorted = [...filtered].sort((a: any, b: any) => {
			let aVal, bVal;

			// Get values based on sort key
			switch (sortBy) {
				case 'overall':
					aVal = a.overall_score ?? -Infinity;
					bVal = b.overall_score ?? -Infinity;
					break;
				case 'name':
					aVal = a.name.toLowerCase();
					bVal = b.name.toLowerCase();
					break;
				case 'provider':
					aVal = a.provider.toLowerCase();
					bVal = b.provider.toLowerCase();
					break;
				case 'type':
					aVal = a.type;
					bVal = b.type;
					break;
				case 'price':
					aVal = a.pricing.average_per_1m;
					bVal = b.pricing.average_per_1m;
					break;
				case 'speed':
					aVal = a.performance.output_speed_tps;
					bVal = b.performance.output_speed_tps;
					break;
				case 'latency':
					aVal = a.performance.latency_ttft_ms;
					bVal = b.performance.latency_ttft_ms;
					break;
				case 'release':
					aVal = new Date(a.release_date).getTime();
					bVal = new Date(b.release_date).getTime();
					break;
				case 'coding':
				case 'reasoning':
				case 'agents':
				case 'conversation':
				case 'math':
				case 'multimodal':
				case 'multilingual':
					aVal = a.category_scores?.[sortBy] ?? -Infinity;
					bVal = b.category_scores?.[sortBy] ?? -Infinity;
					break;
				default:
					return 0;
			}

			// Compare values
			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		return sorted;
	});

	// Get score for a category
	function getCategoryScore(model: any, categoryId: string): number | null {
		return model.category_scores?.[categoryId] ?? null;
	}

	// Memoized formatting functions to avoid redundant calculations
	const formatPrice = memoize((price: number): string => {
		if (price === 0) return 'Free';
		return `$${price.toFixed(2)}`;
	});

	const formatDate = memoize((dateString: string): string => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short'
		});
	});

	const formatScore = memoize((score: number | null): string => {
		if (score == null) return '—';
		return `${score.toFixed(1)}%`;
	});

	// Memoized tooltip content generation
	const generateScoreTooltip = memoize((model: any, categoryId: string): string => {
		const category = data.categories.find((c: any) => c.id === categoryId);
		if (!category) return '';

		let content = `<strong>${category.name}</strong><br/><br/>`;
		content += `<em>Benchmarks:</em><br/>`;

		for (const benchmark of category.benchmarks) {
			const score = model.benchmark_scores[benchmark.id];
			if (score != null) {
				content += `• ${benchmark.name}: ${formatScore(benchmark.type === 'elo' ? ((score - 800) / 600) * 100 : score)} `;
				content += `<a href="${benchmark.url}" target="_blank" rel="noopener noreferrer">🔗</a><br/>`;
			} else {
				content += `• ${benchmark.name}: — <a href="${benchmark.url}" target="_blank" rel="noopener noreferrer">🔗</a><br/>`;
			}
		}

		const availableBenchmarks = category.benchmarks.filter((b: any) => model.benchmark_scores[b.id] != null).length;
		content += `<br/>${availableBenchmarks}/${category.benchmarks.length} benchmarks available`;

		return content;
	});

	// Get type badge class
	function getTypeBadgeClass(type: string): string {
		return type === 'open-source'
			? 'badge badge-open-source'
			: 'badge badge-proprietary';
	}

	// Tooltip handlers
	function showModelTooltip(event: MouseEvent, model: any) {
		tooltipContent = model.editor_notes || 'No notes available';
		tooltipX = event.clientX;
		tooltipY = event.clientY;
		showTooltip = true;
	}

	function showCategoryTooltip(event: MouseEvent, categoryId: string) {
		const category = data.categories.find((c: any) => c.id === categoryId);
		if (category) {
			tooltipContent = category.description;
			tooltipX = event.clientX;
			tooltipY = event.clientY;
			showTooltip = true;
		}
	}

	function showScoreTooltip(event: MouseEvent, model: any, categoryId: string) {
		tooltipContent = generateScoreTooltip(model, categoryId);
		tooltipX = event.clientX;
		tooltipY = event.clientY;
		showTooltip = true;
	}

	function hideTooltip() {
		showTooltip = false;
	}

	// Check if model is favorited
	function isFavorite(modelId: string): boolean {
		return favorites.includes(modelId);
	}

	// Toggle favorite
	function toggleFavorite(modelId: string) {
		if (favorites.includes(modelId)) {
			favorites = favorites.filter(id => id !== modelId);
		} else {
			favorites = [...favorites, modelId];
		}
	}

	// Handle favorite click
	function handleFavoriteClick(event: MouseEvent, modelId: string) {
		event.stopPropagation();
		toggleFavorite(modelId);
	}

	// Handle filters change
	function handleFiltersChange(newFilters: any) {
		filters = newFilters;
	}

	// Handle columns change
	function handleColumnsChange(newVisibleColumns: string[]) {
		visibleColumns = newVisibleColumns;
	}

	// Enable virtual scrolling when we have many models (threshold: 20)
	const useVirtualScrolling = $derived(() => filteredAndSortedModels.length >= 20);

	// Calculate table row height (approximate)
	const tableRowHeight = 65;
</script>

<svelte:head>
	<!-- Additional page-specific meta tags -->
	<title>Showdown.Best - Compare Top LLM Models | Claude, GPT-4, Gemini</title>
	<meta name="description" content="Compare 12+ top language models side-by-side. View benchmarks for coding, reasoning, math, and more. Updated with latest model performance data." />

	<!-- Table-specific structured data -->
	<script type="application/ld+json">
		{JSON.stringify(structuredData)}
	</script>
</svelte:head>

<div class="container">
	<header class="header">
		<div class="header-top">
			<h1>{t('showdown.title')}</h1>
			<div class="header-controls">
				<LanguageSelector />
				<ThemeToggle />
				<a href="/editor" class="editor-link">{t('showdown.editData')}</a>
			</div>
		</div>
		<p class="subtitle">{t('showdown.subtitle')}</p>
	</header>

	<!-- Filters -->
	<Filters filters={filters} models={data.models} onFiltersChange={handleFiltersChange} />

	<!-- Column Settings -->
	<ColumnSettings visibleColumns={visibleColumns} onColumnsChange={handleColumnsChange} />

	<!-- Desktop Table View (>= 768px) -->
	<div class="table-container desktop-only">
		<table class="models-table">
			<thead>
				<tr>
					<th class="favorite-header">⭐</th>
					{#each columns.filter(col => visibleColumns.includes(col.id)) as column}
						<th
							class="sortable"
							onclick={() => handleSort(column.key)}
							onmouseenter={(e) => ['coding', 'reasoning', 'agents', 'conversation', 'math', 'multimodal', 'multilingual'].includes(column.key) && showCategoryTooltip(e as MouseEvent, column.key)}
							onmouseleave={hideTooltip}
							role="button"
							tabindex="0"
							onkeydown={(e) => e.key === 'Enter' && handleSort(column.key)}
						>
							<span class="column-label">{column.label}</span>
							<span class="sort-icon">{getSortIcon(column.key)}</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if useVirtualScrolling}
					<VirtualScroller
						items={filteredAndSortedModels}
						itemHeight={tableRowHeight}
						containerHeight={600}
						overscan={5}
						renderItem={(model: any) => renderTableRow(model)}
					/>
				{:else}
					{#each filteredAndSortedModels as model, index}
						{@render renderTableRow(model)}
					{/each}
				{/if}
			</tbody>

			<!-- Render function for table rows -->
			{#snippet renderTableRow(model: any)}
				<tr class="model-row">
					<td class="favorite-cell">
						<button
							class="favorite-button"
							onclick={(e) => handleFavoriteClick(e, model.id)}
							title={isFavorite(model.id) ? 'Remove from favorites' : 'Add to favorites'}
						>
							{isFavorite(model.id) ? '⭐' : '☆'}
						</button>
					</td>
					{#if visibleColumns.includes('rank')}
						<td class="rank-cell">
							{#if model.rank}
								<span class="rank-badge">#{model.rank}</span>
								<div class="overall-score">{model.overall_score?.toFixed(1) ?? '—'}%</div>
							{:else}
								<span class="rank-badge">—</span>
							{/if}
						</td>
					{/if}
					{#if visibleColumns.includes('provider')}
						<td class="provider-cell">{model.provider}</td>
					{/if}
					{#if visibleColumns.includes('model')}
						<td class="model-name-cell">
							<strong
								onmouseenter={(e) => showModelTooltip(e as MouseEvent, model)}
								onmouseleave={hideTooltip}
							>
								{model.name}
							</strong>
						</td>
					{/if}
					{#if visibleColumns.includes('type')}
						<td class="type-cell">
							<span class={getTypeBadgeClass(model.type)}>
								{model.type === 'open-source' ? 'Open Source' : 'Proprietary'}
							</span>
						</td>
					{/if}
					{#if visibleColumns.includes('coding')}
						<td
							class="score-cell"
							onmouseenter={(e) => showScoreTooltip(e as MouseEvent, model, 'coding')}
							onmouseleave={hideTooltip}
						>
							{formatScore(getCategoryScore(model, 'coding'))}
						</td>
					{/if}
					{#if visibleColumns.includes('reasoning')}
						<td
							class="score-cell"
							onmouseenter={(e) => showScoreTooltip(e as MouseEvent, model, 'reasoning')}
							onmouseleave={hideTooltip}
						>
							{formatScore(getCategoryScore(model, 'reasoning'))}
						</td>
					{/if}
					{#if visibleColumns.includes('agents')}
						<td
							class="score-cell"
							onmouseenter={(e) => showScoreTooltip(e as MouseEvent, model, 'agents')}
							onmouseleave={hideTooltip}
						>
							{formatScore(getCategoryScore(model, 'agents'))}
						</td>
					{/if}
					{#if visibleColumns.includes('conversation')}
						<td
							class="score-cell"
							onmouseenter={(e) => showScoreTooltip(e as MouseEvent, model, 'conversation')}
							onmouseleave={hideTooltip}
						>
							{formatScore(getCategoryScore(model, 'conversation'))}
						</td>
					{/if}
					{#if visibleColumns.includes('math')}
						<td
							class="score-cell"
							onmouseenter={(e) => showScoreTooltip(e as MouseEvent, model, 'math')}
							onmouseleave={hideTooltip}
						>
							{formatScore(getCategoryScore(model, 'math'))}
						</td>
					{/if}
					{#if visibleColumns.includes('multimodal')}
						<td
							class="score-cell"
							onmouseenter={(e) => showScoreTooltip(e as MouseEvent, model, 'multimodal')}
							onmouseleave={hideTooltip}
						>
							{formatScore(getCategoryScore(model, 'multimodal'))}
						</td>
					{/if}
					{#if visibleColumns.includes('multilingual')}
						<td
							class="score-cell"
							onmouseenter={(e) => showScoreTooltip(e as MouseEvent, model, 'multilingual')}
							onmouseleave={hideTooltip}
						>
							{formatScore(getCategoryScore(model, 'multilingual'))}
						</td>
					{/if}
					{#if visibleColumns.includes('price')}
						<td class="price-cell">{formatPrice(model.pricing.average_per_1m)}</td>
					{/if}
					{#if visibleColumns.includes('speed')}
						<td class="speed-cell">{model.performance.output_speed_tps.toFixed(1)}</td>
					{/if}
					{#if visibleColumns.includes('latency')}
						<td class="latency-cell">{model.performance.latency_ttft_ms}</td>
					{/if}
					{#if visibleColumns.includes('release')}
						<td class="date-cell">{formatDate(model.release_date)}</td>
					{/if}
				</tr>
			{/snippet}
		</table>
	</div>

	<!-- Mobile Card View (< 768px) -->
	<div class="cards-container mobile-only">
		{#each filteredAndSortedModels as model}
			<ModelCard
				{model}
				categories={data.categories}
				{showTooltip}
				{tooltipContent}
				{tooltipX}
				{tooltipY}
			/>
		{/each}
	</div>

	<footer class="footer">
		<p>Data updated: {new Date(data.meta.last_update).toLocaleDateString()}</p>
		<p>Showing {filteredAndSortedModels.length} of {data.models.length} models</p>
	</footer>
</div>

{#if showTooltip}
	<div
		class="tooltip"
		role="tooltip"
		style="left: {tooltipX}px; top: {tooltipY - 10}px"
		onmouseenter={() => showTooltip = true}
		onmouseleave={() => showTooltip = false}
	>
		{@html tooltipContent}
	</div>
{/if}

<style>
	:global(:root) {
		--bg-primary: #ffffff;
		--bg-secondary: #f8f9fa;
		--bg-tertiary: #ffffff;
		--text-primary: #212529;
		--text-secondary: #495057;
		--text-muted: #6c757d;
		--border-color: #dee2e6;
		--border-hover: #adb5bd;
		--primary-color: #1971c2;
		--primary-hover: #1864ab;
		--shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		--shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
		--shadow-strong: 0 4px 20px rgba(0, 0, 0, 0.15);
	}

	:global(.dark) {
		--bg-primary: #1a1a1a;
		--bg-secondary: #2d2d2d;
		--bg-tertiary: #242424;
		--text-primary: #ffffff;
		--text-secondary: #e0e0e0;
		--text-muted: #a0a0a0;
		--border-color: #3d3d3d;
		--border-hover: #505050;
		--primary-color: #4dabf7;
		--primary-hover: #339af0;
		--shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		--shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.4);
		--shadow-strong: 0 4px 20px rgba(0, 0, 0, 0.5);
	}

	.container {
		max-width: 1600px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: var(--bg-primary);
		color: var(--text-primary);
		transition: background-color 0.3s, color 0.3s;
	}

	.header {
		margin-bottom: 2rem;
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.header h1 {
		font-size: 2.5rem;
		margin: 0;
		font-weight: 700;
		color: var(--text-primary);
	}

	.header-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.editor-link {
		padding: 0.5rem 1rem;
		background: var(--bg-tertiary);
		border: 2px solid var(--border-color);
		border-radius: 8px;
		text-decoration: none;
		color: var(--text-secondary);
		font-weight: 600;
		transition: all 0.2s;
	}

	.editor-link:hover {
		background: var(--bg-secondary);
		border-color: var(--primary-color);
		color: var(--primary-color);
	}

	.subtitle {
		color: var(--text-muted);
		font-size: 1.1rem;
		margin: 0.5rem 0 0;
		text-align: center;
	}

	.table-container {
		overflow-x: auto;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.models-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}

	thead {
		background: #f8f9fa;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	th {
		padding: 1rem 0.75rem;
		text-align: left;
		font-weight: 600;
		color: #333;
		border-bottom: 2px solid #dee2e6;
		white-space: nowrap;
	}

	th.favorite-header {
		text-align: center;
	}

	th.sortable {
		cursor: pointer;
		user-select: none;
		transition: background-color 0.2s;
	}

	th.sortable:hover {
		background-color: #e9ecef;
	}

	.favorite-cell {
		text-align: center;
		padding: 0.5rem;
	}

	.favorite-button {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		transition: transform 0.2s;
	}

	.favorite-button:hover {
		transform: scale(1.2);
	}

	.column-label {
		margin-right: 0.5rem;
	}

	.sort-icon {
		font-size: 0.8rem;
		opacity: 0.6;
	}

	tbody tr {
		border-bottom: 1px solid #dee2e6;
		transition: background-color 0.2s;
	}

	tbody tr:hover {
		background-color: #f8f9fa;
	}

	td {
		padding: 0.875rem 0.75rem;
		vertical-align: middle;
	}

	.rank-cell {
		font-weight: 600;
		text-align: center;
		min-width: 80px;
	}

	.rank-badge {
		display: inline-block;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
	}

	.overall-score {
		font-size: 0.75rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.provider-cell {
		font-weight: 500;
		color: #495057;
	}

	.model-name-cell strong {
		font-size: 1rem;
		color: #212529;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.badge-proprietary {
		background: #ffe0e0;
		color: #c92a2a;
	}

	.badge-open-source {
		background: #d3f9d8;
		color: #2b8a3e;
	}

	.score-cell {
		text-align: center;
		font-family: 'Courier New', monospace;
		font-weight: 600;
		color: #495057;
	}

	.price-cell {
		font-family: 'Courier New', monospace;
		font-weight: 600;
		color: #2b8a3e;
	}

	.speed-cell,
	.latency-cell {
		text-align: right;
		font-family: 'Courier New', monospace;
	}

	.date-cell {
		color: #6c757d;
		white-space: nowrap;
	}

	.footer {
		margin-top: 2rem;
		text-align: center;
		color: #6c757d;
		font-size: 0.9rem;
	}

	.footer p {
		margin: 0.25rem 0;
	}

	.tooltip {
		position: fixed;
		z-index: 1000;
		background: #333;
		color: white;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-size: 0.875rem;
		max-width: 300px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		pointer-events: auto;
	}

	/* Responsive design */
	.desktop-only {
		display: block;
	}

	.mobile-only {
		display: none;
	}

	@media (max-width: 767px) {
		.container {
			padding: 1rem;
		}

		.header h1 {
			font-size: 1.75rem;
		}

		.header-top {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.header-controls {
			width: 100%;
			justify-content: space-between;
		}

		.editor-link {
			align-self: flex-end;
		}

		.subtitle {
			text-align: left;
		}

		.desktop-only {
			display: none;
		}

		.mobile-only {
			display: block;
		}
	}
</style>
