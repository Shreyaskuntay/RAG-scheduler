import chromadb
from sentence_transformers import SentenceTransformer
from app.config import VECTORSTORE_PATH, COLLECTION_NAME, EMBEDDING_MODEL, TOP_K

# Load once at module level (avoid reloading on every request)
_model = None
_collection = None


def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


def _get_collection():
    global _collection
    if _collection is None:
        client = chromadb.PersistentClient(path=VECTORSTORE_PATH)
        _collection = client.get_collection(COLLECTION_NAME)
    return _collection


def retrieve(question: str) -> list[str]:
    """Embed the question and return the top-k most relevant class rows."""
    model = _get_model()
    collection = _get_collection()

    query_embedding = model.encode(question).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=TOP_K,
    )

    # results["documents"] is a list of lists
    return results["documents"][0]
if __name__ == "__main__":
    # Quick test
    test_question = "When is the next Data Science class?"
    relevant_rows = retrieve(test_question)
    print("Top relevant rows:")
    for row in relevant_rows:
        print("-", row)
