import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Assuming the backend is run from the 'server' directory, the database is at '../prisma/tradelab.db'
# However, if run from root, it is './prisma/tradelab.db'
# We will use an absolute path relative to this file to be safe.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "prisma", "tradelab.db")

DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")
if DATABASE_URL.startswith("file:"):
    DATABASE_URL = DATABASE_URL.replace("file:", "sqlite:///")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
