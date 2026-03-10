# 📚 LogicShield Backend Documentation

## 📖 Overview

The LogicShield backend is a FastAPI-based Python application that provides AI-powered argument analysis, debate simulation, logical fallacy detection, and reputation risk estimation using state-of-the-art transformer models. This document provides comprehensive documentation of the backend architecture, components, and API endpoints.

---

## 🏗️ Architecture

### Tech Stack

- **Framework**: FastAPI 0.104.1+
- **Database**: SQLite (dev) / PostgreSQL (prod) with SQLAlchemy ORM
- **NLP/ML Models**: Hugging Face Transformers, Sentence-BERT
- **Deep Learning**: PyTorch 2.1.0+ (CPU or GPU)
- **API Documentation**: OpenAPI/Swagger (built-in)

### Project Structure

```
backend/
├── main.py                    # Application entry point
├── app/
│   └── config.py             # Configuration settings
├── api/
│   ├── main.py               # API route handlers
│   └── schemas.py            # Pydantic request/response models
├── database/
│   ├── core/
│   │   └── database.py       # Database connection & session
│   └── models.py              # SQLAlchemy ORM models
├── services/
│   ├── fallacy_detector.py    # ML-based fallacy detection
│   ├── reputation_risk.py    # ML-based risk estimation
│   ├── debate_simulator.py   # AI debate simulation engine
│   └── analysis.py           # Unified analysis service
└── requirements.txt           # Python dependencies
```

---

## ⚙️ Core Components

### 1. Configuration (`app/config.py`)

The configuration module manages all application settings using Pydantic:

- **Database URL**: PostgreSQL connection string
- **API Version**: Current API version (v1)
- **CORS Origins**: Allowed origins for cross-origin requests
- **Model Configuration**: Hugging Face model settings

```python
from app.config import settings
# Access settings like: settings.DATABASE_URL
```

### 2. Database Layer

#### Connection Management (`database/core/database.py`)

- Creates SQLAlchemy engine with connection pooling
- Provides session factory for database operations
- Includes dependency injection function for FastAPI routes

```python
from database.core.database import get_db, init_db

# In FastAPI route:
def some_route(db: Session = Depends(get_db)):
    # Use db session
    pass
```

#### ORM Models (`database/models.py`)

**User Model**
- Stores user account information
- Links to debate sessions and analytics

**DebateSession Model**
- Represents a single debate session
- Stores topic, user stance, opponent persona
- Links to arguments and analysis results

**Argument Model**
- Individual argument within a debate
- Tracks whether from user or opponent

**AnalysisResult Model**
- Complete analysis results for each argument
- Stores fallacy detection, strength scores, and risk assessment

**UserAnalytics Model**
- Aggregated user performance metrics
- Tracks improvement over time

**FallacyExample Model**
- Repository of fallacy examples for reference

---

## 🤖 NLP/ML Services

### 1. Fallacy Detection (`services/fallacy_detector.py`)

The `FallacyDetector` class identifies 9 types of logical fallacies using transformer-based zero-shot classification:

| Fallacy Type | Description |
|-------------|-------------|
| ad_hominem | Attacking the person rather than the argument |
| strawman | Misrepresenting someone's argument |
| false_dilemma | Presenting only two options when more exist |
| slippery_slope | Assuming chain of negative events without evidence |
| appeal_to_authority | Using authority as sole evidence |
| bandwagon | Appealing to popularity |
| circular_reasoning | Using conclusion as premise |
| red_herring | Introducing irrelevant information |
| no_fallacy | Valid logical argument |

#### ML Models Used

- **Primary**: `facebook/bart-large-mnli` - Zero-shot classification model
- **Fallback**: Rule-based pattern matching (when model unavailable)

#### Detection Method

Uses BART-large-MNLI for zero-shot classification with multi-label support:

```python
from services.fallacy_detector import FallacyDetector

detector = FallacyDetector()
fallacies, confidences = detector.detect_fallacies("Your argument is stupid because...")

# Returns:
# fallacies: ["ad_hominem"]
# confidences: {"ad_hominem": 0.85}
```

