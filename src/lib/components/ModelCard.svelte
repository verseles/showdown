<script lang="ts">
	let { model, categories, showTooltip, tooltipContent, tooltipX, tooltipY } = $props();

	// Expanded state for showing all categories
	let expanded = $state(false);

	// Format price
	function formatPrice(price: number): string {
		if (price === 0) return 'Free';
		return `$${price.toFixed(2)}`;
	}

	// Format date
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short'
		});
	}

	// Format score with % sign
	function formatScore(score: number | null): string {
		if (score == null) return '—';
		return `${score.toFixed(1)}%`;
	}

	// Get type badge class
	function getTypeBadgeClass(type: string): string {
		return type === 'open-source'
			? 'badge badge-open-source'
			: 'badge badge-proprietary';
	}

	// Get category emoji
	function getCategoryEmoji(categoryId: string): string {
		const category = categories.find((c: any) => c.id === categoryId);
		return category?.emoji || '';
	}

	// Get category name
	function getCategoryName(categoryId: string): string {
		const category = categories.find((c: any) => c.id === categoryId);
		return category?.name || categoryId;
	}

	// Show tooltip
	function showScoreTooltip(event: MouseEvent, categoryId: string) {
		const category = categories.find((c: any) => c.id === categoryId);
		if (!category) return;

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

		tooltipContent.set(content);
		tooltipX.set(event.clientX);
		tooltipY.set(event.clientY);
		showTooltip.set(true);
	}
</script>

<div class="model-card">
	<div class="card-header">
		<div class="rank-section">
			<span class="rank-badge">#{model.rank || '—'}</span>
			<div class="overall-score">{model.overall_score?.toFixed(1) ?? '—'}%</div>
		</div>
		<div class="model-info">
			<h3 class="model-name">{model.name}</h3>
			<div class="model-meta">
				<span class="provider">{model.provider}</span>
				<span class={getTypeBadgeClass(model.type)}>
					{model.type === 'open-source' ? 'Open Source' : 'Proprietary'}
				</span>
			</div>
		</div>
	</div>

	<div class="card-body">
		<div class="categories-grid">
			{#each categories.slice(0, expanded ? categories.length : 3) as category}
				<div
					class="category-item"
					role="tooltip"
					onmouseenter={(e) => showScoreTooltip(e as MouseEvent, category.id)}
					onmouseleave={() => showTooltip.set(false)}
				>
					<span class="category-emoji">{category.emoji}</span>
					<span class="category-name">{category.name}:</span>
					<span class="category-score">
						{formatScore(model.category_scores?.[category.id] ?? null)}
					</span>
				</div>
			{/each}
		</div>

		{#if !expanded && categories.length > 3}
			<button class="expand-button" onclick={() => expanded = true}>
				Show all {categories.length} categories
			</button>
		{/if}

		<div class="meta-info">
			<div class="meta-item">
				<span class="meta-label">Price:</span>
				<span class="meta-value">{formatPrice(model.pricing.average_per_1m)}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Speed:</span>
				<span class="meta-value">{model.performance.output_speed_tps.toFixed(1)} tok/s</span>
			</div>
		</div>
	</div>

	<div class="card-footer">
		<button class="action-button favorite-button">
			⭐ Favorite
		</button>
		<button class="action-button details-button">
			🔗 Details
		</button>
	</div>
</div>

<style>
	.model-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.card-header {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.rank-section {
		flex-shrink: 0;
		text-align: center;
	}

	.rank-badge {
		display: inline-block;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 700;
		font-size: 1rem;
	}

	.overall-score {
		font-size: 0.75rem;
		color: #666;
		margin-top: 0.25rem;
	}

	.model-info {
		flex: 1;
	}

	.model-name {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: #212529;
	}

	.model-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.provider {
		font-size: 0.9rem;
		color: #495057;
		font-weight: 500;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.7rem;
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

	.card-body {
		margin-bottom: 1rem;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.category-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 8px;
		transition: background-color 0.2s;
	}

	.category-item:hover {
		background: #e9ecef;
	}

	.category-emoji {
		font-size: 1.2rem;
	}

	.category-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: #495057;
		flex: 1;
	}

	.category-score {
		font-size: 0.85rem;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		color: #212529;
	}

	.expand-button {
		width: 100%;
		padding: 0.75rem;
		background: #e7f5ff;
		border: 1px solid #a5d8ff;
		border-radius: 8px;
		color: #1971c2;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.expand-button:hover {
		background: #d0ebff;
	}

	.meta-info {
		display: flex;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #dee2e6;
	}

	.meta-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.meta-label {
		font-size: 0.75rem;
		color: #6c757d;
		text-transform: uppercase;
		font-weight: 600;
	}

	.meta-value {
		font-size: 0.9rem;
		font-weight: 700;
		font-family: 'Courier New', monospace;
		color: #495057;
	}

	.card-footer {
		display: flex;
		gap: 0.5rem;
	}

	.action-button {
		flex: 1;
		padding: 0.75rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.action-button:hover {
		opacity: 0.8;
	}

	.favorite-button {
		background: #fff3bf;
		color: #f08c00;
	}

	.details-button {
		background: #e7f5ff;
		color: #1971c2;
	}

	@media (max-width: 480px) {
		.categories-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
