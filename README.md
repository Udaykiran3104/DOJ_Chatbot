# Department of Justice (DoJ) RAG Chatbot

A production-ready, intelligent conversational AI chatbot designed to help citizens access Department of Justice information, legal aid schemes, and judicial infrastructure details through natural language interactions. The system uses Retrieval-Augmented Generation (RAG) architecture to provide accurate, context-aware responses grounded in official legal documents.

## 🎯 Features

- **Conversational AI**: Advanced NLP using RAG (Retrieval-Augmented Generation) architecture
- **Multilingual Support**: English, Hindi (हिंदी), and Telugu (తెలుగు) with automatic language detection
- **Document-Based Answers**: Responses grounded in official DoJ PDF documents
- **Source Citations**: Every answer includes references to source documents
- **Conversation History**: Maintains context across multiple interactions
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Real-time Processing**: Fast response times with local LLM inference

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Python 3.10+
- FastAPI (REST API framework)
- LangChain 0.2.x (RAG orchestration)
- Ollama + Llama 3 (Local LLM)
- ChromaDB (Vector Database for document storage)
- HuggingFace Embeddings (`all-MiniLM-L6-v2`)
- PyPDF (PDF document processing)
- Google Translator API (via `deep-translator`)

**Frontend:**
- React 19 with Vite
- Tailwind CSS (styling)
- Axios (HTTP client)
- React Markdown (markdown rendering)
- Framer Motion (animations)
- Lucide React (icons)

## 📁 Project Structure

```
JCB/
├── backend/                      # Backend API & AI Logic
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── rag_chain.py        # RAG chain implementation
│   │   ├── translator.py       # Language detection & translation
│   │   └── config.py           # Configuration settings
│   ├── data/
│   │   └── doj_pdfs/           # PDF documents (58 files)
│   ├── chroma_db/              # ChromaDB persistent storage
│   ├── ingest.py               # Document ingestion script
│   ├── requirements.txt        # Python dependencies
│   └── venv/                   # Python virtual environment
├── frontend/                    # Frontend React Application
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ChatInput.jsx   # Chat input component
│   │   │   ├── ChatMessage.jsx # Message display component
│   │   │   ├── Header.jsx      # Application header
│   │   │   ├── WelcomeScreen.jsx # Welcome screen
│   │   │   └── TypingIndicator.jsx # Loading indicator
│   │   ├── App.jsx             # Main App component
│   │   ├── main.jsx            # Entry point
│   │   ├── index.css           # Global styles
│   │   └── App.css             # App-specific styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js      # Tailwind configuration
│   └── postcss.config.js
├── README.md                    # This file
├── ARCHITECTURE.md              # System architecture documentation
├── WORKFLOW.md                  # Complete workflow documentation
└── API_DOCUMENTATION.md         # API endpoints documentation
```

## 📋 Prerequisites

### System Requirements
- **OS**: Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB (16GB recommended for LLM)
- **Storage**: 10GB free space
- **CPU**: Multi-core processor (GPU optional but recommended)

### Software Requirements
1. **Python 3.10+**
   ```bash
   python --version
   ```

2. **Node.js 18+**
   ```bash
   node --version
   npm --version
   ```

3. **Ollama** (for running Llama 3 locally)
   - Visit: https://ollama.ai/download
   - Install for your OS
   - Pull the Llama 3 model: `ollama pull llama3`

## 🚀 Quick Start Guide

### Step 1: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Ensure Ollama is running and Llama 3 is pulled
ollama pull llama3
ollama list  # Verify installation
```

### Step 2: Ingest Documents

```bash
# Make sure PDFs are in backend/data/doj_pdfs/
python ingest.py
```

This will:
- Load all PDFs from `data/doj_pdfs/` directory
- Split documents into chunks (800 chars with 150 overlap)
- Generate embeddings using HuggingFace model
- Store in ChromaDB vector database

### Step 3: Start Backend Server

```bash
# Ensure virtual environment is activated
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend will be available at: `http://127.0.0.1:8000`
API Documentation: `http://127.0.0.1:8000/docs`

### Step 4: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration (`backend/app/config.py`)

```python
DATA_DIR = BASE_DIR / "data" / "doj_pdfs"      # PDF documents directory
CHROMA_DIR = BASE_DIR / "chroma_db"            # Vector database directory
EMBEDDING_MODEL = "all-MiniLM-L6-v2"           # HuggingFace embedding model
LLM_MODEL = "llama3"                           # Ollama LLM model
```

### Frontend Configuration

The frontend connects to the backend API at `http://127.0.0.1:8000` (hardcoded in `App.jsx`).

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed system architecture and component interactions
- **[WORKFLOW.md](./WORKFLOW.md)** - Complete workflow from user query to response
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoints and request/response formats

## 🌐 Multilingual Support

The chatbot supports three languages:

1. **English** - Primary language for processing
2. **Hindi (हिंदी)** - Full support with Devanagari script
3. **Telugu (తెలుగు)** - Full support with Telugu script

**How it works:**
- Language detection using Llama 3 LLM
- Automatic translation to English for RAG processing
- Response translation back to user's language
- Bilingual responses (English + Native language) for non-English queries

## 🔍 How It Works

1. **User Query**: User sends a question in any supported language
2. **Language Detection**: System detects language using LLM
3. **Translation**: Query translated to English (if needed)
4. **Document Retrieval**: RAG system retrieves relevant document chunks from ChromaDB
5. **Answer Generation**: Llama 3 generates answer based on retrieved context
6. **Translation**: Answer translated back to user's language
7. **Response**: User receives answer with source citations

## 🧪 Testing

### Test Backend API

```bash
# Using curl
curl -X POST "http://127.0.0.1:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my legal rights?", "history": []}'

# Or visit http://127.0.0.1:8000/docs for interactive API documentation
```

### Test Frontend

Simply open `http://localhost:5173` in your browser and interact with the chatbot.

## 🐛 Troubleshooting

### Common Issues

1. **Ollama Not Running**
   ```bash
   # Start Ollama service
   ollama serve
   ```

2. **Port Already in Use**
   ```bash
   # Windows: Find and kill process on port 8000
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

3. **ChromaDB Not Found**
   - Run `python ingest.py` to create the vector database

4. **CORS Error**
   - Ensure backend CORS middleware allows `http://localhost:5173`
   - Check `backend/app/main.py` for CORS configuration

5. **Module Not Found**
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

## 📦 Production Deployment

### Backend Deployment

```bash
# Using Gunicorn
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service (Vercel, Netlify, etc.)
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure allowed origins properly in production
3. **Input Validation**: All inputs are validated via Pydantic models
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting for production use

## 📈 Future Enhancements

- [ ] Voice input/output support
- [ ] Additional language support
- [ ] User authentication and session management
- [ ] Advanced analytics and query tracking
- [ ] Integration with court case management systems
- [ ] Mobile applications (iOS/Android)
- [ ] SMS/WhatsApp bot integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation files in the repository

## 🙏 Acknowledgments

- Department of Justice, Government of India
- LangChain community
- Ollama team
- HuggingFace for embeddings
- Open source contributors

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained By**: Department of Justice IT Team
=======
# Justice_ChatBot
Major project