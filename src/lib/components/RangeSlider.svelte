<script lang="ts">
	interface Props {
		min: number;
		max: number;
		step?: number;
		value: [number, number];
		format?: (val: number) => string;
	}

	let { min, max, step = 1, value = $bindable(), format = (v) => v.toString() }: Props = $props();

	// Calculate percentages for the UI
	let minPercent = $derived(Math.max(0, Math.min(100, ((value[0] - min) / (max - min)) * 100)));
	let maxPercent = $derived(Math.max(0, Math.min(100, ((value[1] - min) / (max - min)) * 100)));
</script>

<div class="range-slider">
	<div class="slider-container">
		<div class="track-bg"></div>
		<div class="track-fill" style="left: {minPercent}%; width: {maxPercent - minPercent}%"></div>

		<!-- Min Value Input -->
		<input
			type="range"
			{min}
			{max}
			{step}
			bind:value={value[0]}
			oninput={() => {
				value[0] = Math.min(value[0], value[1]);
			}}
			class="thumb"
		/>

		<!-- Max Value Input -->
		<input
			type="range"
			{min}
			{max}
			{step}
			bind:value={value[1]}
			oninput={() => {
				value[1] = Math.max(value[0], value[1]);
			}}
			class="thumb"
		/>
	</div>

	<div class="values">
		<span>{format(value[0])}</span>
		<span>{format(value[1])}</span>
	</div>
</div>

<style>
	.range-slider {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		width: 100%;
		min-width: 140px;
	}

	.slider-container {
		position: relative;
		height: 20px;
		width: 100%;
	}

	.track-bg {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 100%;
		height: 4px;
		background-color: var(--border-color);
		border-radius: 2px;
		z-index: 1;
	}

	.track-fill {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		height: 4px;
		background-color: var(--accent-primary);
		border-radius: 2px;
		z-index: 2;
	}

	input[type='range'] {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		-webkit-appearance: none;
		z-index: 3;
		height: 20px;
		width: 100%;
		opacity: 1;
		cursor: pointer;
		margin: 0;
		background: transparent;
	}

	/* Thumb Styling */
	input[type='range']::-webkit-slider-thumb {
		pointer-events: auto;
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--bg-primary);
		border: 2px solid var(--accent-primary);
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		margin-top: 2px; /* Center in 20px container */
	}

	input[type='range']::-moz-range-thumb {
		pointer-events: auto;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--bg-primary);
		border: 2px solid var(--accent-primary);
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		border: none;
		transform: translateY(0);
	}

	/* Remove default track styling */
	input[type='range']::-webkit-slider-runnable-track {
		width: 100%;
		height: 20px;
		background: transparent;
		border: none;
	}

	input[type='range']::-moz-range-track {
		width: 100%;
		height: 20px;
		background: transparent;
		border: none;
	}

	.values {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--text-muted);
		font-family: var(--font-mono);
	}

	/* Hover states */
	input[type='range']::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	input[type='range']::-moz-range-thumb:hover {
		transform: scale(1.1);
	}
</style>
