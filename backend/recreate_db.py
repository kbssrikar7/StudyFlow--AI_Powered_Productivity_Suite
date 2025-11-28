from app.database import engine, Base
from app.models.session import Session
from app.models.snippet import Snippet
from app.models.task import Task

def recreate_tables():
    print("Recreating tables...")
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Tables recreated successfully.")

if __name__ == "__main__":
    recreate_tables()
