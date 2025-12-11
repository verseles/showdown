<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { changeLocale, languageData } from '$lib/stores/locale.js';
	import * as m from '$lib/paraglide/messages.js';

	let isOpen = $state(false);

	const currentLanguage = $derived(
		languageData.find((lang) => lang.code === getLocale()) || languageData[0]
	);

	function selectLanguage(code: string) {
		changeLocale(code);
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.language-selector')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<div class="language-selector">
	<button
		class="selector-button"
		onclick={() => (isOpen = !isOpen)}
		aria-label={m.aria_select_language()}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
	>
		<span class="current-flag">{currentLanguage.flag}</span>
		<span class="current-name">{currentLanguage.nativeName}</span>
		<span class="chevron" class:open={isOpen}>▾</span>
	</button>

	{#if isOpen}
		<div class="dropdown" role="listbox" aria-label={m.aria_select_language()}>
			{#each languageData as lang (lang.code)}
				<button
					role="option"
					class="language-option"
					class:selected={lang.code === getLocale()}
					class:rtl={lang.rtl}
					aria-selected={lang.code === getLocale()}
					onclick={() => selectLanguage(lang.code)}
				>
					<span class="flag">{lang.flag}</span>
					<span class="name">{lang.nativeName}</span>
					{#if lang.code === getLocale()}
						<span class="checkmark">✓</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.language-selector {
		position: relative;
	}

	.selector-button {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--bg-tertiary);
		color: var(--text-primary);
		cursor: pointer;
		font-size: 0.875rem;
		transition:
			background var(--transition-fast),
			transform var(--transition-fast);
	}

	.selector-button:hover {
		background: var(--border-color);
	}

	.chevron {
		font-size: 0.75rem;
		transition: transform 0.2s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 0.375rem);
		right: 0;
		min-width: 200px;
		max-height: 360px;
		overflow-y: auto;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		box-shadow: var(--shadow-lg);
		z-index: 1000;
	}

	.language-option {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: none;
		background: transparent;
		color: var(--text-primary);
		cursor: pointer;
		text-align: left;
		font-size: 0.875rem;
		transition: background var(--transition-fast);
	}

	.language-option:hover {
		background: var(--bg-hover, var(--bg-secondary));
	}

	.language-option.selected {
		background: var(--bg-selected, var(--bg-tertiary));
	}

	.language-option.rtl {
		direction: rtl;
		text-align: right;
	}

	.language-option.rtl .checkmark {
		margin-right: auto;
		margin-left: 0;
	}

	.checkmark {
		margin-left: auto;
		color: var(--accent-primary);
		font-weight: 600;
	}

	.flag {
		font-size: 1.125rem;
	}

	.name {
		flex: 1;
	}

	.current-flag {
		font-size: 1rem;
	}

	.current-name {
		max-width: 80px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Mobile adjustments */
	@media (max-width: 767px) {
		.current-name {
			display: none;
		}

		.selector-button {
			padding: 0.375rem;
		}

		.dropdown {
			right: auto;
			left: 0;
		}
	}
</style>
