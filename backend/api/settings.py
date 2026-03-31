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
    auto_save_debates: Optional[bool] = None
    show_typing_indicator: Optional[bool] = None
    sound_effects: Optional[bool] = None
    default_persona: Optional[str] = None


class SettingsResponse(BaseModel):
    auto_save_debates: bool = True
    show_typing_indicator: bool = True
    sound_effects: bool = False
    default_persona: str = "logical"


def get_user_from_auth_header(db: Session, auth_header: str = None, x_auth_token: str = None):
    print(f"DEBUG settings: auth_header={auth_header}, x_auth_token={x_auth_token}")
    return get_current_user(db, auth_header, x_auth_token)


@router.get("/user/settings", response_model=SettingsResponse)
def get_user_settings(
    db: Session = Depends(get_db),
    authorization: str = Header(None, alias="Authorization"),
    x_auth_token: str = Header(None, alias="X-Auth-Token")
):
    print(f"==> GET /user/settings called, auth: {authorization}, x_auth: {x_auth_token}")
    
    user = get_current_user(db, authorization, x_auth_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    settings = user.settings or {}
    return SettingsResponse(
        auto_save_debates=settings.get("auto_save_debates", True),
        show_typing_indicator=settings.get("show_typing_indicator", True),
        sound_effects=settings.get("sound_effects", False),
        default_persona=settings.get("default_persona", "logical")
    )


@router.patch("/user/settings", response_model=SettingsResponse)
def update_user_settings(
    settings_update: SettingsUpdate,
    db: Session = Depends(get_db),
    authorization: str = Header(None, alias="Authorization"),
    x_auth_token: str = Header(None, alias="X-Auth-Token")
):
    print(f"==> PATCH /user/settings called")
    print(f"==> authorization header: {authorization}")
    print(f"==> x_auth_token header: {x_auth_token}")
    
    user = get_current_user(db, authorization, x_auth_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    current_settings = user.settings or {}
    update_data = settings_update.model_dump(exclude_unset=True)
    current_settings.update(update_data)
    user.settings = current_settings
    db.commit()
    db.refresh(user)
    settings = user.settings or {}
    return SettingsResponse(
        auto_save_debates=settings.get("auto_save_debates", True),
        show_typing_indicator=settings.get("show_typing_indicator", True),
        sound_effects=settings.get("sound_effects", False),
        default_persona=settings.get("default_persona", "logical")
    )


@router.get("/user/export")
def export_user_data(
    db: Session = Depends(get_db),
    authorization: str = Header(None, alias="Authorization"),
    x_auth_token: str = Header(None, alias="X-Auth-Token")
):
    user = get_user_from_auth_header(db, authorization, x_auth_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    sessions = db.query(DebateSession).filter(DebateSession.user_id == user.id).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Session ID', 'Topic', 'User Stance', 'Opponent Persona', 'Created At', 'Ended At', 'Argument ID', 'Argument Content', 'Is From User', 'Argument Created At'])
    
    for session in sessions:
        arguments = db.query(Argument).filter(Argument.session_id == session.id).order_by(Argument.created_at).all()
        
        if arguments:
            for arg in arguments:
                writer.writerow([
                    session.id,
                    session.topic,
                    session.user_stance,
                    session.opponent_persona,
                    session.created_at.isoformat() if session.created_at else '',
                    session.ended_at.isoformat() if session.ended_at else '',
                    arg.id,
                    arg.content,
                    'Yes' if arg.is_from_user else 'No',
                    arg.created_at.isoformat() if arg.created_at else ''
                ])
        else:
            writer.writerow([
                session.id,
                session.topic,
                session.user_stance,
                session.opponent_persona,
                session.created_at.isoformat() if session.created_at else '',
                session.ended_at.isoformat() if session.ended_at else '',
                '', '', '', ''
            ])
    
    return output.getvalue()


@router.delete("/user/account")
def delete_user_account(
    db: Session = Depends(get_db),
    authorization: str = Header(None, alias="Authorization"),
    x_auth_token: str = Header(None, alias="X-Auth-Token")
):
    user = get_user_from_auth_header(db, authorization, x_auth_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    sessions = db.query(DebateSession).filter(DebateSession.user_id == user.id).all()
    for session in sessions:
        db.query(AnalysisResult).filter(AnalysisResult.session_id == session.id).delete()
        db.query(Argument).filter(Argument.session_id == session.id).delete()
        db.delete(session)
    
    db.delete(user)
    db.commit()
    
    return {"message": "Account deleted successfully"}
