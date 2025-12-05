# Repository Guidelines

## Project Structure & Module Organization
- `backend/` — FastAPI app entry at `app.py` serves static assets and chat APIs; deps in `requirements.txt`; expects a `.env` next to `app.py` for runtime secrets.
- `frontend/` — Static HTML/CSS/JS. Mobile entry is `frontend/mobile/index.html` with feature pages under `pages/benefit` and `pages/service`. PC utilities live in `frontend/pc/common/js/`.
- `data/benefit_data.json` — Mock public-benefit data; treat as read-only unless a change is intentional.
- `docs/需求文档.md` — Product requirements reference.

## Build, Test, and Development Commands
- Create a virtualenv and install backend deps:
  - `cd backend && python -m venv .venv && source .venv/bin/activate` (or `.venv\\Scripts\\activate` on Windows)
  - `pip install -r requirements.txt`
- Configure secrets: create `backend/.env` with `DASHSCOPE_API_KEY=<your key>`, optionally `HOST`/`PORT` to override defaults.
- Run the dev server (serves frontend and APIs): `cd backend && source .venv/bin/activate && python app.py`.
- Quick checks: `curl http://localhost:8000/health` for availability; `curl http://localhost:8000/api/info` for metadata.
- Frontend-only preview (without backend): `cd frontend/mobile && python -m http.server 8080`.

## Coding Style & Naming Conventions
- Python: follow PEP 8 with 4-space indents; prefer type hints and docstrings as in `backend/app.py`; snake_case for functions/variables, UPPER_SNAKE for env vars.
- JavaScript: favor `const`/`let`, kebab-case file names, and helpers under `frontend/pc/common/js/`; keep inline scripts minimal inside HTML.
- HTML/CSS: keep shared colors/spacing in CSS variables; reuse existing typography/gradient patterns for consistency.

## Testing Guidelines
- No automated tests exist yet; add `pytest` cases under `backend/tests/` named `test_*.py` when changing API or service logic.
- Smoke tests: `GET /health`, `GET /api/info`, `POST /api/chat` with `{ "message": "hi" }` (needs `DASHSCOPE_API_KEY`).
- When altering static pages, validate mobile flows in `frontend/mobile/pages/benefit` and `frontend/mobile/pages/service` on a mobile viewport and re-check data fetches against `/data/benefit_data.json`.

## Commit & Pull Request Guidelines
- Git history is minimal (`init`); adopt clear, imperative messages. Conventional Commits like `feat: add benefit list filter` are welcome.
- PRs should include: summary of behavior changes, affected paths (backend/frontend/data), test evidence (commands or UI screenshots), and linked issues/task IDs when available.

## Security & Configuration Tips
- Never commit real API keys; keep `backend/.env` local and update `.gitignore` if new secret files appear.
- The chat service initializes at import time; missing `DASHSCOPE_API_KEY` will stop the app early—set it before running or guard new code accordingly.
