import os
import logging
from typing import Optional, Dict, List
import random

logger = logging.getLogger(__name__)


class SmartDebateSimulator:
    """Enhanced debate simulator with context-aware counter-arguments"""

    PERSONAS = {
        "logical": {
            "name": "Logical Challenger",
            "opening": "That's an interesting perspective,",
            "style": "facts and evidence",
        },
        "aggressive": {
            "name": "Aggressive Debater",
            "opening": "Let me challenge that directly:",
            "style": "direct confrontation",
        },
        "skeptical": {
            "name": "Skeptic",
            "opening": "I'd like to question this further:",
            "style": "probing questions",
        },
        "devil_advocate": {
            "name": "Devil's Advocate",
            "opening": "From the opposing viewpoint:",
            "style": "extreme counter-positions",
        },
    }

    # Topic-specific counter-arguments for common debate topics
    TOPIC_COUNTERS = {
        "ai": {
            "support": [
                "While you raise valid concerns about AI harms, consider that AI has also enabled breakthroughs in healthcare, science, and education. The net impact depends on how we regulate it.",
                "Your argument focuses on risks, but evidence shows AI has created more jobs than it's displaced. Can you cite specific data on the harm?",
                "That's a valid concern, but banning AI would put us at a competitive disadvantage. How do you suggest we maintain innovation while addressing risks?",
                "The issue is more nuanced. AI harm is not inevitable - proper governance can mitigate risks while preserving benefits.",
            ],
            "oppose": [
                "You make a fair point about benefits, but there are documented cases of AI harm - algorithmic bias, job displacement, privacy erosion. How do you address these?",
                "While AI has benefits, dismissing concerns is premature. The technology is still evolving and poses real risks that warrant caution.",
            ],
        },
        "climate": {
            "support": [
                "Your concern is valid, but consider the economic damage of aggressive climate policies. Is there a balanced approach?",
                "Many climate predictions have been wrong. What makes your model different?",
            ],
            "oppose": [
                "Renewable energy costs have plummeted - the economic argument against climate action is weakening.",
                "Even if you question climate science, the national security and energy independence arguments still favor clean energy.",
            ],
        },
        "default": {
            "support": [
                "That's a valid perspective, but have you considered the counter-evidence?",
                "Your argument makes assumptions. What data supports this?",
                "There are multiple viewpoints on this. Can you address the opposing evidence?",
            ],
            "oppose": [
                "That's a fair point, but the evidence is mixed. What specific examples support your view?",
                "Consider that alternative approaches might work better. What if the opposite were true?",
            ],
        },
    }

    # Argument weakness detectors
    WEAKNESS_PATTERNS = {
        "absolute": {
            "keywords": ["always", "never", "everyone", "nobody", "all", "none"],
            "response": "Your use of absolute terms like '{word}' is problematic. Can you provide exceptions?",
        },
        "source": {
            "keywords": ["they say", "experts say", "studies show", "everyone knows"],
            "response": "You reference 'experts' or 'studies' without specifics. Which experts? What studies?",
        },
        "emotion": {
            "keywords": ["dangerous", "terrible", "horrible", "disaster", "threat"],
            "response": "Your argument uses emotional language. Can you provide objective evidence?",
        },
        "causation": {
            "keywords": ["will lead to", "causes", "results in", "because of"],
            "response": "You're assuming causation from correlation. What evidence shows direct causation?",
        },
    }

    def __init__(self):
        self.counter_cache = {}

    def _detect_topic(self, topic: str) -> str:
        """Detect the topic category"""
        topic_lower = topic.lower()
        for key in ["ai", "artificial intelligence", "machine learning"]:
            if key in topic_lower:
                return "ai"
        for key in ["climate", "environment", "global warming", "carbon"]:
            if key in topic_lower:
                return "climate"
        return "default"

    def _detect_weakness(self, argument: str) -> List[str]:
        """Detect weaknesses in the argument"""
        arg_lower = argument.lower()
        weaknesses = []

        for pattern_type, pattern_data in self.WEAKNESS_PATTERNS.items():
            for keyword in pattern_data["keywords"]:
                if keyword in arg_lower:
                    response = pattern_data["response"].replace("{word}", keyword)
                    weaknesses.append(response)
                    break

        return weaknesses[:2]  # Max 2 weaknesses

    def _generate_counter_argument(
        self,
        topic: str,
        user_argument: str,
        persona: str = "logical",
        user_stance: str = "support",
    ) -> str:
        """Generate a smart counter-argument"""

        persona_data = self.PERSONAS.get(persona, self.PERSONAS["logical"])
        topic_category = self._detect_topic(topic)

        # Get topic-specific counters
        if topic_category in self.TOPIC_COUNTERS:
            topic_counters = self.TOPIC_COUNTERS[topic_category].get(
                user_stance, self.TOPIC_COUNTERS["default"]["support"]
            )
        else:
            topic_counters = self.TOPIC_COUNTERS["default"].get(
                user_stance, self.TOPIC_COUNTERS["default"]["support"]
            )

        # Detect argument weaknesses
        weaknesses = self._detect_weakness(user_argument)

        # Build response
        if weaknesses and persona in ["skeptical", "aggressive"]:
            # Lead with weakness detection
            response = f"{persona_data['opening']} {weaknesses[0]}"
        else:
            # Use topic-specific counter
            response = random.choice(topic_counters)
            response = f"{persona_data['opening']} {response}"

        return response

    def generate(
        self, topic: str, user_argument: str, user_stance: str, persona: str = "logical"
    ) -> str:
        """Main entry point for generating counter-arguments"""
        return self._generate_counter_argument(
            topic=topic,
            user_argument=user_argument,
            persona=persona,
            user_stance=user_stance,
        )

    def analyze_argument(
        self, text: str, context: str = "", difficulty: str = "intermediate"
    ) -> Dict:
        """Analyze argument using smart template-based detection"""
        text_lower = text.lower()
        issues = []
        suggestions = []

        offensive = [
            "stupid",
            "fool",
            "idiot",
            "dumb",
            "ignorant",
            "shit",
            "fuck",
            "ass",
            "bitch",
            "retard",
        ]
        if any(w in text_lower for w in offensive):
            issues.append(
                {
                    "type": "fallacy",
                    "name": "ad_hominem",
                    "confidence": 0.95,
                    "severity": "high",
                }
            )
            suggestions.append("Remove offensive language")
            return {
                "issues": issues,
                "overall_score": 0.1,
                "suggestions": suggestions,
                "is_healthy": False,
                "should_proceed": False,
                "recommendation": "not_ready",
                "word_count": len(text.split()),
                "has_coherence": False,
            }

        absolute = ["all", "every", "always", "never", "everyone", "nobody"]
        if any(w in text_lower for w in absolute):
            issues.append(
                {
                    "type": "fallacy",
                    "name": "overgeneralization",
                    "confidence": 0.75,
                    "severity": "medium",
                }
            )
            suggestions.append("Avoid absolute terms")

        word_count = len(text.split())
        has_coherence = any(
            w in text_lower
            for w in ["because", "therefore", "however", "although", "since"]
        )

        score = 0.7
        if issues:
            score = 0.5
        if word_count < 5:
            issues.append(
                {
                    "type": "length",
                    "name": "too_short",
                    "confidence": 0.9,
                    "severity": "low",
                }
            )
            suggestions.append("Add more detail")
            score -= 0.2

        return {
            "issues": issues,
            "overall_score": min(1.0, max(0.0, score)),
            "suggestions": suggestions,
            "is_healthy": len([i for i in issues if i.get("severity") == "high"]) == 0,
            "should_proceed": len([i for i in issues if i.get("severity") == "high"])
            == 0,
            "recommendation": "ready"
            if len([i for i in issues if i.get("severity") == "high"]) == 0
            else "review",
            "word_count": word_count,
            "has_coherence": has_coherence,
        }


# Global instance
smart_debate_simulator = SmartDebateSimulator()
