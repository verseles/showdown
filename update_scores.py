import json
from datetime import datetime

filepath = 'data/showdown.json'

with open(filepath, 'r') as f:
    data = json.load(f)

updates = {
    "gemini-3-pro": {"lmarena_vision_elo": 1300},
    "gemini-3-flash": {"lmarena_vision_elo": 1280},
    "gemini-3-flash-thinking": {"lmarena_vision_elo": 1280},
    "gemini-2.5-pro": {"lmarena_vision_elo": 1248},
    "deepseek-r1": {"lmarena_vision_elo": 1413},
    "deepseek-v3.2": {"lmarena_vision_elo": 1444},
    "deepseek-v3.2-thinking": {"lmarena_vision_elo": 1440},
    "o3-mini-20250129": {"lmarena_vision_elo": 1381}
}

changed_count = 0

for model in data['models']:
    if model['id'] in updates:
        for key, new_value in updates[model['id']].items():
            old_value = model['benchmark_scores'].get(key)
            if old_value != new_value:
                print(f"Updating {model['id']} {key}: {old_value} -> {new_value}")
                model['benchmark_scores'][key] = new_value
                changed_count += 1

if changed_count > 0:
    data['meta']['last_update'] = "2026-01-20T10:00:00.000000Z"
    data['meta']['version'] = "2026.01.20"

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent='\t', ensure_ascii=False)
    print(f"Successfully updated {changed_count} values.")
else:
    print("No changes needed.")
