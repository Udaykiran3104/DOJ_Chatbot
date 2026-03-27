# Detailed Setup Guide

Step-by-step instructions for setting up the DoJ RAG Chatbot on your local machine.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.10 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] npm (comes with Node.js) installed
- [ ] Git (optional, for cloning repository)
- [ ] At least 8GB RAM (16GB recommended)
- [ ] 10GB free disk space
- [ ] Internet connection (for downloading dependencies and translation API)

---

## Step 1: Install Ollama

Ollama is required to run the Llama 3 LLM locally.

### Windows

1. Visit: https://ollama.ai/download
2. Download the Windows installer
3. Run the installer and follow the prompts
4. Verify installation:
   ```powershell
   ollama --version
   ```

### macOS

1. Visit: https://ollama.ai/download
2. Download the macOS installer
3. Run the installer
4. Verify installation:
   ```bash
   ollama --version
   ```

### Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Pull Llama 3 Model

After installing Ollama, pull the Llama 3 model:

```bash
ollama pull llama3
```

This will download the model (approximately 4.7GB). Verify:

```bash
ollama list
```

You should see `llama3` in the list.

### Start Ollama Service

Ollama should start automatically. If not, start it manually:

```bash
ollama serve
```

Keep this running in a separate terminal.

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Create Virtual Environment

**Windows**:
```powershell
python -m venv venv
```

**macOS/Linux**:
```bash
python3 -m venv venv
```

### 2.3 Activate Virtual Environment

**Windows (PowerShell)**:
```powershell
venv\Scripts\Activate.ps1
```

**Windows (Command Prompt)**:
```cmd
venv\Scripts\activate.bat
```

**macOS/Linux**:
```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 2.4 Upgrade Pip

```bash
python -m pip install --upgrade pip
```

### 2.5 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI and Uvicorn
- LangChain and related packages
- ChromaDB
- HuggingFace embeddings
- PyPDF
- Ollama client
- Translation libraries

**Expected time**: 5-10 minutes depending on internet speed.

### 2.6 Verify Installation

```bash
python -c "import fastapi; import langchain; print('Dependencies installed successfully!')"
```

---

## Step 3: Prepare Documents

### 3.1 Check Documents Directory

Ensure PDF documents are in the correct location:

```
backend/data/doj_pdfs/
```

### 3.2 Add Your PDFs

Place your PDF documents in the `backend/data/doj_pdfs/` directory. The system will process all PDFs in this folder.

**Note**: The directory should already contain 58 PDF files. If you need to add more:
1. Copy PDF files to `backend/data/doj_pdfs/`
2. Run ingestion script (see Step 4)

---

## Step 4: Ingest Documents

This step creates the vector database from your PDF documents.

### 4.1 Run Ingestion Script

Make sure you're in the `backend` directory with virtual environment activated:

```bash
python ingest.py
```

### 4.2 What Happens During Ingestion

1. **Clears existing database** (if any)
2. **Loads all PDFs** from `data/doj_pdfs/`
3. **Splits documents** into chunks (800 chars each)
4. **Generates embeddings** for each chunk
5. **Stores in ChromaDB** vector database

**Expected time**: 5-15 minutes depending on number of PDFs.

### 4.3 Verify Ingestion

After completion, you should see:
```
✅ Ingestion complete! Vector store saved to disk.
```

Check that `chroma_db` directory was created:
```bash
ls chroma_db
```

You should see database files.

---

## Step 5: Start Backend Server

### 5.1 Ensure Virtual Environment is Activated

You should see `(venv)` in your terminal prompt.

### 5.2 Start Server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 5.3 Verify Server is Running

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
Initializing RAG chain...
RAG chain ready.
INFO:     Application startup complete.
```

### 5.4 Test Backend

Open your browser and visit:
- API Documentation: http://127.0.0.1:8000/docs
- Alternative Docs: http://127.0.0.1:8000/redoc

You should see the FastAPI interactive documentation.

**Keep this terminal window open!** The server needs to keep running.

---

## Step 6: Frontend Setup

Open a **new terminal window** (keep backend running).

### 6.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 6.2 Install Node Dependencies

```bash
npm install
```

This will install:
- React and React DOM
- Vite
- Tailwind CSS
- Axios
- React Markdown
- Other dependencies

**Expected time**: 2-5 minutes.

### 6.3 Verify Installation

```bash
npm list --depth=0
```

You should see all packages listed.

---

## Step 7: Start Frontend Server

### 7.1 Start Development Server

```bash
npm run dev
```

### 7.2 Verify Frontend is Running

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7.3 Open in Browser

