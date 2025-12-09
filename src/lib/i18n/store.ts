import { writable } from 'svelte/store';

// Supported languages
export const SUPPORTED_LANGUAGES = [
	{ code: 'en', name: 'English', flag: '🇺🇸' },
	{ code: 'es', name: 'Español', flag: '🇪🇸' },
	{ code: 'fr', name: 'Français', flag: '🇫🇷' },
	{ code: 'de', name: 'Deutsch', flag: '🇩🇪' },
	{ code: 'zh', name: '中文', flag: '🇨🇳' },
	{ code: 'ja', name: '日本語', flag: '🇯🇵' },
	{ code: 'ko', name: '한국어', flag: '🇰🇷' },
	{ code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
	{ code: 'pt', name: 'Português', flag: '🇵🇹' },
	{ code: 'ru', name: 'Русский', flag: '🇷🇺' }
] as const;

// Language type
export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// RTL languages
export const RTL_LANGUAGES: LanguageCode[] = ['ar'];

// Current language store
export const currentLanguage = writable<LanguageCode>('en');

// Current translations store
export const translations = writable<Record<string, string>>({});

// Load translations for a language
export async function loadTranslations(lang: LanguageCode): Promise<Record<string, string>> {
	try {
		const module = await import(`./locales/${lang}.ts`);
		return module.default || module;
	} catch (error) {
		console.error(`Failed to load translations for ${lang}:`, error);
		// Fallback to English
		if (lang !== 'en') {
			return loadTranslations('en');
		}
		return {};
	}
}

// Set language and load translations
export async function setLanguage(lang: LanguageCode) {
	currentLanguage.set(lang);
	const loadedTranslations = await loadTranslations(lang);
	translations.set(loadedTranslations);

	// Update document language and direction
	if (typeof window !== 'undefined') {
		document.documentElement.lang = lang;
		document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';

		// Store in localStorage
		localStorage.setItem('language', lang);
	}
}

// Initialize language from localStorage or browser
export async function initLanguage() {
	let lang: LanguageCode = 'en';

	if (typeof window !== 'undefined') {
		// Try to get from localStorage
		const stored = localStorage.getItem('language') as LanguageCode;
		if (stored && SUPPORTED_LANGUAGES.find(l => l.code === stored)) {
			lang = stored;
		} else {
			// Try to detect from browser
			const browserLang = navigator.language.split('-')[0] as LanguageCode;
			if (SUPPORTED_LANGUAGES.find(l => l.code === browserLang)) {
				lang = browserLang;
			}
		}
	}

	await setLanguage(lang);
}
