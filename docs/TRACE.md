# Algorithm Trace — LogicShield: AI-Argument Simulator With Risk Forecasting

> This document presents a step-by-step algorithm trace for the core processing pipeline of **LogicShield**, simulating how the system processes a user's argument from raw input to final analysed output. The trace mirrors a traditional dry-run approach used in academic documentation to illustrate the internal data flow and transformations at each processing stage.

---

## 1. System Overview

LogicShield follows a **three-stage pipeline** for argument analysis:

```
┌─────────────┐      ┌──────────────────────────────┐      ┌──────────────────┐
│   INPUT      │ ──▶  │        PROCESS                │ ──▶  │     OUTPUT        │
│ (User Text)  │      │ Fallacy Detection             │      │ Analysis Report   │
│              │      │ Argument Strength Scoring      │      │ (JSON Response)   │
│              │      │ Reputation Risk Estimation     │      │                   │
└─────────────┘      └──────────────────────────────┘      └──────────────────┘
```

---

## 2. Sample Input

For this trace, we use the following sample argument text submitted by the user:

| Field         | Value                                                                                                      |
|---------------|------------------------------------------------------------------------------------------------------------|
| **Text**      | `"You are an idiot if you think AI is safe. Everyone knows it will always lead to job loss and total doom."` |
| **Context**   | `"Debating whether AI is beneficial for society"`                                                           |
| **Endpoint**  | `POST /api/v1/analyze`                                                                                     |

---

## 3. Algorithm Trace — Step-by-Step Dry Run

### Stage 1: INPUT — Request Reception & Validation

| Step | Operation                         | Value / State                                                                                               |
|------|-----------------------------------|-------------------------------------------------------------------------------------------------------------|
| 1.1  | HTTP Request received             | `POST /api/v1/analyze` with JSON body                                                                       |
| 1.2  | Pydantic schema validation        | Schema: `AnalysisRequest(text: str, context: Optional[str])`                                                |
| 1.3  | Validate `text` field             | `min_length=1` ✓ — Input length = 93 characters → **PASS**                                                 |
| 1.4  | Validate `context` field          | Optional, present → `"Debating whether AI is beneficial for society"` → **PASS**                            |
| 1.5  | Route to handler                  | `analyze_argument(request)` in `api/main.py` is invoked                                                    |
| 1.6  | Extract fields                    | `text ← request.text`, `context ← request.context`                                                         |

> **State after Stage 1:**  
> `text = "You are an idiot if you think AI is safe. Everyone knows it will always lead to job loss and total doom."`  
> `context = "Debating whether AI is beneficial for society"`

---

### Stage 2: PROCESS — Analysis Pipeline

The handler calls `AnalysisService.analyze_argument(text, context)`, which orchestrates three sub-modules in sequence.

---

#### Stage 2A: Fallacy Detection — `FallacyDetector.detect_fallacies(text)`

**Model**: `facebook/bart-large-mnli` (Zero-Shot Classification, Multi-Label)

| Step | Operation                             | Value / State                                                                                                                                      |
|------|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| 2A.1 | Check empty input                     | `text.strip()` → non-empty → **CONTINUE**                                                                                                        |
| 2A.2 | Check if ML model is loaded           | `self.classifier is not None` → **True** → use `_detect_with_model(text)`                                                                        |
| 2A.3 | Define candidate labels               | `["ad hominem attack on person", "strawman misrepresentation", "false dilemma either or", "slippery slope chain of events", "appeal to authority", "bandwagon popular opinion", "circular reasoning repeating", "red herring distraction", "valid logical argument"]` |
| 2A.4 | Run zero-shot classification          | `self.classifier(text, candidate_labels, multi_label=True)`                                                                                       |
| 2A.5 | Raw model output (scores)             | `{ "ad hominem attack on person": 0.82, "bandwagon popular opinion": 0.71, "slippery slope chain of events": 0.65, "false dilemma either or": 0.28, "valid logical argument": 0.12, ... }` |
| 2A.6 | Apply confidence threshold (> 0.3)    | **Pass**: ad_hominem (0.82), bandwagon (0.71), slippery_slope (0.65). **Fail**: false_dilemma (0.28), valid_logical (0.12)                         |
| 2A.7 | Map labels to fallacy types           | `"ad hominem attack on person"` → `"ad_hominem"`, `"bandwagon popular opinion"` → `"bandwagon"`, `"slippery slope chain of events"` → `"slippery_slope"` |
| 2A.8 | Build result lists                    | `detected = ["ad_hominem", "bandwagon", "slippery_slope"]`                                                                                        |
| 2A.9 | Build confidence map                  | `confidences = {"ad_hominem": 0.82, "bandwagon": 0.71, "slippery_slope": 0.65}`                                                                  |