Open your browser and visit: **http://localhost:5173**

You should see the DoJ Chatbot welcome screen.

---

## Step 8: Test the Application

### 8.1 Test Basic Query

1. Type a question: "What are my legal rights?"
2. Click Send or press Enter
3. Wait for response (4-9 seconds)
4. Verify answer appears with source citations

### 8.2 Test Multilingual Support

**Hindi**:
- Type: "मेरे कानूनी अधिकार क्या हैं?"
- Should detect Hindi and return bilingual response

**Telugu**:
- Type: "నా చట్టపరమైన హక్కులు ఏమిటి?"
- Should detect Telugu and return bilingual response

### 8.3 Test Conversation History

1. Ask: "What are my legal rights?"
2. Wait for response
3. Ask: "Can you tell me more about that?"
4. Verify the second question uses context from first

---

## Troubleshooting

### Issue: Ollama Not Found

**Error**: `ollama: command not found`

**Solution**:
1. Verify Ollama is installed: `ollama --version`
2. Add Ollama to PATH (if needed)
3. Restart terminal

### Issue: Port 8000 Already in Use

**Error**: `Address already in use`

**Solution (Windows)**:
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Solution (macOS/Linux)**:
```bash
lsof -ti:8000 | xargs kill -9
```

### Issue: Module Not Found

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
1. Ensure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`

### Issue: ChromaDB Not Found

**Error**: `ChromaDB collection not found`

**Solution**:
1. Run ingestion script: `python ingest.py`
2. Verify `chroma_db` directory exists

### Issue: Ollama Connection Failed

**Error**: `Connection refused` or `Ollama not running`

**Solution**:
1. Start Ollama: `ollama serve`
2. Verify model is pulled: `ollama list`
3. Test: `ollama run llama3 "Hello"`

### Issue: CORS Error in Browser

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
1. Verify backend CORS configuration in `backend/app/main.py`
2. Ensure frontend URL matches allowed origins
3. Restart backend server

### Issue: Translation API Error

**Error**: `Translation failed`

**Solution**:
1. Check internet connection
2. Verify `deep-translator` is installed: `pip list | grep deep-translator`
3. Check if Google Translator API is accessible

### Issue: Slow Response Times

**Possible Causes**:
- LLM inference is slow (normal: 2-5 seconds)
- Large number of documents in database
- Weak hardware (CPU/RAM)

**Solutions**:
- Use GPU acceleration for Ollama (if available)
- Reduce number of retrieved chunks (modify `k` in `rag_chain.py`)
- Upgrade hardware

---

## Verification Checklist

After setup, verify:

- [ ] Ollama is running and Llama 3 model is available
- [ ] Backend server starts without errors
- [ ] Vector database exists (`chroma_db` directory)
- [ ] Frontend server starts without errors
- [ ] Can access frontend at http://localhost:5173
- [ ] Can access backend docs at http://127.0.0.1:8000/docs
- [ ] Can send a query and receive a response
- [ ] Source citations appear in responses
- [ ] Multilingual queries work (Hindi/Telugu)

---

## Next Steps

After successful setup:

1. **Read Documentation**:
   - [README.md](./README.md) - Overview
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
   - [WORKFLOW.md](./WORKFLOW.md) - Detailed workflows
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference

2. **Customize Configuration**:
   - Modify `backend/app/config.py` for different models
   - Adjust chunk size/overlap in `ingest.py`
   - Change retrieval parameters in `rag_chain.py`

3. **Add More Documents**:
   - Add PDFs to `backend/data/doj_pdfs/`
   - Re-run `python ingest.py`

4. **Customize Frontend**:
   - Modify colors in `frontend/tailwind.config.js`
   - Update branding in `frontend/src/components/Header.jsx`
   - Add new features to components

---

## Production Deployment

For production deployment, see the [README.md](./README.md) Production Deployment section.

Key differences:
- Use Gunicorn instead of Uvicorn dev server
- Build frontend static assets
- Configure proper CORS origins
- Set up HTTPS
- Add authentication
- Implement rate limiting
- Set up monitoring and logging

---

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages in terminal
3. Check server logs
4. Verify all prerequisites are met
5. Ensure all services are running (Ollama, backend, frontend)

---

## System Requirements Summary

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8GB | 16GB |
| Storage | 10GB | 20GB |
| CPU | Multi-core | Multi-core with GPU |
| Python | 3.10+ | 3.11+ |
| Node.js | 18+ | 20+ |

---

**Setup Complete!** 🎉

You should now have a fully functional DoJ RAG Chatbot running on your local machine.

