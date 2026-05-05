import json
import os
from typing import Optional, List
from datetime import datetime

STORAGE_FILE = "simulations.json"

class MemoryStore:
    def __init__(self):
        self._data: dict = {}
        self._load()

    def _load(self):
        if os.path.exists(STORAGE_FILE):
            try:
                with open(STORAGE_FILE, "r") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = {}

    def _persist(self):
        try:
            with open(STORAGE_FILE, "w") as f:
                json.dump(self._data, f, indent=2)
        except Exception as e:
            print(f"Warning: could not persist data: {e}")

    def save_simulation(self, simulation_id: str, data: dict):
        self._data[simulation_id] = {
            **data,
            "created_at": datetime.utcnow().isoformat(),
        }
        self._persist()

    def get_simulation(self, simulation_id: str) -> Optional[dict]:
        return self._data.get(simulation_id)

    def get_all_simulations(self) -> List[dict]:
        results = []
        for sim_id, sim in self._data.items():
            results.append({
                "simulation_id": sim_id,
                "topic": sim.get("topic", ""),
                "status": sim.get("status", ""),
                "created_at": sim.get("created_at", ""),
                "num_agents": len(sim.get("agents", [])),
                "num_conversations": len(sim.get("conversations", [])),
            })
        return sorted(results, key=lambda x: x["created_at"], reverse=True)

    def delete_simulation(self, simulation_id: str) -> bool:
        if simulation_id in self._data:
            del self._data[simulation_id]
            self._persist()
            return True
        return False
