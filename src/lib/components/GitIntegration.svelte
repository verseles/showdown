<script lang="ts">
	let { onClose } = $props();

	// Git status
	let gitStatus = $state('idle'); // 'idle', 'loading', 'success', 'error'
	let gitMessage = $state('');
	let gitOutput = $state('');
	let gitError = $state('');

	// Commit message
	let commitMessage = $state('');

	// Check git status
	async function checkGitStatus() {
		gitStatus = 'loading';
		gitError = '';
		gitOutput = '';

		try {
			const response = await fetch('/api/git/status', {
				method: 'GET'
			});

			if (!response.ok) {
				throw new Error('Failed to check git status');
			}

			const data = await response.json();
			gitOutput = JSON.stringify(data, null, 2);
			gitStatus = 'idle';
		} catch (error) {
			gitError = error instanceof Error ? error.message : 'Unknown error';
			gitStatus = 'error';
		}
	}

	// Stage all changes
	async function stageChanges() {
		gitStatus = 'loading';
		gitError = '';
		gitOutput = '';

		try {
			const response = await fetch('/api/git/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					files: ['.']
				})
			});

			if (!response.ok) {
				throw new Error('Failed to stage changes');
			}

			const data = await response.json();
			gitOutput = data.output || 'Changes staged successfully';
			gitStatus = 'idle';
		} catch (error) {
			gitError = error instanceof Error ? error.message : 'Unknown error';
			gitStatus = 'error';
		}
	}

	// Commit changes
	async function commitChanges() {
		if (!commitMessage.trim()) {
			alert('Please enter a commit message');
			return;
		}

		gitStatus = 'loading';
		gitError = '';
		gitOutput = '';

		try {
			const response = await fetch('/api/git/commit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: commitMessage
				})
			});

			if (!response.ok) {
				throw new Error('Failed to commit changes');
			}

			const data = await response.json();
			gitOutput = data.output || 'Changes committed successfully';
			gitStatus = 'success';
			commitMessage = '';

			// Refresh status after commit
			setTimeout(() => {
				checkGitStatus();
			}, 1000);
		} catch (error) {
			gitError = error instanceof Error ? error.message : 'Unknown error';
			gitStatus = 'error';
		}
	}

	// Push changes
	async function pushChanges() {
		gitStatus = 'loading';
		gitError = '';
		gitOutput = '';

		try {
			const response = await fetch('/api/git/push', {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to push changes');
			}

			const data = await response.json();
			gitOutput = data.output || 'Changes pushed successfully';
			gitStatus = 'success';
		} catch (error) {
			gitError = error instanceof Error ? error.message : 'Unknown error';
			gitStatus = 'error';
		}
	}

	// Pull latest changes
	async function pullChanges() {
		gitStatus = 'loading';
		gitError = '';
		gitOutput = '';

		try {
			const response = await fetch('/api/git/pull', {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to pull changes');
			}

			const data = await response.json();
			gitOutput = data.output || 'Changes pulled successfully';
			gitStatus = 'success';
		} catch (error) {
			gitError = error instanceof Error ? error.message : 'Unknown error';
			gitStatus = 'error';
		}
	}

	// Initialize on mount
	$effect(() => {
		checkGitStatus();
	});
</script>

<div class="git-integration">
	<div class="git-header">
		<h3>🔄 Git Integration</h3>
		<button class="close-button" onclick={onClose}>✕</button>
	</div>

	<div class="git-content">
		<div class="git-section">
			<h4>Current Status</h4>
			{#if gitStatus === 'loading'}
				<div class="status-indicator loading">Checking git status...</div>
			{:else if gitStatus === 'error'}
				<div class="status-indicator error">
					❌ {gitError}
				</div>
			{:else if gitStatus === 'success'}
				<div class="status-indicator success">
					✅ {gitOutput}
				</div>
			{:else}
				<div class="status-indicator">
					ℹ️ Git status retrieved
				</div>
			{/if}

			<div class="action-buttons">
				<button class="action-button" onclick={checkGitStatus}>
					Refresh Status
				</button>
				<button class="action-button" onclick={pullChanges}>
					⬇️ Pull
				</button>
				<button class="action-button" onclick={stageChanges}>
					➕ Stage All
				</button>
			</div>
		</div>

		<div class="git-section">
			<h4>Commit Changes</h4>
			<div class="commit-form">
				<div class="form-group">
					<label for="commit-message">Commit Message</label>
					<textarea
						id="commit-message"
						bind:value={commitMessage}
						placeholder="Describe your changes..."
						rows="3"
					></textarea>
				</div>
				<button
					class="commit-button"
					onclick={commitChanges}
					disabled={!commitMessage.trim() || gitStatus === 'loading'}
				>
					💾 Commit & Push
				</button>
			</div>
		</div>

		<div class="git-section">
			<h4>Quick Actions</h4>
			<div class="quick-actions">
				<button class="quick-button" onclick={pushChanges}>
					⬆️ Push to Remote
				</button>
				<button class="quick-button secondary" onclick={stageChanges}>
					📦 Stage Changes
				</button>
			</div>
		</div>

		<div class="git-section">
			<h4>Output</h4>
			<div class="output-area">
				{#if gitOutput}
					<pre>{gitOutput}</pre>
				{:else}
					<p class="placeholder">No output yet. Perform an action to see results.</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="git-footer">
		<button class="button secondary" onclick={onClose}>
			Close
		</button>
		<button class="button primary" onclick={() => window.open('https://github.com', '_blank')}>
			View on GitHub
		</button>
	</div>
</div>

<style>
	.git-integration {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		max-width: 800px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.git-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #dee2e6;
	}

	.git-header h3 {
		margin: 0;
		font-size: 1.5rem;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6c757d;
		cursor: pointer;
		padding: 0.5rem;
		transition: color 0.2s;
	}

	.close-button:hover {
		color: #212529;
	}

	.git-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.git-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.git-section h4 {
		margin: 0;
		font-size: 1.1rem;
		color: #495057;
	}

	.status-indicator {
		padding: 0.75rem 1rem;
		border-radius: 6px;
		background: #f8f9fa;
		color: #495057;
		font-size: 0.9rem;
	}

	.status-indicator.loading {
		background: #fff3bf;
		color: #997404;
	}

	.status-indicator.error {
		background: #ffe3e3;
		color: #c92a2a;
	}

	.status-indicator.success {
		background: #d3f9d8;
		color: #2b8a3e;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.action-button {
		padding: 0.5rem 1rem;
		border: 1px solid #dee2e6;
		background: white;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-button:hover {
		background: #f8f9fa;
		border-color: #1971c2;
		color: #1971c2;
	}

	.commit-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-weight: 600;
		color: #495057;
		font-size: 0.9rem;
	}

	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		font-size: 0.95rem;
		font-family: inherit;
		resize: vertical;
	}

	.form-group textarea:focus {
		outline: none;
		border-color: #1971c2;
	}

	.commit-button,
	.quick-button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		background: #1971c2;
		color: white;
	}

	.commit-button:hover:not(:disabled),
	.quick-button:hover {
		background: #1864ab;
	}

	.commit-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.quick-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.quick-button.secondary {
		background: white;
		color: #495057;
		border: 1px solid #dee2e6;
	}

	.quick-button.secondary:hover {
		background: #f8f9fa;
		border-color: #1971c2;
		color: #1971c2;
	}

	.output-area {
		background: #f8f9fa;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		padding: 1rem;
		min-height: 150px;
		max-height: 300px;
		overflow-y: auto;
	}

	.output-area pre {
		margin: 0;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		color: #495057;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.output-area .placeholder {
		margin: 0;
		color: #6c757d;
		font-style: italic;
	}

	.git-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid #dee2e6;
	}

	.button {
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.button.secondary {
		background: white;
		border: 1px solid #dee2e6;
		color: #495057;
	}

	.button.secondary:hover {
		background: #f8f9fa;
	}

	.button.primary {
		background: #1971c2;
		border: 1px solid #1971c2;
		color: white;
	}

	.button.primary:hover {
		background: #1864ab;
	}

	@media (max-width: 768px) {
		.git-integration {
			max-width: 100%;
			height: 100%;
			max-height: 100vh;
			border-radius: 0;
		}

		.action-buttons,
		.quick-actions {
			flex-direction: column;
		}

		.action-button,
		.quick-button {
			width: 100%;
		}

		.git-footer {
			flex-direction: column;
		}

		.button {
			width: 100%;
		}
	}
</style>
