<script lang="ts">
	let { models, categories } = $props();

	// State for editing
	let editingModel = $state<any>(null);
	let showForm = $state(false);

	// Form state
	let formData = $state({
		id: '',
		name: '',
		provider: '',
		type: 'proprietary' as 'proprietary' | 'open-source',
		rank: 0,
		overall_score: 0,
		category_scores: {} as Record<string, number>,
		pricing: {
			average_per_1m: 0,
			input: 0,
			output: 0
		},
		performance: {
			output_speed_tps: 0,
			latency_ttft_ms: 0
		},
		release_date: '',
		editor_notes: ''
	});

	// Providers list
	const providers = ['Anthropic', 'OpenAI', 'Google', 'DeepSeek', 'Meta', 'Alibaba', 'Microsoft', 'Mistral', 'Other'];

	// Initialize category scores
	function initCategoryScores() {
		const scores: Record<string, number> = {};
		categories.forEach((cat: any) => {
			scores[cat.id] = 0;
		});
		return scores;
	}

	// Open form for adding new model
	function openAddForm() {
		editingModel = null;
		formData = {
			id: '',
			name: '',
			provider: '',
			type: 'proprietary',
			rank: 0,
			overall_score: 0,
			category_scores: initCategoryScores(),
			pricing: {
				average_per_1m: 0,
				input: 0,
				output: 0
			},
			performance: {
				output_speed_tps: 0,
				latency_ttft_ms: 0
			},
			release_date: new Date().toISOString().split('T')[0],
			editor_notes: ''
		};
		showForm = true;
	}

	// Open form for editing existing model
	function openEditForm(model: any) {
		editingModel = model;
		formData = {
			id: model.id,
			name: model.name,
			provider: model.provider,
			type: model.type,
			rank: model.rank || 0,
			overall_score: model.overall_score || 0,
			category_scores: { ...model.category_scores },
			pricing: { ...model.pricing },
			performance: { ...model.performance },
			release_date: model.release_date,
			editor_notes: model.editor_notes || ''
		};
		showForm = true;
	}

	// Close form
	function closeForm() {
		showForm = false;
		editingModel = null;
	}

	// Save model
	function saveModel() {
		// In a real app, this would save to backend
		console.log('Saving model:', formData);
		alert('Model saved! (Note: This is a demo - changes are not persisted)');
		closeForm();
	}

	// Delete model
	function deleteModel(model: any) {
		if (confirm(`Are you sure you want to delete ${model.name}?`)) {
			// In a real app, this would delete from backend
			console.log('Deleting model:', model);
			alert('Model deleted! (Note: This is a demo - changes are not persisted)');
		}
	}

	// Generate ID from name
	function generateId(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}

	// Update form ID when name changes
	$effect(() => {
		if (!editingModel && formData.name) {
			formData.id = generateId(formData.name);
		}
	});
</script>

