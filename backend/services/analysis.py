from typing import Dict, Optional
from services.fallacy_detector import FallacyDetector, ArgumentStrengthScorer
from services.reputation_risk import ReputationRiskEstimator


class AnalysisService:
    def __init__(self):
        self.fallacy_detector = FallacyDetector()
        self.strength_scorer = ArgumentStrengthScorer()
        self.risk_estimator = ReputationRiskEstimator()
    
    def analyze_argument(
        self,
        text: str,
        context: str = ""
    ) -> Dict:
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
            
            "timestamp": self._get_timestamp()
        }
    
    def _get_timestamp(self) -> str:
        from datetime import datetime
        return datetime.utcnow().isoformat()
    
    def get_supported_fallacies(self) -> Dict:
        return self.fallacy_detector.get_fallacy_descriptions()
    
    def batch_analyze(self, texts: list, context: str = "") -> list:
        return [self.analyze_argument(text, context) for text in texts]
