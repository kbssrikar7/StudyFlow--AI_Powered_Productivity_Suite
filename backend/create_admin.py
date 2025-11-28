from app.database import SessionLocal
from app.models.user import User
from app.services.auth_service import AuthService

def create_admin():
    db = SessionLocal()
    try:
        email = "admin@admin.com"
        password = "admin"
        
        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User {email} already exists.")
            return

        hashed_password = AuthService.get_password_hash(password)
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name="Admin User"
        )
        db.add(user)
        db.commit()
        print(f"User created successfully: {email} / {password}")
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
