export default {
	// Header
	'showdown.title': '🏆 Showdown - Rankings LLM',
	'showdown.subtitle': 'Comparação abrangente de modelos de linguagem IA',
	'showdown.editData': '📊 Editar Dados',

	// Navigation
	'showdown.backToMain': '← Voltar ao Showdown',

	// Filters
	'filters.title': 'Filtros',
	'filters.providers': 'Fornecedores',
	'filters.types': 'Tipos',
	'filters.priceRange': 'Faixa de Preço ($/1M tokens)',
	'filters.speedRange': 'Faixa de Velocidade (tokens/s)',
	'filters.favoritesOnly': 'Apenas Favoritos',
	'filters.reset': 'Redefinir',
	'filters.showing': 'Mostrando {{count}} de {{total}} modelos',

	// Column Settings
	'columns.title': 'Visibilidade de Colunas',
	'columns.showAll': 'Mostrar Tudo',
	'columns.hideAll': 'Ocultar Tudo',
	'columns.resetDefaults': 'Redefinir para Padrão',
	'columns.default': 'Padrão',

	// Favorites
	'favorites.add': 'Adicionar aos favoritos',
	'favorites.remove': 'Remover dos favoritos',
	'favorites.empty': 'Nenhum favorito ainda',

	// Categories
	'category.coding': '💻 Programação',
	'category.reasoning': '🧠 Raciocínio',
	'category.agents': '🤖 Agentes',
	'category.conversation': '💬 Conversa',
	'category.math': '🔢 Matemática',
	'category.multimodal': '👁️ Multimodal',
	'category.multilingual': '🌐 Multilíngue',

	// Model properties
	'model.rank': 'Classificação',
	'model.provider': 'Fornecedor',
	'model.name': 'Modelo',
	'model.type': 'Tipo',
	'model.price': 'Preço ($/1M)',
	'model.speed': 'Velocidade (tok/s)',
	'model.latency': 'Latência (ms)',
	'model.releaseDate': 'Data de Lançamento',
	'model.overallScore': 'Pontuação Geral',

	// Model types
	'model.type.proprietary': 'Proprietário',
	'model.type.openSource': 'Código Aberto',

	// Actions
	'action.edit': 'Editar',
	'action.delete': 'Excluir',
	'action.add': 'Adicionar',
	'action.save': 'Salvar',
	'action.cancel': 'Cancelar',
	'action.close': 'Fechar',
	'action.showAll': 'Mostrar todas as {{count}} categorias',

	// Editor
	'editor.title': '📊 Editor de Dados',
	'editor.subtitle': 'Editar modelos, categorias e dados de benchmark',
	'editor.modelsTab': 'Modelos',
	'editor.categoriesTab': 'Categorias',
	'editor.saveChanges': 'Salvar Alterações',
	'editor.backToShowdown': '← Voltar ao Showdown',

	// Models Editor
	'modelsEditor.title': 'Editor de Modelos',
	'modelsEditor.subtitle': 'Adicionar, editar ou excluir modelos do banco de dados',
	'modelsEditor.addModel': '+ Adicionar Novo Modelo',
	'modelsEditor.editModel': 'Editar Modelo',
	'modelsEditor.addNewModel': 'Adicionar Novo Modelo',
	'modelsEditor.updateModel': 'Atualizar Modelo',
	'modelsEditor.createModel': 'Criar Modelo',

	// Model form fields
	'modelsEditor.form.name': 'Nome',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': 'Fornecedor',
	'modelsEditor.form.type': 'Tipo',
	'modelsEditor.form.rank': 'Classificação',
	'modelsEditor.form.overallScore': 'Pontuação Geral (%)',
	'modelsEditor.form.releaseDate': 'Data de Lançamento',
	'modelsEditor.form.pricing': 'Preços ($ por 1M tokens)',
	'modelsEditor.form.averagePrice': 'Média',
	'modelsEditor.form.inputPrice': 'Entrada',
	'modelsEditor.form.outputPrice': 'Saída',
	'modelsEditor.form.performance': 'Desempenho',
	'modelsEditor.form.speed': 'Velocidade de Saída (tokens/s)',
	'modelsEditor.form.latency': 'Latência TTFT (ms)',
	'modelsEditor.form.categoryScores': 'Pontuações de Categoria (%)',
	'modelsEditor.form.notes': 'Notas do Editor',
	'modelsEditor.form.placeholder.name': 'ex., Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': 'auto-gerado a partir do nome',
	'modelsEditor.form.placeholder.rank': 'ex., 1',
	'modelsEditor.form.placeholder.score': 'ex., 95.5',
	'modelsEditor.form.placeholder.avgPrice': 'ex., 15.00',
	'modelsEditor.form.placeholder.inputPrice': 'ex., 10.00',
	'modelsEditor.form.placeholder.outputPrice': 'ex., 30.00',
	'modelsEditor.form.placeholder.speed': 'ex., 125.5',
	'modelsEditor.form.placeholder.latency': 'ex., 450',
	'modelsEditor.form.placeholder.notes': 'Notas adicionais sobre este modelo...',

	// Categories Editor
	'categoriesEditor.title': 'Editor de Categorias',
	'categoriesEditor.subtitle': 'Ajustar pesos de categoria e gerenciar benchmarks',
	'categoriesEditor.addCategory': '+ Adicionar Nova Categoria',
	'categoriesEditor.editCategory': 'Editar Categoria',
	'categoriesEditor.addNewCategory': 'Adicionar Nova Categoria',
	'categoriesEditor.updateCategory': 'Atualizar Categoria',
	'categoriesEditor.createCategory': 'Criar Categoria',

	// Category form fields
	'categoriesEditor.form.name': 'Nome',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': 'Emoji',
	'categoriesEditor.form.weight': 'Peso (%)',
	'categoriesEditor.form.description': 'Descrição',
	'categoriesEditor.form.benchmarks': 'Benchmarks',
	'categoriesEditor.form.addBenchmark': '+ Adicionar Benchmark',
	'categoriesEditor.form.placeholder.name': 'ex., Programação',
	'categoriesEditor.form.placeholder.id': 'auto-gerado a partir do nome',
	'categoriesEditor.form.placeholder.emoji': 'ex., 💻',
	'categoriesEditor.form.placeholder.weight': 'ex., 25',
	'categoriesEditor.form.placeholder.description': 'Breve descrição desta categoria...',
	'categoriesEditor.form.benchmark.name': 'Nome',
	'categoriesEditor.form.benchmark.type': 'Tipo',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': 'ex., SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': 'Pontuação (0-100)',

	// Git Integration
	'git.title': '🔄 Integração Git',
	'git.currentStatus': 'Status Atual',
	'git.commitChanges': 'Confirmar Alterações',
	'git.commitMessage': 'Mensagem de Confirmação',
	'git.commitMessage.placeholder': 'Descreva suas alterações...',
	'git.quickActions': 'Ações Rápidas',
	'git.refreshStatus': 'Atualizar Status',
	'git.pull': '⬇️ Pull',
	'git.stageAll': '➕ Preparar Tudo',
	'git.commitPush': '💾 Confirmar e Enviar',
	'git.pushToRemote': '⬆️ Enviar para Remoto',
	'git.stageChanges': '📦 Preparar Alterações',
	'git.output': 'Saída',
	'git.noOutput': 'Nenhuma saída ainda. Execute uma ação para ver resultados.',
	'git.viewOnGitHub': 'Ver no GitHub',

	// Common
	'common.loading': 'Carregando...',
	'common.error': 'Erro',
	'common.success': 'Sucesso',
	'common.confirm': 'Confirmar',
	'common.yes': 'Sim',
	'common.no': 'Não',
	'common.benchmark': 'benchmark',
	'common.benchmarks': 'benchmarks',
	'common.selectProvider': 'Selecionar fornecedor',
	'common.selectType': 'Selecionar tipo',

	// Footer
	'footer.dataUpdated': 'Dados atualizados: {{date}}',
	'footer.showingModels': 'Mostrando {{count}} de {{total}} modelos',

	// Tooltips
	'tooltip.addToFavorites': 'Adicionar aos favoritos',
	'tooltip.removeFromFavorites': 'Remover dos favoritos',
	'tooltip.availableBenchmarks': '{{count}}/{{total}} benchmarks disponíveis',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': 'Grátis',
	'misc.na': '—',
};
