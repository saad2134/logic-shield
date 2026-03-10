from typing import Dict, List, Optional
import torch
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import numpy as np


RISK_DESCRIPTIONS = {
    "moral_polarity": "Uses extreme moral language that may appear unbalanced or biased.",
    "absolutist_phrasing": "Uses absolute terms that leave no room for nuance or exceptions.",
    "identity_sensitive": "Contains language that may reference group identity in potentially sensitive ways.",
    "inflammatory": "Uses provocative language that may escalate tensions or attract backlash.",
    "defensive": "Contains conspiratorial or defensive framing that may raise suspicion."
}


class ReputationRiskEstimator:
    def __init__(self):
        self.toxicity_classifier = None
        self.hate_speech_classifier = None
        self._load_models()
    
    def _load_models(self):
        try:
            self.toxicity_classifier = pipeline(
                "text-classification",
                model="martin-ha/toxic-comment-model",
                tokenizer="martin-ha/toxic-comment-model",
                device=-1
            )
        except Exception as e:
            print(f"Warning: Could not load toxicity model: {e}")
        
        try:
            self.hate_speech_classifier = pipeline(
                "text-classification",
                model="facebook/roberta-hate-speech-dynabench-r4-target",
                device=-1
            )
        except Exception as e:
            print(f"Warning: Could not load hate speech model: {e}")
    
    def estimate_risk(self, text: str) -> Dict[str, any]:
        if not text or not text.strip():
            return {
                "risk_level": "low",
                "risk_score": 0.0,
                "risk_factors": [],
                "details": {}
            }
        
        category_scores = {}
        risk_factors = []
        
        toxicity_score = self._calculate_toxicity(text)
        if toxicity_score > 0:
            category_scores["inflammatory"] = toxicity_score
            if toxicity_score >= 0.5:
                risk_factors.append({
                    "category": "inflammatory",
                    "score": round(toxicity_score, 3),
                    "description": RISK_DESCRIPTIONS["inflammatory"]
                })
        
        hate_score = self._calculate_hate_speech(text)
        if hate_score > 0:
            category_scores["identity_sensitive"] = hate_score
            if hate_score >= 0.4:
                risk_factors.append({
                    "category": "identity_sensitive",
                    "score": round(hate_score, 3),
                    "description": RISK_DESCRIPTIONS["identity_sensitive"]
                })
        
        absolutist_score = self._calculate_absolutist(text)
        if absolutist_score > 0:
            category_scores["absolutist_phrasing"] = absolutist_score
            if absolutist_score >= 0.5:
                risk_factors.append({
                    "category": "absolutist_phrasing",
                    "score": round(absolutist_score, 3),
                    "description": RISK_DESCRIPTIONS["absolutist_phrasing"]
                })
        
        moral_score = self._calculate_moral_polarity(text)
        if moral_score > 0:
            category_scores["moral_polarity"] = moral_score
            if moral_score >= 0.5:
                risk_factors.append({
                    "category": "moral_polarity",
                    "score": round(moral_score, 3),
                    "description": RISK_DESCRIPTIONS["moral_polarity"]
                })
        
        defensive_score = self._calculate_defensive(text)
        if defensive_score > 0:
            category_scores["defensive"] = defensive_score
            if defensive_score >= 0.5:
                risk_factors.append({
                    "category": "defensive",
                    "score": round(defensive_score, 3),
                    "description": RISK_DESCRIPTIONS["defensive"]
                })
        
        if not category_scores:
            category_scores["baseline"] = 0.1
        
        weights = {
            "inflammatory": 0.25,
            "identity_sensitive": 0.30,
            "absolutist_phrasing": 0.20,
            "moral_polarity": 0.15,
            "defensive": 0.10,
            "baseline": 0.1
        }
        
        overall_score = sum(
            category_scores.get(cat, 0) * weights.get(cat, 0.1)
            for cat in category_scores
        )
        
        overall_score = min(overall_score, 1.0)
        
        risk_level = self._determine_risk_level(overall_score)
        
        return {
            "risk_level": risk_level,
            "risk_score": round(overall_score, 3),
            "risk_factors": risk_factors,
            "details": category_scores
        }
    
    def _calculate_toxicity(self, text: str) -> float:
        if self.toxicity_classifier is not None:
            try:
                result = self.toxicity_classifier(text[:512])[0]
                if result["label"] == "toxic":
                    return float(result["score"])
            except:
                pass
        return self._rule_based_toxicity(text)
    
    def _rule_based_toxicity(self, text: str) -> float:
        import re
        toxic_words = [
            "stupid", "idiot", "dumb", "moron", "fool", "ignorant", "liar",
            "terrible", "horrible", "awful", "hate", "despise", "loathe",
            "disgusting", "repulsive", "vile", "contempt"
        ]
        
        text_lower = text.lower()
        matches = sum(1 for word in toxic_words if word in text_lower)
        
        if matches >= 3:
            return 0.8
        elif matches >= 1:
            return 0.5
        return 0.0
    
    def _calculate_hate_speech(self, text: str) -> float:
        if self.hate_speech_classifier is not None:
            try:
                result = self.hate_speech_classifier(text[:512])[0]
                if result["label"] == "hate":
                    return float(result["score"])
            except:
                pass
        return self._rule_based_hate(text)
    
    def _rule_based_hate(self, text: str) -> float:
        import re
        identity_patterns = [
            r"\b(people\s+like\s+you|people\s+like\s+them|your\s+kind|their\s+kind)",
            r"\b(ethnic|racial|religious)\s+(group|minority)",
            r"\b(immigrant|refugee|asylum)\s+(illegal|criminal)",
        ]
        
        text_lower = text.lower()
        matches = sum(1 for pattern in identity_patterns if re.search(pattern, text_lower))
        
        if matches >= 1:
            return 0.6
        return 0.0
    
    def _calculate_absolutist(self, text: str) -> float:
        import re
        absolutist_terms = [
            "never", "always", "every", "none", "nobody", "everyone", "all", "nothing",
            "without doubt", "undoubtedly", "certainly", "definitely", "absolutely",
            "no question", "must be", "have to be only"
        ]
        
        text_lower = text.lower()
        matches = sum(1 for term in absolutist_terms if term in text_lower)
        
        if matches >= 3:
            return 0.85
        elif matches >= 1:
            return 0.5
        return 0.0
    
    def _calculate_moral_polarity(self, text: str) -> float:
        extreme_positive = ["perfect", "ideal", "ultimate", "greatest", "best ever", "incomparable"]
        extreme_negative = ["terrible", "horrible", "worst", "evil", "monster", "criminal", "disgusting"]
        
        text_lower = text.lower()
        
        pos_count = sum(1 for word in extreme_positive if word in text_lower)
        neg_count = sum(1 for word in extreme_negative if word in text_lower)
        
        if pos_count >= 2 or neg_count >= 2:
            return 0.7
        elif pos_count >= 1 or neg_count >= 1:
            return 0.4
        return 0.0
    
    def _calculate_defensive(self, text: str) -> float:
        import re
        defensive_patterns = [
            r"\b(they\s+want\s+to|they\s+are\s+trying\s+to|conspiracy)",
            r"\b(attack\s+on|assault\s+on|war\s+against)",
            r"\b(agenda|hidden\s+agenda|plot|scheme)",
        ]
        
        text_lower = text.lower()
        matches = sum(1 for pattern in defensive_patterns if re.search(pattern, text_lower))
        
        if matches >= 2:
            return 0.7
        elif matches >= 1:
            return 0.4
        return 0.0
    
    def _determine_risk_level(self, score: float) -> str:
        if score < 0.2:
            return "low"
        elif score < 0.5:
            return "medium"
        elif score < 0.75:
            return "high"
        else:
            return "critical"
    
    def get_historical_backlash_similarity(self, text: str) -> Dict[str, float]:
        keywords = ["speech", "statement", "comment", "policy", "proposal", "reform"]
        
        text_lower = text.lower()
        found = {kw: 0.3 for kw in keywords if kw in text_lower}
        
        return found
