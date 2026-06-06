from dotenv import load_dotenv
load_dotenv()
import os
import tempfile
import traceback
import json
import uuid
from datetime import datetime
from io import BytesIO
from typing import List, Optional, Dict

import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.background import BackgroundTask
from pydantic import BaseModel
from groq import Groq
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import google.generativeai as genai
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from fairness_engine import FairLensAuditor, analyze_fairness
from llm_profiler import profile_dataset_with_llm, generate_executive_summary

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / response models ────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system: str
    context_data: Optional[Dict] = None
    max_tokens: int = 1000

from database import init_db, save_analysis, get_all_analyses_summaries, get_analysis_by_id

# Initialize database
init_db()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.1-8b-instant"


# ── Helper: map FairLensAuditor output → frontend format ─────────────────────
def format_for_frontend(audit_result: dict, filename: str, analysis_id: str) -> dict:
    """
    Map the output of FairLensAuditor.run_active_mitigation() to the JSON
    shape that the React frontend expects.
    """
    original = audit_result.get("original", {})
    mitigated = audit_result.get("mitigated", {})
    scan = audit_result.get("protected_attribute_scan", [])

    # Derive per-attribute scores from the protected_attribute_scan
    attr_scores = {}
    for entry in scan:
        attr_name = entry.get("attribute", "").lower()
        # Score is fairness score (0-100, higher = fairer)
        # Convert to bias score: 100 - fairness
        fairness = entry.get("score", None)
        if fairness is not None:
            attr_scores[attr_name] = 100 - fairness

    overall_fairness = original.get("score")
    overall_bias = (100 - overall_fairness) if overall_fairness is not None else None

    di_ratio = original.get("di_ratio")
    spd = original.get("statistical_parity_difference")
    dpg = original.get("demographic_parity_gap")

    # Build column_bias list from scan
    column_bias = []
    for entry in scan:
        column_bias.append({
            "column": entry.get("attribute", ""),
            "attribute": entry.get("attribute", "").lower(),
            "bias_score": (100 - entry["score"]) if entry.get("score") is not None else None,
            "highest_selection_group": entry.get("highest_selection_group"),
            "lowest_selection_group": entry.get("lowest_selection_group"),
            "di_ratio": entry.get("di_ratio"),
            "severity": entry.get("severity"),
        })

    dataset_summary = audit_result.get("dataset_summary", {})
    outcome_col = dataset_summary.get("target_attribute")
    protected_attrs = [e.get("attribute", "").lower() for e in scan]

    # Build recommendations in the frontend's expected [{severity, action, details}] shape
    raw_recs = audit_result.get("recommendations", [])
    formatted_recs = []
    alerts = audit_result.get("alerts", [])
    # Engine recommendations are plain strings – convert to structured format
    for i, rec in enumerate(raw_recs):
        if isinstance(rec, dict):
            formatted_recs.append(rec)
        else:
            severity = "high" if i == 0 else ("medium" if i < 3 else "low")
            formatted_recs.append({
                "severity": severity,
                "action": str(rec),
                "details": str(rec),
            })
    # Append alert-based recommendations
    for alert in alerts:
        if "EEOC" in str(alert) or "Disparate Impact" in str(alert):
            formatted_recs.insert(0, {
                "severity": "high",
                "action": "EEOC compliance risk detected",
                "details": str(alert),
            })

    bias_scores = {
        "overall": overall_bias,
        "demographic": attr_scores.get("demographic", attr_scores.get("region", None)),
        "socioeconomic": attr_scores.get("socioeconomic", attr_scores.get("income", None)),
        "gender": attr_scores.get("gender", attr_scores.get("sex", None)),
        "ethnicity": attr_scores.get("ethnicity", attr_scores.get("race", None)),
        "age": attr_scores.get("age", None),
        "disparate_impact_ratio": di_ratio,
        "statistical_parity_diff": spd,
        "demographic_parity_gap": dpg,
        "protected_attributes": protected_attrs,
        "column_bias": column_bias,
        "intersectional_bias": audit_result.get("intersectional_bias_scan", []),
        "outcome_column": outcome_col,
        # Include before/after mitigation data directly
        "original": original,
        "mitigated": mitigated,
        "shap_values": audit_result.get("shap_values", []),
        "proxy_detected": audit_result.get("proxy_detected"),
        "what_if": audit_result.get("what_if"),
        "alerts": alerts,
        "dataset_quality": audit_result.get("dataset_quality"),
    }

    eeoc_pass = di_ratio >= 0.80 if di_ratio is not None else None

    result = {
        "status": "success",
        "filename": filename,
        "analysis_id": analysis_id,
        "timestamp": datetime.now().isoformat(),
        "bias_scores": bias_scores,
        "recommendations": formatted_recs[:6],
        "dataset_stats": {
            "total_rows": dataset_summary.get("rows", 0),
            "total_columns": dataset_summary.get("columns", 0),
        },
        "eeoc_pass": eeoc_pass,
    }
    return result


