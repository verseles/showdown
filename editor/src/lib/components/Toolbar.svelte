<script lang="ts">
	import {
		store,
		saveData,
		commitChanges,
		pushChanges,
		refreshGitStatus,
		addModel,
		deleteModel,
		duplicateModel,
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
	}

	let { theme, onToggleTheme, onToggleSidebar, sidebarOpen, selectedModelId, onExportCsv }: Props =
		$props();

	let commitMessage = $state('');
	let isCommitting = $state(false);
	let isPushing = $state(false);
	let showAddModal = $state(false);
	let newModelName = $state('');

	// Refresh git status on mount
	$effect(() => {
		refreshGitStatus();
	});

	async function handleSave() {
		if (!commitMessage.trim()) {
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
		const committed = await commitChanges(commitMessage);
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

	function handleDeleteSelected() {
		if (!selectedModelId) return;
		if (!confirm('Delete this model? This cannot be undone.')) return;
		deleteModel(selectedModelId);
	}

	function handleDuplicateSelected() {
		if (!selectedModelId) return;
		duplicateModel(selectedModelId);
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
			if (store.hasUnsavedChanges && commitMessage.trim()) {
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

		<button
			onclick={handleDuplicateSelected}
			disabled={!selectedModelId}
			title="Duplicate selected model"
		>
			Duplicate
		</button>

		<button
			onclick={handleDeleteSelected}
			disabled={!selectedModelId}
			class="danger"
			title="Delete selected model"
		>
			Delete
		</button>
	</div>

	<div class="toolbar-divider"></div>

	<!-- Undo/Redo -->
	<div class="toolbar-section">
		<button onclick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)"> ↶ Undo </button>
		<button onclick={redo} disabled={!canRedo()} title="Redo (Ctrl+Shift+Z)"> ↷ Redo </button>
	</div>

	<div class="toolbar-divider"></div>

	<!-- Export -->
	<div class="toolbar-section">
		<button onclick={onExportCsv} title="Export data as CSV"> Export CSV </button>
	</div>

	<div class="toolbar-divider"></div>

	<!-- View controls -->
	<div class="toolbar-section">
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

		<div class="git-status">
			{#if store.gitStatus}
				<span>Branch: {store.gitStatus.current}</span>
				{#if store.gitStatus.ahead > 0}
					<span class="status-badge info">↑ {store.gitStatus.ahead}</span>
				{/if}
				{#if !store.gitStatus.isClean}
					<span class="status-badge warning">modified</span>
				{/if}
			{/if}
		</div>

		<input
			type="text"
			bind:value={commitMessage}
			placeholder="Commit message..."
			class="commit-input"
			disabled={!store.hasUnsavedChanges && store.gitStatus?.isClean}
		/>

		<button
			onclick={handleSave}
			disabled={!store.hasUnsavedChanges || !commitMessage.trim() || isCommitting}
			class="primary"
			title="Save and commit (Ctrl+S)"
		>
			{isCommitting ? 'Saving...' : '💾 Save'}
		</button>

		<button
			onclick={handlePublish}
			disabled={!store.gitStatus || store.gitStatus.ahead === 0 || isPushing}
			class="success"
			title="Push to remote"
		>
			{isPushing ? 'Publishing...' : '🚀 Publish'}
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
