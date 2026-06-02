from typing import Dict, Optional
import logging
from services.fallacy_detector import FallacyDetector, ArgumentStrengthScorer
from services.reputation_risk import ReputationRiskEstimator
from services.ollama_analyzer import ollama_analyzer
from app.config import settings
import random

logger = logging.getLogger(__name__)


DEMO_ANALYSIS_RESULTS = [
    {
        "fallacy_detected": ["no_fallacy"],
        "fallacy_confidences": {"no_fallacy": 0.85},
        "fallacy_descriptions": {},
        "argument_strength": 0.75,
        "coherence_score": 0.78,
        "evidence_score": 0.70,
        "sentiment_score": 0.65,
        "logical_score": 0.72,
        "reputation_risk_level": "low",
        "reputation_risk_score": 0.25,
        "risk_factors": [],
    },
    {
        "fallacy_detected": ["ad_hominem"],
        "fallacy_confidences": {"ad_hominem": 0.72},
        "fallacy_descriptions": {},
        "argument_strength": 0.35,
        "coherence_score": 0.45,
        "evidence_score": 0.30,
        "sentiment_score": 0.25,
        "logical_score": 0.40,
        "reputation_risk_level": "medium",
        "reputation_risk_score": 0.55,
        "risk_factors": [
            "Personal attacks detected",
            "Emotional language may alienate audience",
        ],
    },
    {
        "fallacy_detected": ["false_dilemma"],
        "fallacy_confidences": {"false_dilemma": 0.68},
        "fallacy_descriptions": {},
        "argument_strength": 0.50,
        "coherence_score": 0.55,
        "evidence_score": 0.45,
        "sentiment_score": 0.60,
        "logical_score": 0.48,
        "reputation_risk_level": "low",
        "reputation_risk_score": 0.35,
        "risk_factors": ["Oversimplified binary thinking detected"],
    },
    {
        "fallacy_detected": ["bandwagon"],
        "fallacy_confidences": {"bandwagon": 0.65},
        "fallacy_descriptions": {},
        "argument_strength": 0.55,
        "coherence_score": 0.60,
        "evidence_score": 0.50,
        "sentiment_score": 0.70,
        "logical_score": 0.52,
        "reputation_risk_level": "low",
        "reputation_risk_score": 0.30,
        "risk_factors": ["Appeal to popularity rather than evidence"],
    },
]


