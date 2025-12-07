'''
This class provides functionality for the management and operation of the SQLite Databases. 
Methods include:
    1/ Init - initialise connection to sqlite database 
    2/ RetrieveShow - Retrieve a show by name input - return: Name, Img URL or 'None'
    3/ RetrieveEpisodeTimestamp - Given Show, Season and Episode, return timestamp of episode air date (PRIMARY USE CASE METHOD) or returns 'None'
    4/ RefreshShow - When called, will delete all table entries, and refill using latest API data
    5/ InsertShow - Method for inserting a new show
    6/ InsertSeason - Method for inserting a new season
    7/ InsertEpisode - Method for inserting a new episode 
    8/ RetrieveSeasons - Method for returning all seasons of a show 
    9/ RetrieveEpisodes - Methdo for returning all episodes of a season 

'''
import sqlite3
import datetime

class Database: 
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row

    def retrieve_show(self, show_name):
        curr = self.conn.cursor() 
        curr.execute(
            "SELECT name, tvmaze_id, poster_url FROM shows WHERE name = ? COLLATE NOCASE",
            (show_name,)
        )
        return curr.fetchone()
    
    def retrieve_episode_timestamp(self, show_name, season_number, episode_name):
        curr = self.conn.cursor() 
        curr.execute(
            """
            SELECT e.air_date
            FROM episodes e
            JOIN seasons s ON e.season_id = s.id
            JOIN shows sh ON s.show_id = sh.id
            WHERE sh.name = ?
            AND s.season_number = ?
            AND e.episode_number = ?
            """, 
            (show_name, season_number, episode_name)
        )
        return curr.fetchone()

    def refresh_show(self, show_name):
        curr = self.conn.cursor()
        curr.execute("SELECT id FROM shows WHERE name = ?", (show_name,))
        row = curr.fetchone()
        if not row:
            return False 
        
        show_id = row["id"]

        curr.execute("""
            DELETE FROM episodes
            WHERE season_id IN (
                SELECT id FROM seasons WHERE show_id = ?
            )
        """, (show_id,))

        curr.execute("DELETE FROM seasons WHERE show_id = ?", (show_id,))
        curr.execute("DELETE FROM shows WHERE id = ?", (show_id,))
        self.conn.commit()
        return True
        

    def insert_show(self, show_name, maze_id, poster_url):
        last_refreshed = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        curr = self.conn.cursor()
        curr.execute(
            """
            INSERT INTO shows (name, tvmaze_id, poster_url, last_refreshed)
            VALUES (?, ?, ?, ?)
            """,
            (show_name, maze_id, poster_url, last_refreshed)
        )
        self.conn.commit()


    def insert_season(self, show_id, season_number, number_episodes):
        curr = self.conn.cursor()
        curr.execute(
            """
            INSERT INTO seasons (show_id, season_number, number_episodes)
            VALUES (?, ?, ?)
            """,
            (show_id, season_number, number_episodes)
        )
        self.conn.commit()

    def insert_episode(self, season_id, episode_number, title, air_date):
        curr = self.conn.cursor()
        curr.execute(
            """
            INSERT INTO episodes (season_id, episode_number, title, air_date)
            VALUES (?, ?, ?, ?)
            """,
            (season_id, episode_number, title, air_date)    
        )
        self.conn.commit()

    def retrieve_seasons(self, show_id):
        curr = self.conn.cursor()
        curr.execute(
            "SELECT id, season_number FROM seasons WHERE show_id = ?",
            (show_id,)
        )
        return curr.fetchall()
    
    def retrieve_single_season(self, show_id, season_number):
        curr = self.conn.cursor()
        curr.execute(
            "SELECT id FROM seasons WHERE show_id = ? AND season_number = ?",
            (show_id,season_number)
        )
        return curr.fetchone()

    def retrieve_episodes_by_season(self, show_name, season_number):
        curr = self.conn.cursor()
        curr.execute(
            """
            SELECT e.id, e.episode_number, e.title, e.air_date
            FROM episodes e
            JOIN seasons s ON e.season_id = s.id
            JOIN shows sh ON s.show_id = sh.id
            WHERE sh.name = ? AND s.season_number = ?
            ORDER BY e.episode_number
            """,
            (show_name, season_number)
        )
        return curr.fetchall()
    
    def reset(self):
        curr = self.conn.cursor()

        curr.execute("PRAGMA foreign_keys = OFF;")

        curr.execute("DELETE FROM episodes;")
        curr.execute("DELETE FROM seasons;")
        curr.execute("DELETE FROM shows;")

        curr.execute("DELETE FROM sqlite_sequence WHERE name = 'episodes';")
        curr.execute("DELETE FROM sqlite_sequence WHERE name = 'seasons';")
        curr.execute("DELETE FROM sqlite_sequence WHERE name = 'shows';")

        curr.execute("PRAGMA foreign_keys = ON;")

        self.conn.commit()

        print("Database reset completed.")

