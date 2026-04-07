import json

def get_livebench_values(model_name, file_path):
    with open(file_path, "r") as f:
        lines = f.readlines()
        for line in lines:
            if model_name in line:
                cols = [c.strip() for c in line.split("|")]
                if len(cols) >= 11:
                    return {
                        "livebench": float(cols[3]),
                        "livebench_reasoning": float(cols[4]),
                        "livebench_coding": float(cols[5]),
                        "livebench_agentic_coding": float(cols[6]) if cols[6] != "-" else None,
                        "livebench_math": float(cols[7]),
                        "livebench_data_analysis": float(cols[8]),
                        "livebench_language": float(cols[9]),
                        "livebench_if": float(cols[10])
                    }
    return None

def update_livebench_thinking():
    with open("data/showdown.json") as f:
        data = json.load(f)

    lb_data = get_livebench_values("Qwen 3 235B A22B Thinking 2507", "livebench_data.txt")
    if lb_data:
        # Note: we don't have this in showdown.json, but maybe we should add it? Or update the existing one?
        pass

    mapping = {
        "claude-opus-4-6-20260205-thinking-32k": "Claude 4.6 Opus Thinking High Effort",
        "claude-sonnet-4-6-20260217-thinking-32k": "Claude 4.6 Sonnet Thinking Medium Effort",
        "gpt-5.4-high": "GPT-5.4 Thinking xHigh Effort",
        "gemini-3-1-pro-preview-thinking": "Gemini 3.1 Pro Preview",  # Not matching
        "mimo-v2-pro": "MiMo V2 Pro",
        "minimax-m2-7": "Minimax M2.7"
    }

    updates = []
    for model in data["models"]:
        if model["id"] in mapping:
            lb_data = get_livebench_values(mapping[model["id"]], "livebench_data.txt")
            if lb_data:
                for key, val in lb_data.items():
                    if val is not None:
                        if model["benchmark_scores"].get(key) != val:
                            print(f"Updating {model['id']} {key}: {model['benchmark_scores'].get(key)} -> {val}")
                            model["benchmark_scores"][key] = val
                            updates.append(model["id"])

    if updates:
        import datetime
        data["meta"]["last_update"] = datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        with open("data/showdown.json", "w", encoding='utf-8') as f:
            json.dump(data, f, indent="\t", ensure_ascii=False)
            f.write("\n")

update_livebench_thinking()