class AnalysisService:
    def __init__(self):
        self.fallacy_detector = None
        self.strength_scorer = None
        self.risk_estimator = None
        if not settings.DEMO_MODE:
            try:
                self.fallacy_detector = FallacyDetector()
                self.strength_scorer = ArgumentStrengthScorer()
                self.risk_estimator = ReputationRiskEstimator()
            except Exception as e:
                print(f"Warning: Could not load ML models: {e}")
                settings.DEMO_MODE = True

    def analyze_argument(self, text: str, context: str = "") -> Dict:
        if settings.DEMO_MODE:
            demo_result = random.choice(DEMO_ANALYSIS_RESULTS).copy()
            demo_result["demo_mode"] = True
            demo_result["demo_message"] = settings.DEMO_MESSAGE
            demo_result["timestamp"] = self._get_timestamp()
            if self.fallacy_detector:
                demo_result["fallacy_descriptions"] = (
                    self.fallacy_detector.get_fallacy_descriptions()
                )
            return demo_result

        fallacies, fallacy_confidences = self.fallacy_detector.detect_fallacies(text)

        strength_results = self.strength_scorer.calculate_strength(text, context)

        risk_results = self.risk_estimator.estimate_risk(text)

        return {
            "fallacy_detected": fallacies,
            "fallacy_confidences": fallacy_confidences,
            "fallacy_descriptions": self.fallacy_detector.get_fallacy_descriptions(),
            "argument_strength": strength_results["overall"],
            "coherence_score": strength_results["coherence"],
            "evidence_score": strength_results["evidence"],
            "sentiment_score": strength_results["sentiment"],
            "logical_score": strength_results["logical"],
            "reputation_risk_level": risk_results["risk_level"],
            "reputation_risk_score": risk_results["risk_score"],
            "risk_factors": risk_results["risk_factors"],
            "timestamp": self._get_timestamp(),
        }

    def _get_timestamp(self) -> str:
        from datetime import datetime

        return datetime.utcnow().isoformat()

    def _demo_rewrite(self, text: str) -> str:
        import re
        replacements = {
            "stupid": "uninformed",
            "fool": "misguided",
            "idiot": "incorrect",
            "dumb": "flawed",
            "ignorant": "unaware",
            "moron": "unwise",
            "shit": "issues",
            "fuck": "disregard",
            "ass": "perspective",
            "bitch": "complain",
            "bastard": "individual",
            "crap": "substandard work",
            "suck": "is unsatisfactory",
            "hate": "disagree with",
            "garbage": "unhelpful",
            "trash": "poor quality",
            "you are wrong": "there may be another perspective",
            "wrong": "incorrect",
            "liar": "mistaken",
        }
        rewritten = text
        for word, rep in replacements.items():
            pattern = re.compile(r'\b' + re.escape(word) + r'\b', re.IGNORECASE)
            rewritten = pattern.sub(rep, rewritten)
        if rewritten == text:
            if not rewritten.strip().endswith((".", "!", "?")):
                rewritten += "."
            return f"Dear team, I would like to suggest: {rewritten} Let me know your thoughts. Best regards."
        return rewritten

    def scan_communication_risk(self, text: str, context: str = "") -> Dict:
        # Check if in demo mode or models not initialized
        is_demo = settings.DEMO_MODE or (self.fallacy_detector is None)

        if is_demo:
            # Rule-based / template evaluation for demo mode
            text_lower = text.lower()
            
            # Simple tone evaluation
            negative_words = ["bad", "terrible", "worse", "harm", "failure", "decline", "weak", "wrong", "problem", "hate", "suck", "stupid", "idiot"]
            neg_count = sum(1 for w in negative_words if w in text_lower)
            tone_score = max(0.2, 0.9 - (neg_count * 0.15))
            
            # Simple factuality evaluation
            evidence_indicators = ["study", "research", "evidence", "data", "statistics", "percent", "according to", "report", "show", "prove"]
            ev_count = sum(1 for w in evidence_indicators if w in text_lower)
            factuality_score = min(1.0, 0.4 + (ev_count * 0.15))
            
            # Simple sensitivity evaluation
            offensive_keywords = ["stupid", "fool", "idiot", "dumb", "ignorant", "moron", "shit", "fuck", "ass", "bitch", "bastard", "crap", "suck", "retard", "loser", "pathetic"]
            off_count = sum(1 for w in offensive_keywords if w in text_lower)
            sensitivity_score = max(0.1, 1.0 - (off_count * 0.3))
            
            # Risk factors
            risk_factors = []
            if sensitivity_score < 0.8:
                risk_factors.append("Contains potential inflammatory or sensitive language")
            if tone_score < 0.6:
                risk_factors.append("Tone appears aggressive or overly negative")
            if factuality_score < 0.5:
                risk_factors.append("Lacks citations, evidence, or supporting data indicators")
            
            # Combined publish safe score
            publish_safe_score = (tone_score * 0.3 + factuality_score * 0.3 + sensitivity_score * 0.4)
            
            risk_level = "low"
            if publish_safe_score < 0.4:
                risk_level = "high"
            elif publish_safe_score < 0.7:
                risk_level = "medium"
                
            rewrite_suggestion = self._demo_rewrite(text)
            
            return {
                "publish_safe_score": round(publish_safe_score, 3),
                "risk_level": risk_level,
                "tone_score": round(tone_score, 3),
                "factuality_score": round(factuality_score, 3),
                "sensitivity_score": round(sensitivity_score, 3),
                "risk_factors": risk_factors,
                "rewrite_suggestion": rewrite_suggestion,
                "demo_mode": True,
                "timestamp": self._get_timestamp()
            }
            
        else:
            # Full ML mode
            # Detect fallacies
            fallacies, fallacy_confidences = self.fallacy_detector.detect_fallacies(text)
            # Calculate strength
            strength_results = self.strength_scorer.calculate_strength(text, context)
            # Estimate risk
            risk_results = self.risk_estimator.estimate_risk(text)
            
            # Extract scores
            sentiment_score = strength_results.get("sentiment", 0.5)
            # Normalize/derive tone score
            tone_score = sentiment_score
            
            factuality_score = strength_results.get("evidence", 0.5)
            
            # Sensitivity score: inverse of toxicity and hate speech
            toxicity_score = risk_results["details"].get("inflammatory", 0.0)
            hate_score = risk_results["details"].get("identity_sensitive", 0.0)
            sensitivity_score = 1.0 - max(toxicity_score, hate_score)
            
            # Reputation risk score
            reputation_risk_score = risk_results.get("risk_score", 0.0)
            argument_strength = strength_results.get("overall", 0.5)
            
            # Publish-safe score: combines argument strength and low reputation risk
            publish_safe_score = (argument_strength + (1.0 - reputation_risk_score)) / 2.0
            
            # Risk factors
            risk_factors = list(risk_results.get("risk_factors", []))
            for f in fallacies:
                if f != "no_fallacy" and fallacy_confidences.get(f, 0.0) > 0.5:
                    risk_factors.append(f"Logical Fallacy: {f.replace('_', ' ').title()}")
                    
            if factuality_score < 0.4:
                risk_factors.append("Low evidence or factual support")
                
            # Rewrite suggestion
            from services.llm_generator import llm_generator
            rewrite_suggestion = llm_generator.generate_rewrite(text, risk_factors)
            refusal_keywords = ["cannot fulfill", "can't fulfill", "sorry", "apologize", "as an ai", "inappropriate", "offensive", "cannot rewrite", "unable to provide"]
            is_refusal = any(kw in rewrite_suggestion.lower() for kw in refusal_keywords)
            if rewrite_suggestion == text or not llm_generator.is_available or is_refusal:
                rewrite_suggestion = self._demo_rewrite(text)
                
            return {
                "publish_safe_score": round(publish_safe_score, 3),
                "risk_level": risk_results.get("risk_level", "low"),
                "tone_score": round(tone_score, 3),
                "factuality_score": round(factuality_score, 3),
                "sensitivity_score": round(sensitivity_score, 3),
                "risk_factors": risk_factors,
                "rewrite_suggestion": rewrite_suggestion,
                "demo_mode": False,
                "timestamp": self._get_timestamp()
            }

    def get_supported_fallacies(self) -> Dict:
        return self.fallacy_detector.get_fallacy_descriptions()

    def batch_analyze(self, texts: list, context: str = "") -> list:
        return [self.analyze_argument(text, context) for text in texts]

    def quick_analyze(
        self, text: str, context: str = "", difficulty: str = "intermediate"
    ) -> Dict:
        # ALWAYS check offensive words FIRST (safety check)
        text_lower = text.lower()
        offensive_keywords = [
            "stupid",
            "fool",
            "idiot",
            "dumb",
            "ignorant",
            "moron",
            "shit",
            "fuck",
            "ass",
            "bitch",
            "bastard",
            "crap",
            "hell",
            "suck",
            "retard",
            "loser",
            "pathetic",
            "disgusting",
            "garbage",
            "trash",
        ]
        if any(word in text_lower for word in offensive_keywords):
            return {
                "issues": [
                    {
                        "type": "fallacy",
                        "name": "ad_hominem",
                        "confidence": 0.95,
                        "severity": "high",
                    }
                ],
                "overall_score": 0.1,
                "suggestions": ["⚠️ DO NOT SEND - Contains offensive language"],
                "risk_level": "medium",
                "is_healthy": False,
                "should_proceed": False,
                "recommendation": "not_ready",
                "word_count": len(text.split()),
                "has_coherence": False,
                "timestamp": self._get_timestamp(),
                "llm_powered": False,
            }

        # Try Ollama first (priority: Ollama > HF > Smart > Keyword)
        ollama_result = None
        if ollama_analyzer.check_available():
            try:
                result = ollama_analyzer.analyze_argument(text, context, difficulty)
                # Accept any valid result - let model quality be the differentiator
                if result and result.get("overall_score", 0) > 0:
                    ollama_result = result
            except Exception as e:
                logger.warning(f"Ollama failed: {e}")

        # Try HuggingFace second
        hf_result = None
        try:
            from services.llm_generator import llm_generator

            result = llm_generator.quick_analyze(text, context, difficulty)
            if result and result.get("overall_score", 0) > 0:
                hf_result = result
        except Exception as e:
            logger.warning(f"HF failed: {e}")

        # Use best available: Ollama > HF > Smart > Keyword
        final_result = None
        if ollama_result:
            final_result = ollama_result
            final_result["llm_powered"] = True
        elif hf_result:
            final_result = hf_result
            final_result["llm_powered"] = True
        else:
            # Try Smart Templates third
            try:
                from services.smart_debate import smart_debate_simulator

                result = smart_debate_simulator.analyze_argument(
                    text, context, difficulty
                )
                if result and result.get("overall_score", 0) > 0:
                    final_result = result
                    final_result["llm_powered"] = False
            except Exception as e:
                logger.warning(f"Smart failed: {e}")

        if not final_result:
            # Keyword detection as LAST RESORT
            text_lower = text.lower()

            # Check offensive words first
            offensive_keywords = [
                "stupid",
                "fool",
                "idiot",
                "dumb",
                "ignorant",
                "moron",
                "shit",
                "fuck",
                "ass",
                "bitch",
                "bastard",
                "crap",
                "hell",
                "suck",
                "retard",
                "loser",
                "pathetic",
                "disgusting",
                "garbage",
                "trash",
            ]
            if any(word in text_lower for word in offensive_keywords):
                final_result = {
                    "issues": [
                        {
                            "type": "fallacy",
                            "name": "ad_hominem",
                            "confidence": 0.95,
                            "severity": "high",
                        }
                    ],
                    "overall_score": 0.1,
                    "suggestions": ["⚠️ DO NOT SEND - Contains offensive language"],
                    "risk_level": "medium",
                    "is_healthy": False,
                    "should_proceed": False,
                    "recommendation": "not_ready",
                    "word_count": len(text.split()),
                    "has_coherence": False,
                    "llm_powered": False,
                }
            else:
                full_analysis = self.analyze_argument(text, context)

                issues = []
                suggestions = []

                fallacy_detected = full_analysis.get("fallacy_detected", [])
                fallacy_confidences = full_analysis.get("fallacy_confidences", {})

                for fallacy in fallacy_detected:
                    if fallacy != "no_fallacy":
                        confidence = fallacy_confidences.get(fallacy, 0)
                        # Lower threshold to catch more fallacies
                        threshold = 0.5 if difficulty == "advanced" else 0.55
                        if confidence >= threshold:
                            issues.append(
                                {
                                    "type": "fallacy",
                                    "name": fallacy,
                                    "confidence": confidence,
                                    "severity": "high" if confidence > 0.75 else "medium",
                                }
                            )
                            if difficulty != "basic":
                                suggestions.append(
                                    f"Avoid {fallacy.replace('_', ' ')} - consider rephrasing with evidence"
                                )

                if difficulty == "advanced":
                    if full_analysis.get("evidence_score", 0) < 0.5:
                        suggestions.append(
                            "Add supporting evidence or data to strengthen your argument"
                        )
                    if full_analysis.get("coherence_score", 0) < 0.5:
                        suggestions.append(
                            "Improve logical flow - use connecting words like 'therefore', 'because'"
                        )

                if difficulty in ["intermediate", "advanced"]:
                    if full_analysis.get("sentiment_score", 0) < 0.3:
                        suggestions.append(
                            "Tone may be too negative - consider balancing with positive points"
                        )
                    if full_analysis.get("sentiment_score", 0) > 0.8:
                        suggestions.append(
                            "Tone may seem overly emotional - maintain objectivity"
                        )

                risk_level = full_analysis.get("reputation_risk_level", "low")
                if risk_level in ["medium", "high"]:
                    issues.append(
                        {
                            "type": "risk",
                            "name": "reputation",
                            "risk_level": risk_level,
                            "severity": "medium" if risk_level == "medium" else "high",
                        }
                    )
                    if difficulty != "basic":
                        for factor in full_analysis.get("risk_factors", []):
                            suggestions.append(f"Risk factor: {factor}")

                is_healthy = len([i for i in issues if i.get("severity") == "high"]) == 0

                final_result = {
                    "issues": issues,
                    "overall_score": full_analysis.get("argument_strength", 0.5),
                    "suggestions": suggestions[:5],
                    "risk_level": risk_level,
                    "is_healthy": is_healthy,
                    "llm_powered": False,
                }

        # Common Sanitization and Defaults
        final_result["timestamp"] = self._get_timestamp()

        # Ensure suggestions is a List[str]
        suggestions_raw = final_result.get("suggestions", [])
        sanitized_suggestions = []
        for s in suggestions_raw:
            if isinstance(s, str):
                sanitized_suggestions.append(s)
            elif isinstance(s, dict):
                val = s.get("name") or s.get("description") or str(s)
                sanitized_suggestions.append(val)
            else:
                sanitized_suggestions.append(str(s))
        final_result["suggestions"] = sanitized_suggestions

        # Ensure other fields required by QuickAnalysisResponse have defaults
        if "risk_level" not in final_result:
            final_result["risk_level"] = "low"
        if "is_healthy" not in final_result:
            final_result["is_healthy"] = len([i for i in final_result.get("issues", []) if i.get("severity") == "high"]) == 0
        if "should_proceed" not in final_result:
            final_result["should_proceed"] = final_result["is_healthy"]
        if "recommendation" not in final_result:
            final_result["recommendation"] = "ready" if final_result["is_healthy"] else "review"
        if "word_count" not in final_result:
            final_result["word_count"] = len(text.split())
        if "has_coherence" not in final_result:
            final_result["has_coherence"] = any(w in text.lower() for w in ["because", "therefore", "however", "although", "since"])

        return final_result
