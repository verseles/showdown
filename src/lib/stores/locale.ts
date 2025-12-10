import { setLocale, getLocale, locales, baseLocale } from '$lib/paraglide/runtime.js';

const STORAGE_KEY = 'showdown_locale';

// RTL languages
const RTL_LANGUAGES = ['ar', 'arz', 'ur'];

type Locale = (typeof locales)[number];

/**
 * Initialize locale from localStorage or browser settings
 */
export function initializeLocale(): Locale {
	if (typeof window === 'undefined') {
		return baseLocale as Locale;
	}

	// Priority: localStorage > navigator.language > default (en)
	const stored = localStorage.getItem(STORAGE_KEY);

	if (stored && (locales as readonly string[]).includes(stored)) {
		setLocale(stored as Locale);
		return stored as Locale;
	}

	// Detect from browser
	const browserLang = navigator.language.toLowerCase();

	// Try exact match (e.g., pt-br -> pt-BR)
	const exactMatch = locales.find((l) => l.toLowerCase() === browserLang);
	if (exactMatch) {
		setLocale(exactMatch);
		persistLocale(exactMatch);
		return exactMatch;
	}

	// Try language code only (e.g., pt from pt-BR)
	const langCode = browserLang.split('-')[0];
	const codeMatch = locales.find((l) => l.toLowerCase().startsWith(langCode));
	if (codeMatch) {
		setLocale(codeMatch);
		persistLocale(codeMatch);
		return codeMatch;
	}

	// Default to English
	setLocale(baseLocale as Locale);
	return baseLocale as Locale;
}

/**
 * Change the current locale and persist to localStorage
 */
export function changeLocale(newLocale: string): void {
	if (!(locales as readonly string[]).includes(newLocale)) {
		console.error(`Invalid locale: ${newLocale}`);
		return;
	}

	setLocale(newLocale as Locale);
	persistLocale(newLocale);
	updateDocumentDirection(newLocale);
}

/**
 * Persist locale to localStorage
 */
function persistLocale(locale: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, locale);
	}
}

/**
 * Update document direction and lang attribute
 */
export function updateDocumentDirection(locale?: string): void {
	if (typeof document === 'undefined') return;

	const lang = locale || getLocale();
	const dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
	document.documentElement.setAttribute('dir', dir);
	document.documentElement.setAttribute('lang', lang);
}

/**
 * Check if a locale is RTL
 */
export function isRTL(locale?: string): boolean {
	const lang = locale || getLocale();
	return RTL_LANGUAGES.includes(lang);
}

/**
 * Get the current locale
 */
export function getCurrentLocale(): Locale {
	return getLocale() as Locale;
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): readonly Locale[] {
	return locales;
}

/**
 * Language metadata for display
 */
export const languageData: {
	code: Locale;
	flag: string;
	name: string;
	nativeName: string;
	rtl?: boolean;
}[] = [
	// Top 10 Global (250M+)
	{ code: 'en', flag: '🇬🇧', name: 'English', nativeName: 'English' },
	{ code: 'zh', flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
	{ code: 'hi', flag: '🇮🇳', name: 'Hindi', nativeName: 'हिन्दी' },
	{ code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
	{ code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
	{ code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية', rtl: true },
	{ code: 'bn', flag: '🇧🇩', name: 'Bengali', nativeName: 'বাংলা' },
	{ code: 'pt-BR', flag: '🇧🇷', name: 'Portuguese (BR)', nativeName: 'Português (BR)' },
	{ code: 'ru', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский' },
	{ code: 'ur', flag: '🇵🇰', name: 'Urdu', nativeName: 'اردو', rtl: true },

	// 100M+ speakers
	{ code: 'id', flag: '🇮🇩', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
	{ code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
	{ code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
	{ code: 'arz', flag: '🇪🇬', name: 'Egyptian Arabic', nativeName: 'مصرى', rtl: true },

	// Strategic Tech markets
	{ code: 'vi', flag: '🇻🇳', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
	{ code: 'tr', flag: '🇹🇷', name: 'Turkish', nativeName: 'Türkçe' },
	{ code: 'it', flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano' },
	{ code: 'ko', flag: '🇰🇷', name: 'Korean', nativeName: '한국어' },

	// High-value Tech markets
	{ code: 'pl', flag: '🇵🇱', name: 'Polish', nativeName: 'Polski' },
	{ code: 'th', flag: '🇹🇭', name: 'Thai', nativeName: 'ไทย' },
	{ code: 'nl', flag: '🇳🇱', name: 'Dutch', nativeName: 'Nederlands' },
	{ code: 'sv', flag: '🇸🇪', name: 'Swedish', nativeName: 'Svenska' }
];
