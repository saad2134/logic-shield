from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database.core.database import get_db
from database.models import User
from pydantic import BaseModel
from typing import Optional, Dict, Any

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


@router.get("/user/settings", response_model=SettingsResponse)
def get_user_settings(
    db: Session = Depends(get_db),
    authorization: str = Header(None)
):
    from api.auth import get_current_user
    
    user = get_current_user(db, authorization)
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
    authorization: str = Header(None)
):
    from api.auth import get_current_user
    
    user = get_current_user(db, authorization)
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
