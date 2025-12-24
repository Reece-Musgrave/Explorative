from backend.models.user import UserInDB
from backend.auth.hashing import verify_password
from backend.services.user_database_service import UserDatabase


def get_user(db: UserDatabase, username: str) -> UserInDB | None:
    conn = db._get_connection()
    cur = conn.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    )
    row = cur.fetchone()
    if row is None:
        return None
    return UserInDB(
        username=row["username"],
        email=row["email"],
        full_name=row["full_name"],
        disabled=row["disabled"],
        hashed_password=row["password_hash"],
    )

def authenticate_user(db: UserDatabase, username: str, password: str) -> UserInDB | bool:
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user