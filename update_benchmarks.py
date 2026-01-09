import json
from datetime import datetime

filepath = 'data/showdown.json'

with open(filepath, 'r') as f:
    data = json.load(f)

# Updates map
updates = {
    'gemini-3-pro': {
        'lmarena_en_elo': 1492,
        'lmarena_coding_elo': 1501,
        'lmarena_vision_elo': 1338
    },
    'gemini-3-flash': {
        'lmarena_en_elo': 1470,
        'lmarena_coding_elo': 1469,
        'lmarena_vision_elo': 1292
    },
    'grok-4.1-thinking': {
        'lmarena_en_elo': 1482,
        'lmarena_coding_elo': 1483
    },
    'claude-opus-4-5-20251101-thinking-32k': {
        'livebench': 75.61,
        'livebench_reasoning': 80.09,
        'livebench_coding': 79.65,
        'livebench_agentic_coding': 63.33,
        'livebench_math': 90.39,
        'livebench_data_analysis': 71.98,
        'livebench_language': 81.26,
        'livebench_if': 62.55,
        'lmarena_en_elo': 1466,
        'lmarena_coding_elo': 1510
    },
    'gpt-5.1-high': {
        'livebench': 72.39,
        'livebench_reasoning': 78.79,
        'livebench_coding': 72.49,
        'livebench_agentic_coding': 53.33,
        'livebench_math': 86.90,
        'livebench_data_analysis': 72.07,
        'livebench_language': 79.26,
        'livebench_if': 63.90,
        'lmarena_en_elo': 1464,
        'lmarena_coding_elo': 1466,
        'lmarena_vision_elo': 1250
    },
    'gpt-5.2-high': {
        'livebench': 74.07,
        'livebench_reasoning': 83.21,
        'livebench_coding': 76.07,
        'livebench_agentic_coding': 51.67,
        'livebench_math': 93.17,
        'livebench_data_analysis': 72.79,
        'livebench_language': 79.81,
        'livebench_if': 61.77,
        'lmarena_en_elo': 1465,
        'lmarena_coding_elo': 1470,
        'lmarena_vision_elo': 1280
    },
    'claude-sonnet-4-5-20250929-thinking-32k': {
        'livebench': 70.31,
        'livebench_reasoning': 77.59,
        'livebench_coding': 80.36,
        'livebench_agentic_coding': 53.33,
        'livebench_math': 79.31,
        'livebench_data_analysis': 71.76,
        'livebench_language': 76.45,
        'livebench_if': 53.35
    },
    'claude-opus-4-5-20251101': {
        'lmarena_en_elo': 1462,
        'lmarena_coding_elo': 1481
    },
    'gemini-2.5-pro': {
        'lmarena_en_elo': 1460,
        'lmarena_coding_elo': 1465
    },
    'grok-4.1': {
        'lmarena_en_elo': 1463,
        'lmarena_coding_elo': 1463
    },
    'gpt-5-high': {
        'lmarena_en_elo': 1444,
        'lmarena_coding_elo': 1460
    },
    'qwen3-max-preview': {
        'lmarena_en_elo': 1443,
        'lmarena_coding_elo': 1468
    },
    'mistral-large-3': {
        'lmarena_en_elo': 1428,
        'lmarena_coding_elo': 1450
    },
    'deepseek-v3.1-thinking': {
        'lmarena_en_elo': 1418,
        'lmarena_coding_elo': 1437
    }
}

for model in data['models']:
    if model['id'] in updates:
        print(f"Updating {model['id']}...")
        for key, value in updates[model['id']].items():
            old_value = model['benchmark_scores'].get(key)
            model['benchmark_scores'][key] = value
            print(f"  {key}: {old_value} -> {value}")

# Update meta
data['meta']['last_update'] = datetime.utcnow().isoformat() + "Z"
data['meta']['version'] = datetime.utcnow().strftime("%Y.%m.%d")
print(f"Updated meta: {data['meta']}")

with open(filepath, 'w') as f:
    json.dump(data, f, indent='\t')
