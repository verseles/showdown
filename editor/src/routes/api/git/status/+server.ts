import { json } from '@sveltejs/kit';
import simpleGit from 'simple-git';
import { join } from 'path';
import type { RequestHandler } from './$types';

const REPO_PATH = join(process.cwd(), '..');

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
