# FairLens AI — Bias Detection Platform

An enterprise-grade AI bias detection platform for hiring, loans, scholarships, and any automated decision system. Powered by **Groq / Llama 3**.

---

## 🚀 Quick Start

### Prerequisites
- [Python 3.10+](https://python.org/downloads)
- [Node.js 18+](https://nodejs.org)
- [Git](https://git-scm.com)
- Free Groq API key → [console.groq.com/keys](https://console.groq.com/keys)

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

### 3. Add your Groq API Key
Open `backend/app.py` and find this line:
```python
GROQ_API_KEY = "YOUR_GROQ_KEY_HERE"
```
Replace it with your key from [console.groq.com/keys](https://console.groq.com/keys)


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

## 🤖 AI Models Used
- **Chat**: Groq `llama-3.1-8b-instant` (free, fast)

## 🛠️ Tech Stack
- **Frontend**: React + Vite + Recharts + Framer Motion
- **Backend**: FastAPI + Python
- **AI**: Groq (Llama 3.1)
- **PDF Export**: ReportLab

---

## ⚠️ Important Notes
- Never commit your Groq API key to GitHub
- Each person needs their own free Groq key
- The `.env` file is gitignored for safety