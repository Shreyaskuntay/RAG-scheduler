import requests
from app.config import OLLAMA_URL, OLLAMA_MODEL
from app.retriever import retrieve


def build_prompt(question: str, context_docs: list[str]) -> str:
    context = "\n".join(f"- {doc}" for doc in context_docs)
    return f"""You are a helpful university schedule assistant.
Use only the schedule information below to answer the question.
If the answer is not in the schedule, say "I don't have that information."

Schedule entries:
{context}

Question: {question}
Answer:"""


def ask(question: str) -> str:
    # Step 1: retrieve relevant rows
    context_docs = retrieve(question)

    # Step 2: build prompt
    prompt = build_prompt(question, context_docs)

    # Step 3: call Ollama
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
        },
        timeout=120,
    )
    response.raise_for_status()

    return response.json()["response"].strip()
