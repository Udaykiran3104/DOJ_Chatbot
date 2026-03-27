# backend/app/translator.py

from deep_translator import GoogleTranslator
from langdetect import detect

# ISO Codes mapping
LANG_MAP = {
    'hi': 'hindi',
    'te': 'telugu',
    'en': 'english'
}

def detect_language(text: str) -> str:
    """
    Uses langdetect to quickly identify English, Hindi, or Telugu.
    """
    try:
        lang = detect(text)
        if lang in ['hi', 'te', 'en']:
            return lang
        return 'en' # Default fallback
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