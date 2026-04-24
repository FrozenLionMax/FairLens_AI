# FairLens AI - AI Fairness Audit Platform

FairLens AI detects hidden bias in automated decisions, measures fairness with audit metrics, recommends mitigation steps, and exports a PDF report.

> We are not making AI smarter.  
> We are making AI fairer.

> We are not replacing AI.  
> We are making AI accountable.

## Hackathon Use Case

Hiring Bias Detection using Adult Income-style data.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, lucide-react, Axios
- Backend: FastAPI, Pandas, NumPy, Scikit-learn, ReportLab
- ML: Logistic Regression active mitigation engine
- Fairness Reference: AIF360-inspired metric and mitigation layer ([Trusted-AI/AIF360](https://github.com/Trusted-AI/AIF360))

## Project Structure

```text
Fairlens/
├── backend/
│   ├── main.py
│   ├── fairness_engine.py
│   ├── report_gen.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
├── sample_data/
│   └── fairlens_sample_hiring.csv
└── README.md
```

## Features

- CSV upload
- Bias detection
- Fairness score
- Bias alerts
- Recommendation engine
- What-if mitigation simulator
- PDF audit report
- Before/after charts

## Fairness Metrics

- Selection Rate Difference
- Demographic Parity Gap
- Disparate Impact Ratio
- Statistical Parity Difference
- Overall Fairness Score
- Multi-Attribute Bias Scan

## AIF360 Alignment

FairLens follows the AI Fairness 360 workflow: measure bias, explain metrics, and recommend mitigation. The MVP keeps lightweight in-project implementations for hackathon deployment while referencing AIF360 concepts such as reweighing, disparate impact removal, equalized odds postprocessing, and bias scan.

## Run Locally

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`.

## API Routes

- `POST /upload-csv`
- `GET /check-bias`
- `GET /get-score`
- `GET /generate-report`
- `GET /health`

## Expected CSV

Recommended columns:

```text
gender, age, education, region, experience, income
```

FairLens also accepts common target columns such as `selection`, `selected`, `decision`, `hired`, or `final_selection`.

## Deployment

Frontend on Vercel:

```bash
cd frontend
npm run build
```

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Env var: `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

Backend on Render:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Demo Video Script

1. Problem: Automated hiring systems can hide gender bias.
2. Solution: FairLens audits decisions with fairness metrics.
3. Demo: Upload CSV or run sample audit.
4. Show bias alerts, fairness score, proxy detection, and charts.
5. Click Engage ML Mitigation and show improved score.
6. Download the PDF audit report.
7. Close with: "We are not replacing AI. We are making AI accountable."

## PPT Structure

1. Problem Statement
2. Existing Problem
3. Our Solution
4. System Architecture
5. Features
6. Tech Stack
7. Demo Screens
8. Future Scope

## Team Division

- Member 1: ML and Bias Detection
- Member 2: Backend and APIs
- Member 3: Frontend and Dashboard
- Member 4: PPT, GitHub, Demo, Deployment