> **Output of Stage 2A:**  
> `fallacies = ["ad_hominem", "bandwagon", "slippery_slope"]`  
> `fallacy_confidences = {"ad_hominem": 0.82, "bandwagon": 0.71, "slippery_slope": 0.65}`

---

#### Stage 2B: Argument Strength Scoring — `ArgumentStrengthScorer.calculate_strength(text, context)`

Four sub-scores are computed independently and then combined using weighted aggregation.

##### Sub-Score 2B-i: Coherence Score

| Step  | Operation                                  | Value / State                                                                                                |
|-------|--------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| 2B.1  | Check if Sentence-BERT model loaded        | `self.sentence_model is not None` → **True**                                                                |
| 2B.2  | Context is non-empty                       | `context = "Debating whether AI..."` → use context-based coherence                                          |
| 2B.3  | Encode `[text, context]` via Sentence-BERT | `embeddings = model.encode([text, context])` → Two 384-dim vectors                                          |
| 2B.4  | Compute cosine similarity                  | `similarity = dot(emb[0], emb[1]) / (norm(emb[0]) * norm(emb[1]))` → `similarity ≈ 0.41`                   |
| 2B.5  | Normalise to [0, 1]                        | `coherence = (0.41 + 1) / 2` → **`coherence = 0.705`**                                                     |

##### Sub-Score 2B-ii: Evidence Score

| Step  | Operation                                  | Value / State                                                                                                |
|-------|--------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| 2B.6  | Define evidence indicator keywords         | `["study", "research", "evidence", "data", "statistics", "percent", "according to", "shown", "demonstrated", "proven", "found", "example", "instance", "case", "source", "report"]` |
| 2B.7  | Scan `text.lower()` for indicators         | `"You are an idiot if you think AI is safe. Everyone knows it will always lead to job loss and total doom."` |
| 2B.8  | Count matches                              | No evidence keywords found → `indicator_count = 0`                                                          |
| 2B.9  | Apply scoring rule (0 indicators)          | `evidence = max(0.2, 1.0 - (word_count / 200))` → `word_count = 21` → `evidence = max(0.2, 1.0 - 0.105)` → **`evidence = 0.895`** |

> *Note*: A high evidence score despite no evidence keywords occurs because the fallback formula rewards shorter texts. The ML-based mode provides more nuanced scoring.

##### Sub-Score 2B-iii: Sentiment Score

| Step   | Operation                                  | Value / State                                                                                               |
|--------|--------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| 2B.10  | Check if sentiment model loaded            | `self.sentiment_analyzer is not None` → **True** (DistilBERT SST-2)                                       |
| 2B.11  | Run sentiment analysis                     | `result = pipeline(text[:512])` → `{"label": "NEGATIVE", "score": 0.96}`                                  |
| 2B.12  | Apply inversion for negative               | Since `label == "NEGATIVE"`: `sentiment = 1 - 0.96` → **`sentiment = 0.04`**                              |

##### Sub-Score 2B-iv: Logical Markers Score

| Step   | Operation                                  | Value / State                                                                                               |
|--------|--------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| 2B.13  | Define logical marker keywords             | `["because", "therefore", "thus", "hence", "consequently", "however", "although", "nevertheless", "moreover", "furthermore", "first", "second", "third", "finally", "suggests", "implies", "indicates"]` |
| 2B.14  | Scan `text.lower()` for markers            | No logical markers found → `marker_count = 0`                                                              |
| 2B.15  | Apply scoring rule (0 markers)             | **`logical = 0.4`**                                                                                         |

##### Weighted Aggregation

| Step   | Operation                                  | Value / State                                                                                               |
|--------|--------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| 2B.16  | Apply weight formula                       | `overall = coherence×0.30 + evidence×0.35 + sentiment×0.15 + logical×0.20`                                 |
| 2B.17  | Compute                                    | `= 0.705×0.30 + 0.895×0.35 + 0.04×0.15 + 0.4×0.20`                                                       |
| 2B.18  | Calculate                                  | `= 0.2115 + 0.3133 + 0.006 + 0.08`                                                                        |
| 2B.19  | Final                                      | **`overall = 0.611`** (rounded to 3 decimal places)                                                        |

> **Output of Stage 2B:**  
> `strength_results = { overall: 0.611, coherence: 0.705, evidence: 0.895, sentiment: 0.04, logical: 0.4 }`

---

#### Stage 2C: Reputation Risk Estimation — `ReputationRiskEstimator.estimate_risk(text)`

Five risk categories are evaluated independently, then combined using weighted scoring.

