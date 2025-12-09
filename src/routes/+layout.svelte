<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setContext } from 'svelte';

	let { children } = $props();

	let theme = $state<'light' | 'dark'>('light');
	let mounted = $state(false);

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}

	// Provide theme context to children
	setContext('theme', {
		get current() { return theme; },
		toggle: toggleTheme
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = (stored as 'light' | 'dark') || (prefersDark ? 'dark' : 'light');
			mounted = true;
		}
	});

	$effect(() => {
		if (mounted && typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', theme === 'dark');
			localStorage.setItem('theme', theme);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content={theme === 'dark' ? '#1a1a2e' : '#ffffff'} />
</svelte:head>

<div class="app" class:dark={theme === 'dark'}>
	{@render children()}
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