### 2. Argument Strength Scoring (`services/fallacy_detector.py`)

The `ArgumentStrengthScorer` class evaluates argument quality across 4 dimensions using ML:

| Dimension | Weight | Method |
|-----------|--------|--------|
| Coherence | 30% | Sentence-BERT semantic similarity |
| Evidence | 35% | ML evidence detection + patterns |
| Sentiment | 15% | DistilBERT sentiment analysis |
| Logical | 20% | Logical marker detection |

#### ML Models Used

- **Semantic Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **Sentiment Analysis**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Fallback**: Rule-based keyword matching

#### Scoring Method

```python
from services.fallacy_detector import ArgumentStrengthScorer

scorer = ArgumentStrengthScorer()
scores = scorer.calculate_strength(
    text="Because research shows that climate change...",
    context="Previous arguments about environmental policy..."
)

# Returns:
# {
#     "overall": 0.82,
#     "coherence": 0.78,
#     "evidence": 0.85,
#     "sentiment": 0.72,
#     "logical": 0.80
# }
```

### 3. Reputation Risk Estimation (`services/reputation_risk.py`)

The `ReputationRiskEstimator` class assesses potential backlash risk using multiple ML classifiers:

| Risk Category | Weight | ML Model |
|--------------|--------|-----------|
| Identity Sensitive | 30% | facebook/roberta-hate-speech-dynabench-r4-target |
| Inflammatory | 25% | martin-ha/toxic-comment-model |
| Absolutist Phrasing | 20% | Pattern matching + ML |
| Moral Polarity | 15% | ML sentiment analysis |
| Defensive | 10% | Pattern matching |

#### ML Models Used

- **Toxicity Detection**: `martin-ha/toxic-comment-model`
- **Hate Speech Detection**: `facebook/roberta-hate-speech-dynabench-r4-target`
- **Fallback**: Rule-based keyword detection

#### Risk Levels

- **Low**: Score < 0.2
- **Medium**: Score 0.2-0.5
- **High**: Score 0.5-0.75
- **Critical**: Score > 0.75

```python
from services.reputation_risk import ReputationRiskEstimator

estimator = ReputationRiskEstimator()
risk = estimator.estimate_risk("This is absolutely the worst policy ever...")

# Returns:
# {
#     "risk_level": "high",
#     "risk_score": 0.72,
#     "risk_factors": [
#         {
#             "category": "absolutist_phrasing",
#             "score": 0.85,
#             "description": "Uses absolute terms..."
#         },
#         {
#             "category": "inflammatory",
#             "score": 0.65,
#             "description": "Uses provocative language..."
#         }
#     ]
# }
```

### 4. Debate Simulation (`services/debate_simulator.py`)

The `DebateSimulator` class generates adversarial counter-arguments with selectable personas:

#### Available Personas

| Persona | Description |
|---------|-------------|
| logical | Uses reason and evidence |
| aggressive | Confrontational style |
| skeptic | Questions everything |
| devil_advocate | Takes extreme positions |

#### Usage

```python
from services.debate_simulator import DebateSimulator

simulator = DebateSimulator()

# Get available personas
personas = simulator.get_available_personas()

# Generate counter-argument
counter = simulator.generate_counter_argument(
    topic="Climate Change",
    user_argument="We need immediate action",
    user_stance="support",
    persona="logical"
)
```

### 5. Unified Analysis Service (`services/analysis.py`)

Combines all ML services into a single interface:

```python
from services.analysis import AnalysisService

service = AnalysisService()
result = service.analyze_argument(
    text="Your argument is stupid because you always...",
    context="Previous context..."
)

# Returns complete analysis with all ML-derived metrics
```

---

## 🌐 API Endpoints

### Base URL

```
http://localhost:8000/api/v1
```

### Health & Info

#### GET `/health`

Returns API health status and available services.

