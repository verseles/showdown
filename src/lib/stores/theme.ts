import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'system';

export const theme = writable<Theme>('system');

// Available themes
export const THEMES = [
	{ value: 'light', label: 'Light', icon: '☀️' },
	{ value: 'dark', label: 'Dark', icon: '🌙' },
	{ value: 'system', label: 'System', icon: '💻' }
] as const;

// Get system preference
export function getSystemTheme(): 'light' | 'dark' {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme to document
export function applyTheme(themeValue: Theme) {
	if (typeof window === 'undefined') return;

	const html = document.documentElement;
	const systemTheme = getSystemTheme();
	const effectiveTheme = themeValue === 'system' ? systemTheme : themeValue;

	// Remove existing theme classes
	html.classList.remove('light', 'dark');
	// Add new theme class
	html.classList.add(effectiveTheme);

	// Store in localStorage
	localStorage.setItem('theme', themeValue);
}

// Set theme and apply it
export function setTheme(newTheme: Theme) {
	theme.set(newTheme);
	applyTheme(newTheme);
}

// Initialize theme
export function initTheme() {
	if (typeof window === 'undefined') return;

	// Get stored theme or default to system
	const stored = localStorage.getItem('theme') as Theme | null;
	const initialTheme = stored && ['light', 'dark', 'system'].includes(stored)
		? stored
		: 'system';

	theme.set(initialTheme);
	applyTheme(initialTheme);

	// Listen for system theme changes
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		// Only update if using system theme
		theme.subscribe((currentTheme) => {
			if (currentTheme === 'system') {
				applyTheme('system');
			}
		})();
	});
}

// Toggle between light and dark (ignoring system)
export function toggleTheme() {
	theme.subscribe((current) => {
		if (current === 'light') {
			setTheme('dark');
		} else if (current === 'dark') {
			setTheme('light');
		} else {
			// If system, toggle to opposite of current system
			const systemTheme = getSystemTheme();
			setTheme(systemTheme === 'dark' ? 'light' : 'dark');
		}
	})();
}
