import os
import json
import time
import random
from dotenv import load_dotenv
from upstash_vector import Index

# Load environment variables from .env.local
load_dotenv('../.env.local')

UPSTASH_URL = os.environ.get("UPSTASH_VECTOR_REST_URL")
UPSTASH_TOKEN = os.environ.get("UPSTASH_VECTOR_REST_TOKEN")

if not UPSTASH_URL or not UPSTASH_TOKEN:
    raise RuntimeError("Set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN in your .env.local file.")

DATA_PATH = os.path.join(os.path.dirname(__file__), "data.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

def flatten_json(value, base_path=""):
    if value is None:
        return []
    if isinstance(value, (str, int, float, bool)):
        path = base_path or "root"
        return [{
            "path": path,
            "text": str(value),
            "id": f"{path}-{int(time.time())}-{random.randint(0, 999999)}"
        }]
    if isinstance(value, list):
        combined = []
        for idx, item in enumerate(value):
            combined.extend(flatten_json(item, f"{base_path}[{idx}]"))
        return combined
    if isinstance(value, dict):
        combined = []
        for k, v in value.items():
            next_path = f"{base_path}.{k}" if base_path else k
            combined.extend(flatten_json(v, next_path))
        return combined
    return []

chunks = flatten_json(data)

print(f"Flattened to {len(chunks)} chunks. Uploading to Upstash...")

try:
    # Initialize Upstash Vector client
    index = Index(url=UPSTASH_URL, token=UPSTASH_TOKEN)
    print("✅ Connected to Upstash Vector successfully!")
    
    # Prepare vectors for upsert
    vectors = []
    for chunk in chunks:
        vector_data = {
            "id": chunk["id"],
            "data": f"{chunk['path']}: {chunk['text']}",  # Raw text for auto-embedding
            "metadata": {
                "path": chunk["path"],
                "text": chunk["text"]
            }
        }
        vectors.append(vector_data)
    
    # Upsert all vectors at once
    result = index.upsert(vectors=vectors)
    print(f"✅ Successfully uploaded {len(vectors)} chunks to Upstash Vector DB!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Troubleshooting:")
    print("1. Check your .env.local file has correct UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN")
    print("2. Ensure your Upstash Vector database is active and configured for automatic embeddings")
    print("3. Verify the database dimension is set to 1024 with mixbread-large embedding model")