**Response:**
```json
{
    "status": "healthy",
    "version": "1.0.0",
    "services": {
        "fallacy_detection": "active",
        "argument_analysis": "active",
        "reputation_risk": "active",
        "debate_simulation": "active"
    }
}
```

### Analysis Endpoints

#### POST `/analyze`

Analyzes a single argument for fallacies, strength, and risk using ML models.

**Request:**
```json
{
    "text": "Your argument is completely wrong because you're stupid",
    "context": ""
}
```

**Response:**
```json
{
    "fallacy_detected": ["ad_hominem"],
    "fallacy_confidences": {"ad_hominem": 0.89},
    "fallacy_descriptions": {...},
    "argument_strength": 0.32,
    "coherence_score": 0.50,
    "evidence_score": 0.20,
    "sentiment_score": 0.15,
    "logical_score": 0.30,
    "reputation_risk_level": "medium",
    "reputation_risk_score": 0.58,
    "risk_factors": [
        {
            "category": "inflammatory",
            "score": 0.72,
            "description": "Uses provocative language..."
        },
        {
            "category": "absolutist_phrasing",
            "score": 0.55,
            "description": "Uses absolute terms..."
        }
    ],
    "timestamp": "2025-01-15T10:30:00"
}
```

#### GET `/fallacy-types`

Returns all supported fallacy types and their descriptions.

#### GET `/personas`

Returns available debate opponent personas.

### Debate Session Endpoints

#### POST `/debate/start`

Starts a new debate session.

**Request:**
```json
{
    "topic": "Universal Basic Income",
    "user_stance": "support",
    "opponent_persona": "logical",
    "user_id": 1
}
```

#### POST `/debate/argument`

Adds an argument to a session and performs ML analysis.

**Request:**
```json
{
    "session_id": 1,
    "content": "UBI would reduce poverty significantly",
    "is_from_user": true
}
```

#### POST `/debate/counter`

Gets a counter-argument from the AI opponent.

**Request:**
```json
{
    "session_id": 1,
    "user_argument": "UBI would reduce poverty",
    "topic": "Universal Basic Income",
    "user_stance": "support",
    "persona": "logical"
}
```

#### GET `/debate/{session_id}/history`

Retrieves complete debate history including arguments and analysis.

#### POST `/debate/{session_id}/end`

Ends a debate session.

---

## 🔀 Data Flow

### Argument Analysis Flow (ML Pipeline)

```
User Input → API Endpoint → AnalysisService
    ↓
FallacyDetector → BART Zero-Shot Classification → Fallacy Predictions
    ↓
ArgumentStrengthScorer 
  ├─ Sentence-BERT → Coherence (semantic similarity)
  ├─ Evidence Patterns → Evidence Score
  ├─ DistilBERT → Sentiment Analysis
  └─ Logical Markers → Logical Score
    ↓
ReputationRiskEstimator
  ├─ Toxicity Model → Inflammatory Score
  ├─ Hate Speech Model → Identity Risk Score
  ├─ Pattern Matching → Absolutist Score
  └─ Sentiment → Moral Polarity Score
    ↓
Weighted Risk Calculation → Risk Level
    ↓
Combined Response → JSON → User
```

### Debate Simulation Flow

```
Start Session → Select Persona → Store in DB
    ↓
User Input → API → Store Argument
    ↓
Analyze User Argument (ML Pipeline) → Store Results
    ↓
DebateSimulator → Generate Counter-Argument Template
    ↓
Store Counter → Return to User
    ↓
Repeat or End Session
```

---

## 🧠 ML Models Summary

| Service | Model | Purpose |
|---------|-------|---------|
| Fallacy Detection | `facebook/bart-large-mnli` | Zero-shot fallacy classification |
| Semantic Similarity | `sentence-transformers/all-MiniLM-L6-v2` | Argument coherence scoring |
| Sentiment Analysis | `distilbert-base-uncased-finetuned-sst-2-english` | Emotional tone detection |
| Toxicity Detection | `martin-ha/toxic-comment-model` | Inflammatory content detection |
| Hate Speech Detection | `facebook/roberta-hate-speech-dynabench-r4-target` | Identity-sensitive language |

