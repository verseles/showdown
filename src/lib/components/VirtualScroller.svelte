<script lang="ts">
	type Item = {
		id: string | number;
		[key: string]: any;
	};

	let {
		items,
		itemHeight = 60,
		containerHeight = 400,
		overscan = 5,
		renderItem
	} = $props<{
		items: Item[];
		itemHeight?: number;
		containerHeight?: number;
		overscan?: number;
		renderItem: (item: Item, index: number) => any;
	}>();

	// Calculate total height
	const totalHeight = $derived(items.length * itemHeight);

	// Calculate visible items
	let scrollTop = $state(0);

	function handleScroll(event: Event) {
		const target = event.target as HTMLElement;
		scrollTop = target.scrollTop;
	}

	// Calculate start and end indices
	const startIndex = $derived(() => {
		return Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
	});

	const endIndex = $derived(() => {
		const visibleCount = Math.ceil(containerHeight / itemHeight);
		return Math.min(items.length, startIndex() + visibleCount + overscan * 2);
	});

	// Get visible items
	const visibleItems = $derived(() => {
		return items.slice(startIndex(), endIndex());
	});

	// Calculate offset for positioning
	const offsetY = $derived(() => startIndex() * itemHeight);
</script>

<div
	class="virtual-scroller"
	style="height: {containerHeight}px; overflow: auto;"
	onscroll={handleScroll}
>
	<div class="spacer" style="height: {totalHeight}px; position: relative;">
		<div class="visible-items" style="transform: translateY({offsetY}px);">
			{#each visibleItems as item, i (item.id)}
				<div class="virtual-item" style="height: {itemHeight}px;">
					{@render renderItem(item, startIndex() + i)}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.virtual-scroller {
		width: 100%;
		overflow: auto;
		position: relative;
	}

	.spacer {
		width: 100%;
	}

	.visible-items {
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.virtual-item {
		width: 100%;
		position: relative;
	}
</style>
