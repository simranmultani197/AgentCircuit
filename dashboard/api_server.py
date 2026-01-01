from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import os
from contextlib import contextmanager

app = FastAPI()

# Enable CORS for localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "../.air_os/traces.db"

def get_db_path():
    # If running from dashboard/ directory, it's ../
    # If running from root, it's .air_os/traces.db
    # We assume usage via 'air-os dashboard' which likely runs from root but spawns process?
    # Or we just try both.
    if os.path.exists(".air_os/traces.db"):
        return ".air_os/traces.db"
    elif os.path.exists("../.air_os/traces.db"):
        return "../.air_os/traces.db"
    return ".air_os/traces.db"

@contextmanager
def get_db():
    path = get_db_path()
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

@app.get("/api/traces")
def get_traces(limit: int = 100, offset: int = 0):
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM traces ORDER BY id DESC LIMIT ? OFFSET ?", (limit, offset)
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

@app.get("/api/stats")
def get_stats():
    with get_db() as conn:
        total_runs = conn.execute("SELECT COUNT(*) FROM traces").fetchone()[0]
        repaired = conn.execute("SELECT COUNT(*) FROM traces WHERE status = 'repaired'").fetchone()[0]
        failed = conn.execute("SELECT COUNT(*) FROM traces WHERE status LIKE 'failed%'").fetchone()[0]
        
        return {
            "total_runs": total_runs,
            "repaired": repaired,
            "failed": failed,
            "success": total_runs - repaired - failed
        }

@app.get("/api/stats/savings")
def get_savings_stats():
    with get_db() as conn:
        # Total Money Saved
        total_saved = conn.execute("SELECT SUM(saved_cost) FROM traces").fetchone()[0] or 0.0
        
        # Failures Prevented
        failures_prevented = conn.execute("SELECT COUNT(*) FROM traces WHERE status = 'repaired'").fetchone()[0]
        
        # Loops Killed
        loops_killed = conn.execute("SELECT COUNT(*) FROM traces WHERE status = 'failed_loop'").fetchone()[0]
        
        # Total Spend (for ROI)
        total_spend = conn.execute("SELECT SUM(estimated_cost) FROM traces").fetchone()[0] or 0.0
        
        # ROI Multiplier
        # Avoid division by zero
        roi = (total_saved / total_spend) if total_spend > 0 else 0.0
        
        return {
            "total_money_saved": total_saved,
            "failures_prevented": failures_prevented,
            "loops_killed": loops_killed,
            "roi_multiplier": round(roi, 2)
        }

if __name__ == "__main__":
    import uvicorn
    # If running directly file
    uvicorn.run(app, host="0.0.0.0", port=8000)
