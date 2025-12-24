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

def get_database() -> UserDatabase:
    return UserDatabase("./backend/database/users/user_db.db")