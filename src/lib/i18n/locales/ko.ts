export default {
	// Header
	'showdown.title': '🏆 쇼다운 - LLM 순위',
	'showdown.subtitle': 'AI 언어 모델의 포괄적 비교',
	'showdown.editData': '📊 데이터 편집',

	// Navigation
	'showdown.backToMain': '← 쇼다운으로 돌아가기',

	// Filters
	'filters.title': '필터',
	'filters.providers': '제공자',
	'filters.types': '유형',
	'filters.priceRange': '가격 범위 ($/1M 토큰)',
	'filters.speedRange': '속도 범위 (토큰/초)',
	'filters.favoritesOnly': '즐겨찾기만',
	'filters.reset': '재설정',
	'filters.showing': '{{total}}개 모델 중 {{count}}개 표시',

	// Column Settings
	'columns.title': '열 가시성',
	'columns.showAll': '모두 표시',
	'columns.hideAll': '모두 숨기기',
	'columns.resetDefaults': '기본값으로 재설정',
	'columns.default': '기본',

	// Favorites
	'favorites.add': '즐겨찾기에 추가',
	'favorites.remove': '즐겨찾기에서 제거',
	'favorites.empty': '즐겨찾기가 없습니다',

	// Categories
	'category.coding': '💻 코딩',
	'category.reasoning': '🧠 추론',
	'category.agents': '🤖 에이전트',
	'category.conversation': '💬 대화',
	'category.math': '🔢 수학',
	'category.multimodal': '👁️ 멀티모달',
	'category.multilingual': '🌐 다국어',

	// Model properties
	'model.rank': '순위',
	'model.provider': '제공자',
	'model.name': '모델',
	'model.type': '유형',
	'model.price': '가격 ($/1M)',
	'model.speed': '속도 (토큰/초)',
	'model.latency': '대기시간 (ms)',
	'model.releaseDate': '출시일',
	'model.overallScore': '전체 점수',

	// Model types
	'model.type.proprietary': '독점',
	'model.type.openSource': '오픈소스',

	// Actions
	'action.edit': '편집',
	'action.delete': '삭제',
	'action.add': '추가',
	'action.save': '저장',
	'action.cancel': '취소',
	'action.close': '닫기',
	'action.showAll': '모든 {{count}} 카테고리 표시',

	// Editor
	'editor.title': '📊 데이터 편집기',
	'editor.subtitle': '모델, 카테고리, 벤치마크 데이터 편집',
	'editor.modelsTab': '모델',
	'editor.categoriesTab': '카테고리',
	'editor.saveChanges': '변경사항 저장',
	'editor.backToShowdown': '← 쇼다운으로 돌아가기',

	// Models Editor
	'modelsEditor.title': '모델 편집기',
	'modelsEditor.subtitle': '데이터베이스에 모델 추가, 편집, 삭제',
	'modelsEditor.addModel': '+ 새 모델 추가',
	'modelsEditor.editModel': '모델 편집',
	'modelsEditor.addNewModel': '새 모델 추가',
	'modelsEditor.updateModel': '모델 업데이트',
	'modelsEditor.createModel': '모델 생성',

	// Model form fields
	'modelsEditor.form.name': '이름',
	'modelsEditor.form.id': 'ID',
	'modelsEditor.form.provider': '제공자',
	'modelsEditor.form.type': '유형',
	'modelsEditor.form.rank': '순위',
	'modelsEditor.form.overallScore': '전체 점수 (%)',
	'modelsEditor.form.releaseDate': '출시일',
	'modelsEditor.form.pricing': '가격 ($/1M 토큰)',
	'modelsEditor.form.averagePrice': '평균',
	'modelsEditor.form.inputPrice': '입력',
	'modelsEditor.form.outputPrice': '출력',
	'modelsEditor.form.performance': '성능',
	'modelsEditor.form.speed': '출력 속도 (토큰/초)',
	'modelsEditor.form.latency': '대기시간 TTFT (ms)',
	'modelsEditor.form.categoryScores': '카테고리 점수 (%)',
	'modelsEditor.form.notes': '편집자 노트',
	'modelsEditor.form.placeholder.name': '예: Claude Opus 4.5',
	'modelsEditor.form.placeholder.id': '이름에서 자동 생성',
	'modelsEditor.form.placeholder.rank': '예: 1',
	'modelsEditor.form.placeholder.score': '예: 95.5',
	'modelsEditor.form.placeholder.avgPrice': '예: 15.00',
	'modelsEditor.form.placeholder.inputPrice': '예: 10.00',
	'modelsEditor.form.placeholder.outputPrice': '예: 30.00',
	'modelsEditor.form.placeholder.speed': '예: 125.5',
	'modelsEditor.form.placeholder.latency': '예: 450',
	'modelsEditor.form.placeholder.notes': '이 모델에 대한 추가 노트...',

	// Categories Editor
	'categoriesEditor.title': '카테고리 편집기',
	'categoriesEditor.subtitle': '카테고리 가중치 조정 및 벤치마크 관리',
	'categoriesEditor.addCategory': '+ 새 카테고리 추가',
	'categoriesEditor.editCategory': '카테고리 편집',
	'categoriesEditor.addNewCategory': '새 카테고리 추가',
	'categoriesEditor.updateCategory': '카테고리 업데이트',
	'categoriesEditor.createCategory': '카테고리 생성',

	// Category form fields
	'categoriesEditor.form.name': '이름',
	'categoriesEditor.form.id': 'ID',
	'categoriesEditor.form.emoji': '이모지',
	'categoriesEditor.form.weight': '가중치 (%)',
	'categoriesEditor.form.description': '설명',
	'categoriesEditor.form.benchmarks': '벤치마크',
	'categoriesEditor.form.addBenchmark': '+ 벤치마크 추가',
	'categoriesEditor.form.placeholder.name': '예: 코딩',
	'categoriesEditor.form.placeholder.id': '이름에서 자동 생성',
	'categoriesEditor.form.placeholder.emoji': '예: 💻',
	'categoriesEditor.form.placeholder.weight': '예: 25',
	'categoriesEditor.form.placeholder.description': '이 카테고리에 대한 간단한 설명...',
	'categoriesEditor.form.benchmark.name': '이름',
	'categoriesEditor.form.benchmark.type': '유형',
	'categoriesEditor.form.benchmark.url': 'URL',
	'categoriesEditor.form.benchmark.placeholder.name': '예: SWE-Bench',
	'categoriesEditor.form.benchmark.placeholder.url': 'https://example.com/benchmark',

	// Benchmark types
	'benchmark.type.elo': 'ELO (800-1400)',
	'benchmark.type.score': '점수 (0-100)',

	// Git Integration
	'git.title': '🔄 Git 통합',
	'git.currentStatus': '현재 상태',
	'git.commitChanges': '변경사항 커밋',
	'git.commitMessage': '커밋 메시지',
	'git.commitMessage.placeholder': '변경사항을 설명하세요...',
	'git.quickActions': '빠른 작업',
	'git.refreshStatus': '상태 새로고침',
	'git.pull': '⬇️ 풀',
	'git.stageAll': '➕ 모두 스테이징',
	'git.commitPush': '💾 커밋 및 푸시',
	'git.pushToRemote': '⬆️ 원격으로 푸시',
	'git.stageChanges': '📦 변경사항 스테이징',
	'git.output': '출력',
	'git.noOutput': '아직 출력 없습니다. 결과를 보려면 작업을 수행하세요.',
	'git.viewOnGitHub': 'GitHub에서 보기',

	// Common
	'common.loading': '로딩 중...',
	'common.error': '오류',
	'common.success': '성공',
	'common.confirm': '확인',
	'common.yes': '예',
	'common.no': '아니오',
	'common.benchmark': '벤치마크',
	'common.benchmarks': '벤치마크',
	'common.selectProvider': '제공자 선택',
	'common.selectType': '유형 선택',

	// Footer
	'footer.dataUpdated': '데이터 업데이트: {{date}}',
	'footer.showingModels': '{{total}}개 모델 중 {{count}}개 표시',

	// Tooltips
	'tooltip.addToFavorites': '즐겨찾기에 추가',
	'tooltip.removeFromFavorites': '즐겨찾기에서 제거',
	'tooltip.availableBenchmarks': '{{count}}/{{total}} 벤치마크 사용 가능',

	// Sorting
	'sort.ascending': '↑',
	'sort.descending': '↓',
	'sort.neutral': '↕️',

	// Misc
	'misc.free': '무료',
	'misc.na': '—',
};
