from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database.core.database import get_db
from database.models import DebateSession, Argument, AnalysisResult, User
from api.schemas import (
    DebateSessionCreate,
    DebateSessionResponse,
    ArgumentCreate,
    ArgumentResponse,
    CounterArgumentRequest,
    CounterArgumentResponse,
    AnalysisRequest,
    AnalysisResponse,
    HealthResponse,
    PersonaInfo,
    QuickAnalysisRequest,
    QuickAnalysisResponse,
    ArgumentVisualizeRequest,
    ArgumentVisualizeResponse,
    RiskScanRequest,
    RiskScanResponse,
)
from services.analysis import AnalysisService
from services.debate_simulator import DebateSimulator
from services.argument_visualizer import argument_visualizer
from app.config import settings
from datetime import datetime, timezone

router = APIRouter()

analysis_service = AnalysisService()
debate_simulator = DebateSimulator()


@router.get("/health", response_model=HealthResponse)
def health_check():
    services_status = {
        "fallacy_detection": "active" if not settings.DEMO_MODE else "demo",
        "argument_analysis": "active" if not settings.DEMO_MODE else "demo",
        "reputation_risk": "active" if not settings.DEMO_MODE else "demo",
        "debate_simulation": "active" if not settings.DEMO_MODE else "demo",
    }
    result = {"status": "healthy", "version": "1.0.0", "services": services_status}
    if settings.DEMO_MODE:
        result["demo_mode"] = True
        result["demo_message"] = settings.DEMO_MESSAGE
    return result


@router.get("/personas", response_model=list[PersonaInfo])
def get_personas():
    return debate_simulator.get_available_personas()


@router.get("/fallacy-types")
def get_fallacy_types():
    return analysis_service.get_supported_fallacies()


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_argument(request: AnalysisRequest):
    context = request.context or ""
    result = analysis_service.analyze_argument(request.text, context)
    return result


@router.post("/analyze/quick", response_model=QuickAnalysisResponse)
def quick_analyze(request: QuickAnalysisRequest):
    result = analysis_service.quick_analyze(
        request.text, request.context or "", request.difficulty
    )
    return result


@router.post("/visualize/argument", response_model=ArgumentVisualizeResponse)
def visualize_argument(request: ArgumentVisualizeRequest):
    result = argument_visualizer.parse_argument(request.text, request.context or "")
    return result


@router.post("/debate/start", response_model=DebateSessionResponse)
def start_debate_session(request: DebateSessionCreate, db: Session = Depends(get_db)):
    session = DebateSession(
        topic=request.topic,
        user_stance=request.user_stance,
        opponent_persona=request.opponent_persona,
        user_id=request.user_id,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return DebateSessionResponse(
        id=int(session.id),
        topic=str(session.topic),
        user_stance=str(session.user_stance),
        opponent_persona=str(session.opponent_persona),
        created_at=session.created_at.replace(tzinfo=timezone.utc).isoformat(),
    )


@router.post("/debate/argument", response_model=ArgumentResponse)
def add_argument(request: ArgumentCreate, db: Session = Depends(get_db)):
    session = (
        db.query(DebateSession).filter(DebateSession.id == request.session_id).first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    argument = Argument(
        session_id=request.session_id,
        content=request.content,
        is_from_user=request.is_from_user,
    )
    db.add(argument)
    db.commit()
    db.refresh(argument)

    analysis = analysis_service.analyze_argument(request.content)

    analysis_result = AnalysisResult(
        session_id=request.session_id,
        argument_id=argument.id,
        fallacy_detected=analysis["fallacy_detected"],
        fallacy_confidences=analysis["fallacy_confidences"],
        argument_strength=analysis["argument_strength"],
        coherence_score=analysis["coherence_score"],
        evidence_score=analysis["evidence_score"],
        sentiment_score=analysis["sentiment_score"],
        extremity_score=analysis.get("logical_score", 0),
        reputation_risk_level=analysis["reputation_risk_level"],
        reputation_risk_score=analysis["reputation_risk_score"],
        risk_factors=analysis["risk_factors"],
    )
    db.add(analysis_result)
    db.commit()

    return ArgumentResponse(
        id=int(argument.id),
        session_id=int(argument.session_id),
        content=str(argument.content),
        is_from_user=bool(argument.is_from_user),
        created_at=argument.created_at.replace(tzinfo=timezone.utc).isoformat(),
    )


@router.post("/debate/counter", response_model=CounterArgumentResponse)
def get_counter_argument(
    request: CounterArgumentRequest, db: Session = Depends(get_db)
):
    session = (
        db.query(DebateSession).filter(DebateSession.id == request.session_id).first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    previous_args = (
        db.query(Argument)
        .filter(Argument.session_id == request.session_id)
        .order_by(Argument.created_at.desc())
        .all()
    )

    context = " ".join([str(a.content) for a in previous_args[:3]])

    counter = debate_simulator.generate_counter_argument(
        topic=request.topic,
        user_argument=request.user_argument,
        user_stance=request.user_stance,
        persona=request.persona,
        context=context,
    )

    argument = Argument(
        session_id=request.session_id, content=counter, is_from_user=False
    )
    db.add(argument)
    db.commit()

    return CounterArgumentResponse(
        counter_argument=counter, session_id=request.session_id
    )


@router.get("/debate/{session_id}/history")
def get_debate_history(session_id: int, db: Session = Depends(get_db)):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    arguments = (
        db.query(Argument)
        .filter(Argument.session_id == session_id)
        .order_by(Argument.created_at.asc())
        .all()
    )

    analysis_results = (
        db.query(AnalysisResult).filter(AnalysisResult.session_id == session_id).all()
    )

    return {
        "session": {
            "id": session.id,
            "topic": session.topic,
            "user_stance": session.user_stance,
            "opponent_persona": session.opponent_persona,
            "created_at": session.created_at.replace(tzinfo=timezone.utc).isoformat(),
        },
        "arguments": [
            {
                "id": a.id,
                "content": a.content,
                "is_from_user": a.is_from_user,
                "created_at": a.created_at.replace(tzinfo=timezone.utc).isoformat(),
            }
            for a in arguments
        ],
        "analysis": [
            {
                "argument_id": r.argument_id,
                "fallacy_detected": r.fallacy_detected,
                "argument_strength": r.argument_strength,
                "reputation_risk_level": r.reputation_risk_level,
            }
            for r in analysis_results
        ],
    }


@router.post("/debate/{session_id}/end")
def end_debate_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(DebateSession).filter(DebateSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    session.ended_at = datetime.utcnow()
    db.commit()

    return {"message": "Debate session ended", "session_id": session_id}


@router.delete("/debate/{session_id}")
def delete_debate_session(
    session_id: int,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID"),
):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = (
        db.query(DebateSession)
        .filter(DebateSession.id == session_id, DebateSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    db.query(AnalysisResult).filter(AnalysisResult.session_id == session_id).delete()
    db.query(Argument).filter(Argument.session_id == session_id).delete()
    db.delete(session)
    db.commit()

    return {"message": "Debate session deleted", "session_id": session_id}


@router.post("/analyze/risk", response_model=RiskScanResponse)
def scan_communication_risk(request: RiskScanRequest):
    result = analysis_service.scan_communication_risk(
        request.text, request.context or ""
    )
    return result
