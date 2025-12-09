import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

// Mock data for testing
const mockModels = [
	{
		id: 'test-model',
		name: 'Test Model',
		provider: 'Test Provider',
		type: 'open-source',
		pricing: { input: 0.1, output: 0.2 },
		speed: 100,
		elo: 1200,
		benchmarks: {}
	}
];

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page, {
			data: {
				models: mockModels,
				categories: [],
				meta: {}
			}
		});

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
