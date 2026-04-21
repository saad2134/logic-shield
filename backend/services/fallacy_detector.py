from typing import Dict, List, Tuple, Optional

torch = None
transformers = None
SentenceTransformer = None
_auto_tokenizer = None
_auto_model = None
_sentence_model = None
_sentiment_analyzer = None


def _lazy_imports():
    global \
        torch, \
        transformers, \
        SentenceTransformer, \
        _auto_tokenizer, \
        _auto_model, \
        _sentence_model, \
        _sentiment_analyzer
    if torch is None:
        try:
            import torch
            from transformers import (
                pipeline,
                AutoTokenizer,
                AutoModelForSequenceClassification,
                AutoModel,
            )
            from sentence_transformers import SentenceTransformer

            transformers = True
            return True
        except ImportError:
            return False
    return transformers is not None


FALLACY_LABELS = [
    "ad_hominem",
    "strawman",
    "false_dilemma",
    "slippery_slope",
    "appeal_to_authority",
    "bandwagon",
    "circular_reasoning",
    "red_herring",
    "no_fallacy",
]

FALLACY_DESCRIPTIONS = {
    "ad_hominem": "Attacking the person making the argument rather than the argument itself.",
    "strawman": "Misrepresenting someone's argument to make it easier to attack.",
    "false_dilemma": "Presenting only two options when more exist (black-and-white thinking).",
    "slippery_slope": "Arguing that one event will lead to a chain of negative events without evidence.",
    "appeal_to_authority": "Using an authority figure's opinion as evidence without proper justification.",
    "bandwagon": "Arguing something is true because many people believe or do it.",
    "circular_reasoning": "Using the conclusion as a premise in the argument.",
    "red_herring": "Introducing irrelevant information to distract from the main argument.",
    "no_fallacy": "No logical fallacy detected.",
}


class FallacyDetector:
    def __init__(self):
        self.classifier = None
        self.tokenizer = None
        self.model = None
        if _lazy_imports():
            self._load_model()

    def _load_model(self):
        try:
            from transformers import (
                AutoTokenizer,
                AutoModelForSequenceClassification,
                pipeline,
            )

            self.tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-mnli")
            self.model = AutoModelForSequenceClassification.from_pretrained(
                "facebook/bart-large-mnli"
            )
            self.model.eval()
            self.classifier = pipeline(
                "zero-shot-classification", model=self.model, tokenizer=self.tokenizer
            )
        except Exception as e:
            print(f"Warning: Could not load BART model: {e}")
            self.classifier = None

    def detect_fallacies(self, text: str) -> Tuple[List[str], Dict[str, float]]:
        if not text or not text.strip():
            return [], {}

        if self.classifier is not None:
            return self._detect_with_model(text)
        return self._detect_fallback(text)

    def _detect_with_model(self, text: str) -> Tuple[List[str], Dict[str, float]]:
        try:
            candidate_labels = [
                "ad hominem attack on person",
                "strawman misrepresentation",
                "false dilemma either or",
                "slippery slope chain of events",
                "appeal to authority",
                "bandwagon popular opinion",
                "circular reasoning repeating",
                "red herring distraction",
                "valid logical argument",
            ]

            result = self.classifier(text, candidate_labels, multi_label=True)

            detected = []
            confidences = {}

            for label, score in zip(result["labels"], result["scores"]):
                if score > 0.3:
                    fallacy_type = self._map_label_to_fallacy(label)
                    if fallacy_type:
                        detected.append(fallacy_type)
                        confidences[fallacy_type] = round(score, 3)

            if not detected:
                detected.append("no_fallacy")
                confidences["no_fallacy"] = 0.7

            return detected, confidences

        except Exception as e:
            print(f"Model inference error: {e}")
            return self._detect_fallback(text)

    def _map_label_to_fallacy(self, label: str) -> Optional[str]:
        mapping = {
            "ad hominem attack on person": "ad_hominem",
            "strawman misrepresentation": "strawman",
            "false dilemma either or": "false_dilemma",
            "slippery slope chain of events": "slippery_slope",
            "appeal to authority": "appeal_to_authority",
            "bandwagon popular opinion": "bandwagon",
            "circular reasoning repeating": "circular_reasoning",
            "red herring distraction": "red_herring",
            "valid logical argument": None,
        }
        return mapping.get(label)

    def _detect_fallback(self, text: str) -> Tuple[List[str], Dict[str, float]]:
        import re

        patterns = {
            "ad_hominem": [
                r"\b(you|your|you're)\s+(are|were|stupid|idiot|dumb)",
                r"\b(stupid|idiot|dumb|moronic)\s+(person|man|woman)",
            ],
            "strawman": [
                r"\b(so\s+you're\s+saying|you're\s+essentially)",
                r"\bmisrepresenting|distort|twist",
            ],
            "false_dilemma": [
                r"\b(either|or)\s+(you|we|they)\s+(are|is|have)",
                r"\b(only|just)\s+two\s+(choices?|options?)",
            ],
            "slippery_slope": [
                r"\b(if|once)\s+.*\s+(then|will)\s+.*\s+(inevitably|always)",
                r"\bleads?\s+to\s+(doom|disaster|catastrophe)",
            ],
        }

        text_lower = text.lower()
        detected = []
        confidences = {}

        for fallacy, pattern_list in patterns.items():
            for pattern in pattern_list:
                if re.search(pattern, text_lower):
                    detected.append(fallacy)
                    confidences[fallacy] = 0.6
                    break

        if not detected:
            detected.append("no_fallacy")
            confidences["no_fallacy"] = 0.7

        return detected, confidences

    def get_fallacy_descriptions(self) -> Dict[str, str]:
        return FALLACY_DESCRIPTIONS


