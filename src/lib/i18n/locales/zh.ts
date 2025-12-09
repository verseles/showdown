export default {
	// Header
	'showdown.title': '🏆 Showdown - 大语言模型排行榜',
	'showdown.subtitle': '全面的AI语言模型比较',
	'showdown.editData': '📊 编辑数据',

	// Navigation
	'showdown.backToMain': '← 返回Showdown',

	// Filters
	'filters.title': '筛选器',
	'filters.providers': '提供商',
	'filters.types': '类型',
	'filters.priceRange': '价格范围 ($/1M tokens)',
	'filters.speedRange': '速度范围 (tokens/s)',
	'filters.favoritesOnly': '仅显示收藏',
	'filters.reset': '重置',
	'filters.showing': '显示 {{count}} / {{total}} 个模型',

	// Column Settings
	'columns.title': '列可见性',
	'columns.showAll': '显示全部',
	'columns.hideAll': '隐藏全部',
	'columns.resetDefaults': '重置为默认',
	'columns.default': '默认',

	// Favorites
	'favorites.add': '添加到收藏',
	'favorites.remove': '从收藏中移除',
	'favorites.empty': '暂无收藏',

	// Categories
	'category.coding': '💻 编程',
	'category.reasoning': '🧠 推理',
	'category.agents': '🤖 智能体',
	'category.conversation': '💬 对话',
	'category.math': '🔢 数学',
	'category.multimodal': '👁️ 多模态',
	'category.multilingual': '🌐 多语言',

	// Model properties
	'model.rank': '排名',
	'model.provider': '提供商',
	'model.name': '模型',
	'model.type': '类型',
	'model.price': '价格 ($/1M)',
	'model.speed': '速度 (tok/s)',
	'model.latency': '延迟 (ms)',
	'model.releaseDate': '发布日期',
	'model.overallScore': '总体评分',

	// Model types
	'model.type.proprietary': '专有',
	'model.type.openSource': '开源',

	// Actions
	'action.edit': '编辑',
	'action.delete': '删除',
	'action.add': '添加',
	'action.save': '保存',
	'action.cancel': '取消',
	'action.close': '关闭',
	'action.showAll': '显示全部 {{count}} 个类别',

	// Editor
	'editor.title': '📊 数据编辑器',
	'editor.subtitle': '编辑模型、类别和基准测试数据',
	'editor.modelsTab': '模型',
	'editor.categoriesTab': '类别',
	'editor.saveChanges': '保存更改',
	'editor.backToShowdown': '← 返回Showdown',

	// Models Editor
	'modelsEditor.title': '模型编辑器',
	'modelsEditor.subtitle': '添加、编辑或删除数据库中的模型',
	'modelsEditor.addModel': '+ 添加新模型',
	'modelsEditor.editModel': '编辑模型',
	'modelsEditor.addNewModel': '添加新模型',
	'modelsEditor.updateModel': '更新模型',
	'modelsEditor.createModel': '创建模型',

	// Model form fields
	'modelsEditor.form.name': '名称',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': '提供商',
	'modelsEditor.form.type': '类型',
	'modelsEditor.form.rank': '排名',
	'modelsEditor.form.overallScore': '总体评分 (%)',
	'modelsEditor.form.releaseDate': '发布日期',
	'modelsEditor.form.pricing': '价格 ($/1M tokens)',
	'modelsEditor.form.averagePrice': '平均',
	'modelsEditor.form.inputPrice': '输入',
	'modelsEditor.form.outputPrice': '输出',
	'modelsEditor.form.performance': '性能',
	'modelsEditor.form.speed': '输出速度 (tokens/s)',
	'modelsEditor.form.latency': '延迟 TTFT (ms)',
	'modelsEditor.form.categoryScores': '类别评分 (%)',
	'modelsEditor.form.notes': '编辑器备注',
	'modelsEditor.form.placeholder.name': '例如：Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': '从名称自动生成',
	'modelsEditor.form.placeholder.rank': '例如：1',
	'modelsEditor.form.placeholder.score': '例如：95.5',
	'modelsEditor.form.placeholder.avgPrice': '例如：15.00',
	'modelsEditor.form.placeholder.inputPrice': '例如：10.00',
	'modelsEditor.form.placeholder.outputPrice': '例如：30.00',
	'modelsEditor.form.placeholder.speed': '例如：125.5',
	'modelsEditor.form.placeholder.latency': '例如：450',
	'modelsEditor.form.placeholder.notes': '关于此模型的附加备注...',

	// Categories Editor
	'categoriesEditor.title': '类别编辑器',
	'categoriesEditor.subtitle': '调整类别权重和管理基准测试',
	'categoriesEditor.addCategory': '+ 添加新类别',
	'categoriesEditor.editCategory': '编辑类别',
	'categoriesEditor.addNewCategory': '添加新类别',
	'categoriesEditor.updateCategory': '更新类别',
	'categoriesEditor.createCategory': '创建类别',

	// Category form fields
	'categoriesEditor.form.name': '名称',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': '表情符号',
	'categoriesEditor.form.weight': '权重 (%)',
	'categoriesEditor.form.description': '描述',
	'categoriesEditor.form.benchmarks': '基准测试',
	'categoriesEditor.form.addBenchmark': '+ 添加基准测试',
	'categoriesEditor.form.placeholder.name': '例如：编程',
	'categoriesEditor.form.placeholder.id': '从名称自动生成',
	'categoriesEditor.form.placeholder.emoji': '例如：💻',
	'categoriesEditor.form.placeholder.weight': '例如：25',
	'categoriesEditor.form.placeholder.description': '此类别的简要描述...',
	'categoriesEditor.form.benchmark.name': '名称',
	'categoriesEditor.form.benchmark.type': '类型',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': '例如：SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': '评分 (0-100)',

	// Git Integration
	'git.title': '🔄 Git集成',
	'git.currentStatus': '当前状态',
	'git.commitChanges': '提交更改',
	'git.commitMessage': '提交消息',
	'git.commitMessage.placeholder': '描述您的更改...',
	'git.quickActions': '快速操作',
	'git.refreshStatus': '刷新状态',
	'git.pull': '⬇️ 拉取',
	'git.stageAll': '➕ 暂存全部',
	'git.commitPush': '💾 提交并推送',
	'git.pushToRemote': '⬆️ 推送到远程',
	'git.stageChanges': '📦 暂存更改',
	'git.output': '输出',
	'git.noOutput': '尚无输出。执行操作以查看结果。',
	'git.viewOnGitHub': '在GitHub上查看',

	// Common
	'common.loading': '加载中...',
	'common.error': '错误',
	'common.success': '成功',
	'common.confirm': '确认',
	'common.yes': '是',
	'common.no': '否',
	'common.benchmark': '基准测试',
	'common.benchmarks': '基准测试',
	'common.selectProvider': '选择提供商',
	'common.selectType': '选择类型',

	// Footer
	'footer.dataUpdated': '数据更新时间：{{date}}',
	'footer.showingModels': '显示 {{count}} / {{total}} 个模型',

	// Tooltips
	'tooltip.addToFavorites': '添加到收藏',
	'tooltip.removeFromFavorites': '从收藏中移除',
	'tooltip.availableBenchmarks': '{{count}}/{{total}} 个基准测试可用',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': '免费',
	'misc.na': '—',
};
