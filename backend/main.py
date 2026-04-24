import io
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from fairness_engine import analyze_fairness
from report_gen import generate_pdf


app = FastAPI(title="FairLens AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_report_data = None


@app.get("/")
def root():
    return {"name": "FairLens AI", "status": "ready"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    global latest_report_data
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a CSV file.")

    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        latest_report_data = analyze_fairness(df)
        return latest_report_data
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/check-bias")
def check_bias():
    return _require_latest()


@app.get("/get-score")
def get_score():
    data = _require_latest()
    return {
        "overall_fairness_score": data["mitigated"]["score"],
        "original_score": data["original"]["score"],
        "mitigated_score": data["mitigated"]["score"],
        "final_verdict": data["final_verdict"],
    }


@app.get("/generate-report")
def get_report():
    data = _require_latest()
    output_dir = Path(__file__).resolve().parent
    file_path = generate_pdf(data, output_dir / "FairLens_Certified_Audit.pdf")
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename="FairLens_Audit_Report.pdf",
    )


@app.get("/export-json")
def export_json():
    data = _require_latest()
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": "attachment; filename=FairLens_Audit.json"},
    )


def _require_latest():
    if latest_report_data is None:
        raise HTTPException(status_code=404, detail="Upload a dataset first.")
    return latest_report_data
