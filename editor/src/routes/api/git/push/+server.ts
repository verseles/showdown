import { json } from '@sveltejs/kit';
import simpleGit from 'simple-git';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { RequestHandler } from './$types';

// Resolve path relative to this file's location for reliability
const __dirname = dirname(fileURLToPath(import.meta.url));
// Navigate from editor/src/routes/api/git/push/ to project root
const REPO_PATH = resolve(__dirname, '../../../../../../');

export const POST: RequestHandler = async () => {
	try {
		const git = simpleGit(REPO_PATH);

		// Get current branch
		const status = await git.status();
		const branch = status.current;

		if (!branch) {
			return json({ error: 'Not on any branch' }, { status: 400 });
		}

		// Check if there are commits to push
		if (status.ahead === 0) {
			return json({ error: 'No commits to push' }, { status: 400 });
		}

		// Push to origin
		const result = await git.push('origin', branch);

		return json({
			success: true,
			branch,
			pushed: status.ahead,
			result: {
				repo: result.repo,
				ref: result.ref
			}
		});
	} catch (error) {
		console.error('Git push failed:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return json({ error: `Failed to push: ${errorMessage}` }, { status: 500 });
	}
};