| Step  | Sub-Module                 | Operation                                                                 | Score     |
|-------|----------------------------|---------------------------------------------------------------------------|-----------|
| 2C.1  | **Toxicity Detection**     | ML model (`martin-ha/toxic-comment-model`) classifies input               | —         |
| 2C.2  |                            | Result: `{"label": "toxic", "score": 0.89}` → label is "toxic"           | **0.89**  |
| 2C.3  | **Hate Speech Detection**  | ML model (`roberta-hate-speech-dynabench-r4`) classifies input            | —         |
| 2C.4  |                            | Result: `{"label": "nothate", "score": 0.72}` → label ≠ "hate"           | **0.0**   |
| 2C.5  | **Absolutist Phrasing**    | Keyword scan: `["always", "everyone"]` found → 2 matches                 | —         |
| 2C.6  |                            | `matches=2` → rule: ≥1 returns 0.5                                       | **0.5**   |
| 2C.7  | **Moral Polarity**         | Keyword scan: `["doom"]` → no exact match in extreme lists               | **0.0**   |
| 2C.8  | **Defensive Framing**      | Pattern scan: no conspiratorial or defensive patterns                     | **0.0**   |

##### Category Scores Summary

| Category                | Score   | Weight  | Weighted Contribution |
|-------------------------|---------|---------|-----------------------|
| `inflammatory`          | 0.89    | 0.25    | 0.2225                |
| `identity_sensitive`    | 0.0     | 0.30    | 0.0                   |
| `absolutist_phrasing`   | 0.5     | 0.20    | 0.1                   |
| `moral_polarity`        | 0.0     | 0.15    | 0.0                   |
| `defensive`             | 0.0     | 0.10    | 0.0                   |

| Step  | Operation                           | Value / State                                                                              |
|-------|-------------------------------------|--------------------------------------------------------------------------------------------|
| 2C.9  | Compute overall risk score          | `overall = 0.2225 + 0.0 + 0.1 + 0.0 + 0.0` → **`risk_score = 0.323`**                   |
| 2C.10 | Determine risk level                | `0.2 ≤ 0.323 < 0.5` → **`risk_level = "medium"`**                                        |
| 2C.11 | Collect risk factors                | Toxicity ≥ 0.5 → ✓ `"Uses provocative language..."`, Absolutist ≥ 0.5 → ✓ `"Uses absolute terms..."` |

> **Output of Stage 2C:**  
> `risk_results = { risk_level: "medium", risk_score: 0.323, risk_factors: ["Uses provocative language...", "Uses absolute terms..."], details: {inflammatory: 0.89, absolutist_phrasing: 0.5} }`

---

### Stage 3: OUTPUT — Response Assembly

The `AnalysisService.analyze_argument()` method assembles the final response by merging results from all three sub-modules.

| Step | Operation                              | Value / State                                                                                              |
|------|----------------------------------------|------------------------------------------------------------------------------------------------------------|
| 3.1  | Merge fallacy results                  | `fallacy_detected = ["ad_hominem", "bandwagon", "slippery_slope"]`                                        |
| 3.2  | Merge fallacy confidences              | `fallacy_confidences = {"ad_hominem": 0.82, "bandwagon": 0.71, "slippery_slope": 0.65}`                  |
| 3.3  | Attach fallacy descriptions            | Full FALLACY_DESCRIPTIONS dictionary is attached for frontend display                                      |
| 3.4  | Map strength sub-scores                | `argument_strength = 0.611`, `coherence_score = 0.705`, `evidence_score = 0.895`, `sentiment_score = 0.04`, `logical_score = 0.4` |
| 3.5  | Map risk results                       | `reputation_risk_level = "medium"`, `reputation_risk_score = 0.323`                                      |
| 3.6  | Attach risk factors                    | `risk_factors = ["Uses provocative language...", "Uses absolute terms..."]`                                |
| 3.7  | Generate timestamp                     | `timestamp = "2026-06-20T01:12:15.000000"` (UTC ISO-8601)                                                 |
| 3.8  | Build JSON response                    | Compose `AnalysisResponse` Pydantic model                                                                 |
| 3.9  | Return HTTP 200 with JSON body         | FastAPI serialises the response and returns it to the client                                               |

---

## 4. Final Output — JSON Response