# ── Routes ────────────────────────────────────────────────────────────────────


@app.get("/api/health")
def health():
    return {"status": "healthy"}

@app.get("/api/test-ai")
def test_ai():
    try:
        client = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": "Say hello in one sentence."}],
            max_tokens=50,
        )
        return {"status": "ok", "model": GROQ_MODEL, "reply": completion.choices[0].message.content}
    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "detail": str(e)}


# ── GET /api/analyses ─────────────────────────────────────────────────────────
@app.get("/api/analyses")
def list_analyses():
    """Return a list of all past analyses."""
    return get_all_analyses_summaries()


# ── GET /api/sample-data ──────────────────────────────────────────────────────
@app.get("/api/sample-data")
def get_sample_data():
    """Returns analysis of a built-in sample hiring dataset using FairLensAuditor."""
    try:
        np.random.seed(42)
        n = 200
        # Create sample data with a STRONG proxy relationship
        # 1. Base demographics
        genders = np.random.choice(["Male", "Female", "Non-binary"], n, p=[0.6, 0.35, 0.05])
        
        # 2. Income is a STRONG proxy for gender in this biased dataset
        incomes = []
        for g in genders:
            if g == "Male":
                incomes.append(np.random.randint(70000, 150000))
            elif g == "Female":
                incomes.append(np.random.randint(30000, 80000))
            else:
                incomes.append(np.random.randint(40000, 90000))
                
        # 3. Hiring decision is based heavily on income (the proxy), creating disparate impact
        hired = []
        for inc in incomes:
            prob = 0.8 if inc > 75000 else 0.2
            hired.append(np.random.choice([1, 0], p=[prob, 1 - prob]))

        sample_df = pd.DataFrame({
            "name": [f"Person_{i}" for i in range(n)],
            "gender": genders,
            "age": np.random.randint(22, 60, n),
            "ethnicity": np.random.choice(["White", "Asian", "Black", "Hispanic", "Other"], n, p=[0.5, 0.2, 0.15, 0.1, 0.05]),
            "income": incomes,
            "hired": hired,
        })

        analysis_id = f"sample_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        sample_df.to_csv(os.path.join(UPLOAD_DIR, f"{analysis_id}.csv"), index=False)

        auditor = FairLensAuditor(sample_df, protected_attr="gender", target_attr="hired")
        audit_result = auditor.run_active_mitigation()

        result = format_for_frontend(audit_result, "sample_hiring_data.csv", analysis_id)
        result["is_sample"] = True

        save_analysis(analysis_id, result)
        return result
    except ValueError as e:
        traceback.print_exc()
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /api/preview ─────────────────────────────────────────────────────────
@app.post("/api/preview")
async def preview_file(file: UploadFile = File(...)):
    """Read a file and return column metadata + first 5 rows for the user to pick columns."""
    try:
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File too large.")

        ext = file.filename.split(".")[-1].lower() if file.filename else ""
        if ext == "csv":
            df = pd.read_csv(BytesIO(contents))
        elif ext == "xlsx":
            df = pd.read_excel(BytesIO(contents))
        elif ext == "json":
            df = pd.read_json(BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type.")

        if df.empty:
            raise HTTPException(status_code=400, detail="File is empty.")

        # Save file temporarily so /api/analyze can use it later
        preview_id = f"preview_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        df.to_csv(os.path.join(UPLOAD_DIR, f"{preview_id}.csv"), index=False)

        # Detect column types
        columns = []
        for col in df.columns:
            nunique = int(df[col].nunique(dropna=True))
            dtype = str(df[col].dtype)
            is_numeric = df[col].dtype.kind in ('i', 'f', 'b')
            is_binary = nunique == 2
            is_categorical = nunique <= 10 and not is_numeric
            
            # Smart suggestions
            suggested_role = None
            col_lower = col.lower().replace('_', ' ').replace('-', ' ')
            
            # Detect likely target columns
            target_keywords = ['hired', 'selected', 'approved', 'accepted', 'admitted', 'passed',
                             'outcome', 'result', 'decision', 'target', 'label', 'default', 'churn']
            protected_keywords = ['gender', 'sex', 'race', 'ethnicity', 'religion', 'age',
                                'disability', 'nationality', 'marital', 'orientation']
            
            if any(kw in col_lower for kw in target_keywords) and is_binary:
                suggested_role = 'target'
            elif any(kw in col_lower for kw in protected_keywords):
                suggested_role = 'protected'
            
            columns.append({
                "name": col,
                "dtype": dtype,
                "nunique": nunique,
                "is_numeric": is_numeric,
                "is_binary": is_binary,
                "is_categorical": is_categorical,
                "sample_values": [str(v) for v in df[col].dropna().head(3).tolist()],
                "null_count": int(df[col].isnull().sum()),
                "suggested_role": suggested_role,
            })

        # First 5 rows as list of dicts
        preview_rows = df.head(5).fillna("—").astype(str).to_dict(orient="records")

        return {
            "preview_id": preview_id,
            "filename": file.filename,
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": columns,
            "preview_rows": preview_rows,
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /api/analyze ─────────────────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    """Direct file upload analysis with LLM auto-detection."""
    try:
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="File too large.")

        ext = file.filename.split(".")[-1].lower() if file.filename else ""
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

        analysis_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        df.to_csv(os.path.join(UPLOAD_DIR, f"{analysis_id}.csv"), index=False)

        profile = profile_dataset_with_llm(df)
        target_attr = profile.get("target") or "selection"
        protected_attr = profile.get("protected") or "gender"
        print(f"LLM Profiling Output: Target='{target_attr}', Protected='{protected_attr}'")

        audit_result = analyze_fairness(df, target_attr=target_attr, protected_attr=protected_attr)
        result = format_for_frontend(audit_result, file.filename, analysis_id)
        save_analysis(analysis_id, result)
        return result

    except HTTPException:
        raise
    except ValueError as e:
        traceback.print_exc()
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


class AnalyzePreviewRequest(BaseModel):
    preview_id: str
    target_column: str
    protected_column: str

@app.post("/api/analyze-preview")
def analyze_from_preview(req: AnalyzePreviewRequest):
    """Analyze from a previously previewed file with user-selected columns."""
    try:
        csv_path = os.path.join(UPLOAD_DIR, f"{req.preview_id}.csv")
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail="Preview data expired. Please re-upload.")
        
        df = pd.read_csv(csv_path)
        if df.empty:
            raise HTTPException(status_code=400, detail="File is empty.")

        analysis_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        df.to_csv(os.path.join(UPLOAD_DIR, f"{analysis_id}.csv"), index=False)

        print(f"User-selected columns: Target='{req.target_column}', Protected='{req.protected_column}'")
        audit_result = analyze_fairness(df, target_attr=req.target_column, protected_attr=req.protected_column)
        result = format_for_frontend(audit_result, f"{req.preview_id}.csv", analysis_id)
        save_analysis(analysis_id, result)
        return result

    except HTTPException:
        raise
    except ValueError as e:
        traceback.print_exc()
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


