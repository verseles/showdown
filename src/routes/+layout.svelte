<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setContext } from 'svelte';
	import { initializeLocale, updateDocumentDirection } from '$lib/stores/locale.js';

	let { children } = $props();

	type ThemeMode = 'light' | 'dark' | 'system';
	let themeMode = $state<ThemeMode>('system');
	let resolvedTheme = $state<'light' | 'dark'>('light');
	let mounted = $state(false);

	function getSystemTheme(): 'light' | 'dark' {
		if (typeof window === 'undefined') return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function cycleTheme() {
		if (themeMode === 'system') {
			themeMode = 'light';
		} else if (themeMode === 'light') {
			themeMode = 'dark';
		} else {
			themeMode = 'system';
		}
	}

	// Provide theme context to children
	setContext('theme', {
		get current() {
			return resolvedTheme;
		},
		get mode() {
			return themeMode;
		},
		toggle: cycleTheme
	});

	$effect(() => {
		if (typeof window !== 'undefined') {
			// Initialize theme mode from storage
			const stored = localStorage.getItem('themeMode') as ThemeMode | null;
			if (stored && ['light', 'dark', 'system'].includes(stored)) {
				themeMode = stored;
			} else {
				themeMode = 'system';
			}

			// Initialize locale and document direction
			const locale = initializeLocale();
			updateDocumentDirection(locale);

			mounted = true;
		}
	});

	// Resolve the actual theme based on mode
	$effect(() => {
		if (themeMode === 'system') {
			resolvedTheme = getSystemTheme();
		} else {
			resolvedTheme = themeMode;
		}
	});

	// Listen for system theme changes when in system mode
	$effect(() => {
		if (typeof window !== 'undefined' && themeMode === 'system') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handler = (e: MediaQueryListEvent) => {
				resolvedTheme = e.matches ? 'dark' : 'light';
			};
			mediaQuery.addEventListener('change', handler);
			return () => mediaQuery.removeEventListener('change', handler);
		}
	});

	// Apply theme to document
	$effect(() => {
		if (mounted && typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
			localStorage.setItem('themeMode', themeMode);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content={resolvedTheme === 'dark' ? '#1a1a2e' : '#ffffff'} />
</svelte:head>

<div class="app" class:dark={resolvedTheme === 'dark'}>
	{@render children()}
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
