export default {
	// Header
	'showdown.title': '🏆 Showdown - Classements LLM',
	'showdown.subtitle': 'Comparaison complète des modèles de langage IA',
	'showdown.editData': '📊 Modifier les Données',

	// Navigation
	'showdown.backToMain': '← Retour à Showdown',

	// Filters
	'filters.title': 'Filtres',
	'filters.providers': 'Fournisseurs',
	'filters.types': 'Types',
	'filters.priceRange': 'Fourchette de Prix ($/1M jetons)',
	'filters.speedRange': 'Fourchette de Vitesse (jetons/s)',
	'filters.favoritesOnly': 'Favoris Uniquement',
	'filters.reset': 'Réinitialiser',
	'filters.showing': 'Affichage de {{count}} sur {{total}} modèles',

	// Column Settings
	'columns.title': 'Visibilité des Colonnes',
	'columns.showAll': 'Tout Afficher',
	'columns.hideAll': 'Tout Masquer',
	'columns.resetDefaults': 'Rétablir par Défaut',
	'columns.default': 'Défaut',

	// Favorites
	'favorites.add': 'Ajouter aux favoris',
	'favorites.remove': 'Retirer des favoris',
	'favorites.empty': 'Aucun favori pour le moment',

	// Categories
	'category.coding': '💻 Programmation',
	'category.reasoning': '🧠 Raisonnement',
	'category.agents': '🤖 Agents',
	'category.conversation': '💬 Conversation',
	'category.math': '🔢 Mathématiques',
	'category.multimodal': '👁️ Multimodal',
	'category.multilingual': '🌐 Multilingue',

	// Model properties
	'model.rank': 'Classement',
	'model.provider': 'Fournisseur',
	'model.name': 'Modèle',
	'model.type': 'Type',
	'model.price': 'Prix ($/1M)',
	'model.speed': 'Vitesse (jet/s)',
	'model.latency': 'Latence (ms)',
	'model.releaseDate': 'Date de Sortie',
	'model.overallScore': 'Score Global',

	// Model types
	'model.type.proprietary': 'Propriétaire',
	'model.type.openSource': 'Open Source',

	// Actions
	'action.edit': 'Modifier',
	'action.delete': 'Supprimer',
	'action.add': 'Ajouter',
	'action.save': 'Enregistrer',
	'action.cancel': 'Annuler',
	'action.close': 'Fermer',
	'action.showAll': 'Afficher les {{count}} catégories',

	// Editor
	'editor.title': '📊 Éditeur de Données',
	'editor.subtitle': 'Modifier les modèles, catégories et données de benchmark',
	'editor.modelsTab': 'Modèles',
	'editor.categoriesTab': 'Catégories',
	'editor.saveChanges': 'Enregistrer les Modifications',
	'editor.backToShowdown': '← Retour à Showdown',

	// Models Editor
	'modelsEditor.title': 'Éditeur de Modèles',
	'modelsEditor.subtitle': 'Ajouter, modifier ou supprimer des modèles de la base de données',
	'modelsEditor.addModel': '+ Ajouter un Nouveau Modèle',
	'modelsEditor.editModel': 'Modifier le Modèle',
	'modelsEditor.addNewModel': 'Ajouter un Nouveau Modèle',
	'modelsEditor.updateModel': 'Mettre à Jour le Modèle',
	'modelsEditor.createModel': 'Créer un Modèle',

	// Model form fields
	'modelsEditor.form.name': 'Nom',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': 'Fournisseur',
	'modelsEditor.form.type': 'Type',
	'modelsEditor.form.rank': 'Classement',
	'modelsEditor.form.overallScore': 'Score Global (%)',
	'modelsEditor.form.releaseDate': 'Date de Sortie',
	'modelsEditor.form.pricing': 'Tarification ($ par 1M jetons)',
	'modelsEditor.form.averagePrice': 'Moyenne',
	'modelsEditor.form.inputPrice': 'Entrée',
	'modelsEditor.form.outputPrice': 'Sortie',
	'modelsEditor.form.performance': 'Performance',
	'modelsEditor.form.speed': 'Vitesse de Sortie (jetons/s)',
	'modelsEditor.form.latency': 'Latence TTFT (ms)',
	'modelsEditor.form.categoryScores': 'Scores de Catégorie (%)',
	'modelsEditor.form.notes': 'Notes de l\'Éditeur',
	'modelsEditor.form.placeholder.name': 'ex. Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': 'auto-généré à partir du nom',
	'modelsEditor.form.placeholder.rank': 'ex. 1',
	'modelsEditor.form.placeholder.score': 'ex. 95.5',
	'modelsEditor.form.placeholder.avgPrice': 'ex. 15.00',
	'modelsEditor.form.placeholder.inputPrice': 'ex. 10.00',
	'modelsEditor.form.placeholder.outputPrice': 'ex. 30.00',
	'modelsEditor.form.placeholder.speed': 'ex. 125.5',
	'modelsEditor.form.placeholder.latency': 'ex. 450',
	'modelsEditor.form.placeholder.notes': 'Notes supplémentaires sur ce modèle...',

	// Categories Editor
	'categoriesEditor.title': 'Éditeur de Catégories',
	'categoriesEditor.subtitle': 'Ajuster les poids de catégorie et gérer les benchmarks',
	'categoriesEditor.addCategory': '+ Ajouter une Nouvelle Catégorie',
	'categoriesEditor.editCategory': 'Modifier la Catégorie',
	'categoriesEditor.addNewCategory': 'Ajouter une Nouvelle Catégorie',
	'categoriesEditor.updateCategory': 'Mettre à Jour la Catégorie',
	'categoriesEditor.createCategory': 'Créer une Catégorie',

	// Category form fields
	'categoriesEditor.form.name': 'Nom',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': 'Emoji',
	'categoriesEditor.form.weight': 'Poids (%)',
	'categoriesEditor.form.description': 'Description',
	'categoriesEditor.form.benchmarks': 'Benchmarks',
	'categoriesEditor.form.addBenchmark': '+ Ajouter un Benchmark',
	'categoriesEditor.form.placeholder.name': 'ex. Programmation',
	'categoriesEditor.form.placeholder.id': 'auto-généré à partir du nom',
	'categoriesEditor.form.placeholder.emoji': 'ex. 💻',
	'categoriesEditor.form.placeholder.weight': 'ex. 25',
	'categoriesEditor.form.placeholder.description': 'Brève description de cette catégorie...',
	'categoriesEditor.form.benchmark.name': 'Nom',
	'categoriesEditor.form.benchmark.type': 'Type',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': 'ex. SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': 'Score (0-100)',

	// Git Integration
	'git.title': '🔄 Intégration Git',
	'git.currentStatus': 'Statut Actuel',
	'git.commitChanges': 'Valider les Modifications',
	'git.commitMessage': 'Message de Validation',
	'git.commitMessage.placeholder': 'Décrivez vos modifications...',
	'git.quickActions': 'Actions Rapides',
	'git.refreshStatus': 'Actualiser le Statut',
	'git.pull': '⬇️ Tirer',
	'git.stageAll': '➕ Mettre en Scène',
	'git.commitPush': '💾 Valider et Pousser',
	'git.pushToRemote': '⬆️ Pousser vers le Distant',
	'git.stageChanges': '📦 Mettre en Scène les Modifications',
	'git.output': 'Sortie',
	'git.noOutput': 'Pas encore de sortie. Effectuez une action pour voir les résultats.',
	'git.viewOnGitHub': 'Voir sur GitHub',

	// Common
	'common.loading': 'Chargement...',
	'common.error': 'Erreur',
	'common.success': 'Succès',
	'common.confirm': 'Confirmer',
	'common.yes': 'Oui',
	'common.no': 'Non',
	'common.benchmark': 'benchmark',
	'common.benchmarks': 'benchmarks',
	'common.selectProvider': 'Sélectionner un fournisseur',
	'common.selectType': 'Sélectionner un type',

	// Footer
	'footer.dataUpdated': 'Données mises à jour: {{date}}',
	'footer.showingModels': 'Affichage de {{count}} sur {{total}} modèles',

	// Tooltips
	'tooltip.addToFavorites': 'Ajouter aux favoris',
	'tooltip.removeFromFavorites': 'Retirer des favoris',
	'tooltip.availableBenchmarks': '{{count}}/{{total}} benchmarks disponibles',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': 'Gratuit',
	'misc.na': '—',
};
