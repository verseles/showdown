export default {
	// Header
	'showdown.title': '🏆 Showdown - Рейтинги LLM',
	'showdown.subtitle': 'Комплексное сравнение моделей ИИ',
	'showdown.editData': '📊 Редактировать данные',

	// Navigation
	'showdown.backToMain': '← Вернуться к Showdown',

	// Filters
	'filters.title': 'Фильтры',
	'filters.providers': 'Провайдеры',
	'filters.types': 'Типы',
	'filters.priceRange': 'Диапазон цен ($/1M токенов)',
	'filters.speedRange': 'Диапазон скорости (токен/с)',
	'filters.favoritesOnly': 'Только избранное',
	'filters.reset': 'Сбросить',
	'filters.showing': 'Показано {{count}} из {{total}} моделей',

	// Column Settings
	'columns.title': 'Видимость столбцов',
	'columns.showAll': 'Показать все',
	'columns.hideAll': 'Скрыть все',
	'columns.resetDefaults': 'Сбросить на значения по умолчанию',
	'columns.default': 'По умолчанию',

	// Favorites
	'favorites.add': 'Добавить в избранное',
	'favorites.remove': 'Удалить из избранного',
	'favorites.empty': 'Пока нет избранного',

	// Categories
	'category.coding': '💻 Программирование',
	'category.reasoning': '🧠 Рассуждение',
	'category.agents': '🤖 Агенты',
	'category.conversation': '💬 Диалог',
	'category.math': '🔢 Математика',
	'category.multimodal': '👁️ Мультимодальность',
	'category.multilingual': '🌐 Многоязычность',

	// Model properties
	'model.rank': 'Рейтинг',
	'model.provider': 'Провайдер',
	'model.name': 'Модель',
	'model.type': 'Тип',
	'model.price': 'Цена ($/1M)',
	'model.speed': 'Скорость (ток/с)',
	'model.latency': 'Задержка (мс)',
	'model.releaseDate': 'Дата выпуска',
	'model.overallScore': 'Общий балл',

	// Model types
	'model.type.proprietary': 'Проприетарная',
	'model.type.openSource': 'С открытым кодом',

	// Actions
	'action.edit': 'Редактировать',
	'action.delete': 'Удалить',
	'action.add': 'Добавить',
	'action.save': 'Сохранить',
	'action.cancel': 'Отмена',
	'action.close': 'Закрыть',
	'action.showAll': 'Показать все {{count}} категорий',

	// Editor
	'editor.title': '📊 Редактор данных',
	'editor.subtitle': 'Редактирование моделей, категорий и данных бенчмарков',
	'editor.modelsTab': 'Модели',
	'editor.categoriesTab': 'Категории',
	'editor.saveChanges': 'Сохранить изменения',
	'editor.backToShowdown': '← Вернуться к Showdown',

	// Models Editor
	'modelsEditor.title': 'Редактор моделей',
	'modelsEditor.subtitle': 'Добавление, редактирование или удаление моделей из базы данных',
	'modelsEditor.addModel': '+ Добавить новую модель',
	'modelsEditor.editModel': 'Редактировать модель',
	'modelsEditor.addNewModel': 'Добавить новую модель',
	'modelsEditor.updateModel': 'Обновить модель',
	'modelsEditor.createModel': 'Создать модель',

	// Model form fields
	'modelsEditor.form.name': 'Название',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': 'Провайдер',
	'modelsEditor.form.type': 'Тип',
	'modelsEditor.form.rank': 'Рейтинг',
	'modelsEditor.form.overallScore': 'Общий балл (%)',
	'modelsEditor.form.releaseDate': 'Дата выпуска',
	'modelsEditor.form.pricing': 'Цены ($ за 1M токенов)',
	'modelsEditor.form.averagePrice': 'Средняя',
	'modelsEditor.form.inputPrice': 'Ввод',
	'modelsEditor.form.outputPrice': 'Вывод',
	'modelsEditor.form.performance': 'Производительность',
	'modelsEditor.form.speed': 'Скорость вывода (ток/с)',
	'modelsEditor.form.latency': 'Задержка TTFT (мс)',
	'modelsEditor.form.categoryScores': 'Баллы по категориям (%)',
	'modelsEditor.form.notes': 'Заметки редактора',
	'modelsEditor.form.placeholder.name': 'напр., Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': 'автогенерация из названия',
	'modelsEditor.form.placeholder.rank': 'напр., 1',
	'modelsEditor.form.placeholder.score': 'напр., 95.5',
	'modelsEditor.form.placeholder.avgPrice': 'напр., 15.00',
	'modelsEditor.form.placeholder.inputPrice': 'напр., 10.00',
	'modelsEditor.form.placeholder.outputPrice': 'напр., 30.00',
	'modelsEditor.form.placeholder.speed': 'напр., 125.5',
	'modelsEditor.form.placeholder.latency': 'напр., 450',
	'modelsEditor.form.placeholder.notes': 'Дополнительные заметки об этой модели...',

	// Categories Editor
	'categoriesEditor.title': 'Редактор категорий',
	'categoriesEditor.subtitle': 'Настройка весов категорий и управление бенчмарками',
	'categoriesEditor.addCategory': '+ Добавить новую категорию',
	'categoriesEditor.editCategory': 'Редактировать категорию',
	'categoriesEditor.addNewCategory': 'Добавить новую категорию',
	'categoriesEditor.updateCategory': 'Обновить категорию',
	'categoriesEditor.createCategory': 'Создать категорию',

	// Category form fields
	'categoriesEditor.form.name': 'Название',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': 'Эмодзи',
	'categoriesEditor.form.weight': 'Вес (%)',
	'categoriesEditor.form.description': 'Описание',
	'categoriesEditor.form.benchmarks': 'Бенчмарки',
	'categoriesEditor.form.addBenchmark': '+ Добавить бенчмарк',
	'categoriesEditor.form.placeholder.name': 'напр., Программирование',
	'categoriesEditor.form.placeholder.id': 'автогенерация из названия',
	'categoriesEditor.form.placeholder.emoji': 'напр., 💻',
	'categoriesEditor.form.placeholder.weight': 'напр., 25',
	'categoriesEditor.form.placeholder.description': 'Краткое описание этой категории...',
	'categoriesEditor.form.benchmark.name': 'Название',
	'categoriesEditor.form.benchmark.type': 'Тип',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': 'напр., SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': 'Балл (0-100)',

	// Git Integration
	'git.title': '🔄 Интеграция Git',
	'git.currentStatus': 'Текущий статус',
	'git.commitChanges': 'Зафиксировать изменения',
	'git.commitMessage': 'Сообщение коммита',
	'git.commitMessage.placeholder': 'Опишите ваши изменения...',
	'git.quickActions': 'Быстрые действия',
	'git.refreshStatus': 'Обновить статус',
	'git.pull': '⬇️ Pull',
	'git.stageAll': '➕ Индексировать все',
	'git.commitPush': '💾 Коммит и пуш',
	'git.pushToRemote': '⬆️ Отправить в удаленный репозиторий',
	'git.stageChanges': '📦 Индексировать изменения',
	'git.output': 'Вывод',
	'git.noOutput': 'Пока нет вывода. Выполните действие, чтобы увидеть результаты.',
	'git.viewOnGitHub': 'Посмотреть на GitHub',

	// Common
	'common.loading': 'Загрузка...',
	'common.error': 'Ошибка',
	'common.success': 'Успех',
	'common.confirm': 'Подтвердить',
	'common.yes': 'Да',
	'common.no': 'Нет',
	'common.benchmark': 'бенчмарк',
	'common.benchmarks': 'бенчмарки',
	'common.selectProvider': 'Выберите провайдера',
	'common.selectType': 'Выберите тип',

	// Footer
	'footer.dataUpdated': 'Данные обновлены: {{date}}',
	'footer.showingModels': 'Показано {{count}} из {{total}} моделей',

	// Tooltips
	'tooltip.addToFavorites': 'Добавить в избранное',
	'tooltip.removeFromFavorites': 'Удалить из избранного',
	'tooltip.availableBenchmarks': '{{count}}/{{total}} бенчмарков доступно',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': 'Бесплатно',
	'misc.na': '—',
};
