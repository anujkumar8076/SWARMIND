# SwarMind 🧠
### AI Swarm Intelligence Simulation Engine

Deploy a swarm of AI agents with distinct personalities to debate any topic — and get a structured prediction report with insights, consensus, and confidence score.

> Built with React + Vite + FastAPI + Groq (free AI API)

---

## What It Does

1. You enter any topic or question
2. Up to 10 AI agents spawn — each with a unique role (Analyst, Critic, Visionary, Ethicist, etc.)
3. Agents debate across multiple rounds, reading and responding to each other
4. A final prediction report is generated — with key insights, consensus points, disagreements, and a confidence score
5. All results are saved and viewable in History

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast, component-based UI |
| Routing | React Router v6 | SPA navigation |
| HTTP Client | Axios | Clean API calls |
| Styling | CSS Modules | Scoped, no extra deps |
| Backend | Python + FastAPI | Async, auto Swagger docs |
| AI | Groq API (Llama 3.1) | Free, very fast |
| Persistence | JSON file | Simple, no DB needed |

---

## Folder Structure

```
swarmind/
│
├── backend/
│   ├── main.py              # FastAPI app — all routes + CORS
│   ├── agents.py            # Core engine — agent debate logic
│   ├── memory.py            # Save/load simulations to JSON
│   ├── requirements.txt     # Python packages
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js       # API proxy config
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css        # Global styles + CSS variables
│       ├── utils/
│       │   └── api.js       # All API calls
│       ├── components/
│       │   ├── Layout.jsx
│       │   └── Layout.module.css
│       └── pages/
│           ├── Home.jsx           # Landing page
│           ├── Simulate.jsx       # Config form
│           ├── Results.jsx        # Debate + report view
│           └── History.jsx        # Past simulations
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.11 | https://python.org/downloads/release/python-3119 |
| Groq API Key | Free | https://console.groq.com |

> ⚠️ Use Python **3.11** specifically. Python 3.14 breaks some packages.

---

## Getting Your Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up for a free account
3. Click **API Keys** → **Create API Key**
4. Copy the key — it looks like `gsk_xxxxxxxxxxxxxxxxxxxx`

---

## Local Setup (Windows)

### Terminal 1 — Backend

```powershell
cd swarmind\backend

# Copy env file and add your key
copy .env.example .env
notepad .env
# Set: GROQ_API_KEY=your_key_here

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# If you get a permissions error, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install dependencies
pip install -r requirements.txt

# Start backend
python -m uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
Swagger API docs: **http://localhost:8000/docs**

---

### Terminal 2 — Frontend

```powershell
cd swarmind\frontend

copy .env.example .env

npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Local Setup (Mac / Linux)

### Terminal 1 — Backend

```bash
cd swarmind/backend

cp .env.example .env
# Open .env and set: GROQ_API_KEY=your_key_here

python3.11 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Frontend

```bash
cd swarmind/frontend
cp .env.example .env
npm install
npm run dev
```

---

## Environment Variables

### `backend/.env`
```
GROQ_API_KEY=gsk_your_key_here
```

### `frontend/.env`
```
VITE_API_URL=http://localhost:8000
```

---

## API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/docs` | Swagger UI |
| POST | `/api/simulate` | Run a new simulation |
| GET | `/api/history` | List all past simulations |
| GET | `/api/history/{id}` | Get full simulation by ID |
| DELETE | `/api/history/{id}` | Delete a simulation |

### POST `/api/simulate` — Request

```json
{
  "topic": "Will AI replace software engineers by 2030?",
  "num_agents": 6,
  "num_rounds": 3,
  "context": "Optional background info or article text"
}
```

- `num_agents`: 3–10
- `num_rounds`: 2–8
- `context`: optional, paste any relevant article or data

### POST `/api/simulate` — Response

