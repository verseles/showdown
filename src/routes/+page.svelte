<script lang="ts">
	import { getContext } from 'svelte';
	import type { PageData } from './$types';
	import type { Category, FilterState } from '$lib/types.js';
	import {
		rankModels,
		sortModels,
		filterModels,
		findTopScores,
		formatScore,
		formatPrice,
		formatSpeed,
		getUniqueProviders,
		getCategoryBreakdown
	} from '$lib/ranking.js';

	let { data }: { data: PageData } = $props();

	// Theme context from layout
	const themeContext = getContext<{ current: 'light' | 'dark'; toggle: () => void }>('theme');

	// Sorting state
	let sortBy = $state('overall');
	let sortOrder = $state<'asc' | 'desc'>('desc');

	// Filter state
	let filters = $state<FilterState>({
		providers: [],
		types: [],
		priceRange: [0, 100],
		speedRange: [0, 3000],
		dateRange: 'all',
		favoritesOnly: false
	});

	// Favorites state
	let favorites = $state<string[]>([]);

	// Column visibility state
	let visibleColumns = $state({
		rank: true,
		provider: true,
		model: true,
		type: true,
		coding: true,
		reasoning: true,
		agents: true,
		conversation: true,
		math: true,
		multimodal: true,
		multilingual: true,
		price: true,
		speed: true,
		latency: false,
		release_date: false
	});

	// Column settings dropdown state
	let showColumnSettings = $state(false);

	// Load favorites and column visibility from localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			const storedFavorites = localStorage.getItem('favorites');
			if (storedFavorites) {
				favorites = JSON.parse(storedFavorites);
			}
			const storedColumns = localStorage.getItem('visibleColumns');
			if (storedColumns) {
				visibleColumns = { ...visibleColumns, ...JSON.parse(storedColumns) };
			}
		}
	});

	// Save favorites to localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('favorites', JSON.stringify(favorites));
		}
	});

	// Save column visibility to localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
		}
	});

	// Computed values
	let rankedModels = $derived(rankModels(data.models, data.categories));
	let topScores = $derived(findTopScores(rankedModels, data.categories));

	let filteredModels = $derived(
		filterModels(rankedModels, {
			...filters,
			favoriteIds: favorites
		})
	);

	let sortedModels = $derived(sortModels(filteredModels, sortBy, sortOrder));

	let providers = $derived(getUniqueProviders(data.models));

	// Handlers
	function handleSort(column: string) {
		if (sortBy === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortOrder = 'desc';
		}
	}

	function toggleFavorite(modelId: string) {
		if (favorites.includes(modelId)) {
			favorites = favorites.filter((id) => id !== modelId);
		} else {
			favorites = [...favorites, modelId];
		}
	}

	function isFavorite(modelId: string): boolean {
		return favorites.includes(modelId);
	}

	function isTopScore(score: number | null, topScore: number | null): boolean {
		if (score === null || topScore === null) return false;
		return Math.abs(score - topScore) < 0.1;
	}

	function getSortIcon(column: string): string {
		if (sortBy !== column) return '';
		return sortOrder === 'asc' ? '▲' : '▼';
	}

	// Tooltip state
	let activeTooltip = $state<{
		type: 'model' | 'category' | 'score';
		data: unknown;
		x: number;
		y: number;
	} | null>(null);

	function showTooltip(
		event: MouseEvent,
		type: 'model' | 'category' | 'score',
		tooltipData: unknown
	) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		activeTooltip = {
			type,
			data: tooltipData,
			x: rect.left + rect.width / 2,
			y: rect.bottom + 8
		};
	}

	function hideTooltip() {
		activeTooltip = null;
	}
</script>

<svelte:head>
	<title>Showdown - Comprehensive LLM Rankings & Comparison</title>
	<meta
		name="description"
		content="Compare the best AI language models across coding, reasoning, agents, and more. Transparent rankings from 20+ benchmarks."
	/>
	<meta property="og:title" content="Showdown - LLM Rankings" />
	<meta
		property="og:description"
		content="Transparent AI model comparison aggregating SWE-Bench, GPQA, LMArena, and more."
	/>
	<meta property="og:url" content="https://showdown.best" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Showdown - LLM Rankings" />
</svelte:head>

