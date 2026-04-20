from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    experience_level = Column(String(50), nullable=True)
    interests = Column(Text, nullable=True)
    occupation = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    settings = Column(JSON, default=dict)

    debate_sessions = relationship("DebateSession", back_populates="user")
    analytics = relationship("UserAnalytics", back_populates="user", uselist=False)


class DebateSession(Base):
    __tablename__ = "debate_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    topic = Column(Text, nullable=False)
    user_stance = Column(String(50), nullable=False)
    opponent_persona = Column(String(50), default="logical")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="debate_sessions")
    arguments = relationship("Argument", back_populates="session", cascade="all, delete-orphan")
    analysis_results = relationship("AnalysisResult", back_populates="session", cascade="all, delete-orphan")


class Argument(Base):
    __tablename__ = "arguments"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_from_user = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("DebateSession", back_populates="arguments")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("debate_sessions.id"), nullable=False)
    argument_id = Column(Integer, ForeignKey("arguments.id"), nullable=True)
    
    fallacy_detected = Column(JSON, default=list)
    fallacy_confidences = Column(JSON, default=dict)
    
    argument_strength = Column(Float, default=0.0)
    coherence_score = Column(Float, default=0.0)
    evidence_score = Column(Float, default=0.0)
    sentiment_score = Column(Float, default=0.0)
    extremity_score = Column(Float, default=0.0)
    
    reputation_risk_level = Column(String(20), default="low")
    reputation_risk_score = Column(Float, default=0.0)
    risk_factors = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("DebateSession", back_populates="analysis_results")


class UserAnalytics(Base):
    __tablename__ = "user_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    total_sessions = Column(Integer, default=0)
    average_argument_strength = Column(Float, default=0.0)
    average_fallacy_count = Column(Float, default=0.0)
    average_reputation_risk = Column(Float, default=0.0)
    
    strongest_area = Column(String(100), default="")
    weakest_area = Column(String(100), default="")
    
    recent_improvement = Column(JSON, default=dict)
    progress_data = Column(JSON, default=list)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="analytics")


class FallacyExample(Base):
    __tablename__ = "fallacy_examples"

    id = Column(Integer, primary_key=True, index=True)
    fallacy_type = Column(String(50), nullable=False)
    example_text = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    category = Column(String(50), default="general")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
