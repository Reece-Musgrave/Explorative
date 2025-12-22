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
    9/ RetrieveEpisodes - Method for returning all episodes of a season 

'''
import sqlite3
import datetime

class Database: 
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

    def retrieve_show(self, show_name):
        conn = self._get_connection()
        curr = conn.cursor()
        curr.execute(
            "SELECT name, tvmaze_id, poster_url FROM shows WHERE name = ? COLLATE NOCASE",
            (show_name,)
        )
        return curr.fetchone()
    
    def retrieve_episode_timestamp(self, show_name, season_number, episode_number):
        conn = self._get_connection()
        curr = conn.cursor()
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
            (show_name, int(season_number), int(episode_number))
        )
        row = curr.fetchone()
        return row["air_date"] if row else None      

    def insert_show(self, show_name, maze_id, poster_url):
        last_refreshed = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn = self._get_connection()
        curr = conn.cursor()
        curr.execute(
            """
            INSERT INTO shows (name, tvmaze_id, poster_url, last_refreshed)
            VALUES (?, ?, ?, ?)
            """,
            (show_name, maze_id, poster_url, last_refreshed)
        )
        conn.commit()


    def insert_season(self, show_id, season_number, number_episodes):
        conn = self._get_connection()
        curr = conn.cursor()
        curr.execute(
            """
            INSERT INTO seasons (show_id, season_number, number_episodes)
            VALUES (?, ?, ?)
            """,
            (show_id, season_number, number_episodes)
        )
        conn.commit()

    def insert_episode(self, season_id, episode_number, title, air_date):
        conn = self._get_connection()
        curr = conn.cursor()
        curr.execute(
            """
            INSERT INTO episodes (season_id, episode_number, title, air_date)
            VALUES (?, ?, ?, ?)
            """,
            (season_id, episode_number, title, air_date)    
        )
        conn.commit()

    def retrieve_seasons(self, show_id):
        conn = self._get_connection()
        curr = conn.cursor()
        curr.execute(
            "SELECT id, season_number FROM seasons WHERE show_id = ?",
            (show_id,)
        )
        return curr.fetchall()
    
    def retrieve_single_season(self, show_id, season_number):
        conn = self._get_connection()
        curr = conn.cursor()
        curr.execute(
            "SELECT id FROM seasons WHERE show_id = ? AND season_number = ?",
            (show_id,season_number)
        )
        return curr.fetchone()

    def retrieve_episodes_by_season(self, show_name, season_number):
        conn = self._get_connection()
        curr = conn.cursor()
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
        conn = self._get_connection()
        curr = conn.cursor()

        curr.execute("PRAGMA foreign_keys = OFF;")

        curr.execute("DELETE FROM episodes;")
        curr.execute("DELETE FROM seasons;")
        curr.execute("DELETE FROM shows;")

        try:
            curr.execute("DELETE FROM sqlite_sequence WHERE name = 'episodes';")
            curr.execute("DELETE FROM sqlite_sequence WHERE name = 'seasons';")
            curr.execute("DELETE FROM sqlite_sequence WHERE name = 'shows';")
        except sqlite3.OperationalError:
            pass

        curr.execute("PRAGMA foreign_keys = ON;")

        conn.commit()

        print("Database reset completed.")

def get_database():
    return Database("./backend/database/tv_shows/tvshows.db")