---

## 🗃️ Database Schema

The backend uses SQLAlchemy ORM with support for SQLite (development) and PostgreSQL (production).

### Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐
│    User     │       │  UserAnalytics   │
├─────────────┤       ├──────────────────┤
│ id (PK)     │◄──────│ user_id (FK)    │
│ email       │       │ total_sessions   │
│ username    │       │ avg_strength     │
│ full_name   │       │ avg_fallacy      │
│ created_at  │       │ strongest_area   │
└──────┬──────┘       │ weakest_area     │
       │              │ progress_data    │
       │ 1:N          └──────────────────┘
       ▼
┌──────────────────────┐
│   DebateSession      │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ topic                │
│ user_stance          │
│ opponent_persona     │
│ created_at           │
│ ended_at             │
└──────────┬───────────┘
           │
     1:N   │
     ┌─────┴─────┐
     ▼            ▼
┌──────────┐  ┌────────────────┐
│ Argument │  │AnalysisResult  │
├──────────┤  ├────────────────┤
│ id (PK)  │  │ id (PK)       │
│ session_id│ │ session_id(FK)│
│ content   │  │ argument_id(FK)│
│ is_from_  │  │ fallacy_detected│
│   user    │  │ fallacy_conf  │
│ created_at│  │ arg_strength  │
└──────────┘  │ coherence_scr │
             │ evidence_scr  │
             │ sentiment_scr  │
             │ risk_level    │
             │ risk_score    │
             │ risk_factors  │
             └───────────────┘
```

### Tables

---

### 1. Users Table

**Table Name:** `users`

**Description:** Stores user account information for authenticated users.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, INDEX, NULLABLE | User's email address |
| `username` | VARCHAR(100) | UNIQUE, INDEX, NULLABLE | Unique username |
| `hashed_password` | VARCHAR(255) | NULLABLE | Bcrypt hashed password |
| `full_name` | VARCHAR(255) | NULLABLE | User's full name |
| `created_at` | DATETIME | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | DATETIME | ON UPDATE | Last profile update |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |

**Indexes:**
- `idx_users_email` (email)
- `idx_users_username` (username)

**Relationships:**
- One-to-Many with `debate_sessions` (a user can have multiple debate sessions)
- One-to-One with `user_analytics` (each user has one analytics record)

---

### 2. Debate Sessions Table

**Table Name:** `debate_sessions`

**Description:** Represents a single debate session with a topic and opponent.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique session identifier |
| `user_id` | INTEGER | FOREIGN KEY → users(id), NULLABLE | Owner of the session |
| `topic` | TEXT | NOT NULL | The debate topic/argument |
| `user_stance` | VARCHAR(50) | NOT NULL | User's position: `support`, `oppose`, or `neutral` |
| `opponent_persona` | VARCHAR(50) | DEFAULT 'logical' | AI opponent type |
| `created_at` | DATETIME | DEFAULT NOW() | Session start time |
| `ended_at` | DATETIME | NULLABLE | Session end time |

**Valid Values for `user_stance`:**
- `support` - User supports the topic
- `oppose` - User opposes the topic
- `neutral` - User is neutral/discussing

**Valid Values for `opponent_persona`:**
- `logical` - Logical challenger
- `aggressive` - Aggressive debater
- `skeptical` - Skeptic
- `devil_advocate` - Devil's advocate

**Relationships:**
- Many-to-One with `users` (a session belongs to one user)
- One-to-Many with `arguments` (a session has multiple arguments)
- One-to-Many with `analysis_results` (each argument gets analyzed)

---

### 3. Arguments Table

**Table Name:** `arguments`

**Description:** Stores individual arguments within a debate session.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique argument identifier |
| `session_id` | INTEGER | FOREIGN KEY → debate_sessions(id), NOT NULL | Parent debate session |
| `content` | TEXT | NOT NULL | The argument text |
| `is_from_user` | BOOLEAN | DEFAULT TRUE | TRUE if from user, FALSE if from AI opponent |
| `created_at` | DATETIME | DEFAULT NOW() | When argument was made |

**Relationships:**
- Many-to-One with `debate_sessions`
- One-to-One with `analysis_results` (each argument has one analysis)

---

### 4. Analysis Results Table

**Table Name:** `analysis_results`

**Description:** Stores ML analysis results for each argument including fallacy detection, strength scoring, and risk assessment.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique analysis identifier |
| `session_id` | INTEGER | FOREIGN KEY → debate_sessions(id), NOT NULL | Parent session |
| `argument_id` | INTEGER | FOREIGN KEY → arguments(id), NULLABLE | Analyzed argument |

**Fallacy Detection Columns:**
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `fallacy_detected` | JSON | DEFAULT '[]' | List of detected fallacy types |
| `fallacy_confidences` | JSON | DEFAULT '{}' | Confidence scores per fallacy |

**Argument Strength Columns:**
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `argument_strength` | FLOAT | DEFAULT 0.0 | Overall strength score (0-1) |
| `coherence_score` | FLOAT | DEFAULT 0.0 | Semantic coherence (0-1) |
| `evidence_score` | FLOAT | DEFAULT 0.0 | Evidence presence (0-1) |
| `sentiment_score` | FLOAT | DEFAULT 0.0 | Sentiment balance (0-1) |
| `extremity_score` | FLOAT | DEFAULT 0.0 | Logical extremity (0-1) |

**Reputation Risk Columns:**
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `reputation_risk_level` | VARCHAR(20) | DEFAULT 'low' | Risk category: `low`, `medium`, `high`, `critical` |
| `reputation_risk_score` | FLOAT | DEFAULT 0.0 | Overall risk score (0-1) |
| `risk_factors` | JSON | DEFAULT '[]' | List of detected risk factors |

**Metadata:**
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `created_at` | DATETIME | DEFAULT NOW() | Analysis timestamp |

**JSON Structure Examples:**

```json
// fallacy_detected
["ad_hominem", "false_dilemma"]

