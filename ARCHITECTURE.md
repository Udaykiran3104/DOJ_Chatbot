# System Architecture Documentation

## Overview

The DoJ RAG Chatbot is built using a modern microservices-inspired architecture with a clear separation between frontend and backend components. The system leverages Retrieval-Augmented Generation (RAG) to provide accurate, document-grounded responses to user queries.

## High-Level Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Port 5173)    │
└────────┬─────────┘
         │ HTTP/REST
         │
┌────────▼─────────┐
│   FastAPI Backend │
│   (Port 8000)     │
└────────┬─────────┘
         │
    ┌────┴────┬──────────────┬─────────────┐
    │         │              │             │
┌───▼───┐ ┌──▼───┐    ┌──────▼──────┐ ┌───▼────┐
│ Ollama│ │Chroma│    │  HuggingFace │ │ Google │
│ Llama3│ │  DB  │    │  Embeddings  │ │Translator│
└───────┘ └──────┘    └─────────────┘ └────────┘
```

## Component Architecture

### 1. Frontend Layer (React Application)

**Location**: `frontend/src/`

**Components**:
- **App.jsx**: Main application component managing state and API communication
- **Header.jsx**: Application header with DoJ branding
- **ChatInput.jsx**: Input component for user queries
- **ChatMessage.jsx**: Message display component with markdown support
- **WelcomeScreen.jsx**: Initial welcome screen with suggested questions
- **TypingIndicator.jsx**: Loading animation component

**Key Features**:
- State management using React hooks (`useState`, `useRef`, `useEffect`)
- Real-time chat interface with message history
- Automatic scrolling to latest message
- Markdown rendering for formatted responses
- Source citation display
- Language detection indicator

**Styling**:
- Tailwind CSS for utility-first styling
- Custom DoJ color scheme (Navy blue, Saffron orange)
- Responsive design for mobile and desktop
- Custom scrollbar styling

### 2. Backend Layer (FastAPI Application)

**Location**: `backend/app/`

#### 2.1 Main Application (`main.py`)

**Responsibilities**:
- FastAPI application initialization
- CORS middleware configuration
- API endpoint definitions
- Request/response models
- Error handling

**Key Components**:
- **CORS Middleware**: Allows frontend (port 5173) to communicate with backend
- **Startup Event**: Initializes RAG chain on server startup
- **Chat Endpoint**: `/chat` POST endpoint for processing user queries

**Request Flow**:
1. Receives `ChatRequest` with query and history
2. Detects language using LLM
3. Translates query to English (if needed)
4. Invokes RAG chain with English query
5. Translates answer back to user's language
6. Returns `ChatResponse` with answer, sources, and detected language

#### 2.2 RAG Chain (`rag_chain.py`)

**Responsibilities**:
- Vector database initialization
- Embedding model loading
- Retrieval chain creation
- Prompt template management

**Components**:
- **Embeddings**: HuggingFace `all-MiniLM-L6-v2` model
- **Vector Store**: ChromaDB with persistent storage
- **Retriever**: Retrieves top 3 relevant document chunks
- **LLM**: Ollama Llama 3 model
- **Chain**: ConversationalRetrievalChain for context-aware responses

**Prompt Templates**:
1. **Condense Question Prompt**: Rephrases follow-up questions to be standalone
2. **QA Prompt**: Instructions for LLM to answer based on context only

**Key Features**:
- Persistent vector database (survives server restarts)
- Conversation history support
- Source document tracking
- Configurable retrieval parameters (k=3 chunks)

#### 2.3 Translator Module (`translator.py`)

**Responsibilities**:
- Language detection using LLM
- Translation to English for RAG processing
- Translation back to native language for user response

**Language Support**:
- English (`en`)
- Hindi (`hi`) - Devanagari script
- Telugu (`te`) - Telugu script

**Components**:
- **Language Detection**: Uses Llama 3 to detect language from text
- **Google Translator**: Uses `deep-translator` library for translation
- **Language Mapping**: ISO code to language name mapping

**Translation Flow**:
1. User query → Language detection → ISO code
2. Non-English query → Translate to English → RAG processing
3. English answer → Translate to native language → User response

#### 2.4 Configuration (`config.py`)

**Responsibilities**:
- Centralized configuration management
- Path definitions
- Model configuration

**Configuration Values**:
- `DATA_DIR`: Path to PDF documents directory
- `CHROMA_DIR`: Path to ChromaDB storage
- `EMBEDDING_MODEL`: HuggingFace embedding model name
- `LLM_MODEL`: Ollama LLM model name

### 3. Data Layer

#### 3.1 Document Ingestion (`ingest.py`)

**Responsibilities**:
- PDF document loading
- Text chunking
- Embedding generation
- Vector database creation

**Process**:
1. Loads all PDFs from `data/doj_pdfs/` directory
2. Splits documents using `RecursiveCharacterTextSplitter`
   - Chunk size: 800 characters
   - Chunk overlap: 150 characters
3. Generates embeddings for each chunk
4. Stores in ChromaDB with metadata (source file path)

**Key Features**:
- Clears existing database before ingestion (prevents duplicates)
- Processes multiple PDFs in batch
- Preserves document metadata for source citations

#### 3.2 Vector Database (ChromaDB)

**Storage Location**: `backend/chroma_db/`

**Structure**:
- Persistent storage on disk
- SQLite database for metadata
- Binary files for vector indices
- Collection: Default collection with all document chunks

**Query Process**:
1. User query → Embedding generation
2. Similarity search in vector space
3. Retrieves top-k most similar chunks
4. Returns chunks with metadata (source file)

### 4. External Services

#### 4.1 Ollama (Local LLM)

**Model**: Llama 3
**Purpose**: 
- Language detection
- Answer generation based on retrieved context
- Question condensing for conversation history

**Configuration**:
- Runs locally (default: `http://localhost:11434`)
- Model pulled via `ollama pull llama3`
- No API key required

