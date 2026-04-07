import re

def process_livebench(file_path):
    with open(file_path, "r") as f:
        lines = f.readlines()
        for line in lines:
            if "Qwen" in line:
                cols = [c.strip() for c in line.split("|")]
                print("Model:", cols[1])
                print("Global Average:", cols[3])

process_livebench("livebench_data.txt")
