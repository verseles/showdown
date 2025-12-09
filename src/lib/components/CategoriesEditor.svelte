<script lang="ts">
	let { categories } = $props();

	// State for editing
	let editingCategory = $state<any>(null);
	let showForm = $state(false);

	// Form state
	let formData = $state({
		id: '',
		name: '',
		description: '',
		emoji: '',
		weight: 0,
		benchmarks: [] as Array<{
			id: string;
			name: string;
			type: 'elo' | 'score';
			url: string;
		}>
	});

	// Benchmark types
	const benchmarkTypes = [
		{ value: 'elo', label: 'ELO (800-1400)' },
		{ value: 'score', label: 'Score (0-100)' }
	];

	// Generate ID from name
	function generateId(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}

	// Open form for adding new category
	function openAddForm() {
		editingCategory = null;
		formData = {
			id: '',
			name: '',
			description: '',
			emoji: '',
			weight: 0,
			benchmarks: []
		};
		showForm = true;
	}

	// Open form for editing existing category
	function openEditForm(category: any) {
		editingCategory = category;
		formData = {
			id: category.id,
			name: category.name,
			description: category.description,
			emoji: category.emoji,
			weight: category.weight,
			benchmarks: [...category.benchmarks]
		};
		showForm = true;
	}

	// Close form
	function closeForm() {
		showForm = false;
		editingCategory = null;
	}

	// Add benchmark
	function addBenchmark() {
		formData.benchmarks = [
			...formData.benchmarks,
			{
				id: '',
				name: '',
				type: 'score',
				url: ''
			}
		];
	}

	// Remove benchmark
	function removeBenchmark(index: number) {
		formData.benchmarks = formData.benchmarks.filter((_, i) => i !== index);
	}

	// Update benchmark field
	function updateBenchmark(index: number, field: string, value: any) {
		formData.benchmarks = formData.benchmarks.map((bench, i) => {
			if (i === index) {
				const updated = { ...bench, [field]: value };
				// Auto-generate ID from name
				if (field === 'name' && value) {
					updated.id = generateId(value);
				}
				return updated;
			}
			return bench;
		});
	}

	// Save category
	function saveCategory() {
		// In a real app, this would save to backend
		console.log('Saving category:', formData);
		alert('Category saved! (Note: This is a demo - changes are not persisted)');
		closeForm();
	}

	// Delete category
	function deleteCategory(category: any) {
		if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
			// In a real app, this would delete from backend
			console.log('Deleting category:', category);
			alert('Category deleted! (Note: This is a demo - changes are not persisted)');
		}
	}

	// Update form ID when name changes
	$effect(() => {
		if (!editingCategory && formData.name) {
			formData.id = generateId(formData.name);
		}
	});
</script>

