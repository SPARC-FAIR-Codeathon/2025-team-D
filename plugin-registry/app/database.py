from .models import SessionLocal, Base, engine
import os

def create_tables():
    Base.metadata.create_all(bind=engine)

def ensure_data_directory():
    database_path = os.getenv("DATABASE_PATH", "./plugin_registry.db")
    data_dir = os.path.dirname(database_path)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    ensure_data_directory()
    create_tables() 