import { json } from '@sveltejs/kit';
import simpleGit from 'simple-git';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { RequestHandler } from './$types';

// Resolve path relative to this file's location for reliability
const __dirname = dirname(fileURLToPath(import.meta.url));
// Navigate from editor/src/routes/api/git/status/ to project root
const REPO_PATH = resolve(__dirname, '../../../../../../');

export const GET: RequestHandler = async () => {
	try {
		const git = simpleGit(REPO_PATH);
		const status = await git.status();

		return json({
			modified: status.modified,
			staged: status.staged,
			ahead: status.ahead,
			behind: status.behind,
			current: status.current,
			isClean: status.isClean()
		});
	} catch (error) {
		console.error('Git status failed:', error);
		return json({ error: 'Failed to get git status' }, { status: 500 });
	}
};
