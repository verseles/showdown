
import json
import datetime

filepath = 'data/showdown.json'

with open(filepath, 'r') as f:
    data = json.load(f)

# Update meta
# Use datetime.datetime.now(datetime.UTC) if available, else fallback
try:
    now = datetime.datetime.now(datetime.timezone.utc)
except AttributeError:
    now = datetime.datetime.utcnow()

data['meta']['last_update'] = now.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
data['meta']['version'] = now.strftime('%Y.%m.%d')

def update_score(model_id, benchmark_id, score):
    for model in data['models']:
        if model['id'] == model_id:
            if 'benchmark_scores' not in model:
                model['benchmark_scores'] = {}
            current_score = model['benchmark_scores'].get(benchmark_id)
            if current_score != score:
                print(f"Updating {model_id} {benchmark_id}: {current_score} -> {score}")
                model['benchmark_scores'][benchmark_id] = score
            return
    print(f"Model {model_id} not found")

# LMArena English (en)
update_score('gemini-3-pro', 'lmarena_en_elo', 1494)
update_score('grok-4.1-thinking', 'lmarena_en_elo', 1484)
update_score('claude-opus-4-5-20251101-thinking-32k', 'lmarena_en_elo', 1484)
update_score('claude-opus-4-5-20251101', 'lmarena_en_elo', 1478)
update_score('grok-4.1', 'lmarena_en_elo', 1477)
update_score('gemini-3-flash', 'lmarena_en_elo', 1473)
update_score('claude-sonnet-4-5-20250929-thinking-32k', 'lmarena_en_elo', 1471)
update_score('gpt-5.1-high', 'lmarena_en_elo', 1468)
update_score('claude-sonnet-4-5-20250929', 'lmarena_en_elo', 1467)
update_score('claude-opus-4-1-20250805', 'lmarena_en_elo', 1458)
update_score('gpt-5.2-high', 'lmarena_en_elo', 1455)
update_score('gemini-2.5-pro', 'lmarena_en_elo', 1454)
update_score('gpt-5.1', 'lmarena_en_elo', 1441)
update_score('gpt-5.2', 'lmarena_en_elo', 1441)
update_score('gpt-4.5-preview-2025-02-27', 'lmarena_en_elo', 1448)
update_score('qwen3-max-preview', 'lmarena_en_elo', 1441)
update_score('deepseek-v3.2-thinking', 'lmarena_en_elo', 1442)
update_score('deepseek-v3.2', 'lmarena_en_elo', 1440)
update_score('kimi-k2-thinking-turbo', 'lmarena_en_elo', 1447)
update_score('o3-2025-04-16', 'lmarena_en_elo', 1441)

# LMArena Coding
update_score('claude-opus-4-5-20251101-thinking-32k', 'lmarena_coding_elo', 1538)
update_score('claude-opus-4-5-20251101', 'lmarena_coding_elo', 1520)
update_score('gemini-3-pro', 'lmarena_coding_elo', 1517)
update_score('grok-4.1-thinking', 'lmarena_coding_elo', 1510)
update_score('claude-sonnet-4-5-20250929', 'lmarena_coding_elo', 1508)
update_score('claude-opus-4-1-20250805', 'lmarena_coding_elo', 1504)
update_score('gemini-3-flash', 'lmarena_coding_elo', 1502)
update_score('gpt-5.2-high', 'lmarena_coding_elo', 1499)
update_score('gpt-5.1-high', 'lmarena_coding_elo', 1496)
update_score('grok-4.1', 'lmarena_coding_elo', 1495)
update_score('gpt-5.2', 'lmarena_coding_elo', 1493)
update_score('qwen3-max-preview', 'lmarena_coding_elo', 1481)
update_score('gpt-5.1', 'lmarena_coding_elo', 1480)
update_score('longcat-flash-chat', 'lmarena_coding_elo', 1474)
update_score('mistral-large-3', 'lmarena_coding_elo', 1471)
update_score('deepseek-v3.2', 'lmarena_coding_elo', 1469)
update_score('gemini-2.5-pro', 'lmarena_coding_elo', 1468)
update_score('deepseek-v3.2-thinking', 'lmarena_coding_elo', 1466)
update_score('kimi-k2-0905-preview', 'lmarena_coding_elo', 1465)
update_score('deepseek-r1', 'lmarena_coding_elo', 1464)
update_score('gpt-4.5-preview-2025-02-27', 'lmarena_coding_elo', 1459)
update_score('o3-2025-04-16', 'lmarena_coding_elo', 1458)

# ARC-AGI-2
update_score('gpt-5.2-high', 'arc_agi_2', 43.3)
update_score('gpt-5.2-pro', 'arc_agi_2', 54.2)
update_score('gemini-3-pro', 'arc_agi_2', 54.0)
update_score('gemini-3-flash', 'arc_agi_2', 33.6)
update_score('gemini-3-flash-thinking', 'arc_agi_2', 33.6)

with open(filepath, 'w') as f:
    json.dump(data, f, indent='\t')
