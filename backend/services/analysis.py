from typing import Dict, Optional
from services.fallacy_detector import FallacyDetector, ArgumentStrengthScorer
from services.reputation_risk import ReputationRiskEstimator
from app.config import settings
import random


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

    def get_supported_fallacies(self) -> Dict:
        return self.fallacy_detector.get_fallacy_descriptions()

    def batch_analyze(self, texts: list, context: str = "") -> list:
        return [self.analyze_argument(text, context) for text in texts]

    def quick_analyze(
        self, text: str, context: str = "", difficulty: str = "intermediate"
    ) -> Dict:
        full_analysis = self.analyze_argument(text, context)

        issues = []
        suggestions = []

        fallacy_detected = full_analysis.get("fallacy_detected", [])
        fallacy_confidences = full_analysis.get("fallacy_confidences", {})

        major_fallacies = [
            "ad_hominem",
            "strawman",
            "slippery_slope",
            "false_dilemma",
            "bandwagon",
            "appeal_to_authority",
        ]

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

        return {
            "issues": issues,
            "overall_score": full_analysis.get("argument_strength", 0.5),
            "suggestions": suggestions[:5],
            "risk_level": risk_level,
            "is_healthy": is_healthy,
            "timestamp": self._get_timestamp(),
        }
