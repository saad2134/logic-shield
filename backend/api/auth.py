from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
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
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.config import settings

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12, bcrypt__ident="2b"
)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    # Convert sub to string if it exists (JWT spec requires string subject)
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = plain_password[:72] if len(plain_password) > 72 else plain_password
    return pwd_context.verify(truncated, hashed_password)


def get_password_hash(password: str) -> str:
    truncated = password[:72] if len(password) > 72 else password
    return pwd_context.hash(truncated)


def get_current_user(
    db: Session = Depends(get_db), authorization: str = None, x_auth_token: str = None
) -> User:
    token = None

    # Check Authorization header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    # Check X-Auth-Token header (custom header for CORS workarounds)
    elif x_auth_token:
        token = x_auth_token

    if not token:
        print("DEBUG: No token provided")
        return None

    try:
        print(f"DEBUG: Decoding token: {token[:30]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"DEBUG: Payload: {payload}")
        user_id = payload.get("sub")
        if user_id is None:
            return None
        # Convert to int if string
        if isinstance(user_id, str):
            user_id = int(user_id)
    except Exception as e:
        print(f"Token decode error: {e}")
        return None

    user = db.query(User).filter(User.id == user_id).first()
    return user


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(request: UserCreate, db: Session = Depends(get_db)):
    print(f"Registration request: {request}")
    try:
        existing_user = db.query(User).filter(User.email == request.email).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists",
            )

        hashed_password = get_password_hash(request.password)

        user = User(
            email=request.email,
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
            detail=f"Unable to create account. Please try again. ({str(e)[:50]})",
        )

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name},
    }


@router.post("/auth/login")
def login(request: UserLogin, db: Session = Depends(get_db)):
    print(f"Login request: email={request.email}, password_set=***")
    try:
        print(f"Querying for user with email: {request.email}")
        user = db.query(User).filter(User.email == request.email).first()
        print(f"User found: {user is not None}")
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database unavailable. Please try again later. ({str(e)[:50]})",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email. Please sign up first.",
        )

    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.",
        )

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "experience_level": user.experience_level,
        },
    }


@router.get("/auth/me")
def get_current_user_info(
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

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "bio": user.bio,
        "occupation": user.occupation,
        "interests": user.interests,
        "experience_level": user.experience_level,
        "created_at": user.created_at.isoformat() if user.created_at else "",
    }


@router.post("/auth/logout")
def logout():
    return {"message": "Successfully logged out"}


