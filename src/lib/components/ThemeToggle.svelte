<script lang="ts">
	import { theme, THEMES, setTheme, toggleTheme, type Theme } from '$lib/stores/theme';
	import { t } from '$lib/i18n/index';

	let currentTheme = $state<Theme>('system');

	// Subscribe to theme changes
	$effect(() => {
		const unsubscribe = theme.subscribe((value) => {
			currentTheme = value;
		});
		return unsubscribe;
	});

	// Get icon for current theme
	function getIcon(themeValue: Theme): string {
		const theme = THEMES.find(t => t.value === themeValue);
		return theme?.icon || '💻';
	}

	// Get label for current theme
	function getLabel(themeValue: Theme): string {
		const theme = THEMES.find(t => t.value === themeValue);
		return theme?.label || 'System';
	}

	// Cycle through themes
	function cycleTheme() {
		const currentIndex = THEMES.findIndex(t => t.value === currentTheme);
		const nextIndex = (currentIndex + 1) % THEMES.length;
		setTheme(THEMES[nextIndex].value);
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			cycleTheme();
		}
	}
</script>

<button
	class="theme-toggle"
	onclick={cycleTheme}
	onkeydown={handleKeydown}
	title="Change theme (current: {getLabel(currentTheme)})"
	aria-label="Change theme (current: {getLabel(currentTheme)})"
>
	<span class="icon">{getIcon(currentTheme)}</span>
	<span class="label">{getLabel(currentTheme)}</span>
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--bg-tertiary, white);
		border: 2px solid var(--border-color, #dee2e6);
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-secondary, #495057);
		cursor: pointer;
		transition: all 0.2s;
	}

	.theme-toggle:hover {
		background: var(--bg-secondary, #f8f9fa);
		border-color: var(--primary-color, #1971c2);
		color: var(--primary-color, #1971c2);
	}

	.icon {
		font-size: 1.2rem;
	}

	.label {
		font-weight: 600;
	}

	/* Mobile - hide label */
	@media (max-width: 768px) {
		.theme-toggle {
			padding: 0.5rem;
		}

		.theme-toggle .label {
			display: none;
		}
	}
</style>