// fallacy_confidences
{"ad_hominem": 0.85, "false_dilemma": 0.62}

// risk_factors
[
  {
    "category": "inflammatory",
    "score": 0.72,
    "description": "Uses provocative language..."
  }
]
```

**Relationships:**
- Many-to-One with `debate_sessions`
- Many-to-One with `arguments` (optional - can analyze without linking to stored argument)

---

### 5. User Analytics Table

**Table Name:** `user_analytics`

**Description:** Aggregated user performance metrics and progress tracking.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique analytics identifier |
| `user_id` | INTEGER | FOREIGN KEY → users(id), UNIQUE, NOT NULL | Associated user |

**Performance Metrics:**
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `total_sessions` | INTEGER | DEFAULT 0 | Total debate sessions completed |
| `average_argument_strength` | FLOAT | DEFAULT 0.0 | Mean argument strength score |
| `average_fallacy_count` | FLOAT | DEFAULT 0.0 | Mean fallacies per argument |
| `average_reputation_risk` | FLOAT | DEFAULT 0.0 | Mean risk score |

**Skill Assessment:**
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `strongest_area` | VARCHAR(100) | DEFAULT '' | User's strongest skill |
| `weakest_area` | VARCHAR(100) | DEFAULT '' | Area needing improvement |

**Progress Tracking:**
| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `recent_improvement` | JSON | DEFAULT '{}' | Recent improvement metrics |
| `progress_data` | JSON | DEFAULT '[]' | Historical progress array |
| `updated_at` | DATETIME | DEFAULT NOW(), ON UPDATE | Last analytics update |

**JSON Structure Examples:**

```json
// recent_improvement
{
  "argument_strength_delta": 0.05,
  "fallacy_reduction": 0.02,
  "period": "last_7_days"
}