#### 4.2 Google Translator API

**Library**: `deep-translator`
**Purpose**: Translation between languages
**Usage**:
- Auto-detect source language
- Translate to/from English
- Supports Hindi and Telugu scripts

## Data Flow

### Query Processing Flow

```
User Query (Any Language)
    │
    ├─► Language Detection (LLM)
    │       │
    │       └─► ISO Code (en/hi/te)
    │
    ├─► Translation to English (if needed)
    │       │
    │       └─► English Query
    │
    ├─► Embedding Generation
    │       │
    │       └─► Query Vector
    │
    ├─► Vector Similarity Search
    │       │
    │       └─► Top 3 Document Chunks
    │
    ├─► RAG Chain Processing
    │       │
    │       ├─► Question Condensing (if history exists)
    │       ├─► Context + Query → LLM
    │       └─► English Answer + Sources
    │
    ├─► Translation to Native Language (if needed)
    │       │
    │       └─► Bilingual Response
    │
    └─► Response to User
            │
            └─► Answer + Sources + Language Tag
```

### Document Ingestion Flow

```
PDF Documents
    │
    ├─► PDF Loading (PyPDFLoader)
    │       │
    │       └─► Raw Text Documents
    │
    ├─► Text Chunking (RecursiveCharacterTextSplitter)
    │       │
    │       ├─► Chunk Size: 800 chars
    │       ├─► Overlap: 150 chars
    │       └─► Multiple Chunks per Document
    │
    ├─► Embedding Generation (HuggingFace)
    │       │
    │       └─► Vector Embeddings (384 dimensions)
    │
    └─► Storage in ChromaDB
            │
            ├─► Vector Index
            ├─► Metadata (source file path)
            └─► Persistent Storage
```

## Technology Stack Details

### Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | 0.112.0 | REST API framework |
| Server | Uvicorn | 0.30.1 | ASGI server |
| RAG Framework | LangChain | 0.2.11 | RAG orchestration |
| Vector DB | ChromaDB | 0.5.5 | Vector storage |
| Embeddings | HuggingFace | 0.0.3 | Embedding models |
| LLM | Ollama | 0.3.0 | Local LLM client |
| PDF Processing | PyPDF | 4.3.1 | PDF parsing |
| Translation | deep-translator | 1.11.4 | Language translation |

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 19.2.0 | UI framework |
| Build Tool | Vite | 7.2.4 | Build tool |
| HTTP Client | Axios | 1.13.2 | API calls |
| Styling | Tailwind CSS | 3.4.17 | CSS framework |
| Markdown | react-markdown | 10.1.0 | Markdown rendering |
| Icons | lucide-react | 0.562.0 | Icon library |
| Animations | framer-motion | 12.23.26 | Animation library |

## Security Architecture

### Current Security Measures

1. **CORS Configuration**: Restricts frontend origins
2. **Input Validation**: Pydantic models validate all inputs
3. **Error Handling**: Graceful error handling prevents information leakage
4. **Local Processing**: LLM runs locally, no external API keys needed

### Security Considerations for Production

1. **Authentication**: Add JWT-based authentication
2. **Rate Limiting**: Implement request rate limiting
3. **HTTPS**: Enforce HTTPS in production
4. **Input Sanitization**: Additional sanitization for user inputs
5. **API Keys**: Secure storage of translation API keys (if using paid service)

## Scalability Considerations

### Current Limitations

- Single-threaded processing (can be improved with async)
- Local LLM (limited by hardware)
- Single vector database instance

### Scalability Improvements

1. **Horizontal Scaling**: Multiple backend instances behind load balancer
2. **Caching**: Redis cache for frequent queries
3. **Async Processing**: Async/await for concurrent requests
4. **Database Sharding**: Distribute vector database across multiple instances
5. **CDN**: Serve frontend static assets via CDN

## Monitoring and Logging

### Current Logging

- Console logging for debugging
- Error logging in exception handlers
- Print statements for workflow tracking

### Recommended Enhancements

1. **Structured Logging**: Use logging library (e.g., `structlog`)
2. **Metrics Collection**: Track response times, error rates
3. **Query Analytics**: Log user queries for analysis
4. **Performance Monitoring**: Track LLM inference times
5. **Health Checks**: Add `/health` endpoint for monitoring

## Deployment Architecture

### Development

- Backend: `uvicorn app.main:app --reload`
- Frontend: `npm run dev` (Vite dev server)
- Ollama: Local instance

### Production Recommendations

**Backend**:
- Gunicorn with multiple workers
- Nginx reverse proxy
- Process manager (systemd, PM2, or Docker)

**Frontend**:
- Build static assets (`npm run build`)
- Serve via Nginx or CDN
- Enable compression and caching

**Database**:
- ChromaDB persistent storage on mounted volume
- Regular backups of vector database

**LLM**:
- Ollama service running as systemd service
- Consider GPU acceleration for better performance

