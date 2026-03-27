from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple, Optional, Literal
from app.rag_chain import get_rag_chain
from app.translator import detect_language, translate_to_english, translate_to_native
from datetime import datetime, timezone
import csv
from pathlib import Path
from contextlib import asynccontextmanager

app = FastAPI(title="DoJ RAG Chatbot")

qa_chain = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global qa_chain
    print("Initializing RAG chain...")
    qa_chain = get_rag_chain()
    print("RAG chain ready.")
    yield
    # Clean up resources if needed upon shutdown

app = FastAPI(title="DoJ RAG Chatbot", lifespan=lifespan)

# ... Leave your CORS setup here as it was ...


# ==========================================
# CRITICAL FIX: CORS MIDDLEWARE SETUP
# ==========================================
# This allows the React Frontend (running on a different port) to talk to this Backend.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # Allow all for development convenience
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)




class ChatRequest(BaseModel):
    query: str
    history: List[Tuple[str, str]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    detected_language: str 

class FeedbackRequest(BaseModel):
    timestamp: Optional[str] = None
    query: str
    answer: str
    feedback: Literal["up", "down"]
    sources: List[str] = []
    detected_language: Optional[str] = None
    client: Optional[str] = "web"

FEEDBACK_CSV_PATH = Path(__file__).resolve().parent.parent / "feedback.csv"



@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not qa_chain:
        raise HTTPException(status_code=503, detail="RAG chain not initialized")
    
    try:
        # 1. Detect Language
        print(f"Original Query: {request.query}")
        detected_lang = detect_language(request.query)
        print(f"Detected Language: {detected_lang}")

        # 2. Translate to English (if needed)
        english_query = translate_to_english(request.query, detected_lang)
        print(f"Processing in English: {english_query}")

        # 3. Get Answer from RAG
        result = qa_chain.invoke({
            "question": english_query,
            "chat_history": request.history
        })
        english_answer = result["answer"]

        # 4. Prepare Final Response
        final_response_text = ""
        if detected_lang == 'en':
            final_response_text = english_answer
        else:
            native_answer = translate_to_native(english_answer, detected_lang)
            lang_name = "हिंदी" if detected_lang == 'hi' else "Telugu"
            if detected_lang == 'te': lang_name = "తెలుగు"

            final_response_text = (
                f"English:\n{english_answer}\n\n"
                f"{lang_name}:\n{native_answer}"
            )

        return ChatResponse(
            answer=final_response_text,
            sources=[
                doc.metadata.get("source", "DoJ Document")
                for doc in result["source_documents"]
            ],
            detected_language=detected_lang
        )

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/feedback")
def feedback(request: FeedbackRequest):
    """
    Appends user feedback to backend/feedback.csv
    Columns: timestamp, query, answer, feedback, detected_language, sources, client
    """
    try:
        timestamp = request.timestamp or datetime.now(timezone.utc).isoformat()
        is_new_file = not FEEDBACK_CSV_PATH.exists()

        FEEDBACK_CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
        with FEEDBACK_CSV_PATH.open("a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if is_new_file:
                writer.writerow([
                    "timestamp",
                    "query",
                    "answer",
                    "feedback",
                    "detected_language",
                    "sources",
                    "client",
                ])
            writer.writerow([
                timestamp,
                request.query,
                request.answer,
                request.feedback,
                request.detected_language or "",
                "|".join(request.sources or []),
                request.client or "",
            ])

        return {"status": "ok"}
    except Exception as e:
        print(f"Feedback error: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving feedback: {str(e)}")