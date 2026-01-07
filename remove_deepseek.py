import json
import datetime

def update_json():
    with open('data/showdown.json', 'r') as f:
        data = json.load(f)

    # Remove DeepSeek V3.2 models
    data['models'] = [m for m in data['models'] if m['id'] not in ['deepseek-v3.2', 'deepseek-v3.2-speciale']]

    # Update Meta
    data['meta']['version'] = '2026.01.11'
    data['meta']['last_update'] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    with open('data/showdown.json', 'w') as f:
        json.dump(data, f, indent='\t')

update_json()