```json
{
  "simulation_id": "abc12345",
  "topic": "...",
  "agents": [...],
  "conversations": [
    {
      "agent_name": "Analyst",
      "agent_role": "Analyst",
      "round": 1,
      "message": "Based on current automation trends...",
      "agent_color": "#6366f1"
    }
  ],
  "report": {
    "summary": "...",
    "key_insights": ["..."],
    "consensus_points": ["..."],
    "disagreements": ["..."],
    "prediction": "...",
    "confidence_score": 72,
    "recommended_actions": ["..."]
  },
  "status": "completed"
}
```

---

## Agent Personas

| # | Role | Personality |
|---|---|---|
| 1 | Analyst | Data-driven, skeptical |
| 2 | Visionary | Optimistic, future-focused |
| 3 | Critic | Pessimistic, risk-focused |
| 4 | Pragmatist | Practical, solution-oriented |
| 5 | Ethicist | Values-driven, principled |
| 6 | Economist | Market and incentive focused |
| 7 | Technologist | Innovation-focused |
| 8 | Sociologist | People and culture focused |
| 9 | Historian | Pattern-seeking, contextual |
| 10 | Devil's Advocate | Contrarian, challenges ideas |

---

## Docker Deployment

```powershell
# In root swarmind/ folder
copy .env.example .env
# Add GROQ_API_KEY to .env

docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

---

## Deploy to Cloud (Free)

### Backend → Render.com

1. Go to **https://render.com** → New Web Service
2. Connect your GitHub repo
3. Configure:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add env var: `GROQ_API_KEY = your_key`
5. Deploy → copy your URL (e.g. `https://swarmind-api.onrender.com`)

### Frontend → Vercel

1. Go to **https://vercel.com** → New Project
2. Connect your GitHub repo
3. Configure:
   - Root Directory: `frontend`
   - Framework Preset: Vite
4. Add env var: `VITE_API_URL = https://swarmind-api.onrender.com`
5. Deploy → get your live URL

---

## Recommended Simulation Settings

| Use Case | Agents | Rounds |
|---|---|---|
| Quick test | 3 | 2 |
| Standard debate | 6 | 3 |
| Deep analysis | 8 | 5 |
| Full simulation | 10 | 8 |

> Start with 3 agents / 2 rounds on the free Groq tier to avoid rate limits.

---

## Common Issues & Fixes

**`uvicorn` not recognized**
```powershell
python -m uvicorn main:app --reload --port 8000
```
Always use `python -m uvicorn` on Windows.

**`venv\Scripts\Activate.ps1` permission error**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**CORS error in browser**
Make sure `main.py` has `allow_origins=["*"]` in the CORS middleware and restart the backend.

**Rate limit error from Groq**
Reduce agents to 3 and rounds to 2. Add `await asyncio.sleep(1)` between agent calls (already included in `agents.py`).

**Model decommissioned error**
Update the model in `agents.py`:
```python
self.model = "llama-3.1-8b-instant"
```

**Python not found on Windows**
- Uninstall all Python versions from Add/Remove Programs
- Install Python 3.11 from https://python.org/downloads/release/python-3119
- ✅ Check "Add python.exe to PATH" during install
- Disable Python aliases in Settings → Apps → App execution aliases

---

## Extending the Project

| Feature | How |
|---|---|
| MongoDB persistence | Swap `memory.py` JSON store with PyMongo — use your MERN skills! |
| Real-time streaming | Add WebSockets — stream agent messages as they generate |
| Custom personas | Let users define their own agent roles in the UI |
| Report PDF export | Add `reportlab` or `weasyprint` to generate downloadable PDFs |
| News auto-seeding | Integrate NewsAPI to fetch live topics |
| Agent memory | Add ChromaDB + LangChain for cross-simulation memory |

---

## Cost

Groq API is **free** with generous limits:
- Free tier: 14,400 requests/day, 500,000 tokens/minute on paid, ~6,000 tokens/minute free
- Each simulation costs 0 dollars on the free tier
- Upgrade at https://console.groq.com/settings/billing if needed

---

*SwarMind — built with React + FastAPI + Groq*