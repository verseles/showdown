<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { untrack } from 'svelte';
	import SimpleMultiSelect from '$lib/components/SimpleMultiSelect.svelte';
	import type { PageData } from './$types';
	import type { Category, FilterState, Model } from '$lib/types.js';
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
	import * as m from '$lib/paraglide/messages.js';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	let { data }: { data: PageData } = $props();

	// Theme context from layout
	const themeContext = getContext<{
		current: 'light' | 'dark';
		mode: 'light' | 'dark' | 'system';
		toggle: () => void;
	}>('theme');

	// Get theme icon based on current mode
	function getThemeIcon(mode: 'light' | 'dark' | 'system' | undefined): string {
		if (mode === 'system') return '💻';
		if (mode === 'dark') return '🌙';
		return '☀️';
	}

	// Get aria-label for theme toggle
	function getThemeAriaLabel(mode: 'light' | 'dark' | 'system' | undefined): string {
		if (mode === 'system') return m.aria_switch_light();
		if (mode === 'light') return m.aria_switch_dark();
		return m.aria_switch_system();
	}

	// Sorting state - Default to Coding category (best to worst)
	let sortBy = $state('coding');
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

	// Column visibility state - Provider hidden by default
	let visibleColumns = $state({
		rank: true,
		provider: false,
		model: true,
		type: true,
		coding: true,
		reasoning: true,
		agents: true,
		conversation: true,
		math: true,
		multimodal: true,
		knowledge: true,
		price: true,
		speed: true,
		latency: false,
		release_date: false
	});

	// Column settings dropdown state
	let showColumnSettings = $state(false);

	// Track if localStorage has been loaded
	let isInitialized = $state(false);

	// Load favorites and column visibility from localStorage (only once on mount)
	onMount(() => {
		const storedFavorites = localStorage.getItem('favorites');
		if (storedFavorites) {
			try {
				favorites = JSON.parse(storedFavorites);
			} catch {
				// Invalid JSON, use default
			}
		}
		const storedColumns = localStorage.getItem('visibleColumns');
		if (storedColumns) {
			try {
				visibleColumns = { ...visibleColumns, ...JSON.parse(storedColumns) };
			} catch {
				// Invalid JSON, use default
			}
		} else {
			// No stored preferences - show all columns on mobile
			const isMobile = window.innerWidth < 768;
			if (isMobile) {
				visibleColumns = {
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
					knowledge: true,
					price: true,
					speed: true,
					latency: true,
					release_date: true
				};
			}
		}
		isInitialized = true;
	});

	// Save favorites to localStorage (only after initialization)
	$effect(() => {
		if (isInitialized) {
			untrack(() => {
				localStorage.setItem('favorites', JSON.stringify(favorites));
			});
		}
	});

	// Save column visibility to localStorage (only after initialization)
	$effect(() => {
		if (isInitialized) {
			untrack(() => {
				localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
			});
		}
	});

	// Computed values
	let rankedModels = $derived(rankModels(data.models, data.categories));
	let topScores = $derived(findTopScores(rankedModels, data.categories));
	let activeModelsCount = $derived(data.models.filter((m) => !m.disabled).length);

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
		type: 'model' | 'category' | 'score' | 'price';
		data: unknown;
		x: number;
		y: number;
	} | null>(null);

	function showTooltip(
		event: MouseEvent,
		type: 'model' | 'category' | 'score' | 'price',
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

	// Mobile score click handler
	function handleScoreClick(
		event: MouseEvent,
		model: Model,
		category: Category,
		score: number | null
	) {
		event.stopPropagation();
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();

		// Toggle tooltip: if clicking the same score, hide it
		if (activeTooltip && activeTooltip.type === 'score') {
			const currentData = activeTooltip.data as { category: Category; model: Model };
			if (currentData.category.id === category.id && currentData.model.id === model.id) {
				activeTooltip = null;
				return;
			}
		}

		// Show tooltip with score breakdown
		activeTooltip = {
			type: 'score',
			data: {
				category,
				model,
				score,
				breakdown: getCategoryBreakdown(model, category)
			},
			x: rect.left + rect.width / 2,
			y: rect.bottom + 8
		};
	}

	// Expanded cards state for mobile view
	let expandedCards = $state<Set<string>>(new Set());

	function toggleCardExpanded(modelId: string) {
		if (expandedCards.has(modelId)) {
			expandedCards = new Set([...expandedCards].filter((id) => id !== modelId));
		} else {
			expandedCards = new Set([...expandedCards, modelId]);
		}
	}

	function isCardExpanded(modelId: string): boolean {
		return expandedCards.has(modelId);
	}

	function t(key: string, defaultValue: string): string {
		const message = m[key as keyof typeof m];
		if (typeof message === 'function') {
			return (message as () => string)();
		}
		return defaultValue;
	}

	// Close tooltip when clicking outside on mobile
	$effect(() => {
		if (activeTooltip) {
			const handleClickOutside = (event: MouseEvent) => {
				const target = event.target as HTMLElement;
				// Don't close if clicking on the tooltip itself or a clickable score
				if (!target.closest('.tooltip') && !target.closest('.clickable-score')) {
					activeTooltip = null;
				}
			};

			// Add a small delay to prevent immediate closing when opening
			const timeoutId = setTimeout(() => {
				document.addEventListener('click', handleClickOutside);
			}, 100);

			return () => {
				clearTimeout(timeoutId);
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<svelte:head>
	<title>{m.site_title()}</title>
	<meta name="description" content={m.site_description()} />
	<meta property="og:title" content={m.og_title()} />
	<meta property="og:description" content={m.og_description()} />
	<meta property="og:url" content="https://showdown.best" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={m.og_title()} />
</svelte:head>

<header class="header">
	<div class="container">
		<div class="header-content">
			<div class="header-top">
				<div class="logo">
					<h1>{m.header_title()}</h1>
					<span class="tagline">{m.header_tagline()}</span>
				</div>
				<div class="header-buttons">
					<LanguageSelector />
					<a
						href="https://github.com/verseles/showdown"
						target="_blank"
						rel="noopener noreferrer"
						class="github-star-btn"
						aria-label={m.aria_star_github()}
					>
						<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
							<path
								d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
							/>
						</svg>
						<span>{m.github_star()}</span>
					</a>
					<button
						class="theme-toggle"
						onclick={() => themeContext?.toggle()}
						aria-label={getThemeAriaLabel(themeContext?.mode)}
					>
						{getThemeIcon(themeContext?.mode)}
					</button>
				</div>
			</div>
			<div class="header-meta">
				<span class="model-count">
					{m.header_showing({ count: sortedModels.length, total: activeModelsCount })}
				</span>
				<span class="last-update">
					{m.header_updated({ date: new Date(data.meta.last_update).toLocaleDateString() })}
				</span>
			</div>
		</div>
	</div>
</header>

<main class="main">
	<div class="container">
		<!-- Filters Bar -->
		<div class="filters-bar">
			<div class="filter-group">
				<label for="provider-filter">{m.filter_provider()}</label>
				<SimpleMultiSelect
					bind:selected={filters.providers}
					options={providers}
					placeholder={m.filter_provider_placeholder()}
				/>
			</div>

			<div class="filter-group">
				<span class="filter-label">{m.filter_type()}</span>
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
						{m.filter_proprietary()}
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
						{m.filter_opensource()}
					</label>
				</div>
			</div>

			<div class="filter-group">
				<label for="date-range-filter">{m.filter_date_range()}</label>
				<select id="date-range-filter" bind:value={filters.dateRange} class="filter-select">
					<option value="all">{m.filter_date_all()}</option>
					<option value="30d">{m.filter_date_30d()}</option>
					<option value="90d">{m.filter_date_90d()}</option>
					<option value="180d">{m.filter_date_180d()}</option>
				</select>
			</div>

			<div class="filter-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={filters.favoritesOnly} />
					{m.filter_favorites_only()}
				</label>
			</div>

			<div class="filter-actions">
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
					{m.filter_reset()}
				</button>

				<div class="column-settings-wrapper">
					<button
						class="columns-btn"
						onclick={() => (showColumnSettings = !showColumnSettings)}
						aria-expanded={showColumnSettings}
					>
						{m.filter_columns()}
					</button>
					{#if showColumnSettings}
						<div class="column-settings-dropdown">
							<div class="dropdown-header">
								<span>{m.filter_visible_columns()}</span>
								<button class="close-btn" onclick={() => (showColumnSettings = false)}>x</button>
							</div>
							<div class="column-options">
								<label class="column-option">
									<input type="checkbox" bind:checked={visibleColumns.rank} />
									{m.column_rank_score()}
								</label>
								<label class="column-option">
									<input type="checkbox" bind:checked={visibleColumns.provider} />
									{m.column_provider()}
								</label>
								<label class="column-option">
									<input type="checkbox" bind:checked={visibleColumns.model} />
									{m.column_model()}
								</label>
								<label class="column-option">
									<input type="checkbox" bind:checked={visibleColumns.type} />
									{m.column_type()}
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
										{t('category_' + category.id, category.name)}
									</label>
								{/each}
								<hr />
								<label class="column-option">
									<input type="checkbox" bind:checked={visibleColumns.price} />
									{m.column_price()}
								</label>
								<label class="column-option">
									<input type="checkbox" bind:checked={visibleColumns.speed} />
									{m.column_speed()}
								</label>
								<label class="column-option">
									<input type="checkbox" bind:checked={visibleColumns.latency} />
									{m.column_latency()}
								</label>
								<label class="column-option">
									<input type="checkbox" bind:checked={visibleColumns.release_date} />
									{m.column_release_date()}
								</label>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Rankings Table -->
		<div class="table-wrapper">
			<table class="rankings-table">
				<thead>
					<tr>
						<th class="sticky-col col-fav">
							<span class="sr-only">{m.aria_favorite()}</span>
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
									<span>{m.column_rank()}</span>
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
									<span>{m.column_provider()}</span>
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
									<span>{m.column_model()}</span>
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
									<span>{m.column_type()}</span>
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
											<span class="category-name"
												>{t('category_' + category.id, category.name)}</span
											>
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
									<span>{m.column_price()}</span>
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
									<span>{m.column_speed()}</span>
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
									<span>{m.column_latency()}</span>
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
									<span>{m.column_released()}</span>
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
										? m.aria_remove_favorite()
										: m.aria_add_favorite()}
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
										{ranked.model.type === 'proprietary'
											? m.type_proprietary()
											: m.type_opensource()}
									</span>
								</td>
							{/if}
							{#each data.categories as category (category.id)}
								{#if visibleColumns[category.id as keyof typeof visibleColumns]}
									{@const score = ranked.categoryScores[category.id]}
									{@const breakdown = getCategoryBreakdown(ranked.model, category)}
									{@const hasImputedValues =
										ranked.model.imputed_metadata &&
										category.benchmarks.some((b) => ranked.model.imputed_metadata?.[b.id])}
									<td
										class="col-score"
										class:top-score={isTopScore(score, topScores.categories[category.id])}
										onmouseenter={(e) =>
											showTooltip(e, 'score', {
												category,
												model: ranked.model,
												score,
												breakdown
											})}
										onmouseleave={hideTooltip}
									>
										<span class="score-value">
											{formatScore(score)}
											{#if hasImputedValues}
												<span class="imputed-indicator" title={m.imputed_indicator_title()}>*</span>
											{/if}
										</span>
									</td>
								{/if}
							{/each}
							{#if visibleColumns.price}
								<td
									class="col-num col-price"
									onmouseenter={(e) => showTooltip(e, 'price', ranked.model)}
									onmouseleave={hideTooltip}
								>
									{formatPrice(ranked.model.pricing.average_per_1m)}
								</td>
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
			<div class="card-sort-by">
				<label for="sort-by-select">{m.sort_by()}</label>
				<select
					id="sort-by-select"
					bind:value={sortBy}
					class="sort-select"
					onchange={() => {
						sortOrder = 'desc';
					}}
				>
					<option value="overall">{m.column_rank()}</option>
					<option value="name">{m.column_model()}</option>
					{#each data.categories as category (category.id)}
						<option value={category.id}>{t('category_' + category.id, category.name)}</option>
					{/each}
					<option value="price">{m.column_price()}</option>
					<option value="speed">{m.column_speed()}</option>
				</select>
				<button
					class="sort-order-btn"
					onclick={() => (sortOrder = sortOrder === 'asc' ? 'desc' : 'asc')}
					aria-label={m.aria_toggle_sort_order()}
				>
					{sortOrder === 'asc' ? '▲' : '▼'}
				</button>
			</div>
			{#each sortedModels as ranked (ranked.model.id)}
				{@const expanded = isCardExpanded(ranked.model.id)}
				<article class="model-card" class:expanded>
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
						{#if visibleColumns.provider || visibleColumns.type}
							<p class="card-provider">
								{#if visibleColumns.provider}
									{ranked.model.provider}
								{/if}
								{#if visibleColumns.provider && visibleColumns.type}
									·
								{/if}
								{#if visibleColumns.type}
									<span class="type-badge" class:proprietary={ranked.model.type === 'proprietary'}>
										{ranked.model.type === 'proprietary' ? m.type_proprietary() : m.type_open()}
									</span>
								{/if}
							</p>
						{/if}
						<div class="card-scores">
							{#each data.categories
								.filter((c) => visibleColumns[c.id as keyof typeof visibleColumns])
								.slice(0, expanded ? undefined : 3) as category (category.id)}
								{@const score = ranked.categoryScores[category.id]}
								{@const hasImputedValues =
									ranked.model.imputed_metadata &&
									category.benchmarks.some((b) => ranked.model.imputed_metadata?.[b.id])}
								<div
									class="score-row clickable-score"
									onclick={(e) => handleScoreClick(e, ranked.model, category, score)}
									role="button"
									tabindex="0"
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleScoreClick(e as unknown as MouseEvent, ranked.model, category, score);
										}
									}}
								>
									<span class="score-label"
										>{category.emoji} {t('category_' + category.id, category.name)}</span
									>
									<span class="score-value">
										{formatScore(score)}{#if hasImputedValues}<span
												class="imputed-indicator"
												title={m.imputed_indicator_title()}>*</span
											>{/if}
										<svg
											class="info-icon"
											width="14"
											height="14"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<circle cx="12" cy="12" r="10"></circle>
											<line x1="12" y1="16" x2="12" y2="12"></line>
											<line x1="12" y1="8" x2="12.01" y2="8"></line>
										</svg>
									</span>
								</div>
							{/each}
						</div>
						{#if expanded}
							<div class="card-details">
								{#if visibleColumns.price}
									<div class="detail-row">
										<span class="detail-label">{m.card_price_avg()}</span>
										<span class="detail-value"
											>{formatPrice(ranked.model.pricing.average_per_1m)}</span
										>
									</div>
									<div class="detail-row">
										<span class="detail-label">{m.card_input()}</span>
										<span class="detail-value"
											>${ranked.model.pricing.input_per_1m.toFixed(2)}/1M</span
										>
									</div>
									<div class="detail-row">
										<span class="detail-label">{m.card_output()}</span>
										<span class="detail-value"
											>${ranked.model.pricing.output_per_1m.toFixed(2)}/1M</span
										>
									</div>
								{/if}
								{#if visibleColumns.speed}
									<div class="detail-row">
										<span class="detail-label">{m.card_speed()}</span>
										<span class="detail-value"
											>{formatSpeed(ranked.model.performance.output_speed_tps)} t/s</span
										>
									</div>
								{/if}
								{#if visibleColumns.latency}
									<div class="detail-row">
										<span class="detail-label">{m.card_latency()}</span>
										<span class="detail-value">{ranked.model.performance.latency_ttft_ms}ms</span>
									</div>
								{/if}
								{#if visibleColumns.release_date}
									<div class="detail-row">
										<span class="detail-label">{m.card_released()}</span>
										<span class="detail-value"
											>{new Date(ranked.model.release_date).toLocaleDateString()}</span
										>
									</div>
								{/if}
							</div>
						{:else if visibleColumns.price || visibleColumns.speed}
							<div class="card-footer">
								{#if visibleColumns.price}
									<span class="price">{formatPrice(ranked.model.pricing.average_per_1m)}</span>
								{/if}
								{#if visibleColumns.speed}
									<span class="speed"
										>{formatSpeed(ranked.model.performance.output_speed_tps)} t/s</span
									>
								{/if}
							</div>
						{/if}
						<button
							class="expand-btn"
							onclick={() => toggleCardExpanded(ranked.model.id)}
							aria-expanded={expanded}
							aria-label={expanded ? m.aria_show_less() : m.aria_show_more()}
						>
							<span class="expand-icon" class:rotated={expanded}>▼</span>
							<span>{expanded ? m.card_show_less() : m.card_show_all()}</span>
						</button>
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
			<div class="tooltip-header">
				{category.emoji}
				{t('category_' + category.id, category.name)}
			</div>
			<div class="tooltip-body">
				<p>{t('category_description_' + category.id, category.description)}</p>
				<p class="tooltip-weight">
					{m.tooltip_weight({ percentage: (category.weight * 100).toFixed(0) })}
				</p>
			</div>
		{:else if activeTooltip.type === 'score'}
			{@const scoreData = activeTooltip.data as {
				category: Category;
				model: Model;
				score: number | null;
				breakdown: {
					benchmark: { id: string; name: string; url: string; description: string };
					rawScore: number | null;
					normalizedScore: number | null;
				}[];
			}}
			<div class="tooltip-header">
				{t('category_' + scoreData.category.id, scoreData.category.name)}: {formatScore(
					scoreData.score
				)}
			</div>
			<div class="tooltip-body">
				<ul class="benchmark-list">
					{#each scoreData.breakdown as item (item.benchmark.id)}
						{@const isImputed = scoreData.model.imputed_metadata?.[item.benchmark.id]}
						{@const isSuperiorImputed = isImputed?.method === 'superior_of'}
						{@const confidenceIcon =
							isImputed?.confidence === 'high'
								? '✓'
								: isImputed?.confidence === 'medium'
									? '◐'
									: '⚠'}
						<li
							class:imputed-benchmark={isImputed && !isSuperiorImputed}
							class:superior-imputed={isSuperiorImputed}
						>
							<span
								class="benchmark-name"
								title={t('bench_description_' + item.benchmark.id, item.benchmark.description)}
								>{t('bench_' + item.benchmark.id, item.benchmark.name)}{#if isImputed}<span
										class="imputed-marker"
										class:superior-marker={isSuperiorImputed}
										title={isImputed.note +
											(isImputed.confidence
												? ` [${t('confidence_' + isImputed.confidence, isImputed.confidence)} confidence, ${isImputed.benchmarks_used} benchmarks]`
												: '')}>*{confidenceIcon}</span
									>{/if}</span
							>
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
					{m.tooltip_benchmarks_available({
						available: scoreData.breakdown.filter((b) => b.normalizedScore !== null).length,
						total: scoreData.breakdown.length
					})}
				</p>
				{#if scoreData.model.imputed_metadata && Object.keys(scoreData.model.imputed_metadata).some( (id) => scoreData.category.benchmarks.find((b) => b.id === id) )}
					{@const categoryImputedMeta = Object.entries(scoreData.model.imputed_metadata).filter(
						([id]) => scoreData.category.benchmarks.find((b) => b.id === id)
					)}
					{@const hasSuperior = categoryImputedMeta.some(
						([, meta]) => meta.method === 'superior_of'
					)}
					{@const hasAverage = categoryImputedMeta.some(
						([, meta]) => meta.method === 'category_average'
					)}
					<div class="imputed-notice">
						{#if hasSuperior}
							<p class="superior-notice"><em>{m.superior_imputed_notice()}</em></p>
						{/if}
						{#if hasAverage}
							<p><em>{m.imputed_notice()}</em></p>
						{/if}
					</div>
				{/if}
			</div>
		{:else if activeTooltip.type === 'price'}
			{@const model = activeTooltip.data as Model}
			<div class="tooltip-header">{m.tooltip_pricing({ model: model.name })}</div>
			<div class="tooltip-body">
				<div class="price-breakdown">
					<div class="price-row">
						<span class="price-label">{m.tooltip_input()}</span>
						<span class="price-value"
							>${model.pricing.input_per_1m.toFixed(2)} {m.tooltip_per_1m_tokens()}</span
						>
					</div>
					<div class="price-row">
						<span class="price-label">{m.tooltip_output()}</span>
						<span class="price-value"
							>${model.pricing.output_per_1m.toFixed(2)} {m.tooltip_per_1m_tokens()}</span
						>
					</div>
					<div class="price-row price-average">
						<span class="price-label">{m.tooltip_average()}</span>
						<span class="price-value"
							>${model.pricing.average_per_1m.toFixed(2)} {m.tooltip_per_1m_tokens()}</span
						>
					</div>
				</div>
				<p class="price-note">{m.tooltip_average_formula()}</p>
			</div>
		{/if}
	</div>
{/if}

<footer class="footer">
	<div class="container">
		<p>
			<span>{m.footer_data_sourced()}</span>
			<a href="https://github.com/verseles/showdown" target="_blank" rel="noopener noreferrer">
				{m.footer_contribute()}
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
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
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

	.header-buttons {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.header-meta {
		display: flex;
		gap: var(--spacing-md);
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

	.github-star-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		color: var(--text-primary);
		text-decoration: none;
		font-size: 0.875rem;
		transition:
			background var(--transition-fast),
			transform var(--transition-fast);
	}

	.github-star-btn:hover {
		background: var(--border-color);
		transform: scale(1.02);
	}

	.github-star-btn svg {
		flex-shrink: 0;
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
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.875rem;
		min-width: 140px;
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

	.filter-actions {
		display: flex;
		gap: var(--spacing-sm);
		align-self: flex-end;
		margin-left: auto;
	}

	.reset-btn {
		padding: var(--spacing-xs) var(--spacing-md);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		color: var(--text-primary);
		cursor: pointer;
		font-size: 0.875rem;
		transition: background var(--transition-fast);
	}

	.reset-btn:hover {
		background: var(--border-color);
	}

	/* Column Settings */
	.column-settings-wrapper {
		position: relative;
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
		z-index: 1000;
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
		z-index: 2;
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
		z-index: 1;
	}

	/* Sticky column headers need higher z-index to stay above everything in table */
	th.sticky-col {
		z-index: 3;
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
		flex-direction: row;
		align-items: baseline;
		gap: var(--spacing-sm);
	}

	.rank-number {
		font-weight: 700;
		color: var(--text-primary);
	}

	.overall-score {
		font-size: 0.8rem;
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

	.card-sort-by {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
	}

	.card-sort-by label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.sort-select {
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--bg-secondary);
		color: var(--text-primary);
		flex-grow: 1;
	}

	.sort-order-btn {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		padding: var(--spacing-xs) var(--spacing-sm);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
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

	.clickable-score {
		cursor: pointer;
		padding: var(--spacing-xs);
		margin: calc(var(--spacing-xs) * -1);
		border-radius: 6px;
		transition: background-color 0.2s ease;
	}

	.clickable-score:hover {
		background-color: var(--bg-hover);
	}

	.clickable-score:active {
		transform: scale(0.98);
	}

	.score-label {
		color: var(--text-secondary);
	}

	.score-value {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-weight: 600;
	}

	.info-icon {
		opacity: 0.5;
		flex-shrink: 0;
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

	.imputed-indicator {
		color: var(--accent-warning, #f59e0b);
		font-weight: bold;
		font-size: 0.9em;
		margin-left: 2px;
		cursor: help;
	}

	.imputed-marker {
		color: var(--accent-warning, #f59e0b);
		font-weight: bold;
		margin-left: 2px;
		cursor: help;
	}

	.imputed-benchmark {
		background: rgba(245, 158, 11, 0.1);
		border-radius: 4px;
		padding: 2px 4px;
	}

	/* Superior imputed values - more reliable, green */
	.superior-imputed {
		background: rgba(34, 197, 94, 0.1);
		border-radius: 4px;
		padding: 2px 4px;
	}

	.superior-marker {
		color: var(--accent-success, #22c55e) !important;
	}

	.imputed-notice {
		font-size: 0.7rem;
		color: var(--accent-warning, #f59e0b);
		font-style: italic;
		margin-top: var(--spacing-xs);
		border-top: 1px solid var(--border-light);
		padding-top: var(--spacing-xs);
	}

	.imputed-notice p {
		margin: 0;
	}

	.imputed-notice .superior-notice {
		color: var(--accent-success, #22c55e);
	}

	.price-breakdown {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.price-row {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-md);
	}

	.price-label {
		color: var(--text-secondary);
	}

	.price-value {
		font-family: var(--font-mono);
		font-weight: 500;
	}

	.price-average {
		padding-top: var(--spacing-xs);
		border-top: 1px solid var(--border-light);
		font-weight: 600;
	}

	.price-note {
		font-size: 0.7rem;
		color: var(--text-muted);
		font-style: italic;
		margin-top: var(--spacing-xs);
	}

	.col-price {
		cursor: help;
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

	/* Card Details (expandable) */
	.card-details {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding-top: var(--spacing-sm);
		margin-top: var(--spacing-sm);
		border-top: 1px solid var(--border-light);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
	}

	.detail-label {
		color: var(--text-muted);
	}

	.detail-value {
		font-family: var(--font-mono);
		color: var(--text-primary);
	}

	.expand-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		width: 100%;
		padding: var(--spacing-sm);
		margin-top: var(--spacing-sm);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		color: var(--text-secondary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.expand-btn:hover {
		background: var(--border-color);
	}

	.expand-icon {
		display: inline-block;
		transition: transform 0.2s ease;
		font-size: 0.75rem;
	}

	.expand-icon.rotated {
		transform: rotate(180deg);
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

		/* Keep filter actions on same row */
		.filter-actions {
			display: flex;
			gap: var(--spacing-sm);
			width: 100%;
		}

		.reset-btn,
		.column-settings-wrapper {
			flex: 1;
		}

		.columns-btn {
			width: 100%;
		}

		/* Header mobile adjustments */
		.header-top {
			flex-wrap: wrap;
			gap: var(--spacing-sm);
		}

		.header-buttons {
			order: 3;
			width: 100%;
			justify-content: flex-end;
			gap: var(--spacing-xs);
		}

		.header-meta {
			font-size: 0.75rem;
			gap: var(--spacing-sm);
		}

		/* Fix theme toggle circle */
		.theme-toggle {
			flex-shrink: 0;
			min-width: 36px;
			min-height: 36px;
			width: 36px;
			height: 36px;
		}

		.github-star-btn {
			padding: 4px 8px;
			font-size: 0.75rem;
		}

		.github-star-btn span {
			display: none;
		}

		/* Footer line break */
		.footer p {
			display: flex;
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
