import json

# Path to the data.json file
DATA_PATH = "data/data.json"

def clear_json_file(path):
    with open(path, "w") as f:
        json.dump({}, f, indent=2)

if __name__ == "__main__":
    clear_json_file(DATA_PATH)
    print(f"Cleared contents of {DATA_PATH}")
