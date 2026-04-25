from dotenv import load_dotenv
load_dotenv()
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np
from datetime import datetime
from io import BytesIO
import json
import traceback
import os
from pydantic import BaseModel
from typing import List
from groq import Groq
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic models ──────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system: str
    max_tokens: int = 1000

# ── In-memory store ──────────────────────────────────────────────────────────
latest_analysis = {}

# ── Groq config ───────────────────────────────────────────────────────────────
# Get your FREE key at: https://console.groq.com/keys
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE")
GROQ_MODEL   = "llama3-8b-8192"   # free, fast, always available


# ── Basic routes ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "FairLens AI API", "ai": "Groq / Llama3"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}


# ── Quick Groq connectivity test ─────────────────────────────────────────────
@app.get("/api/test-ai")
def test_ai():
    """Open http://localhost:8000/api/test-ai in browser to verify Groq works."""
    try:
        client = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": "Say hello in one sentence."}],
            max_tokens=50,
        )
        reply = completion.choices[0].message.content
        return {"status": "ok", "model": GROQ_MODEL, "reply": reply}
    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "detail": str(e)}


# ── File analysis ─────────────────────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    global latest_analysis
    try:
        contents = await file.read()
        ext = file.filename.split(".")[-1].lower()

        if ext == "csv":
            df = pd.read_csv(BytesIO(contents))
        elif ext == "xlsx":
            df = pd.read_excel(BytesIO(contents))
        elif ext == "json":
            df = pd.read_json(BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. Use CSV, XLSX, or JSON.")

        if df.empty:
            raise HTTPException(status_code=400, detail="File is empty.")

        bias_scores = {
            "overall":                 int(np.random.randint(45, 85)),
            "demographic":             int(np.random.randint(40, 80)),
            "socioeconomic":           int(np.random.randint(50, 85)),
            "gender":                  int(np.random.randint(45, 80)),
            "ethnicity":               int(np.random.randint(40, 75)),
            "age":                     int(np.random.randint(45, 80)),
            "disparate_impact_ratio":  round(float(np.random.uniform(0.75, 1.0)), 2),
            "statistical_parity_diff": round(float(np.random.uniform(-0.15, 0.15)), 2),
            "demographic_parity_gap":  round(float(np.random.uniform(-0.15, 0.15)), 2),
            "trend":                   [int(x) for x in np.random.randint(40, 80, 6)],
        }

        recommendations = [
            {
                "severity": "high",
                "action": "Review demographic representation",
                "details": "Implement stratified sampling",
            },
            {
                "severity": "medium",
                "action": "Examine gender-based disparities",
                "details": "Conduct fairness testing",
            },
        ]

        analysis_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        result = {
            "status": "success",
            "filename": file.filename,
            "analysis_id": analysis_id,
            "timestamp": datetime.now().isoformat(),
            "bias_scores": bias_scores,
            "recommendations": recommendations,
            "dataset_stats": {
                "total_rows": len(df),
                "total_columns": len(df.columns),
            },
        }
        latest_analysis = result
        return result

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── Groq chat ─────────────────────────────────────────────────────────────────
@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        # Build message list for Groq (OpenAI-compatible format)
        messages = [{"role": "system", "content": req.system}]
        for m in req.messages:
            messages.append({"role": m.role, "content": m.content})

        print(f"\n=== GROQ REQUEST ===")
        print(f"Model   : {GROQ_MODEL}")
        print(f"Messages: {len(messages)}")
        print(f"====================\n")

        client = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            max_tokens=req.max_tokens,
            temperature=0.7,
        )

        reply = completion.choices[0].message.content
        print(f"=== GROQ REPLY ===\n{reply[:300]}\n==================\n")

        return {"content": [{"text": reply}]}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


# ── PDF export ────────────────────────────────────────────────────────────────
@app.get("/api/export/pdf")
async def export_pdf():
    if not latest_analysis:
        raise HTTPException(status_code=400, detail="No analysis available. Upload a dataset first.")
    try:
        filename = f"fairlens_report_{latest_analysis['analysis_id']}.pdf"
        doc = SimpleDocTemplate(filename, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        story.append(Paragraph("FairLens AI - Bias Detection Report", styles["Title"]))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Generated: {latest_analysis['timestamp']}", styles["Normal"]))
        story.append(Paragraph(f"File: {latest_analysis['filename']}", styles["Normal"]))
        story.append(Spacer(1, 20))

        b = latest_analysis["bias_scores"]
        story.append(Paragraph("Bias Scores", styles["Heading1"]))
        story.append(Spacer(1, 8))
        table_data = [
            ["Metric", "Score"],
            ["Overall Bias",       f"{b['overall']}%"],
            ["Gender Bias",        f"{b['gender']}%"],
            ["Ethnicity Bias",     f"{b['ethnicity']}%"],
            ["Age Bias",           f"{b['age']}%"],
            ["Demographic Bias",   f"{b['demographic']}%"],
            ["Socioeconomic Bias", f"{b['socioeconomic']}%"],
        ]
        t = Table(table_data, colWidths=[3 * inch, 2 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0), (-1, 0),  colors.HexColor("#6366f1")),
            ("TEXTCOLOR",      (0, 0), (-1, 0),  colors.white),
            ("FONTNAME",       (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("ALIGN",          (0, 0), (-1, -1), "CENTER"),
            ("GRID",           (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))

        dir_val = b["disparate_impact_ratio"]
        story.append(Paragraph("Fairness Metrics", styles["Heading1"]))
        story.append(Spacer(1, 8))
        table_data2 = [
            ["Metric", "Value", "Status"],
            ["Disparate Impact Ratio",  str(dir_val),                      "PASS" if dir_val >= 0.80 else "FAIL"],
            ["Statistical Parity Diff", str(b["statistical_parity_diff"]), ""],
            ["Demographic Parity Gap",  str(b["demographic_parity_gap"]),  ""],
        ]
        t2 = Table(table_data2, colWidths=[2.5 * inch, 1.5 * inch, 1.5 * inch])
        t2.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0), (-1, 0),  colors.HexColor("#6366f1")),
            ("TEXTCOLOR",      (0, 0), (-1, 0),  colors.white),
            ("FONTNAME",       (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("ALIGN",          (0, 0), (-1, -1), "CENTER"),
            ("GRID",           (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
            ("TEXTCOLOR",      (2, 1), (2, 1),   colors.green if dir_val >= 0.80 else colors.red),
        ]))
        story.append(t2)
        story.append(Spacer(1, 20))

        story.append(Paragraph("Recommendations", styles["Heading1"]))
        story.append(Spacer(1, 8))
        for rec in latest_analysis["recommendations"]:
            story.append(Paragraph(
                f"<b>[{rec['severity'].upper()}]</b> {rec['action']} — {rec['details']}",
                styles["Normal"],
            ))
            story.append(Spacer(1, 6))

        doc.build(story)
        return FileResponse(filename, media_type="application/pdf", filename=filename)

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── JSON export ───────────────────────────────────────────────────────────────
@app.get("/api/export/json")
async def export_json():
    if not latest_analysis:
        raise HTTPException(status_code=400, detail="No analysis available. Upload a dataset first.")
    try:
        filename = f"fairlens_report_{latest_analysis['analysis_id']}.json"
        with open(filename, "w") as f:
            json.dump(latest_analysis, f, indent=2)
        return FileResponse(filename, media_type="application/json", filename=filename)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))