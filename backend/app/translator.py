# backend/app/translator.py

from deep_translator import GoogleTranslator
import ollama
from app.config import LLM_MODEL

# ISO Codes mapping
LANG_MAP = {
    'hi': 'hindi',
    'te': 'telugu',
    'en': 'english'
}

def detect_language_with_llm(text: str) -> str:
    """
    Uses Llama 3 to detect if the text is English, Hindi (or Romanized Hindi), 
    or Telugu (or Romanized Telugu).
    Returns 'en', 'hi', or 'te'.
    """
    prompt = f"""
    Analyze the following text and identify the language. 
    It could be English, Hindi (Devanagari or Romanized like 'kya hai'), or Telugu (Script or Romanized like 'ante enti').
    
    Text: "{text}"
    
    Return ONLY one of these three codes:
    - 'en' for English
    - 'hi' for Hindi
    - 'te' for Telugu
    
    Do not explain. Just return the code.
    """
    
    try:
        #  response = ollama.chat(model='llama3', messages=[]
        response = ollama.chat(model=LLM_MODEL, messages=[
            {'role': 'user', 'content': prompt}
        ])
        lang_code = response['message']['content'].strip().lower()
        
        # Clean up any extra characters if the LLM gets chatty
        if 'hi' in lang_code: return 'hi'
        if 'te' in lang_code: return 'te'
        return 'en'
    except Exception as e:
        print(f"Language detection failed: {e}. Defaulting to English.")
        return 'en'

def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translates Hindi/Telugu to English for the RAG chain.
    """
    if source_lang == 'en':
        return text
    
    try:
        translator = GoogleTranslator(source='auto', target='en')
        return translator.translate(text)
    except Exception as e:
        print(f"Translation to English failed: {e}")
        return text

def translate_to_native(text: str, target_lang: str) -> str:
    """
    Translates English answer back to Hindi/Telugu script.
    """
    if target_lang == 'en':
        return text
    
    try:
        translator = GoogleTranslator(source='en', target=target_lang)
        return translator.translate(text)
    except Exception as e:
        print(f"Translation to Native failed: {e}")
        return text