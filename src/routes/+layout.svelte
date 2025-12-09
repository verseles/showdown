<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { initLanguage } from '$lib/i18n/store';
	import { initTheme } from '$lib/stores/theme';
	import { page } from '$app/stores';

	let { children } = $props();

	// Initialize i18n on mount
	$effect(() => {
		if (typeof window !== 'undefined') {
			initLanguage();
			initTheme();
		}
	});

	// SEO metadata
	const siteTitle = 'Showdown.Best - LLM Comparison Platform';
	const siteDescription = 'Compare top AI language models (LLMs) across coding, reasoning, math, and more. Features Claude, GPT-4, Gemini, and more with real benchmarks.';
	const siteUrl = 'https://showdown.best';
	const imageUrl = `${siteUrl}/og-image.png`;

	// Get current page data
	let currentData = $state<any>(null);
	$effect(() => {
		// This will be populated by child routes
	});
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{siteTitle}</title>
	<meta name="description" content={siteDescription} />
	<meta name="keywords" content="LLM, AI, machine learning, comparison, benchmarks, Claude, GPT-4, Gemini, DeepSeek" />
	<meta name="author" content="Showdown.Best" />
	<meta name="robots" content="index, follow" />

	<!-- Viewport and Mobile -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<!-- Favicon -->
	<link rel="icon" href={favicon} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={siteTitle} />
	<meta property="og:description" content={siteDescription} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="Showdown.Best" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={siteUrl} />
	<meta property="twitter:title" content={siteTitle} />
	<meta property="twitter:description" content={siteDescription} />
	<meta property="twitter:image" content={imageUrl} />

	<!-- Canonical URL -->
	<link rel="canonical" href={siteUrl} />

	<!-- Schema.org structured data -->
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebApplication',
			name: 'Showdown.Best',
			description: siteDescription,
			url: siteUrl,
			applicationCategory: 'ReferenceApplication',
			operatingSystem: 'Web Browser',
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'USD'
			},
			author: {
				'@type': 'Organization',
				name: 'Showdown.Best'
			}
		})}
	</script>
</svelte:head>

{@render children()}
