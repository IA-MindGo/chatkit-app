# Managed ChatKit starter

Vite + React UI that talks to a FastAPI session backend for creating ChatKit
workflow sessions.

## Quick start

```bash
npm install           # installs root deps (concurrently)
npm run dev           # runs FastAPI on :8000 and Vite on :3000
```

> **Windows users**: the `dev` task now works on Windows by invoking
> `node start-backend.js`, which selects the appropriate shell script
> (`backend/scripts/run.sh` on Unix, `backend/scripts/run.bat` on
> Windows). You don't need Git Bash or WSL; just run the same commands from
> PowerShell.


What happens:

- `npm run dev` runs the backend via `backend/scripts/run.sh` (or the
  Windows batch version) and the frontend via `npm --prefix frontend run
  dev`.

  The frontend dev server proxies `/api/*` to `127.0.0.1:8000` by default,
  so ECONNREFUSED errors mean the backend isn't running or the proxy target
  is wrong (see the `VITE_API_URL` environment variable). During startup the
  backend may be momentarily unavailable, which will cause a few ECONNREFUSED
  messages in the terminal; the frontend now retries those calls automatically
  but you can still observe the errors in the logs. In the UI you will see a
  yellow “Session error” box if it cannot reach the backend at all.
- The backend exposes `/api/create-session`, exchanging your workflow id and
  `OPENAI_API_KEY` for a ChatKit client secret. The Vite dev server proxies
  `/api/*` to `127.0.0.1:8000`.

## Required environment

- `OPENAI_API_KEY`
- `VITE_CHATKIT_WORKFLOW_ID`
- (optional) `CHATKIT_API_BASE` or `VITE_CHATKIT_API_BASE` (defaults to `https://api.openai.com`)
- (optional) `VITE_API_URL` (override the dev proxy target for `/api`)

Set the env vars in your shell (or process manager) before running. Use a
workflow id from Agent Builder (starts with `wf_...`) and an API key from the
same project and organization.

## Customize

- UI: `frontend/src/components/ChatKitPanel.tsx`
- Session logic: `backend/app/main.py`
