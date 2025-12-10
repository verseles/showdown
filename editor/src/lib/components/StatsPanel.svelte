<script lang="ts">
	import {
		getStats,
		meta,
		validationErrors,
		history,
		models
	} from '$lib/stores/data.svelte';

	const stats = $derived(getStats());

	function formatCoverage(value: number): string {
		return `${value.toFixed(1)}%`;
	}

	function getCoverageClass(value: number): string {
		if (value >= 80) return 'success';
		if (value >= 50) return 'warning';
		return 'error';
	}

	// Get recent history entries (last 10)
	const recentHistory = $derived(
		[...history].reverse().slice(0, 10).map((entry) => {
			const model = models.find((m) => m.id === entry.modelId);
			return {
				...entry,
				modelName: model?.name || entry.modelId,
				time: new Date(entry.timestamp).toLocaleTimeString()
			};
		})
	);
</script>

<div class="stats-panel">
	<!-- Metadata -->
	<div class="card">
		<h4 class="card-title">Data Info</h4>
		{#if meta}
			<table class="stats-table">
				<tbody>
					<tr>
						<td>Version</td>
						<td>{meta.version}</td>
					</tr>
					<tr>
						<td>Last Update</td>
						<td>{new Date(meta.last_update).toLocaleString()}</td>
					</tr>
					<tr>
						<td>Total Models</td>
						<td>{stats?.totalModels ?? 0}</td>
					</tr>
					<tr>
						<td>Benchmarks</td>
						<td>{stats?.totalBenchmarks ?? 0}</td>
					</tr>
				</tbody>
			</table>
		{/if}
	</div>

	<!-- Overall Coverage -->
	<div class="card">
		<h4 class="card-title">Overall Coverage</h4>
		{#if stats}
			<div class="coverage-main">
				<span class="coverage-value">{formatCoverage(stats.overallCoverage)}</span>
				<div class="progress-bar">
					<div
						class="progress-bar-fill {getCoverageClass(stats.overallCoverage)}"
						style="width: {stats.overallCoverage}%"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Coverage by Category -->
	<div class="card">
		<h4 class="card-title">Coverage by Category</h4>
		{#if stats}
			<div class="category-list">
				{#each stats.coverageByCategory as cat}
					<div class="category-item">
						<div class="category-header">
							<span>{cat.emoji} {cat.category}</span>
							<span class="coverage-badge {getCoverageClass(cat.coverage)}">
								{formatCoverage(cat.coverage)}
							</span>
						</div>
						<div class="progress-bar">
							<div
								class="progress-bar-fill {getCoverageClass(cat.coverage)}"
								style="width: {cat.coverage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Validation Errors -->
	{#if validationErrors.length > 0}
		<div class="card validation-card">
			<h4 class="card-title">Validation Errors ({validationErrors.length})</h4>
			<ul class="validation-list">
				{#each validationErrors.slice(0, 10) as error}
					<li>
						<span class="error-model">{error.modelName}</span>
						<span class="error-field">{error.field}</span>
						<span class="error-message">{error.message}</span>
					</li>
				{/each}
				{#if validationErrors.length > 10}
					<li class="more-errors">
						... and {validationErrors.length - 10} more
					</li>
				{/if}
			</ul>
		</div>
	{/if}

	<!-- Low Coverage Models -->
	{#if stats && stats.modelsWithLowCoverage.length > 0}
		<div class="card">
			<h4 class="card-title">Models with Low Coverage</h4>
			<ul class="low-coverage-list">
				{#each stats.modelsWithLowCoverage.slice(0, 5) as model}
					<li>
						<span class="model-name">{model.model}</span>
						<span class="coverage-badge {getCoverageClass(model.coverage)}">
							{formatCoverage(model.coverage)}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Recent Changes -->
	{#if recentHistory.length > 0}
		<div class="card">
			<h4 class="card-title">Recent Changes</h4>
			<ul class="history-list">
				{#each recentHistory as entry}
					<li>
						<span class="history-action {entry.action}">
							{entry.action === 'update' ? '✏️' : entry.action === 'add' ? '➕' : '🗑️'}
						</span>
						<span class="history-model">{entry.modelName}</span>
						{#if entry.field}
							<span class="history-field">.{entry.field}</span>
						{/if}
						<span class="history-time">{entry.time}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.stats-panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.coverage-main {
		text-align: center;
	}

	.coverage-value {
		font-size: 32px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.category-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.category-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
	}

	.coverage-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.coverage-badge.success {
		color: var(--success-color);
		background: var(--success-bg);
	}

	.coverage-badge.warning {
		color: var(--warning-color);
		background: var(--warning-bg);
	}

	.coverage-badge.error {
		color: var(--error-color);
		background: var(--error-bg);
	}

	.validation-card {
		border-color: var(--error-color);
	}

	.validation-list {
		list-style: none;
		font-size: 12px;
	}

	.validation-list li {
		padding: 6px 0;
		border-bottom: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.validation-list li:last-child {
		border-bottom: none;
	}

	.error-model {
		font-weight: 600;
		color: var(--text-primary);
	}

	.error-field {
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 11px;
	}

	.error-message {
		color: var(--error-color);
	}

	.more-errors {
		color: var(--text-muted);
		font-style: italic;
	}

	.low-coverage-list {
		list-style: none;
		font-size: 12px;
	}

	.low-coverage-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 0;
		border-bottom: 1px solid var(--border-color);
	}

	.low-coverage-list li:last-child {
		border-bottom: none;
	}

	.model-name {
		font-weight: 500;
	}

	.history-list {
		list-style: none;
		font-size: 11px;
	}

	.history-list li {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 0;
		border-bottom: 1px solid var(--border-color);
	}

	.history-list li:last-child {
		border-bottom: none;
	}

	.history-action {
		flex-shrink: 0;
	}

	.history-model {
		font-weight: 500;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.history-field {
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	.history-time {
		color: var(--text-muted);
		flex-shrink: 0;
	}
</style>
