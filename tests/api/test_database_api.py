from fastapi.testclient import TestClient
from backend.main import app
from backend.services.database_service import get_database
import sqlite3

def test_retrieve_show_success(mocker):
    mock_db = mocker.MagicMock()
    mock_db.retrieve_show.return_value = {
        "name": "Breaking Bad",
        "tvmaze_id": 169,
        "poster_url": "http://image.url"
    }
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)
    
    response = client.get("/database/retrieve-show/Breaking%20Bad")

    assert response.status_code == 200
    assert response.json() == {
        "name": "Breaking Bad",
        "maze_id": 169,
        "url": "http://image.url"
    }
    app.dependency_overrides.clear()

def test_retrieve_show_failure(mocker):
    mock_db = mocker.MagicMock()
    mock_db.retrieve_show.return_value = None
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)

    response = client.get("/database/retrieve-show/The Walking Dead")

    assert response.status_code == 404
    app.dependency_overrides.clear()

def test_retrieve_episode_air_date_success(mocker):
    mock_db = mocker.MagicMock()
    mock_db.retrieve_episode_timestamp.return_value = "2023-01-15"
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)
    
    response = client.get(
        "/database/retrieve-episode-air_date",
        params={
            "show_name": "Example Show",
            "season_number": "1",
            "episode_name": "Pilot"
        }
    )

    assert response.status_code == 200
    assert response.json() == "2023-01-15"
    app.dependency_overrides.clear()

def test_retrieve_episode_air_date_failure(mocker):
    mock_db = mocker.MagicMock()
    mock_db.retrieve_episode_timestamp.return_value = None
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)
    
    response = client.get(
        "/database/retrieve-episode-air_date",
        params={
            "show_name": "Example Show",
            "season_number": "1",
            "episode_name": "Pilot"
        }
    )

    assert response.status_code == 404
    app.dependency_overrides.clear()

def test_insert_show_success(mocker):
    mock_db = mocker.MagicMock()
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)

    response = client.put(
        "/database/insert-show",
        json={
            "name": "Example Show",
            "maze_id": "45061",
            "url": "http://example-url.com"
        }
    )

    assert response.status_code == 204
    app.dependency_overrides.clear()

def test_insert_show_failure(mocker):
    mock_db = mocker.MagicMock()
    mock_db.insert_show.side_effect = sqlite3.IntegrityError
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)

    response = client.put(
        "/database/insert-show",
        json={
            "name": "Example Show",
            "maze_id": "45061",
            "url": "http://example-url.com"
        }
    )

    assert response.status_code == 409
    app.dependency_overrides.clear()
    

def test_insert_season_success(mocker):
    mock_db = mocker.MagicMock()
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)

    response = client.put(
        "/database/insert-season",
        json={
            "show_id": "5001",
            "season_number": "2",
            "episode_number": "12"
        }
    )

    assert response.status_code == 204
    app.dependency_overrides.clear()

def test_insert_season_failure(mocker):
    mock_db = mocker.MagicMock()
    mock_db.insert_season.side_effect = sqlite3.IntegrityError
    app.dependency_overrides[get_database] = lambda: mock_db 
    client = TestClient(app)

    response = client.put(
        "/database/insert-season",
        json={
            "show_id": "5001",
            "season_number": "2",
            "episode_number": "12"
        }
    )

    assert response.status_code == 409
    app.dependency_overrides.clear()

def test_insert_episode_success(mocker):
    mock_db = mocker.MagicMock()
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)

    response = client.put(
        "/database/insert-episode",
        json = {
            "season_id": "50042",
            "episode_number": "5",
            "title": "Example Episode Title",
            "air_date": "15 July 2024"
        }
    )

    assert response.status_code == 204
    app.dependency_overrides.clear()

def test_insert_episode_failure(mocker):
    mock_db = mocker.MagicMock()
    mock_db.insert_episode.side_effect = sqlite3.IntegrityError
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)

    response = client.put(
        "/database/insert-episode",
        json = {
            "season_id": "50042",
            "episode_number": "5",
            "title": "Example Episode Title",
            "air_date": "15 July 2024"
        }
    )

    assert response.status_code == 409
    app.dependency_overrides.clear()

def test_retrieve_season_success(mocker):
    mock_db = mocker.MagicMock()
    mock_db.retrieve_seasons.return_value = [{"id": "6", "season_number":"5"}]
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)

    response = client.get("/database/retrieve-season/6")
    
    assert response.status_code == 200
    assert response.json() == {
        "id": 6,
        "season_number": 5
    }
    app.dependency_overrides.clear()

def test_retrieve_season_failure(mocker):
    mock_db = mocker.MagicMock()
    mock_db.retrieve_seasons.return_value = None
    app.dependency_overrides[get_database] = lambda: mock_db
    client = TestClient(app)

    response = client.get("/database/retrieve-season/6")

    assert response.status_code == 404
    app.dependency_overrides.clear()
    