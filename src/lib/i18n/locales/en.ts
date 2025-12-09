export default {
	// Header
	'showdown.title': '🏆 Showdown - LLM Rankings',
	'showdown.subtitle': 'Comprehensive comparison of AI language models',
	'showdown.editData': '📊 Edit Data',

	// Navigation
	'showdown.backToMain': '← Back to Showdown',

	// Filters
	'filters.title': 'Filters',
	'filters.providers': 'Providers',
	'filters.types': 'Types',
	'filters.priceRange': 'Price Range ($/1M tokens)',
	'filters.speedRange': 'Speed Range (tokens/s)',
	'filters.favoritesOnly': 'Favorites Only',
	'filters.reset': 'Reset',
	'filters.showing': 'Showing {{count}} of {{total}} models',

	// Column Settings
	'columns.title': 'Column Visibility',
	'columns.showAll': 'Show All',
	'columns.hideAll': 'Hide All',
	'columns.resetDefaults': 'Reset to Default',
	'columns.default': 'Default',

	// Favorites
	'favorites.add': 'Add to favorites',
	'favorites.remove': 'Remove from favorites',
	'favorites.empty': 'No favorites yet',

	// Categories
	'category.coding': '💻 Coding',
	'category.reasoning': '🧠 Reasoning',
	'category.agents': '🤖 Agents',
	'category.conversation': '💬 Conversation',
	'category.math': '🔢 Math',
	'category.multimodal': '👁️ Multimodal',
	'category.multilingual': '🌐 Multilingual',

	// Model properties
	'model.rank': 'Rank',
	'model.provider': 'Provider',
	'model.name': 'Model',
	'model.type': 'Type',
	'model.price': 'Price ($/1M)',
	'model.speed': 'Speed (tok/s)',
	'model.latency': 'Latency (ms)',
	'model.releaseDate': 'Release Date',
	'model.overallScore': 'Overall Score',

	// Model types
	'model.type.proprietary': 'Proprietary',
	'model.type.openSource': 'Open Source',

	// Actions
	'action.edit': 'Edit',
	'action.delete': 'Delete',
	'action.add': 'Add',
	'action.save': 'Save',
	'action.cancel': 'Cancel',
	'action.close': 'Close',
	'action.showAll': 'Show all {{count}} categories',

	// Editor
	'editor.title': '📊 Data Editor',
	'editor.subtitle': 'Edit models, categories, and benchmark data',
	'editor.modelsTab': 'Models',
	'editor.categoriesTab': 'Categories',
	'editor.saveChanges': 'Save Changes',
	'editor.backToShowdown': '← Back to Showdown',

	// Models Editor
	'modelsEditor.title': 'Models Editor',
	'modelsEditor.subtitle': 'Add, edit, or remove models from the database',
	'modelsEditor.addModel': '+ Add New Model',
	'modelsEditor.editModel': 'Edit Model',
	'modelsEditor.addNewModel': 'Add New Model',
	'modelsEditor.updateModel': 'Update Model',
	'modelsEditor.createModel': 'Create Model',

	// Model form fields
	'modelsEditor.form.name': 'Name',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': 'Provider',
	'modelsEditor.form.type': 'Type',
	'modelsEditor.form.rank': 'Rank',
	'modelsEditor.form.overallScore': 'Overall Score (%)',
	'modelsEditor.form.releaseDate': 'Release Date',
	'modelsEditor.form.pricing': 'Pricing ($ per 1M tokens)',
	'modelsEditor.form.averagePrice': 'Average',
	'modelsEditor.form.inputPrice': 'Input',
	'modelsEditor.form.outputPrice': 'Output',
	'modelsEditor.form.performance': 'Performance',
	'modelsEditor.form.speed': 'Output Speed (tokens/s)',
	'modelsEditor.form.latency': 'Latency TTFT (ms)',
	'modelsEditor.form.categoryScores': 'Category Scores (%)',
	'modelsEditor.form.notes': 'Editor Notes',
	'modelsEditor.form.placeholder.name': 'e.g., Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': 'auto-generated from name',
	'modelsEditor.form.placeholder.rank': 'e.g., 1',
	'modelsEditor.form.placeholder.score': 'e.g., 95.5',
	'modelsEditor.form.placeholder.avgPrice': 'e.g., 15.00',
	'modelsEditor.form.placeholder.inputPrice': 'e.g., 10.00',
	'modelsEditor.form.placeholder.outputPrice': 'e.g., 30.00',
	'modelsEditor.form.placeholder.speed': 'e.g., 125.5',
	'modelsEditor.form.placeholder.latency': 'e.g., 450',
	'modelsEditor.form.placeholder.notes': 'Additional notes about this model...',

	// Categories Editor
	'categoriesEditor.title': 'Categories Editor',
	'categoriesEditor.subtitle': 'Adjust category weights and manage benchmarks',
	'categoriesEditor.addCategory': '+ Add New Category',
	'categoriesEditor.editCategory': 'Edit Category',
	'categoriesEditor.addNewCategory': 'Add New Category',
	'categoriesEditor.updateCategory': 'Update Category',
	'categoriesEditor.createCategory': 'Create Category',

	// Category form fields
	'categoriesEditor.form.name': 'Name',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': 'Emoji',
	'categoriesEditor.form.weight': 'Weight (%)',
	'categoriesEditor.form.description': 'Description',
	'categoriesEditor.form.benchmarks': 'Benchmarks',
	'categoriesEditor.form.addBenchmark': '+ Add Benchmark',
	'categoriesEditor.form.placeholder.name': 'e.g., Coding',
	'categoriesEditor.form.placeholder.id': 'auto-generated from name',
	'categoriesEditor.form.placeholder.emoji': 'e.g., 💻',
	'categoriesEditor.form.placeholder.weight': 'e.g., 25',
	'categoriesEditor.form.placeholder.description': 'Brief description of this category...',
	'categoriesEditor.form.benchmark.name': 'Name',
	'categoriesEditor.form.benchmark.type': 'Type',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': 'e.g., SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': 'Score (0-100)',

	// Git Integration
	'git.title': '🔄 Git Integration',
	'git.currentStatus': 'Current Status',
	'git.commitChanges': 'Commit Changes',
	'git.commitMessage': 'Commit Message',
	'git.commitMessage.placeholder': 'Describe your changes...',
	'git.quickActions': 'Quick Actions',
	'git.refreshStatus': 'Refresh Status',
	'git.pull': '⬇️ Pull',
	'git.stageAll': '➕ Stage All',
	'git.commitPush': '💾 Commit & Push',
	'git.pushToRemote': '⬆️ Push to Remote',
	'git.stageChanges': '📦 Stage Changes',
	'git.output': 'Output',
	'git.noOutput': 'No output yet. Perform an action to see results.',
	'git.viewOnGitHub': 'View on GitHub',

	// Common
	'common.loading': 'Loading...',
	'common.error': 'Error',
	'common.success': 'Success',
	'common.confirm': 'Confirm',
	'common.yes': 'Yes',
	'common.no': 'No',
	'common.benchmark': 'benchmark',
	'common.benchmarks': 'benchmarks',
	'common.selectProvider': 'Select provider',
	'common.selectType': 'Select type',

	// Footer
	'footer.dataUpdated': 'Data updated: {{date}}',
	'footer.showingModels': 'Showing {{count}} of {{total}} models',

	// Tooltips
	'tooltip.addToFavorites': 'Add to favorites',
	'tooltip.removeFromFavorites': 'Remove from favorites',
	'tooltip.availableBenchmarks': '{{count}}/{{total}} benchmarks available',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': 'Free',
	'misc.na': '—',
};