// progress_data
[
  {"date": "2025-01-01", "strength": 0.65, "fallacies": 1.2},
  {"date": "2025-01-08", "strength": 0.70, "fallacies": 0.8}
]
```

**Relationships:**
- One-to-One with `users`

---

### 6. Fallacy Examples Table

**Table Name:** `fallacy_examples`

**Description:** Reference repository of fallacy examples for learning.

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique example identifier |
| `fallacy_type` | VARCHAR(50) | NOT NULL | Type of fallacy |
| `example_text` | TEXT | NOT NULL | Example of the fallacy |
| `explanation` | TEXT | NULLABLE | Why this is a fallacy |
| `category` | VARCHAR(50) | DEFAULT 'general' | Example category |
| `created_at` | DATETIME | DEFAULT NOW() | Creation timestamp |

**Valid Values for `fallacy_type`:**
- `ad_hominem`
- `strawman`
- `false_dilemma`
- `slippery_slope`
- `appeal_to_authority`
- `bandwagon`
- `circular_reasoning`
- `red_herring`

**Valid Values for `category`:**
- `general`
- `political`
- `academic`
- `media`

---

### Complete Relationship Summary

| Parent Table | Child Table | Relationship Type | Description |
|--------------|-------------|-------------------|-------------|
| `users` | `debate_sessions` | One-to-Many | User can have multiple debate sessions |
| `users` | `user_analytics` | One-to-One | One analytics record per user |
| `debate_sessions` | `arguments` | One-to-Many | Session contains many arguments |
| `debate_sessions` | `analysis_results` | One-to-Many | Each argument analyzed |
| `arguments` | `analysis_results` | One-to-One | One analysis per argument |

---

### Database Creation (SQL)

For PostgreSQL:

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE,
    hashed_password VARCHAR(255),
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Debate Sessions Table
CREATE TABLE debate_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    topic TEXT NOT NULL,
    user_stance VARCHAR(50) NOT NULL,
    opponent_persona VARCHAR(50) DEFAULT 'logical',
    created_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- Arguments Table
CREATE TABLE arguments (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES debate_sessions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_from_user BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analysis Results Table
CREATE TABLE analysis_results (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES debate_sessions(id) ON DELETE CASCADE,
    argument_id INTEGER REFERENCES arguments(id),
    fallacy_detected JSON DEFAULT '[]',
    fallacy_confidences JSON DEFAULT '{}',
    argument_strength FLOAT DEFAULT 0.0,
    coherence_score FLOAT DEFAULT 0.0,
    evidence_score FLOAT DEFAULT 0.0,
    sentiment_score FLOAT DEFAULT 0.0,
    extremity_score FLOAT DEFAULT 0.0,
    reputation_risk_level VARCHAR(20) DEFAULT 'low',
    reputation_risk_score FLOAT DEFAULT 0.0,
    risk_factors JSON DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Analytics Table
CREATE TABLE user_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_sessions INTEGER DEFAULT 0,
    average_argument_strength FLOAT DEFAULT 0.0,
    average_fallacy_count FLOAT DEFAULT 0.0,
    average_reputation_risk FLOAT DEFAULT 0.0,
    strongest_area VARCHAR(100) DEFAULT '',
    weakest_area VARCHAR(100) DEFAULT '',
    recent_improvement JSON DEFAULT '{}',
    progress_data JSON DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fallacy Examples Table
CREATE TABLE fallacy_examples (
    id SERIAL PRIMARY KEY,
    fallacy_type VARCHAR(50) NOT NULL,
    example_text TEXT NOT NULL,
    explanation TEXT,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚙️ Configuration

### Environment Variables

A template file `backend/.env.template` is provided with all available configuration options. Copy it to `.env` and update the values as needed.

```bash
# Copy the template
cp backend/.env.template backend/.env