<header class="header">
	<div class="container">
		<div class="header-content">
			<div class="logo">
				<h1>Showdown</h1>
				<span class="tagline">LLM Rankings</span>
			</div>
			<div class="header-actions">
				<div class="header-meta">
					<span class="model-count">
						Showing {sortedModels.length} of {data.models.length} models
					</span>
					<span class="last-update">
						Updated: {new Date(data.meta.last_update).toLocaleDateString()}
					</span>
				</div>
				<button
					class="theme-toggle"
					onclick={() => themeContext?.toggle()}
					aria-label={themeContext?.current === 'dark'
						? 'Switch to light mode'
						: 'Switch to dark mode'}
				>
					{themeContext?.current === 'dark' ? '☀️' : '🌙'}
				</button>
			</div>
		</div>
	</div>
</header>

<main class="main">
	<div class="container">
		<!-- Filters Bar -->
		<div class="filters-bar">
			<div class="filter-group">
				<label for="provider-filter">Provider</label>
				<select id="provider-filter" multiple bind:value={filters.providers} class="filter-select">
					{#each providers as provider (provider)}
						<option value={provider}>{provider}</option>
					{/each}
				</select>
			</div>

			<div class="filter-group">
				<span class="filter-label">Type</span>
				<div class="checkbox-group">
					<label class="checkbox-label">
						<input
							type="checkbox"
							checked={filters.types.includes('proprietary')}
							onchange={() => {
								if (filters.types.includes('proprietary')) {
									filters.types = filters.types.filter((t) => t !== 'proprietary');
								} else {
									filters.types = [...filters.types, 'proprietary'];
								}
							}}
						/>
						Proprietary
					</label>
					<label class="checkbox-label">
						<input
							type="checkbox"
							checked={filters.types.includes('open-source')}
							onchange={() => {
								if (filters.types.includes('open-source')) {
									filters.types = filters.types.filter((t) => t !== 'open-source');
								} else {
									filters.types = [...filters.types, 'open-source'];
								}
							}}
						/>
						Open Source
					</label>
				</div>
			</div>

			<div class="filter-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={filters.favoritesOnly} />
					Favorites only
				</label>
			</div>

			<button
				class="reset-btn"
				onclick={() => {
					filters = {
						providers: [],
						types: [],
						priceRange: [0, 100],
						speedRange: [0, 3000],
						dateRange: 'all',
						favoritesOnly: false
					};
				}}
			>
				Reset
			</button>

			<div class="column-settings-wrapper">
				<button
					class="columns-btn"
					onclick={() => (showColumnSettings = !showColumnSettings)}
					aria-expanded={showColumnSettings}
				>
					Columns
				</button>
				{#if showColumnSettings}
					<div class="column-settings-dropdown">
						<div class="dropdown-header">
							<span>Visible Columns</span>
							<button class="close-btn" onclick={() => (showColumnSettings = false)}>x</button>
						</div>
						<div class="column-options">
							<label class="column-option">
								<input type="checkbox" bind:checked={visibleColumns.rank} />
								Rank & Score
							</label>
							<label class="column-option">
								<input type="checkbox" bind:checked={visibleColumns.provider} />
								Provider
							</label>
							<label class="column-option">
								<input type="checkbox" bind:checked={visibleColumns.model} />
								Model
							</label>
							<label class="column-option">
								<input type="checkbox" bind:checked={visibleColumns.type} />
								Type
							</label>
							<hr />
							{#each data.categories as category (category.id)}
								<label class="column-option">
									<input
										type="checkbox"
										checked={visibleColumns[category.id as keyof typeof visibleColumns]}
										onchange={() => {
											visibleColumns[category.id as keyof typeof visibleColumns] =
												!visibleColumns[category.id as keyof typeof visibleColumns];
										}}
									/>
									{category.emoji}
									{category.name}
								</label>
							{/each}
							<hr />
							<label class="column-option">
								<input type="checkbox" bind:checked={visibleColumns.price} />
								Price
							</label>
							<label class="column-option">
								<input type="checkbox" bind:checked={visibleColumns.speed} />
								Speed
							</label>
							<label class="column-option">
								<input type="checkbox" bind:checked={visibleColumns.latency} />
								Latency
							</label>
							<label class="column-option">
								<input type="checkbox" bind:checked={visibleColumns.release_date} />
								Release Date
							</label>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Rankings Table -->
		<div class="table-wrapper">
			<table class="rankings-table">
				<thead>
					<tr>
						<th class="sticky-col col-fav">
							<span class="sr-only">Favorite</span>
						</th>
						{#if visibleColumns.rank}
							<th
								class="sticky-col col-rank sortable"
								onclick={() => handleSort('overall')}
								onkeydown={(e) => e.key === 'Enter' && handleSort('overall')}
								tabindex="0"
								role="columnheader"
								aria-sort={sortBy === 'overall'
									? sortOrder === 'asc'
										? 'ascending'
										: 'descending'
									: 'none'}
							>
								<div class="th-content">
									<span>Rank</span>
									<span class="sort-icon">{getSortIcon('overall')}</span>
								</div>
							</th>
						{/if}
						{#if visibleColumns.provider}
							<th
								class="sortable"
								onclick={() => handleSort('provider')}
								onkeydown={(e) => e.key === 'Enter' && handleSort('provider')}
								tabindex="0"
							>
								<div class="th-content">
									<span>Provider</span>
									<span class="sort-icon">{getSortIcon('provider')}</span>
								</div>
							</th>
						{/if}
						{#if visibleColumns.model}
							<th
								class="sortable col-model"
								onclick={() => handleSort('name')}
								onkeydown={(e) => e.key === 'Enter' && handleSort('name')}
								tabindex="0"
							>
								<div class="th-content">
									<span>Model</span>
									<span class="sort-icon">{getSortIcon('name')}</span>
								</div>
							</th>
						{/if}
						{#if visibleColumns.type}
							<th
								class="sortable"
								onclick={() => handleSort('type')}
								onkeydown={(e) => e.key === 'Enter' && handleSort('type')}
								tabindex="0"
							>
								<div class="th-content">
									<span>Type</span>
									<span class="sort-icon">{getSortIcon('type')}</span>
								</div>
							</th>
						{/if}
						{#each data.categories as category (category.id)}
							{#if visibleColumns[category.id as keyof typeof visibleColumns]}
								<th
									class="sortable col-score"
									onclick={() => handleSort(category.id)}
									onkeydown={(e) => e.key === 'Enter' && handleSort(category.id)}
									tabindex="0"
									onmouseenter={(e) => showTooltip(e, 'category', category)}
									onmouseleave={hideTooltip}
								>
									<div class="th-content">
										<span class="category-header">
											<span class="emoji">{category.emoji}</span>
											<span class="category-name">{category.name}</span>
										</span>
										<span class="sort-icon">{getSortIcon(category.id)}</span>
									</div>
								</th>
							{/if}
						{/each}
						{#if visibleColumns.price}
							<th
								class="sortable col-num"
								onclick={() => handleSort('price')}
								onkeydown={(e) => e.key === 'Enter' && handleSort('price')}
								tabindex="0"
							>
								<div class="th-content">
									<span>Price</span>
									<span class="sort-icon">{getSortIcon('price')}</span>
								</div>
							</th>
						{/if}
						{#if visibleColumns.speed}
							<th
								class="sortable col-num"
								onclick={() => handleSort('speed')}
								onkeydown={(e) => e.key === 'Enter' && handleSort('speed')}
								tabindex="0"
							>
								<div class="th-content">
									<span>Speed</span>
									<span class="sort-icon">{getSortIcon('speed')}</span>
								</div>
							</th>
						{/if}
						{#if visibleColumns.latency}
							<th
								class="sortable col-num"
								onclick={() => handleSort('latency')}
								onkeydown={(e) => e.key === 'Enter' && handleSort('latency')}
								tabindex="0"
							>
								<div class="th-content">
									<span>Latency</span>
									<span class="sort-icon">{getSortIcon('latency')}</span>
								</div>
							</th>
						{/if}
						{#if visibleColumns.release_date}
							<th
								class="sortable"
								onclick={() => handleSort('release_date')}
								onkeydown={(e) => e.key === 'Enter' && handleSort('release_date')}
								tabindex="0"
							>
								<div class="th-content">
									<span>Released</span>
									<span class="sort-icon">{getSortIcon('release_date')}</span>
								</div>
							</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each sortedModels as ranked, index (ranked.model.id)}
						<tr class:even={index % 2 === 0}>
							<td class="sticky-col col-fav">
								<button
									class="fav-btn"
									class:is-favorite={isFavorite(ranked.model.id)}
									onclick={() => toggleFavorite(ranked.model.id)}
									aria-label={isFavorite(ranked.model.id)
										? 'Remove from favorites'
										: 'Add to favorites'}
								>
									{isFavorite(ranked.model.id) ? '★' : '☆'}
								</button>
							</td>
							{#if visibleColumns.rank}
								<td
									class="sticky-col col-rank"
									class:top-score={isTopScore(ranked.overallScore, topScores.overall)}
								>
									<div class="rank-cell">
										<span class="rank-number">#{ranked.rank ?? '—'}</span>
										<span class="overall-score">{formatScore(ranked.overallScore)}</span>
									</div>
								</td>
							{/if}
							{#if visibleColumns.provider}
								<td class="col-provider">{ranked.model.provider}</td>
							{/if}
							{#if visibleColumns.model}
								<td
									class="col-model"
									onmouseenter={(e) =>
										showTooltip(e, 'model', {
											name: ranked.model.name,
											notes: ranked.model.editor_notes
										})}
									onmouseleave={hideTooltip}
								>
									<span class="model-name">{ranked.model.name}</span>
								</td>
							{/if}
							{#if visibleColumns.type}
								<td>
									<span class="type-badge" class:proprietary={ranked.model.type === 'proprietary'}>
										{ranked.model.type === 'proprietary' ? 'Proprietary' : 'Open Source'}
									</span>
								</td>
							{/if}
							{#each data.categories as category (category.id)}
								{#if visibleColumns[category.id as keyof typeof visibleColumns]}
									{@const score = ranked.categoryScores[category.id]}
									<td
										class="col-score"
										class:top-score={isTopScore(score, topScores.categories[category.id])}
										onmouseenter={(e) =>
											showTooltip(e, 'score', {
												category,
												model: ranked.model,
												score,
												breakdown: getCategoryBreakdown(ranked.model, category)
											})}
										onmouseleave={hideTooltip}
									>
										<span class="score-value">{formatScore(score)}</span>
									</td>
								{/if}
							{/each}
							{#if visibleColumns.price}
								<td class="col-num">{formatPrice(ranked.model.pricing.average_per_1m)}</td>
							{/if}
							{#if visibleColumns.speed}
								<td class="col-num">{formatSpeed(ranked.model.performance.output_speed_tps)} t/s</td
								>
							{/if}
							{#if visibleColumns.latency}
								<td class="col-num">{ranked.model.performance.latency_ttft_ms}ms</td>
							{/if}
							{#if visibleColumns.release_date}
								<td>{new Date(ranked.model.release_date).toLocaleDateString()}</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile Card View -->
		<div class="card-view">
			{#each sortedModels as ranked (ranked.model.id)}
				<article class="model-card">
					<header class="card-header">
						<div class="card-rank">
							<span class="rank-badge">#{ranked.rank ?? '—'}</span>
							<span class="overall">{formatScore(ranked.overallScore)}</span>
						</div>
						<button
							class="fav-btn"
							class:is-favorite={isFavorite(ranked.model.id)}
							onclick={() => toggleFavorite(ranked.model.id)}
						>
							{isFavorite(ranked.model.id) ? '★' : '☆'}
						</button>
					</header>
					<div class="card-body">
						<h3 class="card-title">{ranked.model.name}</h3>
						<p class="card-provider">
							{ranked.model.provider} ·
							<span class="type-badge" class:proprietary={ranked.model.type === 'proprietary'}>
								{ranked.model.type === 'proprietary' ? 'Proprietary' : 'Open'}
							</span>
						</p>
						<div class="card-scores">
							{#each data.categories.slice(0, 3) as category (category.id)}
								<div class="score-row">
									<span class="score-label">{category.emoji} {category.name}</span>
									<span class="score-value">{formatScore(ranked.categoryScores[category.id])}</span>
								</div>
							{/each}
						</div>
						<div class="card-footer">
							<span class="price">{formatPrice(ranked.model.pricing.average_per_1m)}</span>
							<span class="speed">{formatSpeed(ranked.model.performance.output_speed_tps)} t/s</span
							>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</main>

<!-- Tooltip -->
{#if activeTooltip}
	<div class="tooltip" style="left: {activeTooltip.x}px; top: {activeTooltip.y}px;" role="tooltip">
		{#if activeTooltip.type === 'model'}
			{@const tooltipData = activeTooltip.data as { name: string; notes: string }}
			<div class="tooltip-header">{tooltipData.name}</div>
			<div class="tooltip-body">
				<p class="tooltip-notes">{tooltipData.notes}</p>
			</div>
		{:else if activeTooltip.type === 'category'}
			{@const category = activeTooltip.data as Category}
			<div class="tooltip-header">{category.emoji} {category.name}</div>
			<div class="tooltip-body">
				<p>{category.description}</p>
				<p class="tooltip-weight">Weight: {(category.weight * 100).toFixed(0)}%</p>
			</div>
		{:else if activeTooltip.type === 'score'}
			{@const scoreData = activeTooltip.data as {
				category: Category;
				model: { name: string };
				score: number | null;
				breakdown: {
					benchmark: { id: string; name: string; url: string };
					rawScore: number | null;
					normalizedScore: number | null;
				}[];
			}}
			<div class="tooltip-header">{scoreData.category.name}: {formatScore(scoreData.score)}</div>
			<div class="tooltip-body">
				<ul class="benchmark-list">
					{#each scoreData.breakdown as item (item.benchmark.id)}
						<li>
							<span class="benchmark-name">{item.benchmark.name}</span>
							<span class="benchmark-score">{formatScore(item.normalizedScore)}</span>
							<a
								href={item.benchmark.url}
								target="_blank"
								rel="external noopener noreferrer"
								class="benchmark-link"
							>
								🔗
							</a>
						</li>
					{/each}
				</ul>
				<p class="benchmark-count">
					{scoreData.breakdown.filter((b) => b.normalizedScore !== null).length}/{scoreData
						.breakdown.length} benchmarks available
				</p>
			</div>
		{/if}
	</div>
{/if}

<footer class="footer">
	<div class="container">
		<p>
			Data sourced from public benchmarks.
			<a href="https://github.com/verseles/showdown" target="_blank" rel="noopener noreferrer">
				Contribute on GitHub
			</a>
		</p>
	</div>
</footer>

<style>
	/* Header */
	.header {
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-color);
		padding: var(--spacing-md) 0;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}

	.logo {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-sm);
	}

	.logo h1 {
		margin: 0;
		font-size: 1.5rem;
		background: linear-gradient(135deg, var(--accent-primary), #ff8e53);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.tagline {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.header-meta {
		display: flex;
		gap: var(--spacing-lg);
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.theme-toggle {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 50%;
		width: 40px;
		height: 40px;
		cursor: pointer;
		font-size: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background var(--transition-fast),
			transform var(--transition-fast);
	}

	.theme-toggle:hover {
		background: var(--border-color);
		transform: scale(1.05);
	}

	/* Main */
	.main {
		flex: 1;
		padding: var(--spacing-lg) 0;
	}

	/* Filters */
	.filters-bar {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
		padding: var(--spacing-md);
		background: var(--bg-secondary);
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.filter-group label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
	}

	.filter-select {
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--bg-primary);
		color: var(--text-primary);
		min-width: 120px;
	}

	.checkbox-group {
		display: flex;
		gap: var(--spacing-md);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		cursor: pointer;
		font-size: 0.875rem;
	}

	.reset-btn {
		padding: var(--spacing-xs) var(--spacing-md);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		color: var(--text-primary);
		cursor: pointer;
		font-size: 0.875rem;
		align-self: flex-end;
		transition: background var(--transition-fast);
	}

	.reset-btn:hover {
		background: var(--border-color);
	}

	/* Column Settings */
	.column-settings-wrapper {
		position: relative;
		align-self: flex-end;
	}

	.columns-btn {
		padding: var(--spacing-xs) var(--spacing-md);
		background: var(--accent-primary);
		border: none;
		border-radius: 4px;
		color: white;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background var(--transition-fast);
	}

	.columns-btn:hover {
		background: var(--accent-secondary);
	}

	.column-settings-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: var(--spacing-xs);
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		box-shadow: var(--shadow-lg);
		min-width: 200px;
		z-index: 100;
	}

	.dropdown-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--border-light);
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		color: var(--text-muted);
	}

	.column-options {
		padding: var(--spacing-sm);
		max-height: 400px;
		overflow-y: auto;
	}

	.column-options hr {
		border: none;
		border-top: 1px solid var(--border-light);
		margin: var(--spacing-xs) 0;
	}

	.column-option {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		cursor: pointer;
		border-radius: 4px;
		font-size: 0.875rem;
		transition: background var(--transition-fast);
	}

	.column-option:hover {
		background: var(--bg-secondary);
	}

	/* Table */
	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-primary);
	}

	.rankings-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}

	.rankings-table th,
	.rankings-table td {
		padding: var(--spacing-sm) var(--spacing-md);
		text-align: left;
		border-bottom: 1px solid var(--border-light);
		white-space: nowrap;
	}

	.rankings-table th {
		background: var(--bg-secondary);
		font-weight: 600;
		color: var(--text-secondary);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.sortable {
		cursor: pointer;
		user-select: none;
		transition: background var(--transition-fast);
	}

	.sortable:hover {
		background: var(--bg-tertiary);
	}

	.th-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.sort-icon {
		font-size: 0.75rem;
		color: var(--accent-primary);
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.emoji {
		font-size: 1rem;
	}

	.category-name {
		max-width: 80px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Row styling */
	.rankings-table tbody tr:hover {
		background: var(--bg-secondary);
	}

	.rankings-table tbody tr.even {
		background: var(--bg-secondary);
	}

	.rankings-table tbody tr.even:hover {
		background: var(--bg-tertiary);
	}

	/* Columns */
	.sticky-col {
		position: sticky;
		left: 0;
		background: inherit;
		z-index: 5;
	}

	.col-fav {
		width: 40px;
		text-align: center;
	}

	.col-rank {
		left: 40px;
		min-width: 100px;
	}

	.col-model {
		min-width: 150px;
	}

	.col-score {
		text-align: right;
		font-family: var(--font-mono);
	}

	.col-num {
		text-align: right;
		font-family: var(--font-mono);
	}

	/* Cell content */
	.fav-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.25rem;
		color: var(--text-muted);
		transition: color var(--transition-fast);
		padding: 0;
	}

	.fav-btn:hover,
	.fav-btn.is-favorite {
		color: #ffc107;
	}

	.rank-cell {
		display: flex;
		flex-direction: column;
	}

	.rank-number {
		font-weight: 700;
		color: var(--text-primary);
	}

	.overall-score {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.model-name {
		font-weight: 500;
		cursor: help;
	}

	.type-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
		background: var(--opensource-bg);
		color: var(--opensource-text);
	}

	.type-badge.proprietary {
		background: var(--proprietary-bg);
		color: var(--proprietary-text);
	}

	.top-score {
		background: var(--highlight-top-bg) !important;
	}

	.top-score .score-value,
	.top-score .overall-score {
		color: var(--highlight-top);
		font-weight: 700;
	}

	/* Card View (Mobile) */
	.card-view {
		display: none;
	}

	.model-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		overflow: hidden;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--bg-tertiary);
	}

	.card-rank {
		display: flex;
		align-items: baseline;
		gap: var(--spacing-sm);
	}

	.rank-badge {
		font-weight: 700;
		font-size: 1.25rem;
	}

	.card-body {
		padding: var(--spacing-md);
	}

	.card-title {
		margin: 0 0 var(--spacing-xs);
		font-size: 1.125rem;
	}

	.card-provider {
		margin: 0 0 var(--spacing-md);
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.card-scores {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-md);
	}

	.score-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
	}

	.score-label {
		color: var(--text-secondary);
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		padding-top: var(--spacing-sm);
		border-top: 1px solid var(--border-light);
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	/* Tooltip */
	.tooltip {
		position: fixed;
		transform: translateX(-50%);
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		box-shadow: var(--shadow-lg);
		padding: var(--spacing-sm);
		max-width: 300px;
		z-index: 1000;
		font-size: 0.875rem;
	}

	.tooltip-header {
		font-weight: 600;
		margin-bottom: var(--spacing-xs);
		padding-bottom: var(--spacing-xs);
		border-bottom: 1px solid var(--border-light);
	}

	.tooltip-body p {
		margin: 0 0 var(--spacing-xs);
		color: var(--text-secondary);
	}

	.tooltip-weight {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.tooltip-notes {
		font-style: italic;
	}

	.benchmark-list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--spacing-xs);
	}

	.benchmark-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-sm);
		padding: 2px 0;
	}

	.benchmark-name {
		flex: 1;
	}

	.benchmark-score {
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.benchmark-link {
		font-size: 0.75rem;
	}

	.benchmark-count {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	/* Footer */
	.footer {
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-color);
		padding: var(--spacing-md) 0;
		text-align: center;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.footer p {
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 767px) {
		.table-wrapper {
			display: none;
		}

		.card-view {
			display: flex;
			flex-direction: column;
			gap: var(--spacing-md);
		}

		.filters-bar {
			flex-direction: column;
		}

		.header-meta {
			flex-direction: column;
			gap: var(--spacing-xs);
		}
	}

	@media (min-width: 768px) and (max-width: 1023px) {
		.category-name {
			display: none;
		}
	}
</style>
