# Common Errors & Debugging — LogicShield

> This document catalogues two frequently encountered errors during the development and testing of **LogicShield**, including their symptoms, root-cause analysis, and the methods used to resolve them. These are representative of the types of issues one would encounter while building and locally testing a full-stack AI web application with ML model dependencies.

---

## Error 1: CORS Policy Blocking Frontend-to-Backend Requests

### 1.1 Error Description

When the Next.js frontend (running on `http://localhost:3000`) attempts to make API calls to the FastAPI backend (running on `http://localhost:8000`), the browser blocks the requests with a Cross-Origin Resource Sharing (CORS) policy error.

### 1.2 Error Message

```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/analyze'
from origin 'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

In the browser console, the accompanying network error appears as:

```
TypeError: Failed to fetch
    at AnalysisService.analyzeArgument (analysis.ts:45)
    at async DebatePage.handleSubmit (page.tsx:112)
```

### 1.3 Fault Analysis

| Aspect              | Detail                                                                                                          |
|----------------------|-----------------------------------------------------------------------------------------------------------------|
| **Root Cause**       | The FastAPI backend's CORS middleware was not configured to allow requests from the frontend's origin.          |
| **Why It Occurs**    | Web browsers enforce the Same-Origin Policy. When the frontend (`localhost:3000`) and backend (`localhost:8000`) run on different ports, they are considered different origins. Without explicit CORS headers from the backend, the browser rejects the response. |
| **Affected Module**  | `backend/main.py` — CORS middleware configuration                                                              |
| **Impact**           | All API functionality is inaccessible from the frontend; the entire application appears non-functional.        |

### 1.4 Method of Resolution

**Step 1**: Identified that the `CORSMiddleware` in `backend/main.py` was either missing or had incomplete origin entries.

**Step 2**: Updated the CORS middleware configuration to explicitly allow the frontend's development origin, including both `localhost` and `127.0.0.1` variants:

```python
# backend/main.py — Corrected CORS Configuration

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization", "X-Auth-Token"],
    expose_headers=["Authorization", "X-Auth-Token"],
)
```

**Step 3**: Verified the fix by restarting the backend server and confirming that the frontend could successfully communicate with all API endpoints (`/analyze`, `/debate/start`, `/debate/counter`, etc.).

### 1.5 Prevention Measures

- Always configure CORS origins at the start of backend development to include all dev-server ports.
- Use environment-based CORS configuration (via `.env`) to avoid hardcoding origins, making the setup portable across development, staging, and production.
- When deploying, update `CORS_ORIGINS` in the environment to include the production domain.

---

## Error 2: `ModuleNotFoundError` for ML/NLP Packages in Demo Mode

### 2.1 Error Description

When running the backend after installing only the base dependencies (`requirements.txt`), the server crashes on startup or on the first API request with an `ImportError` or `ModuleNotFoundError` for ML packages such as `torch`, `transformers`, or `sentence_transformers`.

### 2.2 Error Message

```
Traceback (most recent call last):
  File "backend/services/fallacy_detector.py", line 23, in _lazy_imports
    import torch
ModuleNotFoundError: No module named 'torch'

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "backend/services/analysis.py", line 78, in __init__
    self.fallacy_detector = FallacyDetector()
  ...
Exception: Could not load ML models: No module named 'torch'
```

Alternatively, if the error was not properly caught, the user would see:

```
ERROR:    Application startup failed.
```

### 2.3 Fault Analysis

| Aspect              | Detail                                                                                                          |
|----------------------|-----------------------------------------------------------------------------------------------------------------|
| **Root Cause**       | The ML/NLP packages (`torch`, `transformers`, `sentence-transformers`) are listed in `requirements-local.txt` but not in the base `requirements.txt`. Installing only `requirements.txt` means these packages are absent from the Python environment. |
| **Why It Occurs**    | LogicShield uses a dual-dependency strategy: `requirements.txt` (lightweight, ~50 MB) for demo/production deployment, and `requirements-local.txt` (heavy, ~4 GB with PyTorch and transformer models) for full ML capability. If the code does not properly handle the absence of ML packages, the import fails. |
| **Affected Module**  | `backend/services/fallacy_detector.py`, `backend/services/reputation_risk.py`, `backend/services/analysis.py`  |
| **Impact**           | Server fails to start or crashes on first analysis request, making the entire application unusable.             |

### 2.4 Method of Resolution

**Step 1**: Implemented **lazy imports** with try/except blocks in all ML-dependent service modules. Instead of importing `torch` and `transformers` at the module's top-level, they are imported only when actually needed:

```python
# backend/services/fallacy_detector.py — Lazy Import Pattern

torch = None
transformers = None

def _lazy_imports():
    global torch, transformers
    if torch is None:
        try:
            import torch
            from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
            transformers = True
            return True
        except ImportError:
            return False
    return transformers is not None
```

**Step 2**: Added a **graceful fallback** in the `AnalysisService.__init__()` method. If ML models cannot be loaded, the system automatically switches to Demo Mode instead of crashing:

```python
# backend/services/analysis.py — Graceful Degradation

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
                settings.DEMO_MODE = True   # <-- Auto-fallback to demo
```

**Step 3**: Ensured the `DEMO_MODE` flag in `backend/app/config.py` defaults to `True` for new clones so that first-time users never encounter this error:

```python
# backend/app/config.py — Default Demo Mode

def is_demo_mode() -> bool:
    demo_env = os.getenv("DEMO_MODE", "")
    if demo_env.strip() == "":
        return True              # <-- Default: demo mode ON
    return demo_env.lower() in ("true", "1", "yes")
```

**Step 4**: Verified by running the server with only base dependencies and confirming that:
- The server starts without errors.
- API responses include `"demo_mode": true` to indicate simulated data.
- All endpoints return valid, structured responses using template-based analysis.

### 2.5 Prevention Measures

- Always use the lazy import pattern for optional heavy dependencies in Python projects.
- Provide clear documentation distinguishing between base and full dependency files.
- Default to the safe/lightweight mode for new installations.
- Include a health-check endpoint (`GET /api/v1/health`) that reports which services are running in demo vs. full mode, making it immediately clear to the developer which mode is active.

---

## Summary Table

| #   | Error                                      | Type             | Severity   | Root Cause                                          | Resolution Method                                     |
|-----|--------------------------------------------|------------------|------------|------------------------------------------------------|-------------------------------------------------------|
| 1   | CORS policy blocks frontend API calls      | Configuration    | Critical   | Missing/incomplete CORS origins in backend middleware | Add all dev origins to `CORSMiddleware` config         |
| 2   | `ModuleNotFoundError` for ML packages      | Dependency       | Critical   | ML packages not installed with base `requirements.txt`| Lazy imports + auto-fallback to Demo Mode             |

---

*These errors are representative of real-world development challenges encountered during the building and testing of LogicShield. The resolution methods follow software engineering best practices including graceful degradation, defensive programming, and environment-aware configuration.*
