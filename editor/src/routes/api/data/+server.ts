import { json } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';

// In SvelteKit, process.cwd() returns the directory where the dev server started
// For editor/, that's /path/to/showdown/editor, so we go up one level to find data/
const DATA_PATH = join(process.cwd(), '..', 'data', 'showdown.json');

export const GET: RequestHandler = async () => {
	try {
		console.log('[API] Loading data from:', DATA_PATH);
		const content = await readFile(DATA_PATH, 'utf-8');
		const data = JSON.parse(content);
		console.log('[API] Loaded', data.models?.length, 'models');
		return json(data);
	} catch (error) {
		console.error('Failed to read data:', error);
		return json({ error: 'Failed to read data file' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Update metadata
		data.meta.last_update = new Date().toISOString();
		data.meta.version = new Date().toISOString().split('T')[0].replace(/-/g, '.');

		await writeFile(DATA_PATH, JSON.stringify(data, null, '\t'), 'utf-8');
		return json({ success: true, meta: data.meta });
	} catch (error) {
		console.error('Failed to write data:', error);
		return json({ error: 'Failed to write data file' }, { status: 500 });
	}
};
