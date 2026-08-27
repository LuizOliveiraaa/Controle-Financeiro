# Controle-Financeiro - Backend (Auth)

This branch adds a minimal authentication backend scaffold using Flask, SQLAlchemy and JWT.

Getting started (development):

1. Create a virtual environment and install requirements:
   python -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt

2. Copy .env.example to .env and adjust variables if needed.

3. Run the app (uses sqlite by default for quick dev):
   python backend/run.py

Endpoints:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

Notes:
- This is an initial implementation focusing on auth models and endpoints.
- In production, configure DATABASE_URL, enable COOKIE_SECURE=1, and set strong secrets.
