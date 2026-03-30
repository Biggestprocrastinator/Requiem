# QShield 🔐

Quantum-Proof Cryptography Scanner

## Features
- Asset Discovery (Subfinder)
- Live Host Detection (httpx)
- Port Scanning (Nmap)
- TLS Analysis (SSLyze)
- CBOM Generation
- PQC Risk Assessment
- Cyber Rating Engine

## Tech Stack
- FastAPI (Backend)
- React / HTML (Frontend)
- PostgreSQL (planned)

## Run Locally
- Frontend
```bash
cd .\qshield-backend\frontend\
npm install
npm run dev
```

- Backend
```bash
cd .\qshield-backend\
.\.venv\Scripts\activate (if venv is created else run 'python -m venv .venv' to create one)
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
