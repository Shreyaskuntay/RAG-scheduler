from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil, os

from app.rag_chain import ask
from app.ingestor import ingest
from app.config import VECTORSTORE_PATH

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.get("/")
def root():
    return {"message": "Schedule RAG API is running"}

@app.get("/status")
def status():
    exists = os.path.exists(VECTORSTORE_PATH)
    return {"vectorstore_exists": exists, "message": "Ready" if exists else "No vectorstore found"}

@app.post("/ingest")
async def ingest_file(file: UploadFile = File(...)):
    temp_path = f"data/{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    ingest(temp_path)
    return {"message": "File ingested successfully"}

@app.post("/ask")
def ask_question(request: QueryRequest):
    response = ask(request.query)
    return {"response": response}