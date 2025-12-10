<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		// Check for saved theme preference or system preference
		const saved = localStorage.getItem('editor-theme');
		if (saved === 'dark' || saved === 'light') {
			theme = saved;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}
		document.documentElement.classList.toggle('dark', theme === 'dark');
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('editor-theme', theme);
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}

	// Export for children to use
	const layoutContext = {
		get theme() {
			return theme;
		},
		toggleTheme
	};
</script>

<svelte:head>
	<title>Showdown Editor</title>
	<meta name="description" content="Data editor for Showdown LLM Rankings" />
</svelte:head>

<slot {layoutContext} />