class InteractiveRequest(BaseModel):
    analysis_id: str
    proxy_feature: str

@app.post("/api/mitigate-interactive")
def mitigate_interactive(req: InteractiveRequest):
    try:
        csv_path = os.path.join(UPLOAD_DIR, f"{req.analysis_id}.csv")
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail="Original dataset not found for interactive tuning. Please re-upload.")
            
        # Get the previous metadata
        analysis_data = get_analysis_by_id(req.analysis_id)
        if not analysis_data:
            raise HTTPException(status_code=404, detail="Analysis record not found.")
            
        target_attr = analysis_data.get("bias_scores", {}).get("outcome_column", "selection")
        protected_attrs = analysis_data.get("bias_scores", {}).get("protected_attributes", ["gender"])
        protected_attr = protected_attrs[0] if protected_attrs else "gender"
        
        df = pd.read_csv(csv_path)
        auditor = FairLensAuditor(df, protected_attr=protected_attr, target_attr=target_attr)
        
        # Run mitigation with the forced proxy
        audit_result = auditor.run_active_mitigation(force_proxy=req.proxy_feature)
        
        result = format_for_frontend(audit_result, analysis_data.get("filename", "Interactive"), req.analysis_id)
        
        # Update the database
        save_analysis(req.analysis_id, result)
        return result
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /api/chat ────────────────────────────────────────────────────────────
@app.post("/api/chat")
def chat(req: ChatRequest):
    if GEMINI_API_KEY:
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.0-flash")
            context_str = ""
            if req.context_data:
                context_str = "\n\n=== CURRENT AUDIT CONTEXT ===\n" + json.dumps(req.context_data, indent=2) + "\n=============================\n\n"
            
            full_prompt = req.system + context_str + "\n\n"
            for m in req.messages:
                full_prompt += f"{m.role}: {m.content}\n"
            response = model.generate_content(full_prompt)
            return {"content": [{"text": response.text}]}
        except Exception as e:
            print(f"Gemini failed, falling back to Groq: {e}")

    client = Groq(api_key=GROQ_API_KEY)
    context_str = ""
    if req.context_data:
        context_str = "\n\n=== CURRENT AUDIT CONTEXT ===\n" + json.dumps(req.context_data, indent=2) + "\n=============================\n"
    
    messages = [{"role": "system", "content": req.system + context_str}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        max_tokens=req.max_tokens,
        temperature=0.7,
    )
    return {"content": [{"text": completion.choices[0].message.content}]}


