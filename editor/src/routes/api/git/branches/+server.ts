import { json } from '@sveltejs/kit';
import simpleGit from 'simple-git';
import { join } from 'path';
import type { RequestHandler } from './$types';

const REPO_PATH = join(process.cwd(), '..');

export const GET: RequestHandler = async () => {
	try {
		const git = simpleGit(REPO_PATH);
		const branchSummary = await git.branchLocal();

		return json({
			branches: branchSummary.all,
			current: branchSummary.current
		});
	} catch (error) {
		console.error('Failed to get branches:', error);
		return json({ error: 'Failed to get branches' }, { status: 500 });
	}
};
