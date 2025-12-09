<script lang="ts">
	import { goto } from '$app/navigation';
	import ModelsEditor from '$lib/components/ModelsEditor.svelte';
	import CategoriesEditor from '$lib/components/CategoriesEditor.svelte';
	import GitIntegration from '$lib/components/GitIntegration.svelte';

	let { data } = $props();

	// Active tab state
	let activeTab = $state('models');
	let showGitIntegration = $state(false);

	// Get data from load function
	let { models, categories } = data;
</script>

<div class="editor-container">
	<header class="editor-header">
		<h1>📊 Data Editor</h1>
		<p class="subtitle">Edit models, categories, and benchmark data</p>

		<nav class="tabs">
			<button
				class="tab-button"
				class:active={activeTab === 'models'}
				onclick={() => activeTab = 'models'}
			>
				Models
			</button>
			<button
				class="tab-button"
				class:active={activeTab === 'categories'}
				onclick={() => activeTab = 'categories'}
			>
				Categories
			</button>
		</nav>
	</header>

	<div class="editor-content">
		{#if activeTab === 'models'}
			<ModelsEditor {models} {categories} />
		{:else if activeTab === 'categories'}
			<CategoriesEditor {categories} />
		{/if}
	</div>

	<div class="editor-footer">
		<div class="footer-left">
			<button class="back-button" onclick={() => goto('/')}>
				← Back to Showdown
			</button>
		</div>
		<div class="footer-right">
			<button class="git-button" onclick={() => showGitIntegration = true}>
				🔄 Git
			</button>
			<button class="save-button">Save Changes</button>
		</div>
	</div>
</div>

{#if showGitIntegration}
	<div class="modal-overlay" onclick={() => showGitIntegration = false}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<GitIntegration onClose={() => showGitIntegration = false} />
		</div>
	</div>
{/if}

<style>
	.editor-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	.editor-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.editor-header h1 {
		font-size: 2rem;
		margin: 0;
		font-weight: 700;
	}

	.subtitle {
		color: #666;
		font-size: 1rem;
		margin: 0.5rem 0 1.5rem;
	}

	.tabs {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.5rem;
	}

	.tab-button {
		padding: 0.75rem 1.5rem;
		border: 2px solid #dee2e6;
		background: white;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab-button:hover {
		background: #f8f9fa;
		border-color: #adb5bd;
	}

	.tab-button.active {
		background: #1971c2;
		color: white;
		border-color: #1971c2;
	}

	.editor-content {
		background: white;
		border-radius: 8px;
		padding: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		min-height: 400px;
	}

	.editor-footer {
		display: flex;
		justify-content: space-between;
		margin-top: 2rem;
		gap: 1rem;
	}

	.footer-left,
	.footer-right {
		display: flex;
		gap: 1rem;
	}

	.back-button {
		padding: 0.75rem 1.5rem;
		border: 2px solid #dee2e6;
		background: white;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.back-button:hover {
		background: #f8f9fa;
		border-color: #adb5bd;
	}

	.git-button {
		padding: 0.75rem 1.5rem;
		border: 2px solid #dee2e6;
		background: white;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.git-button:hover {
		background: #f8f9fa;
		border-color: #1971c2;
		color: #1971c2;
	}

	.save-button {
		padding: 0.75rem 2rem;
		border: none;
		background: #1971c2;
		color: white;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.save-button:hover {
		background: #1864ab;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 2rem;
	}

	.modal-content {
		width: 100%;
		max-width: 900px;
	}

	@media (max-width: 768px) {
		.editor-container {
			padding: 1rem;
		}

		.editor-footer {
			flex-direction: column;
		}

		.footer-left,
		.footer-right {
			flex-direction: column;
			width: 100%;
		}

		.back-button,
		.git-button,
		.save-button {
			width: 100%;
		}

		.modal-overlay {
			padding: 1rem;
		}

		.modal-content {
			max-width: 100%;
		}
	}
</style>
