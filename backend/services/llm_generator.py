import os
import logging
import requests
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class LLMGenerator:
    """LLM for generating counter-arguments using HuggingFace Inference Providers"""

    def __init__(self):
        self.hf_token = os.getenv("HF_TOKEN") or settings.HF_TOKEN
        # Use HF Inference Providers (new API)
        self.api_url = "https://router.huggingface.co/v1/chat/completions"
        # Use a free model via Inference Providers with provider suffix
        self.model = "meta-llama/Llama-3.2-1B-Instruct:novita"
        self.is_available = self.hf_token is not None

    def generate_counter_argument(
        self,
        user_argument: str,
        topic: str,
        persona: str = "logical",
        user_stance: str = "support",
    ) -> Optional[str]:
        """Generate a counter-argument using LLM via Inference Providers"""

        if not self.hf_token:
            return None

        persona_prompts = {
            "logical": "You are a logical challenger. Use facts and evidence to counter arguments. Be calm and reasoned.",
            "aggressive": "You are an aggressive debater. Challenge assumptions directly and forcefully. Don't hold back.",
            "skeptical": "You are a skeptic. Question everything and demand evidence. Be probing.",
            "devil_advocate": "You are a devil's advocate. Take extreme counter-positions to test robustness of arguments.",
        }

        system_prompt = persona_prompts.get(persona, persona_prompts["logical"])

        if user_stance == "support":
            stance_context = f"The user supports: {topic}. Argue against their position with strong counter-points."
        elif user_stance == "oppose":
            stance_context = (
                f"The user opposes: {topic}. Support the user's position with evidence."
            )
        else:
            stance_context = (
                f"Debate topic: {topic}. Present a balanced counter-argument."
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Topic: {topic}\n\nUser's argument: {user_argument}\n\n{stance_context}\n\nGenerate a 2-3 sentence counter-argument that specifically addresses the user's points:",
            },
        ]

        headers = {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 150,
            "temperature": 0.7,
        }

        try:
            response = requests.post(
                self.api_url, headers=headers, json=payload, timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"].strip()
            else:
                logger.warning(
                    f"HF Inference API error: {response.status_code} - {response.text[:200]}"
                )

        except Exception as e:
            logger.warning(f"HF inference failed: {e}")

        return None

    def is_available_check(self) -> bool:
        """Check if LLM is available"""
        return self.is_available

    def quick_analyze(
        self, text: str, context: str = "", difficulty: str = "intermediate"
    ) -> Optional[Dict]:
        """Analyze argument using HuggingFace LLM"""
        if not self.hf_token:
            return None

        prompt = f"""You are a debate coach. Analyze this argument and return JSON:
{{"issues": [], "overall_score": 0.5, "suggestions": [], "is_healthy": true, "should_proceed": true, "recommendation": "ready", "word_count": {len(text.split())}, "has_coherence": false}}

Argument: "{text}"
Difficulty: {difficulty}

Identify issues like: ad_hominem, overgeneralization, false_dilemma, strawman, slippery_slope, bandwagon, appeal_to_authority.

Return ONLY valid JSON:"""

        try:
            response = requests.post(
                self.api_url,
                headers={
                    "Authorization": f"Bearer {self.hf_token}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 300,
                    "temperature": 0.3,
                },
                timeout=30,
            )
            if response.status_code == 200:
                result = response.json()
                content = (
                    result.get("choices", [{}])[0].get("message", {}).get("content", "")
                )
                import json

                try:
                    parsed = json.loads(content)
                    return parsed
                except:
                    pass
        except Exception as e:
            logger.warning(f"HF quick_analyze failed: {e}")
        return None


# Global instance
llm_generator = LLMGenerator()
