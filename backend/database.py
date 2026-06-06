import sqlite3
import json
import os
from datetime import datetime
from contextlib import closing

DB_PATH = os.path.join(os.path.dirname(__file__), "fairlens.db")

def init_db():
    with closing(sqlite3.connect(DB_PATH)) as conn:
        with conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS analyses (
                    id TEXT PRIMARY KEY,
                    filename TEXT,
                    timestamp TEXT,
                    overall_score REAL,
                    eeoc_pass BOOLEAN,
                    data TEXT
                )
            ''')

def save_analysis(analysis_id: str, analysis_data: dict):
    filename = analysis_data.get("filename", "")
    timestamp = analysis_data.get("timestamp", datetime.now().isoformat())
    
    bias_scores = analysis_data.get("bias_scores", {})
    overall_score = bias_scores.get("overall")
    eeoc_pass = analysis_data.get("eeoc_pass")
    
    data_json = json.dumps(analysis_data)
    
    with closing(sqlite3.connect(DB_PATH)) as conn:
        with conn:
            conn.execute('''
                INSERT OR REPLACE INTO analyses (id, filename, timestamp, overall_score, eeoc_pass, data)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (analysis_id, filename, timestamp, overall_score, eeoc_pass, data_json))

def get_all_analyses_summaries() -> list:
    with closing(sqlite3.connect(DB_PATH)) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, filename, timestamp, overall_score, eeoc_pass 
            FROM analyses 
            ORDER BY timestamp DESC
        ''')
        rows = cursor.fetchall()
        
    summaries = []
    for row in rows:
        summaries.append({
            "analysis_id": row[0],
            "filename": row[1],
            "timestamp": row[2],
            "overall_score": row[3],
            "eeoc_pass": bool(row[4]) if row[4] is not None else None
        })
    return summaries

def get_analysis_by_id(analysis_id: str) -> dict:
    with closing(sqlite3.connect(DB_PATH)) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT data FROM analyses WHERE id = ?', (analysis_id,))
        row = cursor.fetchone()
        
    if row:
        return json.loads(row[0])
    return None
