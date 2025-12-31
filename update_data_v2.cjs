const fs = require('fs');
const data = require('./data/showdown.json');

const updates = {
	'claude-opus-4-5-20251101': {
		lmarena_coding_elo: 1515,
		lmarena_hard_elo: 1493,
		lmarena_creative_elo: 1458,
		lmarena_if_elo: 1477,
		lmarena_math_elo: 1466,
		lmarena_en_elo: 1478,
		lmarena_zh_elo: 1489,
		webdev_arena_elo: 1479,
		swe_bench: 80.9,
		livebench: 76.2,
		livebench_reasoning: 80.09,
		livebench_coding: 79.65,
		livebench_agentic_coding: 63.33,
		livebench_math: 94.52,
		livebench_data_analysis: 71.98,
		livebench_language: 81.26,
		livebench_if: 62.55,
		arc_agi_2: 37.6
	},
	'claude-opus-4-5-20251101-thinking-32k': {
		lmarena_coding_elo: 1540,
		lmarena_hard_elo: 1502,
		lmarena_creative_elo: 1451,
		lmarena_if_elo: 1479,
		lmarena_math_elo: 1466,
		lmarena_en_elo: 1483,
		lmarena_zh_elo: 1486,
		webdev_arena_elo: 1512,
		livebench: 76.2,
		arc_agi_2: 37.6
	},
	'claude-sonnet-4-5-20250929': {
		lmarena_coding_elo: 1506,
		lmarena_hard_elo: 1474,
		lmarena_creative_elo: 1441,
		lmarena_if_elo: 1453,
		lmarena_math_elo: 1429,
		lmarena_en_elo: 1462,
		lmarena_zh_elo: 1467,
		webdev_arena_elo: 1387,
		swe_bench: 77.2
	},
	'claude-sonnet-4-5-20250929-thinking-32k': {
		lmarena_coding_elo: 1525,
		lmarena_hard_elo: 1485,
		lmarena_creative_elo: 1438,
		lmarena_if_elo: 1460,
		lmarena_math_elo: 1464,
		lmarena_en_elo: 1470,
		lmarena_zh_elo: 1456,
		webdev_arena_elo: 1391,
		swe_bench: 77.2
	},
	'gemini-3-pro': {
		lmarena_coding_elo: 1520,
		lmarena_hard_elo: 1505,
		lmarena_creative_elo: 1489,
		lmarena_if_elo: 1474,
		lmarena_math_elo: 1480,
		lmarena_vision_elo: 1309,
		lmarena_en_elo: 1492,
		lmarena_zh_elo: 1521,
		webdev_arena_elo: 1471,
		swe_bench: 76.2,
		arc_agi_2: 31.1,
		livebench: 75.22
	},
	'gemini-3-flash': {
		lmarena_coding_elo: 1505,
		lmarena_hard_elo: 1489,
		lmarena_creative_elo: 1463,
		lmarena_if_elo: 1456,
		lmarena_math_elo: 1480,
		lmarena_vision_elo: 1284,
		lmarena_en_elo: 1476,
		lmarena_zh_elo: 1523,
		webdev_arena_elo: 1454,
		swe_bench: 78,
		arc_agi_2: 33.6,
		livebench: 73.74
	},
	'gemini-3-flash-thinking': {
		lmarena_coding_elo: 1497,
		lmarena_hard_elo: 1481,
		lmarena_creative_elo: 1438,
		lmarena_if_elo: 1443,
		lmarena_math_elo: 1474,
		lmarena_vision_elo: 1268,
		lmarena_en_elo: 1464,
		lmarena_zh_elo: 1506,
		webdev_arena_elo: 1377,
		swe_bench: 78,
		arc_agi_2: 33.6,
		livebench: 73.74
	},
	'gpt-5.2-high': {
		lmarena_coding_elo: 1493,
		lmarena_hard_elo: 1460,
		lmarena_creative_elo: 1387,
		lmarena_if_elo: 1434,
		lmarena_math_elo: 1503,
		lmarena_en_elo: 1453,
		lmarena_zh_elo: 1467,
		webdev_arena_elo: 1480,
		swe_bench: 80.0,
		arc_agi_2: 43.3,
		livebench: 74.12
	},
	'gpt-5.1-high': {
		lmarena_coding_elo: 1488,
		lmarena_hard_elo: 1473,
		lmarena_creative_elo: 1435,
		lmarena_if_elo: 1445,
		lmarena_math_elo: 1474,
		lmarena_vision_elo: 1249,
		lmarena_en_elo: 1465,
		lmarena_zh_elo: 1496,
		swe_bench: 76.3,
		arc_agi_2: 17.6
	},
	'grok-4.1': {
		lmarena_coding_elo: 1492,
		lmarena_hard_elo: 1477,
		lmarena_creative_elo: 1427,
		lmarena_if_elo: 1430,
		lmarena_math_elo: 1430,
		lmarena_en_elo: 1476,
		lmarena_zh_elo: 1514
	},
	'grok-4.1-thinking': {
		lmarena_coding_elo: 1508,
		lmarena_hard_elo: 1490,
		lmarena_creative_elo: 1436,
		lmarena_if_elo: 1440,
		lmarena_math_elo: 1456,
		lmarena_en_elo: 1485,
		lmarena_zh_elo: 1502,
		webdev_arena_elo: 1202
	},
	'deepseek-v3.1': {
		lmarena_coding_elo: 1447,
		lmarena_hard_elo: 1431,
		lmarena_creative_elo: 1393,
		lmarena_if_elo: 1401,
		lmarena_math_elo: 1418,
		lmarena_en_elo: 1430,
		lmarena_zh_elo: 1463
	},
	'deepseek-r1': {
		lmarena_coding_elo: 1443,
		lmarena_hard_elo: 1415,
		lmarena_creative_elo: 1373,
		lmarena_if_elo: 1391,
		lmarena_math_elo: 1413,
		lmarena_en_elo: 1411,
		lmarena_zh_elo: 1419
	},
	'o3-2025-04-16': {
		lmarena_coding_elo: 1456,
		lmarena_hard_elo: 1440,
		lmarena_creative_elo: 1383,
		lmarena_if_elo: 1399,
		lmarena_math_elo: 1455,
		lmarena_vision_elo: 1217,
		lmarena_en_elo: 1442,
		lmarena_zh_elo: 1459,
		swe_bench: 71.7,
		arc_agi_2: 6.5,
		livebench: 79
	},
	'qwen3-max-preview': {
		lmarena_coding_elo: 1481,
		lmarena_hard_elo: 1457,
		lmarena_creative_elo: 1396,
		lmarena_if_elo: 1425,
		lmarena_math_elo: 1442,
		lmarena_en_elo: 1441,
		lmarena_zh_elo: 1489
	}
};

data.models.forEach((model) => {
	if (updates[model.id]) {
		const modelUpdates = updates[model.id];
		Object.keys(modelUpdates).forEach((bench) => {
			model.benchmark_scores[bench] = modelUpdates[bench];
		});
	}
});

data.meta.last_update = '2025-12-30T12:00:00.000Z';
const versionParts = data.meta.version.split('.');
versionParts[2] = String(parseInt(versionParts[2]) + 1);
data.meta.version = versionParts.join('.');

console.log(JSON.stringify(data, null, '\t'));
