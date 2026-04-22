import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "chatbot.db"

def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Users Table (Same as before)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_id TEXT UNIQUE,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            picture TEXT,
            password_hash TEXT,
            is_verified BOOLEAN DEFAULT 0
        )
    """)
    
    # 2. OTPs Table (Added 'purpose')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS otps (
            email TEXT,
            otp_code TEXT NOT NULL,
            purpose TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            PRIMARY KEY (email, purpose)
        )
    """)

    # 3. Secure Tokens for Setting Passwords
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS verification_tokens (
            email TEXT PRIMARY KEY,
            token TEXT NOT NULL,
            expires_at DATETIME NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()
    print(f"Database initialized with Advanced Auth schema at: {DB_PATH}")

init_db()