from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data" / "doj_pdfs"
CHROMA_DIR = BASE_DIR / "chroma_db"

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
# Use a low-memory default model so the app runs on 8GB RAM systems.
LLM_MODEL = "llama3.2:1b"
