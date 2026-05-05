from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import uuid
import os
from dotenv import load_dotenv
from agents import AgentEngine
from memory import MemoryStore

load_dotenv()

app = FastAPI(title="SwarMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory_store = MemoryStore()
simulation_semaphore = asyncio.Semaphore(5)

# ─── Models ───────────────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    topic: str
    num_agents: int = 6
    num_rounds: int = 4
    context: Optional[str] = None

class SimulationResponse(BaseModel):
    simulation_id: str
    topic: str
    agents: List[dict]
    conversations: List[dict]
    report: dict
    status: str

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "SwarMind API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/simulate", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest):
    if not request.topic or len(request.topic.strip()) < 5:
        raise HTTPException(status_code=400, detail="Topic must be at least 5 characters")

    if request.num_agents < 3 or request.num_agents > 10:
        raise HTTPException(status_code=400, detail="Agents must be between 3 and 10")

    if request.num_rounds < 2 or request.num_rounds > 8:
        raise HTTPException(status_code=400, detail="Rounds must be between 2 and 8")

    async with simulation_semaphore:
        simulation_id = str(uuid.uuid4())[:8]

        engine = AgentEngine(
            topic=request.topic,
            num_agents=request.num_agents,
            num_rounds=request.num_rounds,
            context=request.context,
            memory_store=memory_store,
        )

        result = await engine.run()
        result["simulation_id"] = simulation_id

        memory_store.save_simulation(simulation_id, result)

        return result

@app.get("/api/history")
def get_history():
    return memory_store.get_all_simulations()

@app.get("/api/history/{simulation_id}")
def get_simulation(simulation_id: str):
    sim = memory_store.get_simulation(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return sim

@app.delete("/api/history/{simulation_id}")
def delete_simulation(simulation_id: str):
    success = memory_store.delete_simulation(simulation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return {"message": "Deleted successfully"}