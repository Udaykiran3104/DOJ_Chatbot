# API Documentation

Complete API reference for the DoJ RAG Chatbot backend.

## Base URL

```
http://127.0.0.1:8000
```

## API Endpoints

### 1. Chat Endpoint

Send a query to the chatbot and receive an answer.

**Endpoint**: `POST /chat`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "query": "string",
  "history": [
    ["user_query_1", "bot_response_1"],
    ["user_query_2", "bot_response_2"]
  ]
}
```

**Request Schema**:
- `query` (string, required): The user's question or query
- `history` (array of tuples, optional): Conversation history as pairs of [user_query, bot_response]

**Example Request**:
```json
{
  "query": "What are my legal rights?",
  "history": []
}
```

**Response**:
```json
{
  "answer": "Based on the provided context...",
  "sources": [
    "data/doj_pdfs/legal_rights.pdf",
    "data/doj_pdfs/citizen_rights.pdf"
  ],
  "detected_language": "en"
}
```

**Response Schema**:
- `answer` (string): The generated answer (may be bilingual for non-English queries)
- `sources` (array of strings): List of source document paths
- `detected_language` (string): Language code ('en', 'hi', or 'te')

**Example Response (English Query)**:
```json
{
  "answer": "You have several fundamental legal rights including the right to equality, freedom of speech, and access to justice...",
  "sources": [
    "data/doj_pdfs/legal_rights.pdf"
  ],
  "detected_language": "en"
}
```

**Example Response (Hindi Query)**:
```json
{
  "answer": "English:\nYou have several fundamental legal rights...\n\nहिंदी:\nआपके पास कई मौलिक कानूनी अधिकार हैं...",
  "sources": [
    "data/doj_pdfs/legal_rights.pdf"
  ],
  "detected_language": "hi"
}
```

**Status Codes**:
- `200 OK`: Successful request
- `500 Internal Server Error`: Server error during processing
- `503 Service Unavailable`: RAG chain not initialized

**Error Response**:
```json
{
  "detail": "Error processing query: [error message]"
}
```

---

## Request/Response Models

### ChatRequest Model

**Location**: `backend/app/main.py`

```python
class ChatRequest(BaseModel):
    query: str
    history: List[Tuple[str, str]] = []
```

**Fields**:
- `query`: User's question (required)
- `history`: Conversation history (optional, defaults to empty list)

### ChatResponse Model

**Location**: `backend/app/main.py`

```python
class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    detected_language: str
```

**Fields**:
- `answer`: Generated answer text
- `sources`: List of source document paths
- `detected_language`: Detected language code

---

## API Workflow

### Step-by-Step Process

1. **Receive Request**
   - Validate request body using Pydantic
   - Extract `query` and `history`

2. **Language Detection**
   - Detect language using LLM
   - Returns: 'en', 'hi', or 'te'

3. **Translation (if needed)**
   - Translate non-English queries to English
   - Preserve original for response formatting

4. **RAG Processing**
   - Generate query embedding
   - Retrieve top 3 relevant document chunks
   - Generate answer using LLM with context

5. **Response Translation (if needed)**
   - Translate English answer to user's language
   - Format bilingual response

6. **Return Response**
   - Format answer with sources
   - Return JSON response

---

## Example Usage

### Using cURL

**Basic Query**:
```bash
curl -X POST "http://127.0.0.1:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are my legal rights?",
    "history": []
  }'
```

**With Conversation History**:
```bash
curl -X POST "http://127.0.0.1:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Can you tell me more about that?",
    "history": [
      ["What are my legal rights?", "You have several fundamental legal rights..."]
    ]
  }'
```

**Hindi Query**:
```bash
curl -X POST "http://127.0.0.1:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "मेरे कानूनी अधिकार क्या हैं?",
    "history": []
  }'
```

### Using Python

```python
import requests

