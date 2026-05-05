import asyncio
import json
import os
import re
from typing import List, Optional
from groq import AsyncGroq

PERSONA_ARCHETYPES = [
    {"role": "Analyst", "trait": "data-driven and skeptical", "style": "concise, uses numbers and evidence"},
    {"role": "Visionary", "trait": "optimistic and forward-thinking", "style": "enthusiastic, talks about possibilities"},
    {"role": "Critic", "trait": "pessimistic and risk-focused", "style": "blunt, highlights problems and flaws"},
    {"role": "Pragmatist", "trait": "practical and grounded", "style": "solution-oriented, asks 'how'"},
    {"role": "Ethicist", "trait": "values-driven and principled", "style": "thoughtful, raises moral questions"},
    {"role": "Economist", "trait": "market-focused", "style": "talks about incentives, costs, trade-offs"},
    {"role": "Technologist", "trait": "innovation-focused", "style": "excited about tools and systems"},
    {"role": "Sociologist", "trait": "people and culture focused", "style": "talks about human behavior and society"},
    {"role": "Historian", "trait": "context-aware and pattern-seeking", "style": "draws parallels to past events"},
    {"role": "Devil's Advocate", "trait": "contrarian", "style": "challenges consensus, plays devil's advocate"},
]

class AgentEngine:
    def __init__(self, topic: str, num_agents: int, num_rounds: int, context: Optional[str], memory_store):
        self.topic = topic
        self.num_agents = num_agents
        self.num_rounds = num_rounds
        self.context = context
        self.memory_store = memory_store
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"

    def _build_agents(self) -> List[dict]:
        selected = PERSONA_ARCHETYPES[:self.num_agents]
        agents = []
        for i, archetype in enumerate(selected):
            agents.append({
                "id": f"agent_{i+1}",
                "name": f"{archetype['role']}",
                "role": archetype["role"],
                "trait": archetype["trait"],
                "style": archetype["style"],
                "avatar": archetype["role"][0].upper(),
                "color": self._agent_color(i),
                "memory": [],
            })
        return agents

    def _agent_color(self, index: int) -> str:
        colors = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ef4444",
                  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16"]
        return colors[index % len(colors)]

    async def _agent_speak(self, agent: dict, round_num: int, conversation_so_far: List[dict]) -> str:
        history_text = ""
        if conversation_so_far:
            last_msgs = conversation_so_far[-6:]
            history_text = "\n".join([
                f"{m['agent_name']} ({m['agent_role']}): {m['message']}"
                for m in last_msgs
            ])

        context_block = f"\nAdditional context: {self.context}" if self.context else ""

        system_prompt = f"""You are {agent['name']}, a {agent['trait']} thinker.
Your communication style: {agent['style']}.
You are participating in a multi-agent think-tank simulation.
Topic under discussion: {agent['role']} perspective on "{self.topic}"{context_block}

Rules:
- Stay in character as {agent['name']} at all times
- Keep your response to 2-3 sentences max
- Be specific and opinionated
- Reference or respond to what others have said when relevant
- Round {round_num} of {self.num_rounds} — {'introduce your core view' if round_num == 1 else 'build on the discussion so far' if round_num < self.num_rounds else 'give your final position'}
- Do NOT start with your own name"""

        user_prompt = f"""Discussion so far:
{history_text if history_text else '(You are the first to speak)'}

Now give your response as {agent['name']}:"""

        for attempt in range(5):
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    max_tokens=150,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                if "rate_limit" in str(e).lower() or "429" in str(e):
                    wait = (attempt + 1) * 10
                    print(f"Rate limit hit, waiting {wait}s before retry {attempt + 1}/5...")
                    await asyncio.sleep(wait)
                else:
                    raise e

        return "I was unable to respond due to API limits."

    async def _generate_report(self, agents: List[dict], conversations: List[dict]) -> dict:
        full_convo = "\n".join([
            f"{m['agent_name']} ({m['agent_role']}, Round {m['round']}): {m['message']}"
            for m in conversations
        ])

        system_prompt = """You are a senior research analyst. You must respond ONLY with valid JSON — no markdown, no explanation, no backticks.
The JSON must have exactly these keys: summary, key_insights (array of strings), consensus_points (array of strings), disagreements (array of strings), prediction, confidence_score (number 0-100), recommended_actions (array of strings)"""

        user_prompt = f"""Analyze this multi-agent simulation on: "{self.topic}"

Transcript:
{full_convo}

Return ONLY a JSON object with keys: summary, key_insights, consensus_points, disagreements, prediction, confidence_score, recommended_actions"""

        response = await self.client.chat.completions.create(
            model=self.model,
            max_tokens=800,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
        )

        raw = response.choices[0].message.content.strip()
        raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE).strip()
        raw = re.sub(r"```$", "", raw, flags=re.MULTILINE).strip()

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "summary": raw[:500],
                "key_insights": ["See raw summary above"],
                "consensus_points": [],
                "disagreements": [],
                "prediction": "Unable to parse structured prediction.",
                "confidence_score": 50,
                "recommended_actions": [],
            }

    async def run(self) -> dict:
        agents = self._build_agents()
        conversations = []

        for round_num in range(1, self.num_rounds + 1):
            for agent in agents:
                message = await self._agent_speak(agent, round_num, conversations)
                await asyncio.sleep(1)
                entry = {
                    "id": f"{agent['id']}_r{round_num}",
                    "agent_id": agent["id"],
                    "agent_name": agent["name"],
                    "agent_role": agent["role"],
                    "agent_color": agent["color"],
                    "agent_avatar": agent["avatar"],
                    "round": round_num,
                    "message": message,
                }
                conversations.append(entry)
                agent["memory"].append(message)

        report = await self._generate_report(agents, conversations)

        clean_agents = [
            {k: v for k, v in a.items() if k != "memory"}
            for a in agents
        ]

        return {
            "topic": self.topic,
            "agents": clean_agents,
            "conversations": conversations,
            "report": report,
            "status": "completed",
        }