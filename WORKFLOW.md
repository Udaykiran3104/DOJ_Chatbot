# Complete Workflow Documentation

This document provides a detailed explanation of all workflows and logic within the DoJ RAG Chatbot system.

## Table of Contents

1. [Document Ingestion Workflow](#document-ingestion-workflow)
2. [Query Processing Workflow](#query-processing-workflow)
3. [Language Detection Workflow](#language-detection-workflow)
4. [Translation Workflow](#translation-workflow)
5. [RAG Retrieval Workflow](#rag-retrieval-workflow)
6. [Response Generation Workflow](#response-generation-workflow)
7. [Frontend Interaction Workflow](#frontend-interaction-workflow)

---

## Document Ingestion Workflow

**File**: `backend/ingest.py`

### Purpose
Process PDF documents and create a searchable vector database.

### Step-by-Step Process

1. **Initialization**
   ```python
   # Clear existing database to avoid duplicates
   if os.path.exists(CHROMA_DIR):
       shutil.rmtree(CHROMA_DIR)
   ```

2. **Embedding Model Setup**
   ```python
   embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
   ```
   - Loads pre-trained sentence transformer model
   - Generates 384-dimensional vectors
   - Optimized for semantic similarity search

3. **PDF Loading**
   ```python
   for pdf_file in pdf_files:
       loader = PyPDFLoader(str(pdf_file))
       docs = loader.load()
       documents.extend(docs)
   ```
   - Iterates through all PDFs in `data/doj_pdfs/`
   - Uses PyPDFLoader to extract text
   - Each PDF becomes one or more Document objects
   - Preserves metadata (source file path)

4. **Text Chunking**
   ```python
   splitter = RecursiveCharacterTextSplitter(
       chunk_size=800,
       chunk_overlap=150
   )
   chunks = splitter.split_documents(documents)
   ```
   - Splits documents into smaller chunks
   - **Chunk Size**: 800 characters (optimal for context window)
   - **Overlap**: 150 characters (prevents information loss at boundaries)
   - Uses recursive splitting (tries paragraphs, then sentences, then characters)

5. **Vector Database Creation**
   ```python
   Chroma.from_documents(
       documents=chunks,
       embedding=embeddings,
       persist_directory=str(CHROMA_DIR)
   )
   ```
   - Generates embeddings for each chunk
   - Stores vectors in ChromaDB
   - Persists to disk for future use
   - Creates metadata index for source tracking

### Output
- Vector database stored in `backend/chroma_db/`
- Each chunk has:
  - Vector embedding (384 dimensions)
  - Text content
  - Metadata (source PDF path)

---

## Query Processing Workflow

**File**: `backend/app/main.py` → `/chat` endpoint

### Purpose
Process user queries and return accurate, document-grounded answers.

### Complete Flow

```
User Query
    │
    ├─► [Step 1] Language Detection
    │       │
    │       └─► detect_language_with_llm(query)
    │               │
    │               └─► Returns: 'en', 'hi', or 'te'
    │
    ├─► [Step 2] Translation to English
    │       │
    │       └─► translate_to_english(query, detected_lang)
    │               │
    │               └─► Returns: English query (if needed)
    │
    ├─► [Step 3] RAG Chain Invocation
    │       │
    │       └─► qa_chain.invoke({
    │               "question": english_query,
    │               "chat_history": history
    │           })
    │               │
    │               └─► Returns: {
    │                       "answer": str,
    │                       "source_documents": List[Document]
    │                   }
    │
    ├─► [Step 4] Response Translation
    │       │
    │       └─► translate_to_native(answer, detected_lang)
    │               │
    │               └─► Returns: Native language answer
    │
    └─► [Step 5] Response Formatting
            │
            └─► ChatResponse(
                    answer: bilingual_text,
                    sources: [source_paths],
                    detected_language: lang_code
                )
```

### Detailed Steps

#### Step 1: Language Detection
- **Function**: `detect_language_with_llm(query: str) -> str`
- **Process**:
  1. Constructs prompt asking LLM to identify language
  2. Sends to Ollama Llama 3 model
  3. Parses response to extract language code
  4. Returns 'en', 'hi', or 'te'
  5. Defaults to 'en' on error

#### Step 2: Translation to English
- **Function**: `translate_to_english(text: str, source_lang: str) -> str`
- **Process**:
  1. If source_lang is 'en', returns text as-is
  2. Otherwise, uses GoogleTranslator
  3. Translates from detected language to English
  4. Returns English text for RAG processing

#### Step 3: RAG Chain Processing
- **Function**: `qa_chain.invoke()`
- **Process**:
  1. **Question Condensing** (if history exists):
     - Rephrases follow-up question to be standalone
     - Uses conversation history for context
  2. **Document Retrieval**:
     - Generates embedding for query
     - Searches vector database for top 3 similar chunks
     - Returns chunks with metadata
  3. **Answer Generation**:
     - Combines retrieved chunks as context
     - Sends context + question to LLM
     - LLM generates answer based on context only

#### Step 4: Response Translation
- **Function**: `translate_to_native(text: str, target_lang: str) -> str`
- **Process**:
  1. If target_lang is 'en', returns text as-is
  2. Otherwise, translates English answer to target language
  3. Returns translated text

#### Step 5: Response Formatting
- **For English queries**: Returns English answer only
- **For non-English queries**: Returns bilingual format:
  ```
  English:
  [English answer]
  
  [Native Language Name]:
  [Translated answer]
  ```

---

## Language Detection Workflow

**File**: `backend/app/translator.py` → `detect_language_with_llm()`

### Purpose
Accurately detect the language of user input using LLM.

### Process

1. **Prompt Construction**
   ```python
   prompt = f"""
   Analyze the following text and identify the language.
   It could be English, Hindi (Devanagari or Romanized), or Telugu (Script or Romanized).
   
   Text: "{text}"
   
   Return ONLY one of these three codes:
   - 'en' for English
   - 'hi' for Hindi
   - 'te' for Telugu
   """
   ```

2. **LLM Inference**
   ```python
   response = ollama.chat(
       model='llama3',
       messages=[{'role': 'user', 'content': prompt}]
   )
   ```

3. **Response Parsing**
   ```python
   lang_code = response['message']['content'].strip().lower()
   # Clean up any extra characters
   if 'hi' in lang_code: return 'hi'
   if 'te' in lang_code: return 'te'
   return 'en'
   ```

### Features
- Handles both script and romanized text
- Robust parsing handles verbose LLM responses
- Fallback to English on errors

---

## Translation Workflow

**File**: `backend/app/translator.py`

### Two Translation Functions

#### 1. Translate to English (`translate_to_english`)

**Purpose**: Convert non-English queries to English for RAG processing.

**Process**:
```python
if source_lang == 'en':
    return text  # No translation needed

translator = GoogleTranslator(source='auto', target='en')
return translator.translate(text)
```

**Why**: RAG system works best with English queries and documents.

#### 2. Translate to Native (`translate_to_native`)

**Purpose**: Convert English answers back to user's language.

**Process**:
```python
if target_lang == 'en':
    return text  # Already in English

translator = GoogleTranslator(source='en', target=target_lang)
return translator.translate(text)
```

**Why**: Users prefer answers in their native language.

### Translation Flow Diagram

```
Hindi Query → [Detect: hi] → Translate to English → RAG → English Answer → Translate to Hindi → Bilingual Response

Telugu Query → [Detect: te] → Translate to English → RAG → English Answer → Translate to Telugu → Bilingual Response

English Query → [Detect: en] → No Translation → RAG → English Answer → No Translation → English Response
```

---

## RAG Retrieval Workflow

**File**: `backend/app/rag_chain.py` → `get_rag_chain()`

### Purpose
Retrieve relevant document chunks and generate context-aware answers.

### Components

#### 1. Embedding Model
```python
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
```
- **Model**: Sentence-BERT model
- **Dimensions**: 384
- **Purpose**: Convert text to numerical vectors

#### 2. Vector Database
```python
vectordb = Chroma(
    persist_directory=str(CHROMA_DIR),
    embedding_function=embeddings
)
```
- **Storage**: Persistent on disk
- **Purpose**: Store document chunk embeddings

#### 3. Retriever
```python
retriever = vectordb.as_retriever(search_kwargs={"k": 3})
```
- **k=3**: Retrieves top 3 most similar chunks
- **Search Method**: Cosine similarity
- **Purpose**: Find relevant context for query

#### 4. LLM
```python
llm = Ollama(model="llama3")
```
- **Model**: Llama 3 (via Ollama)
- **Purpose**: Generate answers from context

#### 5. Conversational Retrieval Chain
```python
chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=retriever,
    condense_question_prompt=CONDENSE_QUESTION_PROMPT,
    combine_docs_chain_kwargs={"prompt": QA_PROMPT},
    return_source_documents=True,
)
```

### RAG Process Flow

1. **Query Embedding**
   - User query → Embedding vector (384 dimensions)

2. **Similarity Search**
   - Compare query vector with all chunk vectors
   - Calculate cosine similarity scores
   - Select top 3 chunks with highest similarity

3. **Context Preparation**
   - Combine retrieved chunks into context string
   - Format: `[Chunk 1]\n\n[Chunk 2]\n\n[Chunk 3]`

4. **Answer Generation**
   - Send to LLM: Context + Question + Instructions
   - LLM generates answer using only provided context
   - Returns answer + source documents

### Prompt Templates

#### Condense Question Prompt
```
Given the following conversation and a follow-up question, 
rephrase the follow-up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:
```

#### QA Prompt
```
You are a helpful, respectful, and honest legal assistant for the Department of Justice, India.
Context Information:
{context}

Current Question: {question}

Instructions:
1. Use ONLY the provided context information.
2. Do NOT start answers with "According to the context" or "Based on the documents".
3. If the answer is not in the context, say: "I do not have information on that."
4. Do NOT hallucinate.
5. Simplify legal terms for a layman.
6. Keep answers concise.

Answer:
```

---

## Response Generation Workflow

**File**: `backend/app/main.py` → Response formatting logic

### Purpose
Format and structure the final response to the user.

### Response Structure

```python
ChatResponse(
    answer: str,              # Answer text (may be bilingual)
    sources: List[str],       # Source document paths
    detected_language: str    # Language code ('en', 'hi', 'te')
)
```

### Answer Formatting Logic

#### For English Queries
```python
if detected_lang == 'en':
    final_response_text = english_answer
```

#### For Non-English Queries
```python
else:
    native_answer = translate_to_native(english_answer, detected_lang)
    lang_name = "हिंदी" if detected_lang == 'hi' else "తెలుగు"
    
    final_response_text = (
        f"English:\n{english_answer}\n\n"
        f"{lang_name}:\n{native_answer}"
    )
```

### Source Extraction
```python
sources = [
    doc.metadata.get("source", "DoJ Document")
    for doc in result["source_documents"]
]
```
- Extracts source file paths from retrieved documents
- Falls back to "DoJ Document" if source not found
- Returns list of source PDF filenames

---

## Frontend Interaction Workflow

**File**: `frontend/src/App.jsx`

### Purpose
Handle user interactions and display responses.

### State Management

```javascript
const [messages, setMessages] = useState([]);      // Chat history
const [input, setInput] = useState('');            // Current input
const [isLoading, setIsLoading] = useState(false); // Loading state
```

### Message Flow

1. **User Input**
   ```javascript
   const userMessage = { role: 'user', content: query };
   setMessages(prev => [...prev, userMessage]);
   ```

2. **History Preparation**
   ```javascript
   const history = messages
     .filter((_, i) => i % 2 !== 0)  // Get bot responses
     .map((msg, i) => [messages[i * 2]?.content, msg.content]);
   ```
   - Formats conversation history as pairs: `[user_query, bot_response]`

3. **API Call**
   ```javascript
   const response = await axios.post('http://127.0.0.1:8000/chat', {
     query: userMessage.content,
     history: history
   });
   ```

4. **Response Handling**
   ```javascript
   const botMessage = {
     role: 'bot',
     content: response.data.answer,
     sources: response.data.sources,
     language: response.data.detected_language
   };
   setMessages(prev => [...prev, botMessage]);
   ```

5. **Error Handling**
   ```javascript
   catch (error) {
     const errorMessage = {
       role: 'bot',
       content: "Unable to connect to server..."
     };
     setMessages(prev => [...prev, errorMessage]);
   }
   ```

### UI Components Interaction

1. **WelcomeScreen** (when `messages.length === 0`)
   - Displays welcome message
   - Shows suggested questions
   - On click: Calls `handleSend(suggestion)`

2. **ChatMessage** (for each message)
   - Renders user/bot messages
   - Displays markdown content
   - Shows source citations (bot only)
   - Shows language tag (bot only)

3. **ChatInput**
   - Text input with send button
   - Enter key to send
   - Disabled during loading
   - Mic icon (placeholder for future voice feature)

4. **TypingIndicator** (when `isLoading === true`)
   - Animated dots
   - Shows bot is processing

### Auto-Scroll Behavior

```javascript
useEffect(() => {
  scrollToBottom();
}, [messages, isLoading]);
```
- Automatically scrolls to bottom when new messages arrive
- Smooth scroll animation

---

## Error Handling Workflows

### Backend Error Handling

1. **RAG Chain Not Initialized**
   ```python
   if not qa_chain:
       raise HTTPException(status_code=503, detail="RAG chain not initialized")
   ```

2. **Translation Errors**
   ```python
   except Exception as e:
       print(f"Translation failed: {e}")
       return text  # Return original text
   ```

3. **General Errors**
   ```python
   except Exception as e:
       print(f"Error: {e}")
       raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")
   ```

### Frontend Error Handling

1. **API Connection Errors**
   ```javascript
   catch (error) {
     const errorMessage = {
       role: 'bot',
       content: "Unable to connect to server..."
     };
   }
   ```

2. **Empty Query Prevention**
   ```javascript
   if (!query.trim()) return;  // Don't send empty queries
   ```

---

## Performance Considerations

### Optimization Strategies

1. **Vector Database**: Persistent storage avoids re-ingestion
2. **Embedding Caching**: Embeddings generated once during ingestion
3. **Retrieval Limit**: Only top 3 chunks retrieved (configurable)
4. **LLM Caching**: Consider implementing response caching for common queries

### Bottlenecks

1. **LLM Inference**: Slowest component (~2-5 seconds per query)
2. **Translation API**: External API calls add latency
3. **Vector Search**: Fast but scales with database size

---

## Future Workflow Enhancements

1. **Streaming Responses**: Stream LLM output token-by-token
2. **Caching Layer**: Cache frequent queries and responses
3. **Batch Processing**: Process multiple queries in parallel
4. **Async Operations**: Make translation and LLM calls async
5. **Query Preprocessing**: Expand queries with synonyms
6. **Re-ranking**: Re-rank retrieved chunks for better relevance

