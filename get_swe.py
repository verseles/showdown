import json

with open("data/showdown.json") as f:
    data = json.load(f)
    for model in data["models"]:
        if "qwen" in model["id"]:
            print(f"{model['id']} SWE-Bench: {model['benchmark_scores'].get('swe_bench')}")