# ── GET /api/export/pdf/{analysis_id} ─────────────────────────────────────────
@app.get("/api/export/pdf/{analysis_id}")
async def export_pdf(analysis_id: str):
    analysis = get_analysis_by_id(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")

    tmp_path = None
    try:
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf", prefix="fairlens_cert_")
        os.close(tmp_fd)

        doc = SimpleDocTemplate(tmp_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'TitleStyle', parent=styles['Heading1'], fontSize=22, textColor=colors.HexColor("#1e293b"), alignment=1, spaceAfter=20
        )
        subtitle_style = ParagraphStyle(
            'Subtitle', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor("#64748b"), alignment=1, spaceAfter=30
        )
        section_style = ParagraphStyle(
            'Section', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor("#3b82f6"), spaceBefore=20, spaceAfter=10
        )
        
        story = []
        
        # 1. Header / Title
        story.append(Paragraph("<b>FairLens AI Fairness & Compliance Certificate</b>", title_style))
        story.append(Paragraph(f"Analysis ID: {analysis_id} | Date: {analysis['timestamp'][:10]} | Dataset: {analysis.get('filename', 'N/A')}", subtitle_style))
        story.append(Spacer(1, 10))

        b = analysis.get("bias_scores", {})
        dir_val = b.get("disparate_impact_ratio")
        is_compliant = dir_val is not None and dir_val >= 0.80
        
        # 2. EEOC Compliance Verdict Box
        verdict_color = colors.HexColor("#22c55e") if is_compliant else colors.HexColor("#ef4444")
        verdict_text = "PASSED (EEOC Four-Fifths Rule Compliant)" if is_compliant else "FAILED (Bias Risk Detected)"
        
        verdict_data = [[Paragraph(f"<b><font color='white' size=14>COMPLIANCE STATUS: {verdict_text}</font></b>", styles["Normal"])]]
        verdict_table = Table(verdict_data, colWidths=[6.5*inch])
        verdict_table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), verdict_color),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
            ("TOPPADDING", (0,0), (-1,-1), 12),
            ("BOTTOMPADDING", (0,0), (-1,-1), 12)
        ]))
        story.append(verdict_table)
        story.append(Spacer(1, 25))

        # 3. Core Metrics Table
        story.append(Paragraph("<b>Core Fairness Metrics</b>", section_style))
        
        overall = b.get("overall")
        spd = b.get("statistical_parity_diff", "N/A")
        dpg = b.get("demographic_parity_gap", "N/A")
        
        metrics_data = [
            ["Metric", "Score / Value", "Interpretation"],
            ["Overall Bias Score", f"{overall}%" if overall is not None else "N/A", "Lower is better"],
            ["Disparate Impact Ratio", str(dir_val) if dir_val is not None else "N/A", ">= 0.80 is passing"],
            ["Demographic Parity Gap", str(dpg), "Difference in selection rates"],
        ]
        
        metrics_table = Table(metrics_data, colWidths=[2.5*inch, 1.5*inch, 2.5*inch])
        metrics_table.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0,0), (-1,0), colors.white),
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("ALIGN", (0,0), (-1,-1), "LEFT"),
            ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
            ("PADDING", (0,0), (-1,-1), 8),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 20))

        # 4. SHAP Explainability Chart
        shap_values = b.get("shap_values", [])
        if shap_values:
            story.append(Paragraph("<b>Inside the AI Brain (SHAP Explainability)</b>", section_style))
            story.append(Paragraph("The chart below illustrates the exact features driving the AI's decision-making process.", styles["Normal"]))
            story.append(Spacer(1, 10))
            
            try:
                # Sort shap values by impact
                shap_sorted = sorted(shap_values, key=lambda x: x["impact"], reverse=False)
                labels = [str(x["feature"]) for x in shap_sorted]
                impacts = [x["impact"] for x in shap_sorted]
                colors_list = ['#22c55e' if x["direction"] == 'positive' else '#ef4444' for x in shap_sorted]
                
                plt.figure(figsize=(7, 3.5))
                bars = plt.barh(labels, impacts, color=colors_list)
                plt.xlabel('SHAP Impact Weight (Absolute)')
                plt.title('Feature Importance (Red = Negative Driver, Green = Positive Driver)', fontsize=10)
                plt.tight_layout()
                
                img_data = BytesIO()
                plt.savefig(img_data, format='png', dpi=150)
                img_data.seek(0)
                plt.close()
                
                story.append(Image(img_data, width=6.5*inch, height=3.25*inch))
            except Exception as e:
                print(f"SHAP Chart failed: {e}")
        
        story.append(Spacer(1, 20))

        # 5. Executive Recommendations
        recs = analysis.get("recommendations", [])
        if recs:
            story.append(Paragraph("<b>Actionable Recommendations</b>", section_style))
            for rec in recs:
                if isinstance(rec, dict):
                    sev = rec.get("severity", "INFO").upper()
                    act = rec.get("action", "")
                    det = rec.get("details", "")
                    story.append(Paragraph(f"<b>[{sev}]</b> {act} — {det}", styles["Normal"]))
                elif isinstance(rec, str):
                    story.append(Paragraph(f"• {rec}", styles["Normal"]))
                story.append(Spacer(1, 6))

        doc.build(story)
        return FileResponse(
            tmp_path,
            media_type="application/pdf",
            filename=f"fairlens_certificate_{analysis_id}.pdf",
            background=BackgroundTask(os.remove, tmp_path),
        )
    except HTTPException:
        raise
    except Exception as e:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to generate PDF.")


