import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		const mockData = {
			models: [],
			categories: [],
			meta: {
				version: '1.0.0',
				last_update: new Date().toISOString(),
				schema_version: '1.0.0'
			}
		};
		render(Page, { data: mockData });

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
