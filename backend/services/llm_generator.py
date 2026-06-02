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
            "logical": "You are a logical challenger in a live debate. Use facts and evidence to counter the user's arguments directly. Be calm, reasoned, and address the user in the first/second person (use 'I' and 'you').",
            "aggressive": "You are an aggressive debater in a live debate. Challenge the user's assumptions directly and forcefully in the first/second person (use 'I' and 'you'). Don't hold back.",
            "skeptical": "You are a skeptic in a live debate. Question the user's claims directly and demand evidence. Address the user in the first/second person (use 'I' and 'you'). Be probing.",
            "devil_advocate": "You are a devil's advocate in a live debate. Take extreme counter-positions to test the robustness of the user's arguments. Address the user directly in the first/second person (use 'I' and 'you').",
        }

        system_prompt = persona_prompts.get(persona, persona_prompts["logical"])

        if user_stance == "support":
            stance_context = (
                f"Your assignment in this debate is to OPPOSE the topic: \"{topic}\".\n"
                "Your stance: You are AGAINST this idea. You must argue against it.\n"
                "The user is in favor of this topic. Do NOT agree with the user. Challenge their argument from your opposing stance."
            )
        elif user_stance == "oppose":
            stance_context = (
                f"Your assignment in this debate is to SUPPORT/ADVOCATE FOR the topic: \"{topic}\".\n"
                "Your stance: You are IN FAVOR of this idea. You must argue for it.\n"
                "The user is against this topic. Do NOT agree with the user. Challenge their argument from your supporting stance."
            )
        else:
            stance_context = (
                f"Debate topic: {topic}. Present a balanced counter-argument."
            )

        messages = [
            {
                "role": "system", 
                "content": (
                    f"{system_prompt}\n\n"
                    "CRITICAL INSTRUCTIONS:\n"
                    "1. Speak DIRECTLY to the user in the second person (e.g. use 'you', 'your', 'I disagree with your stance').\n"
                    "2. Do NOT say 'the user', 'their stance', 'the opponent', or talk about them in the third person.\n"
                    "3. Do NOT include any meta-text, introductions, explanations, or preambles (e.g. do NOT say 'Here is a counter-argument:', 'This counter-argument addresses...').\n"
                    "4. Output ONLY your direct conversational counter-response itself."
                )
            },
            {
                "role": "user",
                "content": f"Topic: {topic}\n\nUser's argument: \"{user_argument}\"\n\n{stance_context}\n\nGenerate your direct 2-3 sentence response:",
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

    def generate_rewrite(self, text: str, risk_factors: list[str]) -> str:
        """Generate a safer, more professional version of the input text"""
        if not self.hf_token:
            return text

        risk_list = ", ".join(risk_factors) if risk_factors else "general communication improvements"
        prompt = f"""You are a professional communications consultant and editor. 
Your task is to rewrite the input text to make it extremely professional, respectful, clear, and safe for publication/sending. 
Address these risk factors: {risk_list}.
Maintain the core original message and intent, but remove all inflammatory language, logical fallacies, extreme sentiment, bias, or offensive phrasing.

Original text:
"{text}"

Output ONLY the rewritten text, with no explanations, introductions, or quotes:"""

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
                    "temperature": 0.5,
                },
                timeout=30,
            )
            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                if content:
                    if content.startswith('"') and content.endswith('"'):
                        content = content[1:-1].strip()
                    return content
        except Exception as e:
            logger.warning(f"HF generate_rewrite failed: {e}")
        return text


# Global instance
llm_generator = LLMGenerator()
