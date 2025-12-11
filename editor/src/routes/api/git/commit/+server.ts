import { json } from '@sveltejs/kit';
import simpleGit from 'simple-git';
import { join } from 'path';
import type { RequestHandler } from './$types';

// In SvelteKit, process.cwd() returns the directory where the dev server started
// For editor/, that's /path/to/showdown/editor, so we go up one level for repo root
const REPO_PATH = join(process.cwd(), '..');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { message } = await request.json();

		if (!message || typeof message !== 'string' || !message.trim()) {
			return json({ error: 'Commit message is required' }, { status: 400 });
		}

		const git = simpleGit(REPO_PATH);

		// Stage the data file
		await git.add('data/showdown.json');

		// Check if there are changes to commit
		const status = await git.status();
		if (status.staged.length === 0) {
			return json({ error: 'No changes to commit' }, { status: 400 });
		}

		// Commit
		const result = await git.commit(message.trim());

		return json({
			success: true,
			commit: result.commit,
			summary: {
				changes: result.summary.changes,
				insertions: result.summary.insertions,
				deletions: result.summary.deletions
			}
		});
	} catch (error) {
		console.error('Git commit failed:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return json({ error: `Failed to commit: ${errorMessage}` }, { status: 500 });
	}
};
