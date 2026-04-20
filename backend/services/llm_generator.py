import os
import logging
import requests
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)


class LLMGenerator:
    """Lightweight LLM for generating counter-arguments using HuggingFace Inference API"""

    def __init__(self):
        self.hf_token = os.getenv("HF_TOKEN") or settings.HF_TOKEN
        # Use the serverless inference API
        self.api_url = "https://api-inference.huggingface.co/models/gpt2"
        self.is_available = self.hf_token is not None

    def generate_counter_argument(
        self,
        user_argument: str,
        topic: str,
        persona: str = "logical",
        user_stance: str = "support",
    ) -> Optional[str]:
        """Generate a counter-argument using LLM via Inference API"""

        if not self.hf_token:
            return None

        persona_prompts = {
            "logical": "You are a logical challenger. Use facts and evidence to counter arguments.",
            "aggressive": "You are an aggressive debater. Challenge assumptions directly.",
            "skeptical": "You are a skeptic. Question everything and demand evidence.",
            "devil_advocate": "You are a devil's advocate. Take extreme counter-positions.",
        }

        system_prompt = persona_prompts.get(persona, persona_prompts["logical"])

        if user_stance == "support":
            stance_context = (
                f"The user supports: {topic}. Argue against their position."
            )
        elif user_stance == "oppose":
            stance_context = f"The user opposes: {topic}. Support the user's position."
        else:
            stance_context = f"Debate topic: {topic}."

        prompt = f"""<|system|>
{system_prompt}
</s>
<|user|>
Context: {stance_context}

User's argument: {user_argument}

Generate a 2-3 sentence counter-argument that addresses their specific points.
</s>
<|assistant|>"""

        headers = {
            "Authorization": f"Bearer {self.hf_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "inputs": prompt,
            "parameters": {"max_new_tokens": 150, "temperature": 0.7, "top_p": 0.9},
        }

        try:
            response = requests.post(
                self.api_url, headers=headers, json=payload, timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    generated_text = result[0].get("generated_text", "")
                    # Extract just the assistant response
                    if "</s><|assistant|>" in generated_text:
                        response_part = generated_text.split("</s><|assistant|>")[1]
                        return response_part.strip()
                    return generated_text.strip()
            else:
                logger.warning(
                    f"HF API error: {response.status_code} - {response.text}"
                )

        except Exception as e:
            logger.warning(f"HF inference failed: {e}")

        return None


# Global instance
llm_generator = LLMGenerator()