# Edit .env with your values
```

**All Available Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection URL | `sqlite:///./logicshield.db` |
| `USE_SQLITE` | Use SQLite (true/false) | `true` |
| `SECRET_KEY` | Secret key for JWT/sessions | (auto-generated) |
| `HF_TOKEN` | Hugging Face token (optional) | (none) |
| `HF_ENDPOINT` | Hugging Face mirror URL (optional) | (none) |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Debug mode (true/false) | `true` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `FALLACY_MODEL` | Fallacy detection model | `facebook/bart-large-mnli` |
| `EMBEDDING_MODEL` | Sentence embedding model | `sentence-transformers/all-MiniLM-L6-v2` |
| `LOG_LEVEL` | Logging level | `INFO` |

**Note:** Empty values in `.env` will fall back to defaults automatically.

---

## 🚀 Running the Backend

### Installation

```bash
cd backend
pip install -r requirements.txt
```

**Important**: On first run, the ML models will be downloaded from Hugging Face (~3GB total). Set `HF_TOKEN` environment variable for faster downloads.

**Note**: On Windows, if you encounter DLL errors with PyTorch, reinstall with:
```bash
pip uninstall torch -y
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### Database Setup

The backend supports both SQLite (for development) and PostgreSQL (for production).

#### SQLite (Default - No Setup Required)
By default, the app uses SQLite (`logicshield.db`). No additional setup needed.

#### PostgreSQL (Production)
Set environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/logicshield"
export USE_SQLITE=false
```

Or create the database:
```sql
CREATE DATABASE logicshield;
```

### Start Server

```bash
# Development (CPU)
cd backend
uvicorn main:app --reload

# Development with GPU (if available)
set CUDA_VISIBLE_DEVICES=0
uvicorn main:app --reload

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### API Documentation

Access the interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 💾 Model Caching

Models are automatically cached after first use in:
- Linux/Mac: `~/.cache/huggingface/`
- Windows: `C:\Users\<user>\.cache\huggingface\`

To pre-download models:
```python
from transformers import AutoModel, AutoTokenizer
from sentence_transformers import SentenceTransformer

# Download all models at once
bart = AutoModel.from_pretrained("facebook/bart-large-mnli")
tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-mnli")
sentence_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
```

---

## ⚡ Performance Considerations

- **First Request**: Models load on first use (~5-10 seconds)
- **Subsequent Requests**: Fast inference (~100-500ms)
- **Memory**: ~2GB RAM for all models loaded
- **GPU**: Recommended for production (10x faster inference)
- **Caching**: Consider Redis for repeated analyses

---

## 🔧 Extending the Backend

### Adding New Fallacy Types

1. Add to `FALLACY_LABELS` in `services/fallacy_detector.py`
2. Add description to `FALLACY_DESCRIPTIONS`
3. The BART model will automatically include new types in zero-shot classification

### Adding New Personas

1. Add persona to `PERSONAS` in `services/debate_simulator.py`
2. Update the regex pattern in the API schema

### Using Different Models

Replace model names in service constructors:

```python
# Example: Use a different sentence transformer
self.sentence_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# Example: Use a different toxicity model
self.toxicity_classifier = pipeline(
    "text-classification",
    model="nicholasKluge/ToxicityModel"
)
```

---

## 🔍 Troubleshooting

### Windows-Specific Issues

#### PyTorch DLL Errors
If you encounter "DLL load failed" errors on Windows:
```bash
pip uninstall torch -y
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

#### Symlink Warnings on Windows
The warning about symlinks is harmless. To silence it:
```bash
set HF_HUB_DISABLE_SYMLINKS_WARNING=1
```

### Model Download Errors

1. Check internet connection
2. Set HF_TOKEN environment variable for higher rate limits
3. Use mirror: `set HF_ENDPOINT=https://hf-mirror.com`

### Memory Issues

1. Reduce batch size
2. Use smaller models (e.g., distilbert instead of roberta)
3. Enable model offloading

### CUDA/GPU Errors

1. Ensure PyTorch with CUDA installed: `pip install torch --index-url https://download.pytorch.org/whl/cu118`
2. Check GPU availability: `python -c "import torch; print(torch.cuda.is_available())"`

---

## 📜 License

This project is part of LogicShield - AI-Argument Simulator with Risk Forecasting.
