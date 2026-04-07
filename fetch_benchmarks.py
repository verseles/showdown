import urllib.request
import json

urls = {
    "livebench": "https://r.jina.ai/https://livebench.ai/",
    "swebench": "https://r.jina.ai/https://www.swebench.com/",
    "arc": "https://r.jina.ai/https://arcprize.org/leaderboard",
    "hle": "https://r.jina.ai/https://scale.com/leaderboard/humanitys_last_exam",
    "frontiermath": "https://r.jina.ai/https://epoch.ai/frontiermath"
}

for name, url in urls.items():
    print(f"Fetching {name}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            with open(f"{name}_data.txt", "w") as f:
                f.write(content)
        print(f"Saved {name}")
    except Exception as e:
        print(f"Failed to fetch {name}: {e}")
