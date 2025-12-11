import { json } from '@sveltejs/kit';
import simpleGit from 'simple-git';
import { join } from 'path';
import type { RequestHandler } from './$types';

// In SvelteKit, process.cwd() returns the directory where the dev server started
// For editor/, that's /path/to/showdown/editor, so we go up one level for repo root
const REPO_PATH = join(process.cwd(), '..');

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
