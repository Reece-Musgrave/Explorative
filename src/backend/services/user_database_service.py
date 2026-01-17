import sqlite3

class UserDatabase:
    def __init__(self, db_path = None, connection = None):
        if connection != None:
            self.conn = connection
        else:
            self.db_path = db_path
        self._row_factory = sqlite3.Row
    
    def _get_connection(self):
        if hasattr(self, "conn"):
            conn = self.conn
        else:
            conn = sqlite3.connect(self.db_path)
        conn.row_factory = self._row_factory
        return conn
    
    def check_email(self, email):
        conn = self._get_connection()
        with conn:
            curr = conn.cursor()
            row = curr.execute(
                "SELECT email FROM users WHERE email = ?",
                (email,)
            ).fetchone()
            return row is not None

    def check_username(self, username):
        conn = self._get_connection()
        with conn:
            curr = conn.cursor()
            row = curr.execute(
                "SELECT username FROM users WHERE username = ?",
                (username,)
            ).fetchone()
            return row is not None

    def register_user(self, username, email, full_name, password_hash):
        conn = self._get_connection()
        with conn:
            curr = conn.cursor()
            curr.execute(
                """
                INSERT INTO users (username, email, full_name, password_hash)
                VALUES (?, ?, ?, ?)
                """,
                (username, email, full_name, password_hash)
            )
            conn.commit()

def get_database() -> UserDatabase:
    return UserDatabase("./backend/database/users/user_db.db")