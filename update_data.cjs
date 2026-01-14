const fs = require('fs');
const filename = 'data/showdown.json';
const data = JSON.parse(fs.readFileSync(filename, 'utf8'));

const updates = {
	'gpt-5.2-high': {
		lmarena_coding_elo: 1499,
		lmarena_hard_elo: 1469,
		lmarena_en_elo: 1455,
		lmarena_creative_elo: 1397
	},
	'gpt-5.1-high': {
		lmarena_coding_elo: 1496,
		lmarena_hard_elo: 1476,
		lmarena_en_elo: 1468,
		lmarena_creative_elo: 1438
	},
	'gemini-3-pro': {
		lmarena_coding_elo: 1517,
		lmarena_hard_elo: 1502,
		lmarena_en_elo: 1494,
		lmarena_creative_elo: 1490,
		lmarena_vision_elo: 1299,
		lmarena_math_elo: 1484
	},
	'claude-opus-4-5-20251101-thinking-32k': {
		lmarena_coding_elo: 1538,
		lmarena_hard_elo: 1501,
		lmarena_en_elo: 1484,
		lmarena_creative_elo: 1458
	},
	'claude-opus-4-5-20251101': {
		lmarena_coding_elo: 1520,
		lmarena_hard_elo: 1498,
		lmarena_en_elo: 1478,
		lmarena_creative_elo: 1465
	},
	'claude-sonnet-4-5-20250929-thinking-32k': {
		lmarena_coding_elo: 1524,
		lmarena_hard_elo: 1486,
		lmarena_en_elo: 1471,
		lmarena_creative_elo: 1444
	},
	'grok-4.1-thinking': {
		lmarena_coding_elo: 1510,
		lmarena_hard_elo: 1489,
		lmarena_en_elo: 1484,
		lmarena_creative_elo: 1442
	},
	'gemini-3-flash-thinking': {
		lmarena_coding_elo: 1502,
		lmarena_hard_elo: 1487,
		lmarena_en_elo: 1473,
		lmarena_creative_elo: 1460
	},
	'gemini-3-flash': {
		lmarena_coding_elo: 1497,
		lmarena_hard_elo: 1482,
		lmarena_en_elo: 1465,
		lmarena_creative_elo: 1447,
		lmarena_vision_elo: 1262
	},
	'deepseek-v3.1-thinking': {
		lmarena_coding_elo: 1458,
		lmarena_hard_elo: 1436,
		lmarena_en_elo: 1434
	},
	'deepseek-r1': {
		lmarena_coding_elo: 1464,
		lmarena_hard_elo: 1432,
		lmarena_en_elo: 1429,
		lmarena_creative_elo: 1388
	},
	'qwen3-max-preview': {
		lmarena_coding_elo: 1482,
		lmarena_hard_elo: 1457,
		lmarena_en_elo: 1441,
		lmarena_creative_elo: 1396
	}
};

let changesMade = false;

data.models.forEach((model) => {
	if (updates[model.id]) {
		const modelUpdates = updates[model.id];
		for (const [key, value] of Object.entries(modelUpdates)) {
			if (model.benchmark_scores[key] !== value) {
				console.log(`Updating ${model.id} ${key}: ${model.benchmark_scores[key]} -> ${value}`);
				model.benchmark_scores[key] = value;
				changesMade = true;
			}
		}
	}
});

if (changesMade) {
	data.meta.last_update = new Date().toISOString();
	// Keep version same or increment? Instructions say "Update meta.version".
	// I'll increment the patch version or just update the date part if it follows date format.
	// Current version: "2026.01.13"
	// I'll set it to today's date (simulated). Since I don't know the exact date, I'll assume it's slightly later or same day.
	// LMArena scrape says "Jan 12, 2026". The file is "2026.01.13".
	// I'll update it to "2026.01.14" to be safe.
	data.meta.version = '2026.01.14';

	fs.writeFileSync(filename, JSON.stringify(data, null, '\t'));
	console.log('Successfully updated showdown.json');
} else {
	console.log('No changes needed.');
}