```json
{
  "fallacy_detected": ["ad_hominem", "bandwagon", "slippery_slope"],
  "fallacy_confidences": {
    "ad_hominem": 0.82,
    "bandwagon": 0.71,
    "slippery_slope": 0.65
  },
  "fallacy_descriptions": {
    "ad_hominem": "Attacking the person making the argument rather than the argument itself.",
    "strawman": "Misrepresenting someone's argument to make it easier to attack.",
    "false_dilemma": "Presenting only two options when more exist (black-and-white thinking).",
    "slippery_slope": "Arguing that one event will lead to a chain of negative events without evidence.",
    "appeal_to_authority": "Using an authority figure's opinion as evidence without proper justification.",
    "bandwagon": "Arguing something is true because many people believe or do it.",
    "circular_reasoning": "Using the conclusion as a premise in the argument.",
    "red_herring": "Introducing irrelevant information to distract from the main argument.",
    "no_fallacy": "No logical fallacy detected."
  },
  "argument_strength": 0.611,
  "coherence_score": 0.705,
  "evidence_score": 0.895,
  "sentiment_score": 0.04,
  "logical_score": 0.4,
  "reputation_risk_level": "medium",
  "reputation_risk_score": 0.323,
  "risk_factors": [
    "Uses provocative language that may escalate tensions or attract backlash.",
    "Uses absolute terms that leave no room for nuance or exceptions."
  ],
  "timestamp": "2026-06-20T01:12:15.000000"
}
```

---

## 5. Trace Summary Table

| Stage    | Component                  | Input                                  | Key Transformation                                  | Output                                                 |
|----------|----------------------------|----------------------------------------|------------------------------------------------------|--------------------------------------------------------|
| **1**    | API Gateway                | Raw HTTP POST body                     | Pydantic validation & field extraction               | `text`, `context` strings                              |
| **2A**   | Fallacy Detector           | `text` string                          | Zero-shot classification with BART-large-MNLI        | `["ad_hominem", "bandwagon", "slippery_slope"]`        |
| **2B**   | Argument Strength Scorer   | `text`, `context` strings              | Coherence + Evidence + Sentiment + Logical scoring   | `overall = 0.611`                                      |
| **2C**   | Reputation Risk Estimator  | `text` string                          | Toxicity + Hate Speech + Absolutist + Moral + Defensive  | `risk_level = "medium"`, `risk_score = 0.323`         |
| **3**    | Response Assembly          | Results from 2A, 2B, 2C               | Merge into AnalysisResponse schema                   | Complete JSON response (HTTP 200)                      |

---

## 6. Data Flow Diagram

```
User Input (text, context)
        │
        ▼
┌─────────────────────┐
│  API Gateway         │
│  (FastAPI + Pydantic)│
│  Validate & Extract  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  AnalysisService     │
│  .analyze_argument() │
└─────────┬───────────┘
          │
    ┌─────┼──────────────┐
    │     │              │
    ▼     ▼              ▼
┌──────┐ ┌──────────┐ ┌──────────┐
│Fallacy│ │Argument  │ │Reputation│
│Detect │ │Strength  │ │Risk      │
│      │ │Scorer    │ │Estimator │
│ BART │ │ S-BERT   │ │ Toxicity │
│ MNLI │ │ DistilB. │ │ RoBERTa  │
└──┬───┘ └──┬───────┘ └──┬───────┘
   │        │            │
   └────────┼────────────┘
            │
            ▼
   ┌──────────────────┐
   │ Response Assembly │
   │ (Merge & Format)  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  JSON Response    │
   │  (HTTP 200 OK)    │
   └──────────────────┘
```

---

## 7. Complexity Analysis

| Component               | Time Complexity          | Space Complexity   | Notes                                            |
|-------------------------|--------------------------|--------------------|--------------------------------------------------|
| Pydantic Validation     | O(1)                     | O(n)               | n = input text length                            |
| Fallacy Detection       | O(n × k)                | O(n + k)           | n = tokens, k = candidate labels (9)             |
| Coherence (S-BERT)      | O(n)                     | O(d)               | d = embedding dimension (384)                    |
| Evidence Scoring        | O(n × m)                | O(1)               | m = indicator keywords (16)                      |
| Sentiment Analysis      | O(n)                     | O(n)               | Single forward pass through DistilBERT           |
| Logical Markers         | O(n × p)                | O(1)               | p = marker keywords (17)                         |
| Toxicity Detection      | O(n)                     | O(n)               | Single forward pass through toxicity model       |
| Hate Speech Detection   | O(n)                     | O(n)               | Single forward pass through RoBERTa              |
| Absolutist / Moral / Defensive | O(n × q)          | O(1)               | q = keyword/pattern count per category           |
| Response Assembly       | O(1)                     | O(r)               | r = total result fields                          |

**Overall**: O(n × k) dominated by transformer inference passes (Fallacy, Sentiment, Toxicity, Hate Speech).

---

*This trace demonstrates how LogicShield processes a single argument through its multi-model NLP pipeline, transforming raw text into a structured, quantified analysis report suitable for real-time feedback during debate training.*
