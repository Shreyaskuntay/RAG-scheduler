"""
Debug script — tests the full RAG pipeline directly.
Run this with "Debug - rag_chain only" in VS Code.
Set breakpoints anywhere in app/ to step through the code.
"""
from app.retriever import retrieve
from app.rag_chain import ask

# ─── Change this question to test different queries ───────────────────────────
QUESTION = "When is my next class with Dr. Smith?"
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "="*60)
print(f"Question: {QUESTION}")
print("="*60)

print("\n[1] Retrieving relevant rows from ChromaDB...")
docs = retrieve(QUESTION)
for i, doc in enumerate(docs, 1):
    print(f"  {i}. {doc}")

print("\n[2] Sending to Ollama and getting answer...")
answer = ask(QUESTION)

print("\n[3] Final answer:")
print(f"  {answer}")
print("="*60)
