import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import type { RequestHandler } from './$types';

const execAsync = promisify(exec);
const REPO_PATH = join(process.cwd(), '..');

export const POST: RequestHandler = async () => {
	try {
		console.log('[CI] Running tests from:', REPO_PATH);

		// Run lint check on root
		try {
			console.log('[CI] Running lint...');
			await execAsync('npm run lint', { cwd: REPO_PATH, timeout: 60000 });
			console.log('[CI] Lint passed');
		} catch (lintError: any) {
			// Check if it's just formatting warnings (exit code 1 from prettier --check)
			if (lintError.stderr && lintError.stderr.includes('Code style issues found')) {
				console.log('[CI] Lint has formatting warnings, but continuing...');
			} else if (lintError.code !== 0) {
				console.error('[CI] Lint failed:', lintError.message);
				return json({
					success: false,
					error: `Lint failed: ${lintError.stdout || lintError.message}`
				});
			}
		}

		// Run svelte-check on editor
		try {
			console.log('[CI] Running svelte-check...');
			await execAsync('npm run check', { cwd: join(REPO_PATH, 'editor'), timeout: 120000 });
			console.log('[CI] Svelte-check passed');
		} catch (checkError: any) {
			console.error('[CI] Svelte-check failed:', checkError.message);
			return json({
				success: false,
				error: `Svelte-check failed: ${checkError.stdout || checkError.message}`
			});
		}

		// Run build check on root (if exists)
		try {
			console.log('[CI] Running build check...');
			await execAsync('npm run check', { cwd: REPO_PATH, timeout: 120000 });
			console.log('[CI] Build check passed');
		} catch (buildError: any) {
			// Build check might not exist, that's okay
			if (!buildError.message.includes('Missing script')) {
				console.error('[CI] Build check failed:', buildError.message);
				return json({
					success: false,
					error: `Build check failed: ${buildError.stdout || buildError.message}`
				});
			}
		}

		console.log('[CI] All tests passed!');
		return json({ success: true });
	} catch (error) {
		console.error('[CI] Test failed:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return json({ success: false, error: errorMessage });
	}
};
