# FairLens AI — Bias Detection Platform

An enterprise-grade AI bias detection platform for hiring, loans, scholarships, and any automated decision system. Powered by **Groq / Llama 3**.

---

## 🚀 Quick Start

### Prerequisites
- [Python 3.10+](https://python.org/downloads)
- [Node.js 18+](https://nodejs.org)
- [Git](https://git-scm.com)
- Free Gemini API key → (aistudio.google.com) {Mandatory Google tool used as a qualification rule}
- Free Groq API key → [console.groq.com/keys](https://console.groq.com/keys) 

Note on Gemini API: The Google Gemini free tier has zero quota (limit: 0) for Indian IP addresses due to regional restrictions. The app is fully built and integrated with the google-generativeai SDK and uses gemini-2.0-flash as the primary model. A Groq/Llama fallback is included so the app remains functional during development. On deployment (non-Indian server), Gemini works as the primary AI.
---

## ⚙️ Setup (First Time Only)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/fairlens.git
cd fairlens
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Add your Gemini\Groq API Key
Open `backend/app.py` and find this line:
```python
GEMINI_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
```
Replace it with your key from (aistudio.google.com) \ (https://console.groq.com/keys) 


### 4. Start the Backend
```bash
# Make sure you're in the backend folder with venv activated
uvicorn app:app --reload --port 8000
```
Backend runs at → http://localhost:8000

### 5. Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at → http://localhost:5173

---

## ✅ Verify Everything Works

- Backend health: http://localhost:8000/api/health
- AI test: http://localhost:8000/api/test-ai
- Frontend: http://localhost:5173

---

## 📁 Project Structure

```
fairlens/
├── backend/
│   ├── app.py              # FastAPI backend + Groq AI chat
│   ├── requirements.txt    # Python dependencies
│   └── venv/               # Virtual environment (not in git)
├── frontend/
│   ├── src/
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── FairLensChat.jsx# AI chat component
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔄 Every Time You Want to Run It

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux
uvicorn app:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open → http://localhost:5173

---

## 🤖 How AI Models work

- User sends message
        ↓
Is GEMINI_API_KEY set?
        ↓
   YES → Try Gemini 2.0 Flash (Google AI)
        ↓ (if quota error / region blocked)
   FALLBACK → Groq Llama 3.1 8B Instant
        ↓
   Response sent to user

## 🛠️ Tech Stack
- **Frontend**: React + Vite + Recharts + Framer Motion
- **Backend**: FastAPI + Python
- **AI**: Gemini 2.0 Flash (Google AI) \ (if error) Groq (Llama 3.1)
- **PDF Export**: ReportLab

---

✅ Google AI Integration
This project uses the official google-generativeai Python SDK:
 pythonimport google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)
 model = genai.GenerativeModel("gemini-2.0-flash")
 response = model.generate_content(prompt)
 The chat assistant uses Gemini to:

Explain bias scores in plain English
 Answer EEOC compliance questions
 Give actionable recommendations based on audit results

---

## ⚠️ Important Notes
- Each person needs their own free API key 
- Gemini free tier may have regional restrictions — Groq fallback ensures the app works.