url = "http://127.0.0.1:8000/chat"
payload = {
    "query": "What are my legal rights?",
    "history": []
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Answer: {data['answer']}")
print(f"Sources: {data['sources']}")
print(f"Language: {data['detected_language']}")
```

### Using JavaScript/React

```javascript
import axios from 'axios';

const response = await axios.post('http://127.0.0.1:8000/chat', {
  query: "What are my legal rights?",
  history: []
});

console.log(response.data.answer);
console.log(response.data.sources);
console.log(response.data.detected_language);
```

---

## Interactive API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

You can test the API directly from these pages.

---

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Frontend dev server)
- `http://127.0.0.1:5173`
- `*` (All origins - for development only)

**Location**: `backend/app/main.py`

```python
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # Allow all for development convenience
]
```

**Note**: In production, replace `"*"` with specific allowed origins.

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider implementing:
- Per-IP rate limiting
- Per-user rate limiting (if authentication is added)
- Request throttling

---

## Error Handling

### Error Response Format

All errors follow this format:
```json
{
  "detail": "Error message here"
}
```

### Common Error Scenarios

1. **RAG Chain Not Initialized** (503)
   ```json
   {
     "detail": "RAG chain not initialized"
   }
   ```
   **Solution**: Ensure backend server has completed startup.

2. **Translation Error** (500)
   ```json
   {
     "detail": "Error processing query: Translation failed"
   }
   ```
   **Solution**: Check internet connection for Google Translator API.

3. **LLM Error** (500)
   ```json
   {
     "detail": "Error processing query: Ollama connection failed"
   }
   ```
   **Solution**: Ensure Ollama is running (`ollama serve`).

4. **Validation Error** (422)
   ```json
   {
     "detail": [
       {
         "loc": ["body", "query"],
         "msg": "field required",
         "type": "value_error.missing"
       }
     ]
   }
   ```
   **Solution**: Ensure request body includes required fields.

---

## Response Time Considerations

Typical response times:
- **Language Detection**: ~1-2 seconds
- **Translation**: ~0.5-1 second
- **RAG Retrieval**: ~0.1-0.5 seconds
- **LLM Generation**: ~2-5 seconds
- **Total**: ~4-9 seconds per query

Factors affecting response time:
- LLM model size and hardware
- Number of documents in database
- Query complexity
- Network latency (for translation API)

---

## Best Practices

1. **Conversation History**
   - Include relevant conversation history for context-aware responses
   - Limit history to last 5-10 exchanges to avoid token limits

2. **Query Formatting**
   - Use clear, specific questions
   - Avoid overly long queries (>500 characters)

3. **Error Handling**
   - Always handle potential errors in client code
   - Display user-friendly error messages

4. **Rate Limiting**
   - Implement client-side rate limiting
   - Avoid sending multiple simultaneous requests

---

## Future API Enhancements

Planned features:
- [ ] Streaming responses (Server-Sent Events)
- [ ] Authentication endpoints
- [ ] Query history endpoint
- [ ] Feedback endpoint (thumbs up/down)
- [ ] Health check endpoint (`/health`)
- [ ] Metrics endpoint (`/metrics`)
- [ ] Batch query endpoint

---

## Testing the API

### Using Postman

1. Create a new POST request
2. URL: `http://127.0.0.1:8000/chat`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "query": "What are my legal rights?",
     "history": []
   }
   ```
5. Send request

### Using HTTPie

```bash
http POST http://127.0.0.1:8000/chat \
  query="What are my legal rights?" \
  history:=[]
```

### Using Python Requests

```python
import requests

response = requests.post(
    "http://127.0.0.1:8000/chat",
    json={
        "query": "What are my legal rights?",
        "history": []
    }
)

print(response.json())
```

---

## API Versioning

Currently, there is no versioning implemented. Future versions may include:
- `/v1/chat`
- `/v2/chat`

For now, all endpoints are at the root level.

---

## Security Considerations

1. **Input Validation**: All inputs are validated using Pydantic models
2. **CORS**: Configured to restrict origins (development allows all)
3. **Error Messages**: Generic error messages prevent information leakage
4. **No Authentication**: Currently no authentication required (add for production)

---

## Support

For API issues:
- Check server logs for detailed error messages
- Verify Ollama is running
- Ensure vector database is initialized
- Check network connectivity for translation API