<div class="categories-editor">
	<div class="editor-header">
		<h2>Categories Editor</h2>
		<button class="add-button" onclick={openAddForm}>
			+ Add New Category
		</button>
	</div>

	{#if showForm}
		<div
			class="modal-overlay"
			role="dialog"
			aria-label={editingCategory ? 'Edit Category' : 'Add New Category'}
			onclick={closeForm}
			onkeydown={(e) => e.key === 'Escape' && closeForm()}
			tabindex="0"
		>
			<div class="modal-content" role="document">
				<div class="modal-header">
					<h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
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
									placeholder="e.g., Coding"
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
								<label for="emoji">Emoji</label>
								<input
									id="emoji"
									type="text"
									bind:value={formData.emoji}
									placeholder="e.g., 💻"
									style="font-size: 2rem; text-align: center; padding: 0.5rem;"
								/>
							</div>
							<div class="form-group">
								<label for="weight">Weight (%) *</label>
								<input
									id="weight"
									type="number"
									bind:value={formData.weight}
									placeholder="e.g., 25"
								/>
								<small>Weights should sum to 100% across all categories</small>
							</div>
						</div>

						<div class="form-group">
							<label for="description">Description *</label>
							<textarea
								id="description"
								bind:value={formData.description}
								rows="3"
								placeholder="Brief description of this category..."
							></textarea>
						</div>
					</div>

					<div class="form-section">
						<div class="section-header">
							<h4>Benchmarks</h4>
							<button type="button" class="add-benchmark-button" onclick={addBenchmark}>
								+ Add Benchmark
							</button>
						</div>

						{#if formData.benchmarks.length === 0}
							<p class="empty-state">No benchmarks added yet. Click "Add Benchmark" to get started.</p>
						{:else}
							<div class="benchmarks-list">
								{#each formData.benchmarks as benchmark, index}
									<div class="benchmark-item">
										<div class="benchmark-header">
											<span class="benchmark-number">#{index + 1}</span>
											<button
												type="button"
												class="remove-button"
												onclick={() => removeBenchmark(index)}
											>
												✕
											</button>
										</div>

										<div class="benchmark-fields">
											<div class="form-group">
												<label for={"bench-name-" + index}>Name *</label>
												<input
													id={"bench-name-" + index}
													type="text"
													bind:value={benchmark.name}
													placeholder="e.g., SWE-Bench"
												/>
											</div>

											<div class="form-row">
												<div class="form-group">
													<label for={"bench-type-" + index}>Type *</label>
													<select
														id={"bench-type-" + index}
														bind:value={benchmark.type}
													>
														{#each benchmarkTypes as type}
															<option value={type.value}>{type.label}</option>
														{/each}
													</select>
												</div>

												<div class="form-group">
													<label for={"bench-id-" + index}>ID</label>
													<input
														id={"bench-id-" + index}
														type="text"
														bind:value={benchmark.id}
														placeholder="auto-generated from name"
													/>
												</div>
											</div>

											<div class="form-group">
												<label for={"bench-url-" + index}>URL</label>
												<input
													id={"bench-url-" + index}
													type="url"
													bind:value={benchmark.url}
													placeholder="https://example.com/benchmark"
												/>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<div class="modal-footer">
					<button class="button secondary" onclick={closeForm}>Cancel</button>
					<button class="button primary" onclick={saveCategory}>
						{editingCategory ? 'Update' : 'Create'} Category
					</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="categories-grid">
		{#each categories as category}
			<div class="category-card">
				<div class="category-header">
					<div class="category-title">
						<span class="emoji">{category.emoji}</span>
						<strong>{category.name}</strong>
					</div>
					<span class="weight-badge">{category.weight}%</span>
				</div>

				<p class="description">{category.description}</p>

				<div class="benchmarks-info">
					<span class="benchmarks-count">
						{category.benchmarks.length} benchmark{category.benchmarks.length !== 1 ? 's' : ''}
					</span>
					<div class="benchmark-list">
						{#each category.benchmarks as benchmark}
							<span class="benchmark-tag">{benchmark.name}</span>
						{/each}
					</div>
				</div>

				<div class="category-actions">
					<button class="action-button" onclick={() => openEditForm(category)}>
						Edit
					</button>
					<button class="action-button danger" onclick={() => deleteCategory(category)}>
						Delete
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.categories-editor {
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
		max-width: 900px;
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

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.add-benchmark-button {
		padding: 0.5rem 1rem;
		background: #1971c2;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-benchmark-button:hover {
		background: #1864ab;
	}

	.empty-state {
		text-align: center;
		color: #6c757d;
		padding: 2rem;
		background: #f8f9fa;
		border-radius: 6px;
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

	.form-group small {
		color: #6c757d;
		font-size: 0.8rem;
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

	.benchmarks-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.benchmark-item {
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 1rem;
		background: #f8f9fa;
	}

	.benchmark-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.benchmark-number {
		font-weight: 700;
		color: #495057;
	}

	.remove-button {
		background: none;
		border: none;
		color: #c92a2a;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		transition: color 0.2s;
	}

	.remove-button:hover {
		color: #a61e4d;
	}

	.benchmark-fields {
		display: flex;
		flex-direction: column;
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

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.category-card {
		border: 1px solid #dee2e6;
		border-radius: 8px;
		padding: 1.5rem;
		transition: box-shadow 0.2s;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.category-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.category-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.emoji {
		font-size: 2rem;
	}

	.category-title strong {
		font-size: 1.2rem;
	}

	.weight-badge {
		background: #e7f5ff;
		color: #1971c2;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.description {
		color: #495057;
		margin: 0;
		line-height: 1.5;
	}

	.benchmarks-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.benchmarks-count {
		font-size: 0.9rem;
		color: #666;
		font-weight: 600;
	}

	.benchmark-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.benchmark-tag {
		background: #f8f9fa;
		border: 1px solid #dee2e6;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.85rem;
		color: #495057;
	}

	.category-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: auto;
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

		.categories-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
