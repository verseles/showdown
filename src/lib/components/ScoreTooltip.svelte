<script lang="ts">
	import { formatScore } from '$lib/ranking.js';
	import * as m from '$lib/paraglide/messages.js';
	import type { Category } from '$lib/types';

	export let data: {
		category: Category;
		model: { name: string };
		score: number | null;
		breakdown: {
			benchmark: { id: string; name: string; url: string; description: string };
			rawScore: number | null;
			normalizedScore: number | null;
		}[];
	};
	export let t: (key: string, defaultValue: string) => string;
</script>

<div class="tooltip-header">
	{t('category_' + data.category.id, data.category.name)}: {formatScore(data.score)}
</div>
<div class="tooltip-body">
	<ul class="benchmark-list">
		{#each data.breakdown as item (item.benchmark.id)}
			<li>
				<span
					class="benchmark-name"
					title={t('bench_description_' + item.benchmark.id, item.benchmark.description)}
					>{t('bench_' + item.benchmark.id, item.benchmark.name)}</span
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
			available: data.breakdown.filter((b) => b.normalizedScore !== null).length,
			total: data.breakdown.length
		})}
	</p>
</div>
