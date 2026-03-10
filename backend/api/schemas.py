from typing import List, Optional
from pydantic import BaseModel, Field


class DebateSessionCreate(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500)
    user_stance: str = Field(..., pattern="^(support|oppose|neutral)$")
    opponent_persona: str = Field(default="logical", pattern="^(logical|aggressive|skeptical|devil_advocate)$")
    user_id: Optional[int] = None


class DebateSessionResponse(BaseModel):
    id: int
    topic: str
    user_stance: str
    opponent_persona: str
    created_at: str
    
    class Config:
        from_attributes = True


class ArgumentCreate(BaseModel):
    session_id: int
    content: str = Field(..., min_length=1)
    is_from_user: bool = True


class ArgumentResponse(BaseModel):
    id: int
    session_id: int
    content: str
    is_from_user: bool
    created_at: str
    
    class Config:
        from_attributes = True


class CounterArgumentRequest(BaseModel):
    session_id: int
    user_argument: str
    topic: str
    user_stance: str
    persona: str = Field(default="logical", pattern="^(logical|aggressive|skeptical|devil_advocate)$")
    context: Optional[str] = ""


class CounterArgumentResponse(BaseModel):
    counter_argument: str
    session_id: int


class AnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1)
    context: Optional[str] = ""


class AnalysisResponse(BaseModel):
    fallacy_detected: List[str]
    fallacy_confidences: dict
    fallacy_descriptions: dict
    argument_strength: float
    coherence_score: float
    evidence_score: float
    sentiment_score: float
    logical_score: float
    reputation_risk_level: str
    reputation_risk_score: float
    risk_factors: List[dict]
    timestamp: str


class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict


class PersonaInfo(BaseModel):
    id: str
    name: str
    description: str
