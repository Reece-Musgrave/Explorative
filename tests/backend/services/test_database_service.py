import pytest 
import sqlite3

@pytest.fixture
def test_setup_in_memory_db():
    conn = sqlite3.connect(":memory:")

    #Create a schema here for the database
    #Create a failure condition to return for the normal methods
    #Update refresh method to call other functions to fill db again / Move to end of file

def test_retrieve_show_returns_show():
    assert False

def test_retrieve_show_returns_exception():
    assert False

def test_retrieve_episode_timestamp_returns_timestmp():
    assert False

def test_retrieve_episode_timestamp_returns_exception():
    assert False

def test_refresh_show_returns_success_message():
    assert False 

def test_refresh_show_returns_exception():
    assert False

def test_insert_show_returns_show_existance_in_db():
    assert False 

def test_insert_show_returns_exception():
    assert False

def test_insert_season_returns_season_existance_in_db():
    assert False

def test_insert_season_returns_exception():
    assert False 

def test_insert_episode_returns_episode_existance_in_db():
    assert False 

def test_insert_episdode_returns_exception():
    assert False 

def test_retrieve_seasons_returns_seasons():
    assert False 

def test_retrieve_seasons_returns_exception():
    assert False 

def test_retrieve_single_season_returns_season():
    assert False 

def test_retrieve_single_season_returns_exception():
    assert False

def test_retrieve_episodes_by_season_returns_episodes():
    assert False 

def test_retrieve_episodes_by_season_returns_exception():
    assert False 

def test_reset_returns_deleted_db():
    assert False 

def test_reset_returns_exception():
    assert False 