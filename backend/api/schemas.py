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
    risk_factors: List[str]
    timestamp: str
    demo_mode: Optional[bool] = None
    demo_message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict
    demo_mode: Optional[bool] = None
    demo_message: Optional[str] = None


class PersonaInfo(BaseModel):
    id: str
    name: str
    description: str


class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: Optional[str]
    username: Optional[str]
    full_name: Optional[str]
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    occupation: Optional[str] = None
    interests: Optional[str] = None
    experience_level: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: int
    email: Optional[str]
    username: Optional[str]
    full_name: Optional[str]
    bio: Optional[str] = None
    occupation: Optional[str] = None
    interests: Optional[str] = None
    experience_level: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    total_debates: int
    total_arguments: int
    avg_argument_strength: float
    fallacy_count: float
    current_streak: int
    win_rate: float


class AchievementResponse(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    earned: bool
    earned_at: Optional[str] = None


class UserSettingsUpdate(BaseModel):
    notifications: Optional[bool] = True
    theme: Optional[str] = "light"
    language: Optional[str] = "en"
    analysis_depth: Optional[str] = "standard"


class UserSettingsResponse(BaseModel):
    notifications: bool
    theme: str
    language: str
    analysis_depth: str


class OnboardingRequest(BaseModel):
    name: str
    experience_level: str
    goals: List[str]
    interests: List[str]
    debate_frequency: str
    focus_areas: List[str]
