# backend/app/rag_chain.py

from langchain_community.llms import Ollama
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from app.config import CHROMA_DIR, EMBEDDING_MODEL, LLM_MODEL

# --- Prompts (Same as before) ---
condense_question_template = """
Given the following conversation and a follow-up question, rephrase the follow-up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:"""

CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(condense_question_template)

qa_template = """
You are a helpful, respectful, and honest legal assistant for the Department of Justice, India.
Context Information:
{context}

Current Question: {question}

Instructions:
1. Use ONLY the provided context information.
2. Do NOT start answers with "According to the context" or "Based on the documents". Just state the facts.
3. If the answer is not in the context, say: "I do not have information on that."
3. Do NOT hallucinate.
4. Simplify legal terms for a layman.
4. Keep answers concise.


Answer:"""

QA_PROMPT = PromptTemplate(
    template=qa_template, input_variables=["context", "question"]
)

def get_rag_chain():
    # 1. Load Embeddings
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    # 2. Load Existing Vector DB (No ingestion here!)
    vectordb = Chroma(
        persist_directory=str(CHROMA_DIR),
        embedding_function=embeddings
    )

    retriever = vectordb.as_retriever(search_kwargs={"k": 3})

    llm = Ollama(model=LLM_MODEL)

    # 3. Create Chain
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        condense_question_prompt=CONDENSE_QUESTION_PROMPT,
        combine_docs_chain_kwargs={"prompt": QA_PROMPT},
        return_source_documents=True,
    )

    return chain