<script lang="ts">
	import { deleteModel, duplicateModel, store } from '$lib/stores/data.svelte';

	let { row }: { row: { id: string }; column: any; api: any } = $props();

	function handleDelete() {
		const model = store.models.find((m) => m.id === row.id);
		if (model && confirm(`Delete "${model.name}"? This cannot be undone.`)) {
			deleteModel(row.id);
		}
	}

	function handleDuplicate() {
		duplicateModel(row.id);
	}
</script>

<div class="action-cell">
	<button class="action-btn delete-btn" onclick={handleDelete} title="Delete">🗑</button>
	<button class="action-btn duplicate-btn" onclick={handleDuplicate} title="Duplicate">📋</button>
</div>

<style>
	.action-cell {
		display: flex;
		gap: 4px;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.action-btn {
		padding: 2px 6px;
		font-size: 12px;
		background: transparent;
		border: 1px solid var(--border-color, #dee2e6);
		border-radius: 3px;
		cursor: pointer;
		opacity: 0.7;
		transition: all 0.15s ease;
	}

	.action-btn:hover {
		opacity: 1;
		background: var(--bg-hover, #f1f3f5);
	}

	.delete-btn:hover {
		background: var(--error-bg, #f8d7da);
		border-color: var(--error-color, #dc3545);
	}

	.duplicate-btn:hover {
		background: var(--info-bg, #d1ecf1);
		border-color: var(--info-color, #17a2b8);
	}

	:global(.dark) .action-btn:hover {
		background: var(--bg-hover, #1f4068);
	}

	:global(.dark) .delete-btn:hover {
		background: rgba(255, 107, 107, 0.2);
	}

	:global(.dark) .duplicate-btn:hover {
		background: rgba(77, 171, 247, 0.2);
	}
</style>
