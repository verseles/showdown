import json
import datetime

def update_json():
    with open('data/showdown.json', 'r') as f:
        data = json.load(f)

    # Add DeepSeek V3.2
    v3_2 = {
        "id": "deepseek-v3.2",
        "name": "DeepSeek V3.2",
        "provider": "DeepSeek",
        "type": "open-source",
        "release_date": "2025-12-01",
        "pricing": {
            "input_per_1m": 0.27,
            "output_per_1m": 1.1,
            "average_per_1m": 0.69
        },
        "performance": {
            "output_speed_tps": 120,
            "latency_ttft_ms": 450,
            "source": "https://artificialanalysis.ai"
        },
        "editor_notes": "Efficient reasoning and agentic model. Strong performance on SWE-bench (73.1%) and AIME (93.1%).",
        "benchmark_scores": {
            "aime": 93.1,
            "arc_agi_2": None,
            "bfcl": None,
            "frontiermath": None,
            "gpqa_diamond": None,
            "humanity_last_exam": 25.1,
            "live_code_bench": None,
            "livebench": None,
            "lmarena_coding_elo": None,
            "lmarena_creative_elo": None,
            "lmarena_en_elo": None,
            "lmarena_hard_elo": None,
            "lmarena_if_elo": None,
            "lmarena_math_elo": None,
            "lmarena_vision_elo": None,
            "lmarena_zh_elo": None,
            "math_500": None,
            "mathvista": None,
            "mmlu_pro": None,
            "mmmlu": None,
            "simpleqa": None,
            "mmmu": None,
            "mmmu_pro": None,
            "osworld": None,
            "swe_bench": 73.1,
            "tau_bench": 80.3,
            "terminal_bench": 46.4,
            "webdev_arena_elo": None,
            "livebench_reasoning": None,
            "livebench_coding": None,
            "livebench_agentic_coding": None,
            "livebench_math": None,
            "livebench_data_analysis": None,
            "livebench_language": None,
            "livebench_if": None
        }
    }

    # Add DeepSeek V3.2 Speciale
    v3_2_speciale = {
        "id": "deepseek-v3.2-speciale",
        "name": "DeepSeek V3.2 Speciale",
        "superior_of": "deepseek-v3.2",
        "provider": "DeepSeek",
        "type": "open-source",
        "release_date": "2025-12-01",
        "pricing": {
            "input_per_1m": 0.27,
            "output_per_1m": 1.1,
            "average_per_1m": 0.69
        },
        "performance": {
            "output_speed_tps": 120,
            "latency_ttft_ms": 450,
            "source": "https://artificialanalysis.ai"
        },
        "editor_notes": "Specialized reasoning variant. Outperforms base V3.2 on math tasks (AIME 96.0%).",
        "benchmark_scores": {
            "aime": 96.0,
            "arc_agi_2": None,
            "bfcl": None,
            "frontiermath": None,
            "gpqa_diamond": None,
            "humanity_last_exam": 30.6,
            "live_code_bench": None,
            "livebench": None,
            "lmarena_coding_elo": None,
            "lmarena_creative_elo": None,
            "lmarena_en_elo": None,
            "lmarena_hard_elo": None,
            "lmarena_if_elo": None,
            "lmarena_math_elo": None,
            "lmarena_vision_elo": None,
            "lmarena_zh_elo": None,
            "math_500": None,
            "mathvista": None,
            "mmlu_pro": None,
            "mmmlu": None,
            "simpleqa": None,
            "mmmu": None,
            "mmmu_pro": None,
            "osworld": None,
            "swe_bench": None,
            "tau_bench": None,
            "terminal_bench": None,
            "webdev_arena_elo": None,
            "livebench_reasoning": None,
            "livebench_coding": None,
            "livebench_agentic_coding": None,
            "livebench_math": None,
            "livebench_data_analysis": None,
            "livebench_language": None,
            "livebench_if": None
        }
    }

    # Insert after deepseek-v3.1
    insert_idx = -1
    for i, model in enumerate(data['models']):
        if model['id'] == 'deepseek-v3.1':
            insert_idx = i
            break

    if insert_idx != -1:
        data['models'].insert(insert_idx + 1, v3_2)
        data['models'].insert(insert_idx + 2, v3_2_speciale)

    # Update Gemini 3 Flash Thinking and GPT-5 High
    for model in data['models']:
        if model['id'] == 'gemini-3-flash-thinking':
            model['benchmark_scores']['humanity_last_exam'] = 43.5
        if model['id'] == 'gpt-5-high':
            model['benchmark_scores']['humanity_last_exam'] = 26.3

    # Update Meta
    data['meta']['version'] = '2026.01.10'
    data['meta']['last_update'] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    with open('data/showdown.json', 'w') as f:
        json.dump(data, f, indent='\t')

update_json()
