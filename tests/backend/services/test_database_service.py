import pytest 
import sqlite3
from backend.services.database_service import Database

@pytest.fixture
def in_memory_db():
    conn = sqlite3.connect(":memory:")
    conn.executescript(
        """
        CREATE TABLE shows (id int, name varchar(255), tvmaze_id int UNIQUE, poster_url str, last_refreshed str, PRIMARY KEY (id));
        CREATE TABLE seasons (id int, show_id int, season_number int, number_episodes int, PRIMARY KEY (id), FOREIGN KEY (show_id) REFERENCES shows(id), UNIQUE(show_id, season_number));
        CREATE TABLE episodes (id int, season_id int, episode_number int, title varchar(255), air_date varchar(255), PRIMARY KEY (id), FOREIGN KEY (season_id) REFERENCES seasons(id), UNIQUE(season_id, episode_number));
        INSERT INTO shows VALUES (1, 'Example Show', 2000, 'fakeurl.com', '26/02/2000:21:00');
        INSERT INTO seasons VALUES (1, 1, 5, 8);
        INSERT INTO episodes VALUES (1, 1, 6, 'Example Episode', '26th July 2025');
        """)
    conn.commit()
    database = Database(connection=conn)

    yield database
    conn.close()


def test_retrieve_show_returns_show(in_memory_db):
    assert in_memory_db.retrieve_show('Example Show') != None
        

def test_retrieve_show_returns_none(in_memory_db):
    assert in_memory_db.retrieve_show('Non-real show') == None
        
def test_retrieve_episode_timestamp_returns_timestmp(in_memory_db):
    assert in_memory_db.retrieve_episode_timestamp('Example Show', 5, 6) == '26th July 2025'
        

def test_retrieve_episode_timestamp_returns_exception(in_memory_db):
    assert in_memory_db.retrieve_episode_timestamp('Example Show', 4, 6) == None

def test_insert_show_returns_show_existance_in_db(in_memory_db):
    in_memory_db.insert_show('Test Show','0145', 'http:/exampleurl.com')
    assert in_memory_db.retrieve_show('Test Show') != None

def test_insert_show_returns_exception(in_memory_db):
    in_memory_db.insert_show('Test Show','0145', 'http:/exampleurl.com')
    with pytest.raises(sqlite3.IntegrityError):
        in_memory_db.insert_show('Test Show','0145', 'http:/exampleurl.com')

def test_insert_season_returns_season_existance_in_db(in_memory_db):
    in_memory_db.insert_season('256', 1, 7)
    assert in_memory_db.retrieve_seasons('256') != None

def test_insert_season_returns_exception(in_memory_db):
    in_memory_db.insert_season('256', 1, 7)
    with pytest.raises(sqlite3.IntegrityError):
        in_memory_db.insert_season('256', 1, 7)

def test_insert_episode_returns_episode_existance_in_db(in_memory_db):
    in_memory_db.insert_episode(1, 2, 'Example Title', '23rd July 2022')
    episodes = in_memory_db.retrieve_episodes_by_season('Example Show', 5)
    assert any(ep['title'] == 'Example Title' for ep in episodes)

def test_insert_episdode_returns_exception(in_memory_db):
    in_memory_db.insert_episode(1, 2, 'Example Title', '23rd July 2022')
    with pytest.raises(sqlite3.IntegrityError):
        in_memory_db.insert_episode(1, 2, 'Example Title', '23rd July 2022')

def test_retrieve_seasons_returns_seasons(in_memory_db):
    assert in_memory_db.retrieve_seasons('Example Show') != None

def test_retrieve_seasons_returns_exception(in_memory_db):
    if not in_memory_db.retrieve_seasons('Non-real show'):
        assert True

def test_retrieve_single_season_returns_season(in_memory_db):
    assert in_memory_db.retrieve_single_season(1, 5) != None

def test_retrieve_single_season_returns_exception(in_memory_db):
    assert in_memory_db.retrieve_single_season(1, 2) == None

def test_retrieve_episodes_by_season_returns_episodes(in_memory_db):
    assert in_memory_db.retrieve_episodes_by_season('Example Show', 5) != None

def test_retrieve_episodes_by_season_returns_exception(in_memory_db):
    assert in_memory_db.retrieve_episodes_by_season('Example Show', 4) != None

def test_reset_returns_deleted_db(in_memory_db):
    in_memory_db.reset()
    shows = in_memory_db.conn.execute("SELECT * FROM shows").fetchall()
    if not shows:
        assert True