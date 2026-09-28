from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database.core.database import get_db
from database.models import User, DebateSession, Argument, AnalysisResult
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta

router = APIRouter()

# Pydantic Schemas
class CompleteLessonRequest(BaseModel):
    course_id: str
    lesson_id: str

class AssessmentRequest(BaseModel):
    score: int
    level: str
    weak_fallacies: List[str]

class SpacedRepetitionRequest(BaseModel):
    fallacy_type: str
    action: str  # "add" or "review"

@router.get("/progress")
def get_learning_progress(
    db: Session = Depends(get_db), x_user_id: str = Header(None, alias="X-User-ID")
):
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    # Initialize learning data in settings if not present
    settings = dict(user.settings) if user.settings else {}
    if "learning_data" not in settings:
        settings["learning_data"] = {
            "completed_lessons": [],
            "assessment": None,
            "spaced_repetition": []
        }
        user.settings = settings
        db.commit()

    learning_data = settings["learning_data"]

    # Gather database stats to supplement weak fallacy tracking
    # We query the user's debate arguments analysis to extract what fallacies they committed
    arguments = (
        db.query(Argument)
        .join(DebateSession)
        .filter(DebateSession.user_id == user.id, Argument.is_from_user == True)
        .all()
    )
    argument_ids = [a.id for a in arguments]

    db_detected_fallacies = []
    if argument_ids:
        results = (
            db.query(AnalysisResult)
            .filter(AnalysisResult.argument_id.in_(argument_ids))
            .all()
        )
        for r in results:
            if r.fallacy_detected:
                # fallacy_detected is a list of strings
                db_detected_fallacies.extend(r.fallacy_detected)

    return {
        "completed_lessons": learning_data.get("completed_lessons", []),
        "assessment": learning_data.get("assessment", None),
        "spaced_repetition": learning_data.get("spaced_repetition", []),
        "db_detected_fallacies": list(set(db_detected_fallacies))
    }

@router.post("/complete-lesson")
def complete_lesson(
    request: CompleteLessonRequest,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID")
):
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    settings = dict(user.settings) if user.settings else {}
    if "learning_data" not in settings:
        settings["learning_data"] = {
            "completed_lessons": [],
            "assessment": None,
            "spaced_repetition": []
        }

    learning_data = dict(settings["learning_data"])
    completed = list(learning_data.get("completed_lessons", []))

    lesson_key = f"{request.course_id}:{request.lesson_id}"
    if lesson_key not in completed:
        completed.append(lesson_key)
        learning_data["completed_lessons"] = completed
        settings["learning_data"] = learning_data
        user.settings = settings
        db.commit()

    return {"status": "success", "completed_lessons": completed}

@router.post("/assessment")
def submit_assessment(
    request: AssessmentRequest,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID")
):
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    settings = dict(user.settings) if user.settings else {}
    if "learning_data" not in settings:
        settings["learning_data"] = {
            "completed_lessons": [],
            "assessment": None,
            "spaced_repetition": []
        }

    learning_data = dict(settings["learning_data"])
    learning_data["assessment"] = {
        "score": request.score,
        "level": request.level,
        "weak_fallacies": request.weak_fallacies,
        "completed_at": datetime.utcnow().isoformat()
    }
    
    # Pre-populate spaced repetition items with any weak fallacies from assessment
    spaced_rep = list(learning_data.get("spaced_repetition", []))
    existing_fallacies = {item["fallacy"] for item in spaced_rep}
    
    for fallacy in request.weak_fallacies:
        if fallacy not in existing_fallacies:
            spaced_rep.append({
                "fallacy": fallacy,
                "next_review": (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"),
                "interval_days": 1,
                "created_at": datetime.utcnow().isoformat()
            })
            
    learning_data["spaced_repetition"] = spaced_rep
    settings["learning_data"] = learning_data
    
    # Save the debater level to user experience_level
    user.experience_level = request.level
    
    user.settings = settings
    db.commit()

    return {"status": "success", "assessment": learning_data["assessment"]}

@router.post("/spaced-repetition")
def update_spaced_repetition(
    request: SpacedRepetitionRequest,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID")
):
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    settings = dict(user.settings) if user.settings else {}
    if "learning_data" not in settings:
        settings["learning_data"] = {
            "completed_lessons": [],
            "assessment": None,
            "spaced_repetition": []
        }

    learning_data = dict(settings["learning_data"])
    spaced_rep = list(learning_data.get("spaced_repetition", []))

    # Find the item
    item_idx = -1
    for idx, item in enumerate(spaced_rep):
        if item["fallacy"] == request.fallacy_type:
            item_idx = idx
            break

    if request.action == "add":
        if item_idx == -1:
            spaced_rep.append({
                "fallacy": request.fallacy_type,
                "next_review": (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d"),
                "interval_days": 1,
                "created_at": datetime.utcnow().isoformat()
            })
    elif request.action == "review":
        if item_idx != -1:
            item = dict(spaced_rep[item_idx])
            # Double the interval
            current_interval = item.get("interval_days", 1)
            new_interval = current_interval * 2
            if new_interval > 30:
                new_interval = 30  # cap at 30 days
            
            item["interval_days"] = new_interval
            item["next_review"] = (datetime.utcnow() + timedelta(days=new_interval)).strftime("%Y-%m-%d")
            spaced_rep[item_idx] = item

    learning_data["spaced_repetition"] = spaced_rep
    settings["learning_data"] = learning_data
    user.settings = settings
    db.commit()

    return {"status": "success", "spaced_repetition": spaced_rep}

@router.post("/reset-assessment")
def reset_assessment(
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID")
):
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    settings = dict(user.settings) if user.settings else {}
    if "learning_data" in settings:
        learning_data = dict(settings["learning_data"])
        learning_data["assessment"] = None
        learning_data["spaced_repetition"] = []
        settings["learning_data"] = learning_data

    user.experience_level = None
    user.settings = settings
    db.commit()

    return {"status": "success"}
