@echo off
REM Windows-friendly backend start script for Managed ChatKit

setlocal enabledelayedexpansion

REM Navigate to project root (one level up from scripts folder)
cd /d "%~dp0\.."

REM create virtual environment if missing
if not exist ".venv" (
  python -m venv .venv
)

call ".venv\Scripts\activate"

echo Installing backend deps (editable) ...
pip install -e . >nul

REM load OPENAI_API_KEY from ../.env.local if not already set
if not defined OPENAI_API_KEY if exist "..\.env.local" (
  for /f "usebackq tokens=1,2 delims==" %%A in ("..\.env.local") do (
    if /I "%%A"=="OPENAI_API_KEY" set "OPENAI_API_KEY=%%B"
  )
)

if not defined OPENAI_API_KEY (
  echo Set OPENAI_API_KEY in your environment or in .env.local before running this script.
  exit /b 1
)

echo Starting Managed ChatKit backend on http://127.0.0.1:8000 ...
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
