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

    def RetrieveShow(self, showName):
        curr = self.conn.cursor() 
        curr.execute(
            "SELECT name, tvmaze_id, poster_url FROM shows WHERE name = ? COLLATE NOCASE",
            (showName,)
        )
        return curr.fetchone()
    
    def RetrieveEpisodeTimestamp(self, showName, seasonNumber, episodeName):
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
            (showName, seasonNumber, episodeName)
        )
        return curr.fetchone()

    def RefeshShow(self, showName):
        curr = self.conn.cursor()
        curr.execute("SELECT id FROM shows WHERE name = ?", (showName,))
        row = curr.fetchone()
        if not row:
            return False 
        
        showID = row["id"]

        curr.execute("""
            DELETE FROM episodes
            WHERE season_id IN (
                SELECT id FROM seasons WHERE show_id = ?
            )
        """, (showID,))

        curr.execute("DELETE FROM seasons WHERE show_id = ?", (showID,))
        curr.execute("DELETE FROM shows WHERE id = ?", (showID,))
        self.conn.commit()
        return True
        

    def InsertShow(self, showName, mazeID, posterURL):
        lastRefreshed = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        curr = self.conn.cursor()
        curr.execute(
            """
            INSERT INTO shows (name, tvmaze_id, poster_url, last_refreshed)
            VALUES (?, ?, ?, ?)
            """,
            (showName, mazeID, posterURL, lastRefreshed)
        )
        self.conn.commit()


    def InsertSeason(self, showID, seasonNumber, numberEpisodes):
        curr = self.conn.cursor()
        curr.execute(
            """
            INSERT INTO seasons (show_id, season_number, number_episodes)
            VALUES (?, ?, ?)
            """,
            (showID, seasonNumber, numberEpisodes)
        )
        self.conn.commit()

    def InsertEpisode(self, seasonID, episodeNumber, title, airDate):
        curr = self.conn.cursor()
        curr.execute(
            """
            INSERT INTO episodes (season_id, episode_number, title, air_date)
            VALUES (?, ?, ?, ?)
            """,
            (seasonID, episodeNumber, title, airDate)    
        )
        self.conn.commit()

    def RetrieveSeasons(self, showID):
        curr = self.conn.cursor()
        curr.execute(
            "SELECT id, season_number FROM seasons WHERE show_id = ?",
            (showID,)
        )
        return curr.fetchall()
    
    def RetrieveSingleSeason(self, showID, seasonNumber):
        curr = self.conn.cursor()
        curr.execute(
            "SELECT id FROM seasons WHERE show_id = ? AND season_number = ?",
            (showID,seasonNumber)
        )
        return curr.fetchone()

    def RetrieveEpisodesBySeason(self, showName, seasonNumber):
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
            (showName, seasonNumber)
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

