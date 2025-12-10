<script lang="ts">
	import {
		store,
		saveData,
		commitChanges,
		pushChanges,
		refreshGitStatus,
		addModel,
		canUndo,
		canRedo,
		undo,
		redo
	} from '$lib/stores/data.svelte';

	interface Props {
		theme: 'light' | 'dark';
		onToggleTheme: () => void;
		onToggleSidebar: () => void;
		sidebarOpen: boolean;
		selectedModelId: string | null;
		onExportCsv: () => void;
		highlightEmpty: boolean;
		onToggleHighlightEmpty: () => void;
		onShowColumnSelector: () => void;
	}

	let {
		theme,
		onToggleTheme,
		onToggleSidebar,
		sidebarOpen,
		selectedModelId,
		onExportCsv,
		highlightEmpty,
		onToggleHighlightEmpty,
		onShowColumnSelector
	}: Props = $props();

	let commitMessage = $state('');
	let isCommitting = $state(false);
	let isPushing = $state(false);
	let showAddModal = $state(false);
	let newModelName = $state('');
	let branches = $state<string[]>([]);
	let showBranchDropdown = $state(false);
	let isRunningTests = $state(false);

	// Refresh git status and branches on mount
	$effect(() => {
		refreshGitStatus();
		fetchBranches();
	});

	// Auto-generate commit message from history
	const autoCommitMessage = $derived(() => {
		const history = store.history;
		if (history.length === 0) return '';

		const changes: string[] = [];
		const addedModels = new Set<string>();
		const deletedModels = new Set<string>();
		const updatedModels = new Map<string, Set<string>>();

		for (const entry of history) {
			if (entry.action === 'add') {
				addedModels.add(entry.modelId);
			} else if (entry.action === 'delete') {
				deletedModels.add(entry.modelId);
			} else if (entry.action === 'update') {
				const model = store.models.find((m) => m.id === entry.modelId);
				const modelName = model?.name || entry.modelId;
				if (!updatedModels.has(modelName)) {
					updatedModels.set(modelName, new Set());
				}
				if (entry.field) {
					updatedModels.get(modelName)!.add(entry.field);
				}
			}
		}

		if (addedModels.size > 0) {
			const names = Array.from(addedModels)
				.map((id) => store.models.find((m) => m.id === id)?.name || id)
				.join(', ');
			changes.push(`Add: ${names}`);
		}

		if (deletedModels.size > 0) {
			changes.push(`Remove: ${deletedModels.size} model(s)`);
		}

		if (updatedModels.size > 0) {
			const updates: string[] = [];
			updatedModels.forEach((fields, modelName) => {
				if (fields.size <= 3) {
					updates.push(`${modelName} (${Array.from(fields).join(', ')})`);
				} else {
					updates.push(`${modelName} (${fields.size} fields)`);
				}
			});
			if (updates.length <= 3) {
				changes.push(`Update: ${updates.join('; ')}`);
			} else {
				changes.push(`Update: ${updatedModels.size} model(s)`);
			}
		}

		return changes.join(' | ') || 'Update showdown data';
	});

	// Use auto message if commit message is empty
	$effect(() => {
		if (!commitMessage && autoCommitMessage()) {
			commitMessage = autoCommitMessage();
		}
	});

	async function fetchBranches() {
		try {
			const response = await fetch('/api/git/branches');
			if (response.ok) {
				const data = await response.json();
				branches = data.branches || [];
			}
		} catch (error) {
			console.error('Failed to fetch branches:', error);
		}
	}

	async function switchBranch(branch: string) {
		try {
			const response = await fetch('/api/git/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ branch })
			});
			if (response.ok) {
				await refreshGitStatus();
				showBranchDropdown = false;
			}
		} catch (error) {
			console.error('Failed to switch branch:', error);
		}
	}

	async function runCITests(): Promise<boolean> {
		isRunningTests = true;
		try {
			const response = await fetch('/api/ci/test', { method: 'POST' });
			const result = await response.json();
			isRunningTests = false;

			if (!result.success) {
				alert(`CI Tests failed:\n${result.error || 'Unknown error'}`);
				return false;
			}
			return true;
		} catch (error) {
			isRunningTests = false;
			alert('Failed to run CI tests');
			return false;
		}
	}

	async function handleSave() {
		const message = commitMessage.trim() || autoCommitMessage();
		if (!message) {
			alert('Please enter a commit message');
			return;
		}

		isCommitting = true;

		// First save the data file
		const saved = await saveData();
		if (!saved) {
			isCommitting = false;
			return;
		}

		// Then commit
		const committed = await commitChanges(message);
		if (committed) {
			commitMessage = '';
		}

		isCommitting = false;
	}

	async function handlePublish() {
		if (!confirm('Push to remote? This will deploy changes to the live site.')) {
			return;
		}

		isPushing = true;

		// Run CI tests before push
		const testsPass = await runCITests();
		if (!testsPass) {
			isPushing = false;
			return;
		}

		await pushChanges();
		isPushing = false;
	}

	function handleAddModel() {
		if (!newModelName.trim()) {
			alert('Please enter a model name');
			return;
		}

		addModel({
			name: newModelName.trim(),
			id: newModelName.trim().toLowerCase().replace(/\s+/g, '-')
		});

		newModelName = '';
		showAddModal = false;
	}

	function closeModal() {
		showAddModal = false;
	}

	function handleOverlayKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	// Keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		const cmdKey = isMac ? event.metaKey : event.ctrlKey;

		if (cmdKey && event.key === 's') {
			event.preventDefault();
			if (store.hasUnsavedChanges) {
				handleSave();
			}
		} else if (cmdKey && event.key === 'z' && !event.shiftKey) {
			event.preventDefault();
			if (canUndo()) undo();
		} else if (cmdKey && event.key === 'z' && event.shiftKey) {
			event.preventDefault();
			if (canRedo()) redo();
		} else if (cmdKey && event.key === 'y') {
			event.preventDefault();
			if (canRedo()) redo();
		} else if (cmdKey && event.key === 'n') {
			event.preventDefault();
			showAddModal = true;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="toolbar">
	<!-- Left section: Data operations -->
	<div class="toolbar-section">
		<button onclick={() => (showAddModal = true)} title="Add new model (Ctrl+N)">
			+ Add Model
		</button>
	</div>

	<div class="toolbar-divider"></div>

	<!-- Undo/Redo -->
	<div class="toolbar-section">
		<button onclick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)"> ↶ Undo </button>
		<button onclick={redo} disabled={!canRedo()} title="Redo (Ctrl+Shift+Z)"> ↷ Redo </button>
	</div>

	<div class="toolbar-divider"></div>

	<!-- View controls -->
	<div class="toolbar-section">
		<button onclick={onShowColumnSelector} title="Select visible columns"> 📋 Columns </button>
		<label class="checkbox-label" title="Highlight empty cells">
			<input type="checkbox" checked={highlightEmpty} onchange={onToggleHighlightEmpty} />
			Highlight Empty
		</label>
	</div>

	<div class="toolbar-divider"></div>

	<!-- Export & Theme -->
	<div class="toolbar-section">
		<button onclick={onExportCsv} title="Export data as CSV"> Export CSV </button>
		<button onclick={onToggleTheme} class="icon-only" title="Toggle theme">
			{theme === 'dark' ? '☀️' : '🌙'}
		</button>
		<button onclick={onToggleSidebar} class="icon-only" title="Toggle statistics panel">
			{sidebarOpen ? '◀' : '▶'}
		</button>
	</div>

	<!-- Git controls (right side) -->
	<div class="git-controls">
		{#if store.validationErrors.length > 0}
			<span class="status-badge error">
				{store.validationErrors.length} error{store.validationErrors.length !== 1 ? 's' : ''}
			</span>
		{/if}

		{#if store.hasUnsavedChanges}
			<span class="unsaved-indicator"></span>
		{/if}

		<!-- Branch selector -->
		<div class="branch-selector">
			{#if store.gitStatus}
				<button
					class="branch-button"
					onclick={() => (showBranchDropdown = !showBranchDropdown)}
					title="Click to switch branch"
				>
					🌿 {store.gitStatus.current}
					{#if store.gitStatus.ahead > 0}
						<span class="status-badge info small">↑{store.gitStatus.ahead}</span>
					{/if}
				</button>
				{#if showBranchDropdown}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div class="branch-dropdown" onclick={(e) => e.stopPropagation()}>
						{#each branches as branch}
							<button
								class="branch-option"
								class:active={branch === store.gitStatus.current}
								onclick={() => switchBranch(branch)}
							>
								{branch}
							</button>
						{/each}
					</div>
				{/if}
			{/if}
		</div>

		<input
			type="text"
			bind:value={commitMessage}
			placeholder={autoCommitMessage() || 'Commit message...'}
			class="commit-input"
			disabled={!store.hasUnsavedChanges && store.gitStatus?.isClean}
		/>

		<button
			onclick={handleSave}
			disabled={!store.hasUnsavedChanges || isCommitting}
			class="primary"
			title="Save and commit (Ctrl+S)"
		>
			{isCommitting ? 'Saving...' : '💾 Save'}
		</button>

		<button
			onclick={handlePublish}
			disabled={!store.gitStatus || store.gitStatus.ahead === 0 || isPushing || isRunningTests}
			class="success"
			title="Run tests and push to remote"
		>
			{#if isRunningTests}
				Testing...
			{:else if isPushing}
				Publishing...
			{:else}
				🚀 Publish
			{/if}
		</button>
	</div>
</div>

<!-- Add Model Modal -->
{#if showAddModal}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="modal-overlay"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
		onclick={closeModal}
		onkeydown={handleOverlayKeydown}
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="modal"
			role="document"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h3 class="modal-title" id="modal-title">Add New Model</h3>
				<button class="icon-only" onclick={closeModal}>✕</button>
			</div>
			<div class="modal-body">
				<label>
					Model Name
					<input
						type="text"
						bind:value={newModelName}
						placeholder="e.g., GPT-5.2"
						style="width: 100%; margin-top: 8px;"
						onkeydown={(e) => e.key === 'Enter' && handleAddModel()}
					/>
				</label>
				<p style="margin-top: 12px; font-size: 12px; color: var(--text-muted);">
					The model will be created with empty benchmark scores. You can edit all fields in the grid
					after creation.
				</p>
			</div>
			<div class="modal-footer">
				<button onclick={closeModal}>Cancel</button>
				<button onclick={handleAddModel} class="primary" disabled={!newModelName.trim()}>
					Add Model
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Click outside to close branch dropdown -->
{#if showBranchDropdown}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="dropdown-backdrop" onclick={() => (showBranchDropdown = false)}></div>
{/if}

<style>
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: var(--radius-sm, 4px);
	}

	.checkbox-label:hover {
		background: var(--bg-hover, #f1f3f5);
	}

	.checkbox-label input {
		cursor: pointer;
	}

	.branch-selector {
		position: relative;
	}

	.branch-button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		font-size: 12px;
		background: var(--bg-secondary, #f8f9fa);
		border: 1px solid var(--border-color, #dee2e6);
		border-radius: var(--radius-sm, 4px);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.branch-button:hover {
		background: var(--bg-hover, #f1f3f5);
		border-color: var(--border-strong, #adb5bd);
	}

	.branch-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 4px;
		min-width: 200px;
		max-height: 300px;
		overflow-y: auto;
		background: var(--bg-primary, #ffffff);
		border: 1px solid var(--border-color, #dee2e6);
		border-radius: var(--radius-md, 8px);
		box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
		z-index: 1000;
	}

	.branch-option {
		display: block;
		width: 100%;
		padding: 8px 12px;
		text-align: left;
		font-size: 13px;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--border-color, #dee2e6);
		cursor: pointer;
	}

	.branch-option:last-child {
		border-bottom: none;
	}

	.branch-option:hover {
		background: var(--bg-hover, #f1f3f5);
	}

	.branch-option.active {
		background: var(--accent-color, #0066cc);
		color: white;
	}

	.dropdown-backdrop {
		position: fixed;
		inset: 0;
		z-index: 999;
	}

	.status-badge.small {
		font-size: 10px;
		padding: 1px 4px;
	}
</style>
