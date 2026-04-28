import pandas as pd
import chromadb
from sentence_transformers import SentenceTransformer
from app.config import CSV_PATH, VECTORSTORE_PATH, COLLECTION_NAME, EMBEDDING_MODEL


def row_to_text(row) -> str:
    """Convert one CSV row into a readable sentence for embedding."""
    return (
        f"{row['Event']} with {row['lecturer']} "
        f"on {row['Date']} from {row['fromtime']} to {row['totime']} "
        f"in room {row['Room NO']}, group {row['group']}, type: {row['event type']}."
    )


def ingest():
    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH)

    print("Loading embedding model...")
    model = SentenceTransformer(EMBEDDING_MODEL)

    print("Connecting to ChromaDB...")
    client = chromadb.PersistentClient(path=VECTORSTORE_PATH)

    # Delete collection if it already exists (clean re-ingest)
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(COLLECTION_NAME)

    print("Embedding and storing rows...")
    texts = [row_to_text(row) for _, row in df.iterrows()]
    embeddings = model.encode(texts).tolist()
    ids = [str(i) for i in range(len(texts))]

    collection.add(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
    )

    print(f"Done! Stored {len(texts)} classes in ChromaDB.")
