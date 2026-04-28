"""
Run this script ONCE before starting the API.
It reads the CSV, creates embeddings, and stores them in ChromaDB.

Usage:
    python ingest.py
"""
from app.ingestor import ingest

if __name__ == "__main__":
    ingest()
