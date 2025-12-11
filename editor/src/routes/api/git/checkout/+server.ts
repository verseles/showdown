import { json } from '@sveltejs/kit';
import simpleGit from 'simple-git';
import { join } from 'path';
import type { RequestHandler } from './$types';

const REPO_PATH = join(process.cwd(), '..');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { branch } = await request.json();

		if (!branch || typeof branch !== 'string') {
			return json({ error: 'Branch name is required' }, { status: 400 });
		}

		const git = simpleGit(REPO_PATH);

		// Check if there are uncommitted changes
		const status = await git.status();
		if (!status.isClean()) {
			return json(
				{
					error:
						'Cannot switch branch with uncommitted changes. Please save or discard changes first.'
				},
				{ status: 400 }
			);
		}

		// Checkout the branch
		await git.checkout(branch);

		const newStatus = await git.status();

		return json({
			success: true,
			branch: newStatus.current
		});
	} catch (error) {
		console.error('Failed to checkout branch:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return json({ error: `Failed to checkout: ${errorMessage}` }, { status: 500 });
	}
};
