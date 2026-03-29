from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database.core.database import get_db
from database.models import User, DebateSession, Argument, AnalysisResult, UserAnalytics
from api.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserProfileUpdate,
    UserProfileResponse,
    UserStatsResponse,
    AchievementResponse,
    UserSettingsUpdate,
    UserSettingsResponse,
    OnboardingRequest,
)
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str = None
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
    except jwt.PyJWTError:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    return user


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(request: UserCreate, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(
            (User.email == request.email) | (User.username == request.username)
        ).first()
        
        if existing_user:
            if existing_user.email == request.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This username is already taken"
                )
        
        hashed_password = get_password_hash(request.password)
        
        user = User(
            email=request.email,
            username=request.username,
            full_name=request.full_name,
            hashed_password=hashed_password,
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        analytics = UserAnalytics(user_id=user.id)
        db.add(analytics)
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to create account. Please try again. ({str(e)[:50]})"
        )
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name
        }
    }


@router.post("/auth/login")
def login(request: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == request.email).first()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please try again later."
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email. Please sign up first."
        )
    
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again."
        )
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name
        }
    }


@router.get("/auth/me")
def get_me(
    db: Session = Depends(get_db),
    authorization: str = None
):
    user = get_current_user(db, authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "created_at": user.created_at.isoformat() if user.created_at else ""
    }


@router.post("/auth/logout")
def logout():
    return {"message": "Successfully logged out"}


@router.get("/user/debates")
def get_user_debates(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    authorization: str = None
):
    user = get_current_user(db, authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    debates = db.query(DebateSession).filter(
        DebateSession.user_id == user.id
    ).order_by(DebateSession.created_at.desc()).offset(offset).limit(limit).all()
    
    total = db.query(DebateSession).filter(DebateSession.user_id == user.id).count()
    
    return {
        "debates": [
            {
                "id": d.id,
                "topic": d.topic,
                "user_stance": d.user_stance,
                "opponent_persona": d.opponent_persona,
                "created_at": d.created_at.isoformat() if d.created_at else "",
                "ended_at": d.ended_at.isoformat() if d.ended_at else None
            }
            for d in debates
        ],
        "total": total
    }


@router.get("/user/stats")
def get_user_stats(
    db: Session = Depends(get_db),
    authorization: str = None
):
    user = get_current_user(db, authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    analytics = db.query(UserAnalytics).filter(UserAnalytics.user_id == user.id).first()
    
    total_debates = db.query(DebateSession).filter(DebateSession.user_id == user.id).count()
    total_arguments = db.query(Argument).join(DebateSession).filter(
        DebateSession.user_id == user.id,
        Argument.is_from_user == True
    ).count()
    
    arguments = db.query(Argument).join(DebateSession).filter(
        DebateSession.user_id == user.id,
        Argument.is_from_user == True
    ).all()
    
    argument_ids = [a.id for a in arguments]
    
    fallacy_count = 0
    avg_strength = 0.0
    
    if argument_ids:
        results = db.query(AnalysisResult).filter(
            AnalysisResult.argument_id.in_(argument_ids)
        ).all()
        
        fallacy_count = sum(
            len(r.fallacy_detected) if r.fallacy_detected else 0
            for r in results
        )
        
        strengths = [r.argument_strength for r in results if r.argument_strength]
        avg_strength = sum(strengths) / len(strengths) if strengths else 0.0
    
    return {
        "total_debates": total_debates,
        "total_arguments": total_arguments,
        "avg_argument_strength": round(avg_strength, 2),
        "fallacy_count": fallacy_count,
        "current_streak": analytics.total_sessions if analytics else 0,
        "win_rate": 0.0
    }


@router.get("/user/achievements")
def get_user_achievements(
    db: Session = Depends(get_db),
    authorization: str = None
):
    achievements = [
        {"id": "first_debate", "title": "First Debate", "description": "Complete your first debate", "icon": "trophy", "earned": False},
        {"id": "streak_7", "title": "Week Warrior", "description": "Maintain a 7-day streak", "icon": "flame", "earned": False},
        {"id": "no_fallacies", "title": "Logical Thinker", "description": "Complete a debate with no fallacies", "icon": "brain", "earned": False},
        {"id": "debate_master", "title": "Debate Master", "description": "Complete 50 debates", "icon": "crown", "earned": False},
        {"id": "persuasive", "title": "Persuasive Speaker", "description": "Win 10 debates", "icon": "megaphone", "earned": False},
    ]
    
    user = get_current_user(db, authorization)
    if not user:
        return achievements
    
    total_debates = db.query(DebateSession).filter(DebateSession.user_id == user.id).count()
    
    if total_debates >= 1:
        achievements[0]["earned"] = True
    if total_debates >= 50:
        achievements[3]["earned"] = True
    
    return achievements


@router.patch("/user/profile")
def update_profile(
    request: UserProfileUpdate,
    db: Session = Depends(get_db),
    authorization: str = None
):
    user = get_current_user(db, authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    if request.full_name is not None:
        user.full_name = request.full_name
    
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "bio": getattr(user, 'bio', None),
        "occupation": getattr(user, 'occupation', None),
        "interests": getattr(user, 'interests', None),
        "experience_level": getattr(user, 'experience_level', None),
        "created_at": user.created_at.isoformat() if user.created_at else ""
    }


@router.patch("/user/settings")
def update_settings(
    request: UserSettingsUpdate,
    db: Session = Depends(get_db),
    authorization: str = None
):
    user = get_current_user(db, authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return {
        "notifications": request.notifications,
        "theme": request.theme,
        "language": request.language,
        "analysis_depth": request.analysis_depth
    }


@router.post("/user/onboarding")
def submit_onboarding(
    request: OnboardingRequest,
    db: Session = Depends(get_db),
    authorization: str = None
):
    user = get_current_user(db, authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user.full_name = request.name
    user.experience_level = request.experience_level
    
    db.commit()
    
    return {"message": "Onboarding completed successfully"}
