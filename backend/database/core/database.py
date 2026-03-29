from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

connect_args = {}
pool_config = {}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif "postgres" in settings.DATABASE_URL:
    pool_config = {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_pre_ping": True,
    }

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args,
    **pool_config
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
