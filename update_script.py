import json
from datetime import datetime

# Load existing data
with open('data/showdown.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Data updates
updates = {
    "o3-mini-20250129": {
        "benchmark_scores": {
            "livebench": 84.6,
            "swe_bench": 49.3,
            "aime": 87.3,
            "gpqa_diamond": 79.7,
            "lmarena_coding_elo": 1434,
            "lmarena_en_elo": 1381,
            "lmarena_hard_elo": 1400,
            "lmarena_math_elo": 1410
        }
    },
    "deepseek-r1": {
        "benchmark_scores": {
            "swe_bench": 49.2,
            "aime": 79.8,
            "gpqa_diamond": 71.5,
            "livebench": 71.38,
            "simpleqa": 30.1
        }
    }
}

updated_models = 0
for model in data["models"]:
    if model["id"] in updates:
        updated_models += 1
        for k, v in updates[model["id"]]["benchmark_scores"].items():
            model["benchmark_scores"][k] = v

print(f"Updated {updated_models} models.")

data["meta"]["last_update"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")

with open('data/showdown.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent='\t', ensure_ascii=False)
