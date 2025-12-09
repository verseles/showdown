<script lang="ts">
	import { currentLanguage, setLanguage, SUPPORTED_LANGUAGES, RTL_LANGUAGES } from '$lib/i18n/store';
	import { isRTL } from '$lib/i18n/index';

	let showDropdown = $state(false);
	let currentLang = $state('en');

	// Subscribe to current language
	$effect(() => {
		const unsubscribe = currentLanguage.subscribe((lang) => {
			currentLang = lang;
		});
		return unsubscribe;
	});

	// Toggle dropdown
	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.language-selector')) {
			showDropdown = false;
		}
	}

	// Change language
	async function changeLanguage(langCode: string) {
		await setLanguage(langCode as any);
		showDropdown = false;
	}

	// Get current language info
	function getCurrentLangInfo() {
		return SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
	}

	// Close on escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showDropdown = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="language-selector" class:rtl={isRTL()}>
	<button
		class="selector-button"
		onclick={toggleDropdown}
		aria-expanded={showDropdown}
		aria-haspopup="true"
		title="Change language"
	>
		<span class="flag">{getCurrentLangInfo().flag}</span>
		<span class="name">{getCurrentLangInfo().name}</span>
		<span class="arrow" class:rotated={showDropdown}>▼</span>
	</button>

	{#if showDropdown}
		<div class="dropdown-menu" class:rtl={isRTL()}>
			{#each SUPPORTED_LANGUAGES as lang}
				<button
					class="language-option"
					class:active={lang.code === currentLang}
					onclick={() => changeLanguage(lang.code)}
				>
					<span class="flag">{lang.flag}</span>
					<span class="name">{lang.name}</span>
					{#if lang.rtl}
						<span class="rtl-badge">RTL</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.language-selector {
		position: relative;
		display: inline-block;
	}

	.selector-button {
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

	.selector-button:hover {
		background: var(--bg-secondary, #f8f9fa);
		border-color: var(--primary-color, #1971c2);
		color: var(--primary-color, #1971c2);
	}

	.flag {
		font-size: 1.2rem;
	}

	.name {
		font-weight: 600;
	}

	.arrow {
		font-size: 0.7rem;
		transition: transform 0.2s;
	}

	.arrow.rotated {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 100;
		min-width: 200px;
		max-height: 400px;
		overflow-y: auto;
		padding: 0.5rem 0;
	}

	.language-selector.rtl .dropdown-menu {
		right: auto;
		left: 0;
	}

	.language-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.2s;
		font-size: 0.9rem;
	}

	.language-selector.rtl .language-option {
		text-align: right;
	}

	.language-option:hover {
		background: #f8f9fa;
	}

	.language-option.active {
		background: #e7f5ff;
		color: #1971c2;
		font-weight: 600;
	}

	.language-option .flag {
		font-size: 1.2rem;
	}

	.language-option .name {
		flex: 1;
	}

	.rtl-badge {
		background: #1971c2;
		color: white;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 600;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.dropdown-menu {
			min-width: 180px;
		}

		.selector-button {
			padding: 0.5rem 0.75rem;
		}

		.selector-button .name {
			display: none;
		}
	}
</style>
