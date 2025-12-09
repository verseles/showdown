export default {
	// Header
	'showdown.title': '🏆 Showdown - Clasificaciones LLM',
	'showdown.subtitle': 'Comparación integral de modelos de IA',
	'showdown.editData': '📊 Editar Datos',

	// Navigation
	'showdown.backToMain': '← Volver a Showdown',

	// Filters
	'filters.title': 'Filtros',
	'filters.providers': 'Proveedores',
	'filters.types': 'Tipos',
	'filters.priceRange': 'Rango de Precio ($/1M tokens)',
	'filters.speedRange': 'Rango de Velocidad (tokens/s)',
	'filters.favoritesOnly': 'Solo Favoritos',
	'filters.reset': 'Restablecer',
	'filters.showing': 'Mostrando {{count}} de {{total}} modelos',

	// Column Settings
	'columns.title': 'Visibilidad de Columnas',
	'columns.showAll': 'Mostrar Todas',
	'columns.hideAll': 'Ocultar Todas',
	'columns.resetDefaults': 'Restablecer por Defecto',
	'columns.default': 'Predeterminado',

	// Favorites
	'favorites.add': 'Añadir a favoritos',
	'favorites.remove': 'Quitar de favoritos',
	'favorites.empty': 'Sin favoritos aún',

	// Categories
	'category.coding': '💻 Programación',
	'category.reasoning': '🧠 Razonamiento',
	'category.agents': '🤖 Agentes',
	'category.conversation': '💬 Conversación',
	'category.math': '🔢 Matemáticas',
	'category.multimodal': '👁️ Multimodal',
	'category.multilingual': '🌐 Multilingüe',

	// Model properties
	'model.rank': 'Clasificación',
	'model.provider': 'Proveedor',
	'model.name': 'Modelo',
	'model.type': 'Tipo',
	'model.price': 'Precio ($/1M)',
	'model.speed': 'Velocidad (tok/s)',
	'model.latency': 'Latencia (ms)',
	'model.releaseDate': 'Fecha de Lanzamiento',
	'model.overallScore': 'Puntuación General',

	// Model types
	'model.type.proprietary': 'Propietario',
	'model.type.openSource': 'Código Abierto',

	// Actions
	'action.edit': 'Editar',
	'action.delete': 'Eliminar',
	'action.add': 'Añadir',
	'action.save': 'Guardar',
	'action.cancel': 'Cancelar',
	'action.close': 'Cerrar',
	'action.showAll': 'Mostrar las {{count}} categorías',

	// Editor
	'editor.title': '📊 Editor de Datos',
	'editor.subtitle': 'Editar modelos, categorías y datos de benchmarks',
	'editor.modelsTab': 'Modelos',
	'editor.categoriesTab': 'Categorías',
	'editor.saveChanges': 'Guardar Cambios',
	'editor.backToShowdown': '← Volver a Showdown',

	// Models Editor
	'modelsEditor.title': 'Editor de Modelos',
	'modelsEditor.subtitle': 'Añadir, editar o eliminar modelos de la base de datos',
	'modelsEditor.addModel': '+ Añadir Nuevo Modelo',
	'modelsEditor.editModel': 'Editar Modelo',
	'modelsEditor.addNewModel': 'Añadir Nuevo Modelo',
	'modelsEditor.updateModel': 'Actualizar Modelo',
	'modelsEditor.createModel': 'Crear Modelo',

	// Model form fields
	'modelsEditor.form.name': 'Nombre',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': 'Proveedor',
	'modelsEditor.form.type': 'Tipo',
	'modelsEditor.form.rank': 'Clasificación',
	'modelsEditor.form.overallScore': 'Puntuación General (%)',
	'modelsEditor.form.releaseDate': 'Fecha de Lanzamiento',
	'modelsEditor.form.pricing': 'Precios ($ por 1M tokens)',
	'modelsEditor.form.averagePrice': 'Promedio',
	'modelsEditor.form.inputPrice': 'Entrada',
	'modelsEditor.form.outputPrice': 'Salida',
	'modelsEditor.form.performance': 'Rendimiento',
	'modelsEditor.form.speed': 'Velocidad de Salida (tokens/s)',
	'modelsEditor.form.latency': 'Latencia TTFT (ms)',
	'modelsEditor.form.categoryScores': 'Puntuaciones de Categoría (%)',
	'modelsEditor.form.notes': 'Notas del Editor',
	'modelsEditor.form.placeholder.name': 'p.ej., Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': 'auto-generado desde el nombre',
	'modelsEditor.form.placeholder.rank': 'p.ej., 1',
	'modelsEditor.form.placeholder.score': 'p.ej., 95.5',
	'modelsEditor.form.placeholder.avgPrice': 'p.ej., 15.00',
	'modelsEditor.form.placeholder.inputPrice': 'p.ej., 10.00',
	'modelsEditor.form.placeholder.outputPrice': 'p.ej., 30.00',
	'modelsEditor.form.placeholder.speed': 'p.ej., 125.5',
	'modelsEditor.form.placeholder.latency': 'p.ej., 450',
	'modelsEditor.form.placeholder.notes': 'Notas adicionales sobre este modelo...',

	// Categories Editor
	'categoriesEditor.title': 'Editor de Categorías',
	'categoriesEditor.subtitle': 'Ajustar pesos de categoría y gestionar benchmarks',
	'categoriesEditor.addCategory': '+ Añadir Nueva Categoría',
	'categoriesEditor.editCategory': 'Editar Categoría',
	'categoriesEditor.addNewCategory': 'Añadir Nueva Categoría',
	'categoriesEditor.updateCategory': 'Actualizar Categoría',
	'categoriesEditor.createCategory': 'Crear Categoría',

	// Category form fields
	'categoriesEditor.form.name': 'Nombre',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': 'Emoji',
	'categoriesEditor.form.weight': 'Peso (%)',
	'categoriesEditor.form.description': 'Descripción',
	'categoriesEditor.form.benchmarks': 'Benchmarks',
	'categoriesEditor.form.addBenchmark': '+ Añadir Benchmark',
	'categoriesEditor.form.placeholder.name': 'p.ej., Programación',
	'categoriesEditor.form.placeholder.id': 'auto-generado desde el nombre',
	'categoriesEditor.form.placeholder.emoji': 'p.ej., 💻',
	'categoriesEditor.form.placeholder.weight': 'p.ej., 25',
	'categoriesEditor.form.placeholder.description': 'Breve descripción de esta categoría...',
	'categoriesEditor.form.benchmark.name': 'Nombre',
	'categoriesEditor.form.benchmark.type': 'Tipo',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': 'p.ej., SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': 'Puntuación (0-100)',

	// Git Integration
	'git.title': '🔄 Integración Git',
	'git.currentStatus': 'Estado Actual',
	'git.commitChanges': 'Confirmar Cambios',
	'git.commitMessage': 'Mensaje de Confirmación',
	'git.commitMessage.placeholder': 'Describe tus cambios...',
	'git.quickActions': 'Acciones Rápidas',
	'git.refreshStatus': 'Actualizar Estado',
	'git.pull': '⬇️ Obtener',
	'git.stageAll': '➕ Preparar Todo',
	'git.commitPush': '💾 Confirmar y Enviar',
	'git.pushToRemote': '⬆️ Enviar a Remoto',
	'git.stageChanges': '📦 Preparar Cambios',
	'git.output': 'Salida',
	'git.noOutput': 'Sin salida aún. Realiza una acción para ver resultados.',
	'git.viewOnGitHub': 'Ver en GitHub',

	// Common
	'common.loading': 'Cargando...',
	'common.error': 'Error',
	'common.success': 'Éxito',
	'common.confirm': 'Confirmar',
	'common.yes': 'Sí',
	'common.no': 'No',
	'common.benchmark': 'benchmark',
	'common.benchmarks': 'benchmarks',
	'common.selectProvider': 'Seleccionar proveedor',
	'common.selectType': 'Seleccionar tipo',

	// Footer
	'footer.dataUpdated': 'Datos actualizados: {{date}}',
	'footer.showingModels': 'Mostrando {{count}} de {{total}} modelos',

	// Tooltips
	'tooltip.addToFavorites': 'Añadir a favoritos',
	'tooltip.removeFromFavorites': 'Quitar de favoritos',
	'tooltip.availableBenchmarks': '{{count}}/{{total}} benchmarks disponibles',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': 'Gratis',
	'misc.na': '—',
};
