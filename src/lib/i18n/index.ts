import { get } from 'svelte/store';
import { translations, currentLanguage, type LanguageCode } from './store';

// Translation function
export function t(key: string, params?: Record<string, string | number>): string {
	const translation = get(translations)[key];

	if (!translation) {
		console.warn(`Missing translation for key: ${key}`);
		return key;
	}

	if (!params) {
		return translation;
	}

	// Replace params like {{param}}
	return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
		const value = params[paramKey];
		return value !== undefined ? String(value) : match;
	});
}

// Get current language
export function getCurrentLanguage(): LanguageCode {
	return get(currentLanguage);
}

// Check if language is RTL
export function isRTL(lang?: LanguageCode): boolean {
	const language = lang || getCurrentLanguage();
	return language === 'ar';
}

// Format number based on locale
export function formatNumber(value: number, lang?: LanguageCode): string {
	const language = lang || getCurrentLanguage();
	return new Intl.NumberFormat(language).format(value);
}

// Format date based on locale
export function formatDate(date: Date | string, lang?: LanguageCode): string {
	const language = lang || getCurrentLanguage();
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat(language, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(dateObj);
}

// Format currency based on locale
export function formatCurrency(value: number, lang?: LanguageCode): string {
	const language = lang || getCurrentLanguage();
	return new Intl.NumberFormat(language, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2
	}).format(value);
}
