import { json } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { RequestHandler } from './$types';

// Resolve path relative to this file's location for reliability
const __dirname = dirname(fileURLToPath(import.meta.url));
// Navigate from editor/src/routes/api/data/ to project root's data/showdown.json
const DATA_PATH = resolve(__dirname, '../../../../../data/showdown.json');

export const GET: RequestHandler = async () => {
	try {
		const content = await readFile(DATA_PATH, 'utf-8');
		const data = JSON.parse(content);
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