# ── GET /api/export/mitigated/{analysis_id} ───────────────────────────────────
@app.get("/api/export/mitigated/{analysis_id}")
async def export_mitigated_csv(analysis_id: str, drop_column: str):
    csv_path = os.path.join(UPLOAD_DIR, f"{analysis_id}.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="Original dataset not found. Cannot export mitigated version.")
    
    try:
        df = pd.read_csv(csv_path)
        
        analysis_data = get_analysis_by_id(analysis_id)
        if not analysis_data:
            raise HTTPException(status_code=404, detail="Analysis metadata not found.")
            
        target_attr = analysis_data.get("bias_scores", {}).get("outcome_column", "selection")
        protected_attrs = analysis_data.get("bias_scores", {}).get("protected_attributes", ["gender"])
        protected_attr = protected_attrs[0] if protected_attrs else "gender"
        
        # 1. Run actual label mitigation (reweighing & calibration)
        auditor = FairLensAuditor(df, protected_attr=protected_attr, target_attr=target_attr)
        ml_df = auditor._encode_for_ml()
        
        drop_col_actual = next((c for c in df.columns if c.lower() == drop_column.lower()), None)
        mitigated_df = auditor._mitigate(ml_df, drop_col_actual)
        
        # 2. Drop the proxy feature so the user gets the completely clean dataset
        if drop_col_actual and drop_col_actual in mitigated_df.columns:
            mitigated_df = mitigated_df.drop(columns=[drop_col_actual])
            
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".csv", prefix="mitigated_")
        os.close(tmp_fd)
        mitigated_df.to_csv(tmp_path, index=False)
        
        return FileResponse(
            tmp_path,
            media_type="text/csv",
            filename=f"mitigated_{analysis_id}.csv",
            background=BackgroundTask(os.remove, tmp_path),
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /api/export/json/{analysis_id} ────────────────────────────────────────
@app.get("/api/analyses/{analysis_id}")
async def get_analysis(analysis_id: str):
    analysis = get_analysis_by_id(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
    return analysis

@app.get("/api/export/json/{analysis_id}")
async def export_json(analysis_id: str):
    analysis = get_analysis_by_id(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
    tmp_path = None
    try:
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".json", prefix="fairlens_report_")
        os.close(tmp_fd)
        with open(tmp_path, "w") as f:
            json.dump(analysis, f, indent=2, default=str)
        return FileResponse(
            tmp_path,
            media_type="application/json",
            filename=f"fairlens_report_{analysis_id}.json",
            background=BackgroundTask(os.remove, tmp_path),
        )
    except Exception as e:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ── Serve React Frontend (Single Page App) ──────────────────────────────────
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    
    # Mount root files if needed (favicon, etc)
    for item in os.listdir(STATIC_DIR):
        item_path = os.path.join(STATIC_DIR, item)
        if os.path.isfile(item_path) and item != "index.html":
            app.mount(f"/{item}", StaticFiles(directory=STATIC_DIR), name=f"root_{item}")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve index.html for SPA routing
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend build not found. Place Vite dist/ in backend/static/"}
