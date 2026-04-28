import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "schedule_formatted-3.csv")
VECTORSTORE_PATH = os.path.join(BASE_DIR, "vectorstore")

# ChromaDB
COLLECTION_NAME = "schedule"

# Embedding model (runs fully offline, downloads once ~80MB)
EMBEDDING_MODEL = "all-MiniLM-L6-v2"# "nomic-embed-text" "all-MiniLM-L6-v2"

# Ollama
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3" #"llama3:8b" "llama2:latest" # change to "mistral" if you prefer

# How many similar rows to retrieve
TOP_K = 10