<div class="models-editor">
	<div class="editor-header">
		<h2>Models Editor</h2>
		<button class="add-button" onclick={openAddForm}>
			+ Add New Model
		</button>
	</div>

	{#if showForm}
		<div
			class="modal-overlay"
			role="dialog"
			aria-label={editingModel ? 'Edit Model' : 'Add New Model'}
			onclick={closeForm}
			onkeydown={(e) => e.key === 'Escape' && closeForm()}
			tabindex="0"
		>
			<div class="modal-content" role="document">
				<div class="modal-header">
					<h3>{editingModel ? 'Edit Model' : 'Add New Model'}</h3>
					<button class="close-button" onclick={closeForm}>✕</button>
				</div>

				<div class="form-body">
					<div class="form-section">
						<h4>Basic Information</h4>
						<div class="form-row">
							<div class="form-group">
								<label for="name">Name *</label>
								<input
									id="name"
									type="text"
									bind:value={formData.name}
									placeholder="e.g., Claude Opus 4.5"
								/>
							</div>
							<div class="form-group">
								<label for="id">ID</label>
								<input
									id="id"
									type="text"
									bind:value={formData.id}
									placeholder="auto-generated from name"
								/>
							</div>
						</div>

						<div class="form-row">
							<div class="form-group">
								<label for="provider">Provider *</label>
								<select id="provider" bind:value={formData.provider}>
									<option value="">Select provider</option>
									{#each providers as provider}
										<option value={provider}>{provider}</option>
									{/each}
								</select>
							</div>
							<div class="form-group">
								<label for="type">Type *</label>
								<select id="type" bind:value={formData.type}>
									<option value="proprietary">Proprietary</option>
									<option value="open-source">Open Source</option>
								</select>
							</div>
						</div>

						<div class="form-row">
							<div class="form-group">
								<label for="rank">Rank</label>
								<input
									id="rank"
									type="number"
									bind:value={formData.rank}
									placeholder="e.g., 1"
								/>
							</div>
							<div class="form-group">
								<label for="overall_score">Overall Score (%)</label>
								<input
									id="overall_score"
									type="number"
									step="0.1"
									bind:value={formData.overall_score}
									placeholder="e.g., 95.5"
								/>
							</div>
						</div>

						<div class="form-group">
							<label for="release_date">Release Date</label>
							<input
								id="release_date"
								type="date"
								bind:value={formData.release_date}
							/>
						</div>
					</div>

					<div class="form-section">
						<h4>Pricing ($ per 1M tokens)</h4>
						<div class="form-row">
							<div class="form-group">
								<label for="avg_price">Average</label>
								<input
									id="avg_price"
									type="number"
									step="0.01"
									bind:value={formData.pricing.average_per_1m}
									placeholder="e.g., 15.00"
								/>
							</div>
							<div class="form-group">
								<label for="input_price">Input</label>
								<input
									id="input_price"
									type="number"
									step="0.01"
									bind:value={formData.pricing.input}
									placeholder="e.g., 10.00"
								/>
							</div>
							<div class="form-group">
								<label for="output_price">Output</label>
								<input
									id="output_price"
									type="number"
									step="0.01"
									bind:value={formData.pricing.output}
									placeholder="e.g., 30.00"
								/>
							</div>
						</div>
					</div>

					<div class="form-section">
						<h4>Performance</h4>
						<div class="form-row">
							<div class="form-group">
								<label for="speed">Output Speed (tokens/s)</label>
								<input
									id="speed"
									type="number"
									step="0.1"
									bind:value={formData.performance.output_speed_tps}
									placeholder="e.g., 125.5"
								/>
							</div>
							<div class="form-group">
								<label for="latency">Latency TTFT (ms)</label>
								<input
									id="latency"
									type="number"
									bind:value={formData.performance.latency_ttft_ms}
									placeholder="e.g., 450"
								/>
							</div>
						</div>
					</div>

					<div class="form-section">
						<h4>Category Scores (%)</h4>
						<div class="category-scores">
							{#each categories as category}
								<div class="form-group">
									<label for={"score-" + category.id}>
										{category.name} ({category.weight}%)
									</label>
									<input
										id={"score-" + category.id}
										type="number"
										step="0.1"
										bind:value={formData.category_scores[category.id]}
										placeholder="0-100"
									/>
								</div>
							{/each}
						</div>
					</div>

					<div class="form-section">
						<h4>Notes</h4>
						<div class="form-group">
							<label for="notes">Editor Notes</label>
							<textarea
								id="notes"
								bind:value={formData.editor_notes}
								rows="4"
								placeholder="Additional notes about this model..."
							></textarea>
						</div>
					</div>
				</div>

				<div class="modal-footer">
					<button class="button secondary" onclick={closeForm}>Cancel</button>
					<button class="button primary" onclick={saveModel}>
						{editingModel ? 'Update' : 'Create'} Model
					</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="models-grid">
		{#each models as model}
			<div class="model-card">
				<div class="model-header">
					<div class="model-title">
						<strong>{model.name}</strong>
						<span class="provider">by {model.provider}</span>
					</div>
					<span class="badge {model.type === 'open-source' ? 'badge-open-source' : 'badge-proprietary'}">
						{model.type}
					</span>
				</div>

				<div class="model-stats">
					<div class="stat">
						<span class="stat-label">Rank</span>
						<span class="stat-value">#{model.rank || '—'}</span>
					</div>
					<div class="stat">
						<span class="stat-label">Score</span>
						<span class="stat-value">{model.overall_score?.toFixed(1) || '—'}%</span>
					</div>
					<div class="stat">
						<span class="stat-label">Price</span>
						<span class="stat-value">${model.pricing.average_per_1m.toFixed(2)}</span>
					</div>
				</div>

				<div class="model-actions">
					<button class="action-button" onclick={() => openEditForm(model)}>
						Edit
					</button>
					<button class="action-button danger" onclick={() => deleteModel(model)}>
						Delete
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.models-editor {
		width: 100%;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.editor-header h2 {
		margin: 0;
		font-size: 1.5rem;
	}

	.add-button {
		padding: 0.75rem 1.5rem;
		background: #1971c2;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-button:hover {
		background: #1864ab;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 2rem;
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #dee2e6;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.5rem;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #6c757d;
		cursor: pointer;
		padding: 0.5rem;
		transition: color 0.2s;
	}

	.close-button:hover {
		color: #212529;
	}

	.form-body {
		padding: 1.5rem;
	}

	.form-section {
		margin-bottom: 2rem;
	}

	.form-section h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #495057;
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-weight: 600;
		color: #495057;
		font-size: 0.9rem;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid #dee2e6;
		border-radius: 6px;
		font-size: 0.95rem;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #1971c2;
	}

	.category-scores {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid #dee2e6;
	}

	.button {
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.button.secondary {
		background: white;
		border: 1px solid #dee2e6;
		color: #495057;
	}

	.button.secondary:hover {
		background: #f8f9fa;
	}

	.button.primary {
		background: #1971c2;
		border: 1px solid #1971c2;
		color: white;
	}

	.button.primary:hover {
		background: #1864ab;
	}

	.models-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.model-card {
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 1.5rem;
		transition: box-shadow 0.2s;
	}

	.model-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.model-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.model-title {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.model-title strong {
		font-size: 1.1rem;
	}

	.provider {
		color: #666;
		font-size: 0.9rem;
	}

	.badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.badge-proprietary {
		background: #ffe0e0;
		color: #c92a2a;
	}

	.badge-open-source {
		background: #d3f9d8;
		color: #2b8a3e;
	}

	.model-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 6px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #666;
		text-transform: uppercase;
		font-weight: 600;
	}

	.stat-value {
		font-size: 1.1rem;
		font-weight: 700;
		color: #212529;
	}

	.model-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-button {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #dee2e6;
		background: white;
		border-radius: 4px;
		font-size: 0.9rem;
		font-weight: 600;
		color: #495057;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-button:hover {
		background: #f8f9fa;
		border-color: #adb5bd;
	}

	.action-button.danger {
		color: #c92a2a;
		border-color: #ffc9c9;
	}

	.action-button.danger:hover {
		background: #fff5f5;
		border-color: #ff8787;
	}

	@media (max-width: 768px) {
		.modal-overlay {
			padding: 1rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.category-scores {
			grid-template-columns: 1fr;
		}

		.models-grid {
			grid-template-columns: 1fr;
		}

		.model-stats {
			grid-template-columns: 1fr;
		}
	}
</style>
