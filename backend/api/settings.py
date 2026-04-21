from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database.core.database import get_db
from database.models import User, DebateSession, Argument, AnalysisResult
from api.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, Dict, Any
import csv
import io
from datetime import datetime

router = APIRouter()


class SettingsUpdate(BaseModel):
    auto_read_aloud: Optional[bool] = None
    live_coach: Optional[bool] = None
    sound_effects: Optional[bool] = None
    default_persona: Optional[str] = None
    # Backwards compatibility
    auto_save_debates: Optional[bool] = None
    show_typing_indicator: Optional[bool] = None


class SettingsResponse(BaseModel):
    auto_read_aloud: bool = True
    live_coach: bool = True
    sound_effects: bool = False
    default_persona: str = "logical"
    # Backwards compatibility
    auto_save_debates: bool = True
    show_typing_indicator: bool = True


def get_user_from_auth_header(
    db: Session, auth_header: str = None, x_auth_token: str = None
):
    print(f"DEBUG settings: auth_header={auth_header}, x_auth_token={x_auth_token}")
    return get_current_user(db, auth_header, x_auth_token)


@router.get("/user/settings", response_model=SettingsResponse)
def get_user_settings(
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID"),
):
    if not x_user_id:
        return SettingsResponse()

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        return SettingsResponse()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return SettingsResponse()

    settings = user.settings or {}
    auto_read = settings.get("auto_read_aloud", settings.get("auto_save_debates", True))
    live = settings.get("live_coach", settings.get("show_typing_indicator", True))
    return SettingsResponse(
        auto_read_aloud=auto_read,
        live_coach=live,
        sound_effects=settings.get("sound_effects", False),
        default_persona=settings.get("default_persona", "logical"),
        auto_save_debates=auto_read,
        show_typing_indicator=live,
    )


@router.patch("/user/settings", response_model=SettingsResponse)
def update_user_settings(
    settings_update: SettingsUpdate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID"),
):
    if not x_user_id:
        return SettingsResponse()

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        return SettingsResponse()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return SettingsResponse()

    current_settings = dict(user.settings or {})
    update_data = settings_update.model_dump(exclude_unset=True)
    current_settings.update(update_data)
    user.settings = current_settings
    db.add(user)
    db.commit()
    db.refresh(user)
    settings = user.settings or {}
    auto_read = settings.get("auto_read_aloud", settings.get("auto_save_debates", True))
    live = settings.get("live_coach", settings.get("show_typing_indicator", True))
    return SettingsResponse(
        auto_read_aloud=auto_read,
        live_coach=live,
        sound_effects=settings.get("sound_effects", False),
        default_persona=settings.get("default_persona", "logical"),
        auto_save_debates=auto_read,
        show_typing_indicator=live,
    )


@router.get("/user/export")
def export_user_data(
    db: Session = Depends(get_db),
    authorization: str = Header(None, alias="Authorization"),
    x_auth_token: str = Header(None, alias="X-Auth-Token"),
):
    user = get_user_from_auth_header(db, authorization, x_auth_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["=== USER PROFILE ==="])
    writer.writerow(["Field", "Value"])
    writer.writerow(["Email", user.email])
    writer.writerow(["Full Name", user.full_name])
    writer.writerow(["Experience Level", user.experience_level or ""])
    writer.writerow(["Interests", user.interests or ""])
    writer.writerow(["Occupation", user.occupation or ""])
    writer.writerow(["Bio", user.bio or ""])
    writer.writerow(
        ["Created At", user.created_at.isoformat() if user.created_at else ""]
    )
    writer.writerow(["Settings", str(user.settings) if user.settings else "{}"])
    writer.writerow([])

    writer.writerow(["=== DEBATE SESSIONS ==="])
    writer.writerow(
        [
            "Session ID",
            "Topic",
            "User Stance",
            "Opponent Persona",
            "Created At",
            "Ended At",
        ]
    )

    sessions = (
        db.query(DebateSession)
        .filter(DebateSession.user_id == user.id)
        .order_by(DebateSession.created_at.desc())
        .all()
    )

    for session in sessions:
        writer.writerow(
            [
                session.id,
                session.topic,
                session.user_stance,
                session.opponent_persona,
                session.created_at.isoformat() if session.created_at else "",
                session.ended_at.isoformat() if session.ended_at else "",
            ]
        )

    writer.writerow([])
    writer.writerow(["=== ARGUMENTS ==="])
    writer.writerow(
        ["Argument ID", "Session ID", "Content", "Is From User", "Created At"]
    )

    for session in sessions:
        arguments = (
            db.query(Argument)
            .filter(Argument.session_id == session.id)
            .order_by(Argument.created_at)
            .all()
        )
        for arg in arguments:
            writer.writerow(
                [
                    arg.id,
                    arg.session_id,
                    arg.content.replace("\n", " ").replace("\r", ""),
                    "Yes" if arg.is_from_user else "No",
                    arg.created_at.isoformat() if arg.created_at else "",
                ]
            )

    writer.writerow([])
    writer.writerow(["=== ANALYSIS RESULTS ==="])
    writer.writerow(
        [
            "Analysis ID",
            "Argument ID",
            "Fallacies Detected",
            "Argument Strength",
            "Coherence Score",
            "Evidence Score",
            "Sentiment Score",
            "Extremity Score",
            "Reputation Risk",
            "Risk Score",
            "Risk Factors",
            "Timestamp",
        ]
    )

    for session in sessions:
        arguments = db.query(Argument).filter(Argument.session_id == session.id).all()
        for arg in arguments:
            analysis = (
                db.query(AnalysisResult)
                .filter(AnalysisResult.argument_id == arg.id)
                .first()
            )
            if analysis:
                writer.writerow(
                    [
                        analysis.id,
                        arg.id,
                        ", ".join(analysis.fallacy_detected)
                        if analysis.fallacy_detected
                        else "",
                        analysis.argument_strength or "",
                        analysis.coherence_score or "",
                        analysis.evidence_score or "",
                        analysis.sentiment_score or "",
                        analysis.extremity_score or "",
                        analysis.reputation_risk_level or "",
                        analysis.reputation_risk_score or "",
                        ", ".join(analysis.risk_factors)
                        if analysis.risk_factors
                        else "",
                        analysis.created_at.isoformat() if analysis.created_at else "",
                    ]
                )

    return output.getvalue()


@router.delete("/user/account")
def delete_user_account(
    db: Session = Depends(get_db),
    authorization: str = Header(None, alias="Authorization"),
    x_auth_token: str = Header(None, alias="X-Auth-Token"),
):
    user = get_user_from_auth_header(db, authorization, x_auth_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    sessions = db.query(DebateSession).filter(DebateSession.user_id == user.id).all()
    for session in sessions:
        db.query(AnalysisResult).filter(
            AnalysisResult.session_id == session.id
        ).delete()
        db.query(Argument).filter(Argument.session_id == session.id).delete()
        db.delete(session)

    db.delete(user)
    db.commit()

    return {"message": "Account deleted successfully"}
