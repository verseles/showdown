import json

with open('data/showdown.json', 'r') as f:
    data = json.load(f)

models = data['models']
print(f"Found {len(models)} models.")

for model in models:
    print(f"\nModel: {model['name']} ({model['id']})")
    scores = model.get('benchmark_scores', {})
    missing = []
    for key, value in scores.items():
        if value is None:
            missing.append(key)

    if missing:
        print(f"  Missing: {', '.join(missing)}")
    else:
        print("  No missing scores.")
