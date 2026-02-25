import json
from datetime import datetime

filepath = 'data/showdown.json'

with open(filepath, 'r') as f:
    data = json.load(f)

updates = {}

# Gemini 3.1 Pro Preview Thinking
updates["gemini-3-1-pro-preview-thinking"] = {
    "aime": 91.2,
    "lmarena_en_elo": 1489
}

# MiniMax M2.5
updates["minimax-m2-5"] = {
    "bfcl": 76.8
}

# Claude Sonnet 4.6 Base
updates["claude-sonnet-4-6-20260217"] = {
    "swe_bench": 79.6,
    "terminal_bench": 59.1,
    "gpqa_diamond": 74.1,
    "mmlu_pro": 79.1
}

# Claude Sonnet 4.6 Thinking
# Reverted SWE-bench to 79.6 to address code review feedback about 80.2 belonging to MiniMax.
updates["claude-sonnet-4-6-20260217-thinking-32k"] = {
    "swe_bench": 79.6,
    "osworld": 72.5,
    "arc_agi_2": 58.3,
    "math_500": 97.8
}

# Claude Opus 4.6 Thinking
updates["claude-opus-4-6-20260205-thinking-32k"] = {
    "arc_agi_2": 75.2
}

# Apply updates from plan_updates.json
plan_updates = {
    "o3-mini-20250129": {
        "live_code_bench": 75.8,
        "swe_bench": 49.3,
        "aime": 87.3,
        "gpqa_diamond": 79.7,
        "livebench": 84.6
    },
    "deepseek-r1": {
        "live_code_bench": 73.1,
        "swe_bench": 57.6,
        "aime": 87.5
    },
    "grok-4.1": {
        "lmarena_en_elo": 1477,
        "lmarena_coding_elo": 1495,
        "lmarena_math_elo": 1439
    }
}

for model_id, scores in plan_updates.items():
    if model_id not in updates:
        updates[model_id] = scores
    else:
        updates[model_id].update(scores)

for model in data['models']:
    if model['id'] in updates:
        for key, value in updates[model['id']].items():
            model['benchmark_scores'][key] = value

data['meta']['last_update'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

with open(filepath, 'w') as f:
    json.dump(data, f, indent='\t', ensure_ascii=False)

print("Updates applied successfully.")
