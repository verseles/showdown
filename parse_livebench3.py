import re

def process_livebench(file_path):
    with open(file_path, "r") as f:
        lines = f.readlines()
        for line in lines:
            if "Qwen 3 235B A22B Instruct 2507" in line:
                cols = [c.strip() for c in line.split("|")]
                print("Model:", cols[1])
                print("Global Average:", cols[3])
                print("Reasoning Average:", cols[4])
                print("Coding Average:", cols[5])
                print("Agentic Coding Average:", cols[6])
                print("Mathematics Average:", cols[7])
                print("Data Analysis Average:", cols[8])
                print("Language Average:", cols[9])
                print("IF Average:", cols[10])

process_livebench("livebench_data.txt")
