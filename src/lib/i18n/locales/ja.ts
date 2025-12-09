export default {
	// Header
	'showdown.title': '🏆 Showdown - LLMランキング',
	'showdown.subtitle': 'AI言語モデルの包括的比较',
	'showdown.editData': '📊 データ編集',

	// Navigation
	'showdown.backToMain': '← Showdownに戻る',

	// Filters
	'filters.title': 'フィルター',
	'filters.providers': 'プロバイダー',
	'filters.types': 'タイプ',
	'filters.priceRange': '価格範囲 ($/1Mトークン)',
	'filters.speedRange': '速度範囲 (トークン/秒)',
	'filters.favoritesOnly': 'お気に入りのみ',
	'filters.reset': 'リセット',
	'filters.showing': '{{total}}モデル中{{count}}件を表示',

	// Column Settings
	'columns.title': '列の表示',
	'columns.showAll': 'すべて表示',
	'columns.hideAll': 'すべて非表示',
	'columns.resetDefaults': 'デフォルトにリセット',
	'columns.default': 'デフォルト',

	// Favorites
	'favorites.add': 'お気に入りに追加',
	'favorites.remove': 'お気に入りから削除',
	'favorites.empty': 'お気に入りはありません',

	// Categories
	'category.coding': '💻 コーディング',
	'category.reasoning': '🧠 推論',
	'category.agents': '🤖 エージェント',
	'category.conversation': '💬 会話',
	'category.math': '🔢 数学',
	'category.multimodal': '👁️ マルチモーダル',
	'category.multilingual': '🌐 多言語',

	// Model properties
	'model.rank': 'ランキング',
	'model.provider': 'プロバイダー',
	'model.name': 'モデル',
	'model.type': 'タイプ',
	'model.price': '価格 ($/1M)',
	'model.speed': '速度 (トークン/秒)',
	'model.latency': 'レイテンシ (ms)',
	'model.releaseDate': 'リリース日',
	'model.overallScore': '総合スコア',

	// Model types
	'model.type.proprietary': 'プロプライエタリ',
	'model.type.openSource': 'オープンソース',

	// Actions
	'action.edit': '編集',
	'action.delete': '削除',
	'action.add': '追加',
	'action.save': '保存',
	'action.cancel': 'キャンセル',
	'action.close': '閉じる',
	'action.showAll': 'すべての{{count}}カテゴリを表示',

	// Editor
	'editor.title': '📊 データエディター',
	'editor.subtitle': 'モデル、カテゴリ、ベンチマークデータの編集',
	'editor.modelsTab': 'モデル',
	'editor.categoriesTab': 'カテゴリ',
	'editor.saveChanges': '変更を保存',
	'editor.backToShowdown': '← Showdownに戻る',

	// Models Editor
	'modelsEditor.title': 'モデルエディター',
	'modelsEditor.subtitle': 'データベースへのモデルの追加、編集、削除',
	'modelsEditor.addModel': '+ 新しいモデルを追加',
	'modelsEditor.editModel': 'モデルを編集',
	'modelsEditor.addNewModel': '新しいモデルを追加',
	'modelsEditor.updateModel': 'モデルを更新',
	'modelsEditor.createModel': 'モデルを作成',

	// Model form fields
	'modelsEditor.form.name': '名前',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': 'プロバイダー',
	'modelsEditor.form.type': 'タイプ',
	'modelsEditor.form.rank': 'ランキング',
	'modelsEditor.form.overallScore': '総合スコア (%)',
	'modelsEditor.form.releaseDate': 'リリース日',
	'modelsEditor.form.pricing': '価格 ($/1Mトークン)',
	'modelsEditor.form.averagePrice': '平均',
	'modelsEditor.form.inputPrice': '入力',
	'modelsEditor.form.outputPrice': '出力',
	'modelsEditor.form.performance': 'パフォーマンス',
	'modelsEditor.form.speed': '出力速度 (トークン/秒)',
	'modelsEditor.form.latency': 'レイテンシ TTFT (ms)',
	'modelsEditor.form.categoryScores': 'カテゴリスコア (%)',
	'modelsEditor.form.notes': 'エディターノート',
	'modelsEditor.form.placeholder.name': '例：Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': '名前から自動生成',
	'modelsEditor.form.placeholder.rank': '例：1',
	'modelsEditor.form.placeholder.score': '例：95.5',
	'modelsEditor.form.placeholder.avgPrice': '例：15.00',
	'modelsEditor.form.placeholder.inputPrice': '例：10.00',
	'modelsEditor.form.placeholder.outputPrice': '例：30.00',
	'modelsEditor.form.placeholder.speed': '例：125.5',
	'modelsEditor.form.placeholder.latency': '例：450',
	'modelsEditor.form.placeholder.notes': 'このモデルについての追加ノート...',

	// Categories Editor
	'categoriesEditor.title': 'カテゴリエディター',
	'categoriesEditor.subtitle': 'カテゴリ重量の調整とベンチマーク管理',
	'categoriesEditor.addCategory': '+ 新しいカテゴリを追加',
	'categoriesEditor.editCategory': 'カテゴリを編集',
	'categoriesEditor.addNewCategory': '新しいカテゴリを追加',
	'categoriesEditor.updateCategory': 'カテゴリを更新',
	'categoriesEditor.createCategory': 'カテゴリを作成',

	// Category form fields
	'categoriesEditor.form.name': '名前',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': '絵文字',
	'categoriesEditor.form.weight': '重量 (%)',
	'categoriesEditor.form.description': '説明',
	'categoriesEditor.form.benchmarks': 'ベンチマーク',
	'categoriesEditor.form.addBenchmark': '+ ベンチマークを追加',
	'categoriesEditor.form.placeholder.name': '例：コーディング',
	'categoriesEditor.form.placeholder.id': '名前から自動生成',
	'categoriesEditor.form.placeholder.emoji': '例：💻',
	'categoriesEditor.form.placeholder.weight': '例：25',
	'categoriesEditor.form.placeholder.description': 'このカテゴリの簡単な説明...',
	'categoriesEditor.form.benchmark.name': '名前',
	'categoriesEditor.form.benchmark.type': 'タイプ',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': '例：SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': 'スコア (0-100)',

	// Git Integration
	'git.title': '🔄 Git統合',
	'git.currentStatus': '現在のステータス',
	'git.commitChanges': '変更をコミット',
	'git.commitMessage': 'コミットメッセージ',
	'git.commitMessage.placeholder': '変更を説明してください...',
	'git.quickActions': 'クイックアクション',
	'git.refreshStatus': 'ステータスを更新',
	'git.pull': '⬇️ プル',
	'git.stageAll': '➕ すべてステージ',
	'git.commitPush': '💾 コミット＆プッシュ',
	'git.pushToRemote': '⬆️ リモートにプッシュ',
	'git.stageChanges': '📦 変更をステージ',
	'git.output': '出力',
	'git.noOutput': 'まだ出力はありません。操作を実行して結果を表示してください。',
	'git.viewOnGitHub': 'GitHubで表示',

	// Common
	'common.loading': '読み込み中...',
	'common.error': 'エラー',
	'common.success': '成功',
	'common.confirm': '確認',
	'common.yes': 'はい',
	'common.no': 'いいえ',
	'common.benchmark': 'ベンチマーク',
	'common.benchmarks': 'ベンチマーク',
	'common.selectProvider': 'プロバイダーを選択',
	'common.selectType': 'タイプを選択',

	// Footer
	'footer.dataUpdated': 'データ更新日：{{date}}',
	'footer.showingModels': '{{total}}モデル中{{count}}件を表示',

	// Tooltips
	'tooltip.addToFavorites': 'お気に入りに追加',
	'tooltip.removeFromFavorites': 'お気に入りから削除',
	'tooltip.availableBenchmarks': '{{count}}/{{total}}ベンチマークが利用可能',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': '無料',
	'misc.na': '—',
};
