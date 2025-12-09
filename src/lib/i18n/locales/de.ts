export default {
	// Header
	'showdown.title': '🏆 Showdown - LLM Rankings',
	'showdown.subtitle': 'Umfassender Vergleich von KI-Sprachmodellen',
	'showdown.editData': '📊 Daten Bearbeiten',

	// Navigation
	'showdown.backToMain': '← Zurück zu Showdown',

	// Filters
	'filters.title': 'Filter',
	'filters.providers': 'Anbieter',
	'filters.types': 'Typen',
	'filters.priceRange': 'Preisbereich ($/1M Tokens)',
	'filters.speedRange': 'Geschwindigkeitsbereich (Tokens/s)',
	'filters.favoritesOnly': 'Nur Favoriten',
	'filters.reset': 'Zurücksetzen',
	'filters.showing': '{{count}} von {{total}} Modellen anzeigen',

	// Column Settings
	'columns.title': 'Spalten-Sichtbarkeit',
	'columns.showAll': 'Alle anzeigen',
	'columns.hideAll': 'Alle ausblenden',
	'columns.resetDefaults': 'Auf Standard zurücksetzen',
	'columns.default': 'Standard',

	// Favorites
	'favorites.add': 'Zu Favoriten hinzufügen',
	'favorites.remove': 'Von Favoriten entfernen',
	'favorites.empty': 'Noch keine Favoriten',

	// Categories
	'category.coding': '💻 Programmierung',
	'category.reasoning': '🧠 Reasoning',
	'category.agents': '🤖 Agents',
	'category.conversation': '💬 Konversation',
	'category.math': '🔢 Mathematik',
	'category.multimodal': '👁️ Multimodal',
	'category.multilingual': '🌐 Mehrsprachig',

	// Model properties
	'model.rank': 'Rang',
	'model.provider': 'Anbieter',
	'model.name': 'Modell',
	'model.type': 'Typ',
	'model.price': 'Preis ($/1M)',
	'model.speed': 'Geschwindigkeit (Tok/s)',
	'model.latency': 'Latenz (ms)',
	'model.releaseDate': 'Erscheinungsdatum',
	'model.overallScore': 'Gesamtpunktzahl',

	// Model types
	'model.type.proprietary': 'Proprietär',
	'model.type.openSource': 'Open Source',

	// Actions
	'action.edit': 'Bearbeiten',
	'action.delete': 'Löschen',
	'action.add': 'Hinzufügen',
	'action.save': 'Speichern',
	'action.cancel': 'Abbrechen',
	'action.close': 'Schließen',
	'action.showAll': 'Alle {{count}} Kategorien anzeigen',

	// Editor
	'editor.title': '📊 Daten-Editor',
	'editor.subtitle': 'Modelle, Kategorien und Benchmark-Daten bearbeiten',
	'editor.modelsTab': 'Modelle',
	'editor.categoriesTab': 'Kategorien',
	'editor.saveChanges': 'Änderungen Speichern',
	'editor.backToShowdown': '← Zurück zu Showdown',

	// Models Editor
	'modelsEditor.title': 'Modell-Editor',
	'modelsEditor.subtitle': 'Modelle zur Datenbank hinzufügen, bearbeiten oder entfernen',
	'modelsEditor.addModel': '+ Neues Modell Hinzufügen',
	'modelsEditor.editModel': 'Modell Bearbeiten',
	'modelsEditor.addNewModel': 'Neues Modell Hinzufügen',
	'modelsEditor.updateModel': 'Modell Aktualisieren',
	'modelsEditor.createModel': 'Modell Erstellen',

	// Model form fields
	'modelsEditor.form.name': 'Name',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': 'Anbieter',
	'modelsEditor.form.type': 'Typ',
	'modelsEditor.form.rank': 'Rang',
	'modelsEditor.form.overallScore': 'Gesamtpunktzahl (%)',
	'modelsEditor.form.releaseDate': 'Erscheinungsdatum',
	'modelsEditor.form.pricing': 'Preise ($ pro 1M Tokens)',
	'modelsEditor.form.averagePrice': 'Durchschnitt',
	'modelsEditor.form.inputPrice': 'Eingabe',
	'modelsEditor.form.outputPrice': 'Ausgabe',
	'modelsEditor.form.performance': 'Leistung',
	'modelsEditor.form.speed': 'Ausgabegeschwindigkeit (Tokens/s)',
	'modelsEditor.form.latency': 'Latenz TTFT (ms)',
	'modelsEditor.form.categoryScores': 'Kategorie-Punktzahlen (%)',
	'modelsEditor.form.notes': 'Editor-Notizen',
	'modelsEditor.form.placeholder.name': 'z.B. Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': 'automatisch aus Name generiert',
	'modelsEditor.form.placeholder.rank': 'z.B. 1',
	'modelsEditor.form.placeholder.score': 'z.B. 95.5',
	'modelsEditor.form.placeholder.avgPrice': 'z.B. 15.00',
	'modelsEditor.form.placeholder.inputPrice': 'z.B. 10.00',
	'modelsEditor.form.placeholder.outputPrice': 'z.B. 30.00',
	'modelsEditor.form.placeholder.speed': 'z.B. 125.5',
	'modelsEditor.form.placeholder.latency': 'z.B. 450',
	'modelsEditor.form.placeholder.notes': 'Zusätzliche Notizen zu diesem Modell...',

	// Categories Editor
	'categoriesEditor.title': 'Kategorie-Editor',
	'categoriesEditor.subtitle': 'Kategorie-Gewichtungen anpassen und Benchmarks verwalten',
	'categoriesEditor.addCategory': '+ Neue Kategorie Hinzufügen',
	'categoriesEditor.editCategory': 'Kategorie Bearbeiten',
	'categoriesEditor.addNewCategory': 'Neue Kategorie Hinzufügen',
	'categoriesEditor.updateCategory': 'Kategorie Aktualisieren',
	'categoriesEditor.createCategory': 'Kategorie Erstellen',

	// Category form fields
	'categoriesEditor.form.name': 'Name',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': 'Emoji',
	'categoriesEditor.form.weight': 'Gewicht (%)',
	'categoriesEditor.form.description': 'Beschreibung',
	'categoriesEditor.form.benchmarks': 'Benchmarks',
	'categoriesEditor.form.addBenchmark': '+ Benchmark Hinzufügen',
	'categoriesEditor.form.placeholder.name': 'z.B. Programmierung',
	'categoriesEditor.form.placeholder.id': 'automatisch aus Name generiert',
	'categoriesEditor.form.placeholder.emoji': 'z.B. 💻',
	'categoriesEditor.form.placeholder.weight': 'z.B. 25',
	'categoriesEditor.form.placeholder.description': 'Kurze Beschreibung dieser Kategorie...',
	'categoriesEditor.form.benchmark.name': 'Name',
	'categoriesEditor.form.benchmark.type': 'Typ',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': 'z.B. SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': 'Punktzahl (0-100)',

	// Git Integration
	'git.title': '🔄 Git-Integration',
	'git.currentStatus': 'Aktueller Status',
	'git.commitChanges': 'Änderungen Übernehmen',
	'git.commitMessage': 'Commit-Nachricht',
	'git.commitMessage.placeholder': 'Beschreiben Sie Ihre Änderungen...',
	'git.quickActions': 'Schnellaktionen',
	'git.refreshStatus': 'Status Aktualisieren',
	'git.pull': '⬇️ Pull',
	'git.stageAll': '➕ Alle Stagen',
	'git.commitPush': '💾 Commit & Push',
	'git.pushToRemote': '⬆️ Zu Remote Pushen',
	'git.stageChanges': '📦 Änderungen Stagen',
	'git.output': 'Ausgabe',
	'git.noOutput': 'Noch keine Ausgabe. Führen Sie eine Aktion aus, um Ergebnisse zu sehen.',
	'git.viewOnGitHub': 'Auf GitHub anzeigen',

	// Common
	'common.loading': 'Laden...',
	'common.error': 'Fehler',
	'common.success': 'Erfolg',
	'common.confirm': 'Bestätigen',
	'common.yes': 'Ja',
	'common.no': 'Nein',
	'common.benchmark': 'Benchmark',
	'common.benchmarks': 'Benchmarks',
	'common.selectProvider': 'Anbieter auswählen',
	'common.selectType': 'Typ auswählen',

	// Footer
	'footer.dataUpdated': 'Daten aktualisiert: {{date}}',
	'footer.showingModels': '{{count}} von {{total}} Modellen anzeigen',

	// Tooltips
	'tooltip.addToFavorites': 'Zu Favoriten hinzufügen',
	'tooltip.removeFromFavorites': 'Von Favoriten entfernen',
	'tooltip.availableBenchmarks': '{{count}}/{{total}} Benchmarks verfügbar',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': 'Kostenlos',
	'misc.na': '—',
};