@router.get("/user/debates")
def get_user_debates(
    sort_by: str = Query("newest"),
    user_stance: str = None,
    opponent_persona: str = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID"),
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

    query = db.query(DebateSession).filter(DebateSession.user_id == user.id)

    if user_stance:
        stance_values = [s.strip() for s in user_stance.split(",")]
        query = query.filter(DebateSession.user_stance.in_(stance_values))
    if opponent_persona:
        persona_values = [p.strip() for p in opponent_persona.split(",")]
        query = query.filter(DebateSession.opponent_persona.in_(persona_values))

    if sort_by == "oldest":
        query = query.order_by(DebateSession.created_at.asc())
    else:
        query = query.order_by(DebateSession.created_at.desc())

    offset = (page - 1) * limit
    debates = query.offset(offset).limit(limit).all()

    total = db.query(DebateSession).filter(DebateSession.user_id == user.id)
    if user_stance:
        stance_values = [s.strip() for s in user_stance.split(",")]
        total = total.filter(DebateSession.user_stance.in_(stance_values))
    if opponent_persona:
        persona_values = [p.strip() for p in opponent_persona.split(",")]
        total = total.filter(DebateSession.opponent_persona.in_(persona_values))
    total = total.count()

    return {
        "debates": [
            {
                "id": d.id,
                "topic": d.topic,
                "user_stance": d.user_stance,
                "opponent_persona": d.opponent_persona,
                "created_at": d.created_at.replace(tzinfo=timezone.utc).isoformat()
                if d.created_at
                else "",
                "ended_at": d.ended_at.replace(tzinfo=timezone.utc).isoformat()
                if d.ended_at
                else None,
            }
            for d in debates
        ],
        "total": total,
    }


@router.get("/user/stats")
def get_user_stats(
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

    total_debates = (
        db.query(DebateSession).filter(DebateSession.user_id == user.id).count()
    )
    
    completed_sessions = (
        db.query(DebateSession)
        .filter(DebateSession.user_id == user.id, DebateSession.ended_at != None)
        .all()
    )

    total_arguments = (
        db.query(Argument)
        .join(DebateSession)
        .filter(DebateSession.user_id == user.id, Argument.is_from_user == True)
        .count()
    )

    arguments = (
        db.query(Argument)
        .join(DebateSession)
        .filter(DebateSession.user_id == user.id, Argument.is_from_user == True)
        .all()
    )

    argument_ids = [a.id for a in arguments]

    fallacy_count = 0
    avg_strength = 0.0

    coherence_scores = []
    evidence_scores = []
    extremity_scores = []
    reputation_risk_scores = []

    if argument_ids:
        results = (
            db.query(AnalysisResult)
            .filter(AnalysisResult.argument_id.in_(argument_ids))
            .all()
        )

        fallacy_count = sum(
            len(r.fallacy_detected) if r.fallacy_detected else 0 for r in results
        )

        strengths = [r.argument_strength for r in results if r.argument_strength is not None]
        avg_strength = sum(strengths) / len(strengths) if strengths else 0.0

        coherence_scores = [r.coherence_score for r in results if r.coherence_score is not None]
        evidence_scores = [r.evidence_score for r in results if r.evidence_score is not None]
        extremity_scores = [r.extremity_score for r in results if r.extremity_score is not None]
        reputation_risk_scores = [r.reputation_risk_score for r in results if r.reputation_risk_score is not None]

    # Calculate wins and win rate
    wins = 0
    for session in completed_sessions:
        session_args = (
            db.query(Argument)
            .filter(Argument.session_id == session.id, Argument.is_from_user == True)
            .all()
        )
        if not session_args:
            continue
        
        session_arg_ids = [a.id for a in session_args]
        session_results = (
            db.query(AnalysisResult)
            .filter(AnalysisResult.argument_id.in_(session_arg_ids))
            .all()
        )
        
        session_strengths = [r.argument_strength for r in session_results if r.argument_strength is not None]
        avg_session_strength = sum(session_strengths) / len(session_strengths) if session_strengths else 0.0
        # A debate is "won" if the average strength of the user's arguments is >= 0.60
        if avg_session_strength >= 0.6:
            wins += 1

    win_rate = 0.0
    if len(completed_sessions) > 0:
        win_rate = round((wins / len(completed_sessions)) * 100, 1)

    # Calculate current day streak
    all_sessions = (
        db.query(DebateSession)
        .filter(DebateSession.user_id == user.id)
        .all()
    )
    current_streak = 0
    if all_sessions:
        dates = sorted({s.created_at.date() for s in all_sessions}, reverse=True)
        today = datetime.utcnow().date()
        if dates and (today - dates[0]).days <= 1:
            current_streak = 1
            current_date = dates[0]
            for next_date in dates[1:]:
                diff = (current_date - next_date).days
                if diff == 1:
                    current_streak += 1
                    current_date = next_date
                elif diff > 1:
                    break

    # Calculate specific skill levels
    avg_coherence = sum(coherence_scores) / len(coherence_scores) if coherence_scores else 0.0
    avg_evidence = sum(evidence_scores) / len(evidence_scores) if evidence_scores else 0.0
    avg_extremity = sum(extremity_scores) / len(extremity_scores) if extremity_scores else 0.0
    avg_reputation_risk = sum(reputation_risk_scores) / len(reputation_risk_scores) if reputation_risk_scores else 0.0

    logical_reasoning = round(avg_extremity * 100, 1) if extremity_scores else 75.0
    argument_construction = round(avg_coherence * 100, 1) if coherence_scores else 82.0
    evidence_usage = round(avg_evidence * 100, 1) if evidence_scores else 68.0
    
    if total_arguments > 0:
        fallacy_rate = fallacy_count / total_arguments
        fallacy_detection = max(0.0, min(100.0, round(100.0 - (fallacy_rate * 100.0), 1)))
    else:
        fallacy_detection = 90.0

    if reputation_risk_scores:
        reputation_management = max(0.0, min(100.0, round((1.0 - avg_reputation_risk) * 100.0, 1)))
    else:
        reputation_management = 72.0

    return {
        "total_debates": total_debates,
        "total_arguments": total_arguments,
        "avg_argument_strength": round(avg_strength, 2),
        "fallacy_count": fallacy_count,
        "current_streak": current_streak,
        "win_rate": win_rate,
        "logical_reasoning": logical_reasoning,
        "argument_construction": argument_construction,
        "evidence_usage": evidence_usage,
        "fallacy_detection": fallacy_detection,
        "reputation_management": reputation_management,
    }


@router.get("/user/achievements")
def get_user_achievements(
    db: Session = Depends(get_db),
    authorization: str = None,
    x_user_id: str = Header(None, alias="X-User-ID"),
):
    achievements = [
        {
            "id": "first_debate",
            "title": "First Debate",
            "description": "Complete your first debate",
            "icon": "trophy",
            "earned": False,
        },
        {
            "id": "streak_7",
            "title": "Week Warrior",
            "description": "Maintain a 7-day streak",
            "icon": "flame",
            "earned": False,
        },
        {
            "id": "no_fallacies",
            "title": "Logical Thinker",
            "description": "Complete a debate with no fallacies",
            "icon": "brain",
            "earned": False,
        },
        {
            "id": "debate_master",
            "title": "Debate Master",
            "description": "Complete 50 debates",
            "icon": "crown",
            "earned": False,
        },
        {
            "id": "persuasive",
            "title": "Persuasive Speaker",
            "description": "Win 10 debates",
            "icon": "megaphone",
            "earned": False,
        },
    ]

    user = None
    if x_user_id:
        try:
            user_id = int(x_user_id)
            user = db.query(User).filter(User.id == user_id).first()
        except (ValueError, TypeError):
            pass
    if not user and authorization:
        user = get_current_user(db, authorization)

    if not user:
        return achievements

    completed_sessions = (
        db.query(DebateSession)
        .filter(DebateSession.user_id == user.id, DebateSession.ended_at != None)
        .all()
    )
    total_completed = len(completed_sessions)

    # First Debate (Complete your first debate)
    if total_completed >= 1:
        achievements[0]["earned"] = True

    # Debate Master (Complete 50 debates)
    if total_completed >= 50:
        achievements[3]["earned"] = True

    # Day streak for Week Warrior
    all_sessions = (
        db.query(DebateSession)
        .filter(DebateSession.user_id == user.id)
        .all()
    )
    current_streak = 0
    if all_sessions:
        dates = sorted({s.created_at.date() for s in all_sessions}, reverse=True)
        today = datetime.utcnow().date()
        if dates and (today - dates[0]).days <= 1:
            current_streak = 1
            current_date = dates[0]
            for next_date in dates[1:]:
                diff = (current_date - next_date).days
                if diff == 1:
                    current_streak += 1
                    current_date = next_date
                elif diff > 1:
                    break

    # Week Warrior (Maintain a 7-day streak)
    if current_streak >= 7:
        achievements[1]["earned"] = True

    # Logical Thinker (Complete a debate with no fallacies)
    has_no_fallacy_debate = False
    for session in completed_sessions:
        session_args = (
            db.query(Argument)
            .filter(Argument.session_id == session.id, Argument.is_from_user == True)
            .all()
        )
        if not session_args:
            continue
        
        session_arg_ids = [a.id for a in session_args]
        session_results = (
            db.query(AnalysisResult)
            .filter(AnalysisResult.argument_id.in_(session_arg_ids))
            .all()
        )
        
        total_fallacies = sum(
            len(r.fallacy_detected) if r.fallacy_detected else 0 for r in session_results
        )
        if total_fallacies == 0 and len(session_results) > 0:
            has_no_fallacy_debate = True
            break

    if has_no_fallacy_debate:
        achievements[2]["earned"] = True

    # Wins calculation for Persuasive Speaker
    wins = 0
    for session in completed_sessions:
        session_args = (
            db.query(Argument)
            .filter(Argument.session_id == session.id, Argument.is_from_user == True)
            .all()
        )
        if not session_args:
            continue
        
        session_arg_ids = [a.id for a in session_args]
        session_results = (
            db.query(AnalysisResult)
            .filter(AnalysisResult.argument_id.in_(session_arg_ids))
            .all()
        )
        
        session_strengths = [r.argument_strength for r in session_results if r.argument_strength is not None]
        avg_session_strength = sum(session_strengths) / len(session_strengths) if session_strengths else 0.0
        if avg_session_strength >= 0.6:
            wins += 1

    # Persuasive Speaker (Win 10 debates)
    if wins >= 10:
        achievements[4]["earned"] = True

    return achievements


@router.patch("/user/profile")
def update_profile(
    request: UserProfileUpdate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-ID"),
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

    if request.full_name is not None:
        user.full_name = request.full_name
    if request.bio is not None:
        user.bio = request.bio
    if request.occupation is not None:
        user.occupation = request.occupation
    if request.interests is not None:
        user.interests = request.interests

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "bio": getattr(user, "bio", None),
        "occupation": getattr(user, "occupation", None),
        "interests": getattr(user, "interests", None),
        "experience_level": getattr(user, "experience_level", None),
        "created_at": user.created_at.isoformat() if user.created_at else "",
    }


@router.post("/user/onboarding")
def submit_onboarding(
    request: OnboardingRequest,
    db: Session = Depends(get_db),
    authorization: str = None,
    x_user_id: str = Header(None, alias="X-User-ID"),
):
    user = None
    if x_user_id:
        try:
            user_id = int(x_user_id)
            user = db.query(User).filter(User.id == user_id).first()
        except (ValueError, TypeError):
            pass
    if not user and authorization:
        user = get_current_user(db, authorization)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    user.full_name = request.name
    user.experience_level = request.experience_level

    db.commit()

    return {"message": "Onboarding completed successfully"}
