import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import type { ShowdownData } from '$lib/types';

const mockData: ShowdownData = {
	meta: {
		version: '1.0.0',
		last_update: new Date().toISOString(),
		schema_version: '1.0.0'
	},
	models: [
		{
			id: '1',
			name: 'Test Model 1',
			provider: 'Test Provider 1',
			type: 'proprietary',
			release_date: new Date().toISOString(),
			pricing: {
				input_per_1m: 1,
				output_per_1m: 2,
				average_per_1m: 1.5
			},
			performance: {
				output_speed_tps: 100,
				latency_ttft_ms: 200,
				source: 'test'
			},
			editor_notes: 'Test notes',
			benchmark_scores: {}
		}
	],
	categories: [
		{
			id: 'coding',
			name: 'Coding',
			emoji: '💻',
			weight: 0.25,
			description: 'Coding benchmarks',
			benchmarks: []
		}
	]
};

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page, {
			props: {
				data: mockData
			}
		});

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
