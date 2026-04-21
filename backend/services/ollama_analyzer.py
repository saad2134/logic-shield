import os
import logging
import requests
import json
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class OllamaAnalyzer:
    """Ollama-based real-time argument analyzer using local LLM"""

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "tinyllama")
        self.is_available = False
        self._check_availability()

    def _check_availability(self):
        """Check if Ollama is running and available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name", "").split(":")[0] for m in models]
                if self.model.split(":")[0] in model_names:
                    self.is_available = True
                    logger.info(f"Ollama available with model: {self.model}")
                else:
                    logger.warning(
                        f"Model {self.model} not found. Available: {model_names}"
                    )
        except Exception as e:
            logger.debug(f"Ollama not available: {e}")

    def analyze_argument(
        self, text: str, context: str = "", difficulty: str = "intermediate"
    ) -> Optional[Dict[str, Any]]:
        """Analyze argument using Ollama LLM"""

        if not self.is_available:
            return None

        difficulty_settings = {
            "basic": "Focus on basic issues: spam, too short, offensive language.",
            "intermediate": "Focus on logical fallacies, coherence, and argument strength.",
            "advanced": "Analyze all issues including tone, evidence, and rhetorical effectiveness.",
        }

        focus = difficulty_settings.get(difficulty, difficulty_settings["intermediate"])

        prompt = f"""You are a debate coach analyzing an argument in real-time.
Context: {context or "General debate"}
Difficulty level: {difficulty}

Analyze this argument and return a JSON response with:
1. "issues": array of issues found, each with {{"type": "fallacy|style|length", "name": "issue_name", "confidence": 0.0-1.0, "severity": "high|medium|low"}}
2. "overall_score": overall argument quality score 0.0-1.0
3. "suggestions": array of specific suggestions to improve
4. "is_healthy": boolean - true if no major issues
5. "should_proceed": boolean - true if ready to send
6. "recommendation": "ready|review|not_ready"
7. "word_count": number of words
8. "has_coherence": boolean - true if argument has logical flow

{focus}

Argument to analyze:
"{text}"

Return ONLY valid JSON, no explanation:''''''

```json
{{"issues": [], "overall_score": 0.5, "suggestions": [], "is_healthy": true, "should_proceed": true, "recommendation": "ready", "word_count": 0, "has_coherence": false}}```"""

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {
                        "temperature": 0.3,
                        "num_predict": 300,
                    },
                },
                timeout=30,
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("response", "")

                content = content.strip()
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]

                content = content.strip()

                parsed = json.loads(content)
                return parsed

        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse Ollama response: {e}")
        except Exception as e:
            logger.warning(f"Ollama analysis failed: {e}")

        return None

    def generate_counter_argument(
        self,
        topic: str,
        user_argument: str,
        persona: str = "logical",
        user_stance: str = "support",
    ) -> Optional[str]:
        """Generate counter-argument using Ollama LLM"""

        if not self.is_available:
            return None

        persona_prompts = {
            "logical": "Be a logical challenger. Use facts.",
            "aggressive": "Be aggressive. Challenge directly.",
            "skeptical": "Be skeptical. Question everything.",
            "devil_advocate": "Be devil's advocate. Take extreme counter-positions.",
        }

        system_prompt = persona_prompts.get(persona, persona_prompts["logical"])

        if user_stance == "support":
            counter = f"While you argue {topic} is caused by human activity, natural cycles like solar radiation and ocean currents also play a significant role."
        elif user_stance == "oppose":
            counter = f"Despite your claim against {topic}, scientific consensus data shows undeniable human impact."
        else:
            counter = f"Consider both perspectives on {topic}: human factors and natural variability both contribute."

        prompt = f"""Debate topic: {topic}. Your position: {persona}. User argument: "{user_argument}". Your counter-response (2 sentences max): {counter}"""

        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 80,
                    },
                },
                timeout=30,
            )

            if response.status_code == 200:
                result = response.json()
                content = result.get("response", "").strip()
                if content:
                    return content

        except Exception as e:
            logger.warning(f"Ollama counter-argument failed: {e}")

        return None

    def check_available(self) -> bool:
        """Check if Ollama is available"""
        return self.is_available


ollama_analyzer = OllamaAnalyzer()