class ArgumentStrengthScorer:
    def __init__(self):
        self.sentence_model = None
        self.sentiment_analyzer = None
        if _lazy_imports():
            self._load_models()

    def _load_models(self):
        try:
            from sentence_transformers import SentenceTransformer

            self.sentence_model = SentenceTransformer(
                "sentence-transformers/all-MiniLM-L6-v2"
            )
        except Exception as e:
            print(f"Warning: Could not load sentence transformer: {e}")

        try:
            from transformers import pipeline

            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
            )
        except Exception as e:
            print(f"Warning: Could not load sentiment analyzer: {e}")

    def calculate_strength(self, text: str, context: str = "") -> Dict[str, float]:
        if not text or not text.strip():
            return {
                "overall": 0.0,
                "coherence": 0.0,
                "evidence": 0.0,
                "sentiment": 0.0,
                "logical": 0.0,
            }

        coherence = self._calculate_coherence(text, context)
        evidence = self._calculate_evidence(text)
        sentiment = self._calculate_sentiment(text)
        logical = self._calculate_logical_markers(text)

        overall = coherence * 0.30 + evidence * 0.35 + sentiment * 0.15 + logical * 0.20

        return {
            "overall": round(overall, 3),
            "coherence": round(coherence, 3),
            "evidence": round(evidence, 3),
            "sentiment": round(sentiment, 3),
            "logical": round(logical, 3),
        }

    def _calculate_coherence(self, text: str, context: str) -> float:
        import numpy as np

        if self.sentence_model is None:
            sentences = text.split(".")
            if len(sentences) > 1:
                return 0.6
            return 0.5

        if not context:
            sentences = text.split(".")
            if len(sentences) > 1:
                embeddings = self.sentence_model.encode(sentences)
                if len(embeddings) >= 2:
                    similarity = np.dot(embeddings[0], embeddings[1]) / (
                        np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
                    )
                    return float(similarity)
            return 0.6

        try:
            embeddings = self.sentence_model.encode([text, context])
            similarity = np.dot(embeddings[0], embeddings[1]) / (
                np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
            )
            return float((similarity + 1) / 2)
        except:
            return 0.5

    def _calculate_evidence(self, text: str) -> float:
        evidence_indicators = [
            "study",
            "research",
            "evidence",
            "data",
            "statistics",
            "percent",
            "according to",
            "shown",
            "demonstrated",
            "proven",
            "found",
            "example",
            "instance",
            "case",
            "source",
            "report",
        ]

        text_lower = text.lower()
        indicator_count = sum(
            1 for indicator in evidence_indicators if indicator in text_lower
        )

        if indicator_count >= 3:
            return 0.9
        elif indicator_count >= 1:
            return 0.7
        else:
            return max(0.2, 1.0 - (len(text.split()) / 200))

    def _calculate_sentiment(self, text: str) -> float:
        if self.sentiment_analyzer is not None:
            try:
                result = self.sentiment_analyzer(text[:512])[0]
                score = result["score"]
                if result["label"] == "NEGATIVE":
                    score = 1 - score
                return score
            except:
                pass

        positive_words = [
            "good",
            "great",
            "excellent",
            "better",
            "benefit",
            "success",
            "improve",
            "effective",
        ]
        negative_words = [
            "bad",
            "terrible",
            "worse",
            "harm",
            "failure",
            "decline",
            "weak",
            "wrong",
            "problem",
        ]

        words = text.lower().split()
        pos_count = sum(1 for w in words if w in positive_words)
        neg_count = sum(1 for w in words if w in negative_words)

        total = pos_count + neg_count
        if total == 0:
            return 0.5

        balance = abs(pos_count - neg_count) / len(words)
        return min(balance * 5 + 0.3, 1.0)

    def _calculate_logical_markers(self, text: str) -> float:
        logical_markers = [
            "because",
            "therefore",
            "thus",
            "hence",
            "consequently",
            "however",
            "although",
            "nevertheless",
            "moreover",
            "furthermore",
            "first",
            "second",
            "third",
            "finally",
            "suggests",
            "implies",
            "indicates",
        ]

        text_lower = text.lower()
        marker_count = sum(1 for marker in logical_markers if marker in text_lower)

        if marker_count >= 3:
            return 0.85
        elif marker_count >= 1:
            return 0.65
        else:
            return 0.4
