<script lang="ts">
	import { onMount } from 'svelte';
	import DataGrid from '$lib/components/DataGrid.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import StatsPanel from '$lib/components/StatsPanel.svelte';
	import {
		loadData,
		isLoading,
		notifications,
		removeNotification
	} from '$lib/stores/data.svelte';

	let theme = $state<'light' | 'dark'>('light');
	let sidebarOpen = $state(true);
	let selectedModelId = $state<string | null>(null);
	let gridComponent: DataGrid;

	onMount(async () => {
		// Load theme preference
		const saved = localStorage.getItem('editor-theme');
		if (saved === 'dark' || saved === 'light') {
			theme = saved;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}
		document.documentElement.classList.toggle('dark', theme === 'dark');

		// Load sidebar preference
		const sidebarPref = localStorage.getItem('editor-sidebar');
		if (sidebarPref === 'closed') {
			sidebarOpen = false;
		}

		// Load data
		try {
			await loadData();
		} catch (error) {
			console.error('Failed to load data:', error);
		}
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('editor-theme', theme);
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
		localStorage.setItem('editor-sidebar', sidebarOpen ? 'open' : 'closed');
	}

	function handleRowSelected(modelId: string | null) {
		selectedModelId = modelId;
	}

	function handleExportCsv() {
		gridComponent?.exportToCsv();
	}
</script>

<div class="editor-container">
	{#if isLoading}
		<div class="loading-screen">
			<div class="loading-spinner"></div>
			<p>Loading data...</p>
		</div>
	{:else}
		<Toolbar
			{theme}
			onToggleTheme={toggleTheme}
			onToggleSidebar={toggleSidebar}
			{sidebarOpen}
			{selectedModelId}
			onExportCsv={handleExportCsv}
		/>

		<div class="main-content">
			<div class="grid-container">
				<DataGrid bind:this={gridComponent} {theme} onRowSelected={handleRowSelected} />
			</div>

			{#if sidebarOpen}
				<aside class="sidebar">
					<StatsPanel />
				</aside>
			{/if}
		</div>
	{/if}

	<!-- Notifications -->
	<div class="notifications-container">
		{#each notifications as notification (notification.id)}
			<div class="notification {notification.type}" role="alert">
				<span>{notification.message}</span>
				<button
					class="notification-close"
					onclick={() => removeNotification(notification.id)}
					aria-label="Dismiss"
				>
					✕
				</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		gap: 16px;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--border-color);
		border-top-color: var(--accent-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.notifications-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		z-index: 1000;
	}

	.notification {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		box-shadow: var(--shadow-md);
		animation: slideIn 0.2s ease;
	}

	.notification.success {
		border-left: 4px solid var(--success-color);
	}

	.notification.error {
		border-left: 4px solid var(--error-color);
	}

	.notification.warning {
		border-left: 4px solid var(--warning-color);
	}

	.notification.info {
		border-left: 4px solid var(--info-color);
	}

	.notification-close {
		padding: 4px 8px;
		font-size: 12px;
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
	}

	.notification-close:hover {
		color: var(--text-primary);
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
