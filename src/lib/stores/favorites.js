// Favorites store with localStorage persistence
// Using Svelte 5 runes for reactivity

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Initialize favorites state
let favorites = $state([]);

// Load favorites from localStorage on initialization (browser only)
if (isBrowser) {
	const stored = localStorage.getItem('favorites');
	if (stored) {
		try {
			favorites = JSON.parse(stored);
		} catch (e) {
			console.error('Failed to parse favorites from localStorage:', e);
		}
	}
}

// Save to localStorage whenever favorites changes (browser only)
$effect(() => {
	if (isBrowser) {
		localStorage.setItem('favorites', JSON.stringify(favorites));
	}
});

/**
 * Toggle a model in favorites list
 * @param {string} modelId - The ID of the model to toggle
 */
export function toggleFavorite(modelId) {
	if (!isBrowser) return;
	if (favorites.includes(modelId)) {
		favorites = favorites.filter(id => id !== modelId);
	} else {
		favorites = [...favorites, modelId];
	}
}

/**
 * Check if a model is in favorites
 * @param {string} modelId - The ID of the model to check
 * @returns {boolean} True if the model is favorited
 */
export function isFavorite(modelId) {
	if (!isBrowser) return false;
	return favorites.includes(modelId);
}

/**
 * Get all favorite model IDs
 * @returns {Array<string>} Array of favorite model IDs
 */
export function getFavorites() {
	if (!isBrowser) return [];
	return favorites;
}

/**
 * Clear all favorites
 */
export function clearFavorites() {
	if (!isBrowser) return;
	favorites = [];
}
