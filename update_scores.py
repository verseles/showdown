
import json
import datetime

filepath = 'data/showdown.json'

with open(filepath, 'r') as f:
    data = json.load(f)

# Update meta
data['meta']['last_update'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')
# update version if needed, keeping simple increment or date
data['meta']['version'] = datetime.datetime.utcnow().strftime('%Y.%m.%d')

def update_score(model_id, benchmark_id, score):
    for model in data['models']:
        if model['id'] == model_id:
            if 'benchmark_scores' not in model:
                model['benchmark_scores'] = {}
            # Only update if the score is different
            current_score = model['benchmark_scores'].get(benchmark_id)
            if current_score != score:
                print(f"Updating {model_id} {benchmark_id}: {current_score} -> {score}")
                model['benchmark_scores'][benchmark_id] = score
            return
    print(f"Model {model_id} not found")

# LMArena Vision
update_score('gemini-3-pro', 'lmarena_vision_elo', 1299)
update_score('gemini-3-flash', 'lmarena_vision_elo', 1279)
update_score('gemini-2.5-pro', 'lmarena_vision_elo', 1249)
update_score('gpt-5.1-high', 'lmarena_vision_elo', 1249)
update_score('gpt-5.1', 'lmarena_vision_elo', 1241)
update_score('chatgpt-4o-latest-20250326', 'lmarena_vision_elo', 1235) # Need to check if this model exists
update_score('gemini-2.5-flash-preview-09-2025', 'lmarena_vision_elo', 1226)
update_score('gpt-4.5-preview-2025-02-27', 'lmarena_vision_elo', 1226)
update_score('o3-2025-04-16', 'lmarena_vision_elo', 1217)
update_score('gpt-4.1-2025-04-14', 'lmarena_vision_elo', 1214)
update_score('gemini-2.5-flash', 'lmarena_vision_elo', 1213)
update_score('qwen3-vl-235b-a22b-instruct', 'lmarena_vision_elo', 1209) # Check ID
update_score('claude-sonnet-4-20250514-thinking-32k', 'lmarena_vision_elo', 1207) # Check ID
update_score('claude-opus-4-20250514-thinking-16k', 'lmarena_vision_elo', 1206) # Check ID
update_score('o4-mini-2025-04-16', 'lmarena_vision_elo', 1200)

# LMArena Creative Writing
update_score('gemini-3-pro', 'lmarena_creative_elo', 1490)
update_score('claude-opus-4-5-20251101', 'lmarena_creative_elo', 1465)
update_score('gemini-3-flash', 'lmarena_creative_elo', 1460)
update_score('claude-opus-4-5-20251101-thinking-32k', 'lmarena_creative_elo', 1458)
update_score('gemini-2.5-pro', 'lmarena_creative_elo', 1451)
update_score('claude-sonnet-4-5-20250929', 'lmarena_creative_elo', 1445)
update_score('claude-opus-4-1-20250805-thinking-16k', 'lmarena_creative_elo', 1445) # Check ID: claude-opus-4-1-20250805-thinking-16k? showdown has 'claude-opus-4-1-20250805' (no thinking). Wait.
# showdown.json has 'claude-opus-4-1-20250805'. It does NOT have a thinking variant for 4.1.
# Actually, let me check the file content again.
# "claude-opus-4-1-20250805" exists.
# The leaderboard has "claude-opus-4-1-20250805-thinking-16k" AND "claude-opus-4-1-20250805".
# Since showdown doesn't have the thinking variant for 4.1, I will update the base model if it matches the base model name.
update_score('claude-opus-4-1-20250805', 'lmarena_creative_elo', 1441)

update_score('claude-sonnet-4-5-20250929-thinking-32k', 'lmarena_creative_elo', 1444)
update_score('grok-4.1-thinking', 'lmarena_creative_elo', 1442)
update_score('gpt-5.1-high', 'lmarena_creative_elo', 1438)
update_score('gpt-4.5-preview-2025-02-27', 'lmarena_creative_elo', 1437) # Add missing score
update_score('grok-4.1', 'lmarena_creative_elo', 1428)

# LMArena Instruction Following
update_score('claude-opus-4-5-20251101', 'lmarena_if_elo', 1486)
update_score('claude-opus-4-5-20251101-thinking-32k', 'lmarena_if_elo', 1479)
update_score('gemini-3-pro', 'lmarena_if_elo', 1475)
update_score('claude-sonnet-4-5-20250929-thinking-32k', 'lmarena_if_elo', 1463)
# claude-opus-4-1-20250805-thinking-16k: 1458. Showdown has no thinking variant.
update_score('claude-sonnet-4-5-20250929', 'lmarena_if_elo', 1454)
update_score('claude-opus-4-1-20250805', 'lmarena_if_elo', 1452)
update_score('gpt-5.1-high', 'lmarena_if_elo', 1450)
update_score('gemini-3-flash', 'lmarena_if_elo', 1448)
update_score('gemini-2.5-pro', 'lmarena_if_elo', 1444)
update_score('gpt-5.2-high', 'lmarena_if_elo', 1437)
update_score('grok-4.1-thinking', 'lmarena_if_elo', 1436)
update_score('gpt-4.5-preview-2025-02-27', 'lmarena_if_elo', 1435) # Add missing score
update_score('grok-4.1', 'lmarena_if_elo', 1434)

# LMArena Math
update_score('gpt-5.2-high', 'lmarena_math_elo', 1492)
update_score('gemini-3-pro', 'lmarena_math_elo', 1484)
update_score('claude-opus-4-5-20251101-thinking-32k', 'lmarena_math_elo', 1476)
update_score('gpt-5.1-high', 'lmarena_math_elo', 1473)
update_score('claude-opus-4-5-20251101', 'lmarena_math_elo', 1467)
update_score('claude-sonnet-4-5-20250929-thinking-32k', 'lmarena_math_elo', 1461)
update_score('grok-4.1-thinking', 'lmarena_math_elo', 1456)
update_score('o3-2025-04-16', 'lmarena_math_elo', 1454)

# LMArena Hard Prompts
update_score('gemini-3-pro', 'lmarena_hard_elo', 1502)
update_score('claude-opus-4-5-20251101-thinking-32k', 'lmarena_hard_elo', 1501)
update_score('claude-opus-4-5-20251101', 'lmarena_hard_elo', 1498)
update_score('grok-4.1-thinking', 'lmarena_hard_elo', 1489)
update_score('gemini-3-flash', 'lmarena_hard_elo', 1487)
update_score('claude-sonnet-4-5-20250929-thinking-32k', 'lmarena_hard_elo', 1486)
update_score('gpt-5.1-high', 'lmarena_hard_elo', 1476)
update_score('gpt-5.2-high', 'lmarena_hard_elo', 1469)
update_score('gpt-5.2', 'lmarena_hard_elo', 1466)

# LMArena Chinese (zh)
update_score('gemini-3-pro', 'lmarena_zh_elo', 1523)
update_score('gemini-3-flash', 'lmarena_zh_elo', 1517)
update_score('grok-4.1', 'lmarena_zh_elo', 1508)
update_score('grok-4.1-thinking', 'lmarena_zh_elo', 1498)
update_score('gpt-5.1-high', 'lmarena_zh_elo', 1496)
update_score('gemini-2.5-pro', 'lmarena_zh_elo', 1495)
update_score('qwen3-max-preview', 'lmarena_zh_elo', 1490)
update_score('claude-opus-4-5-20251101', 'lmarena_zh_elo', 1486)
update_score('claude-opus-4-5-20251101-thinking-32k', 'lmarena_zh_elo', 1481)
update_score('gpt-5.2-high', 'lmarena_zh_elo', 1475)
update_score('claude-sonnet-4-5-20250929', 'lmarena_zh_elo', 1468)

# ARC-AGI-2
# Using values from text dump
update_score('gpt-5.2-high', 'arc_agi_2', 43.3)
update_score('claude-opus-4-5-20251101-thinking-32k', 'arc_agi_2', 37.6)
# gemini-3-flash-thinking (Preview High): 33.6
update_score('gemini-3-flash-thinking', 'arc_agi_2', 33.6) # Updating from 45.1 (which was likely Gemini 3 Deep Think)

with open(filepath, 'w') as f:
    json.dump(data, f, indent='\t')
