from fastapi.testclient import TestClient
from backend.main import app
from backend.services.maze_service import APIError, get_maze_service


def test_retrieve_show_data_success(mocker):    
    mock_response = mocker.MagicMock() 
    mock_response.retrieve_show.return_value = (10, "Example Show", "example_url.com")
    app.dependency_overrides[get_maze_service] = lambda: mock_response
    client = TestClient(app)

    response = client.get("/showapi/retrieve-show/Example Show")

    assert response.status_code == 200
    assert response.json() == {
        "id": 10,
        "name": "Example Show",
        "poster_url": "example_url.com"
    }
    app.dependency_overrides.clear()

def test_retrieve_show_data_failure(mocker): 
    mock_response = mocker.MagicMock()
    mock_response.retrieve_show.side_effect = APIError("Show not found")
    app.dependency_overrides[get_maze_service] = lambda: mock_response
    client = TestClient(app)

    response = client.get("/showapi/retrieve-show/Example Show")

    assert response.status_code == 404
    assert response.json() == {'detail': 'Show not found'}
    app.dependency_overrides.clear()

def test_retrieve_season_data_success(mocker):
    mock_response = mocker.MagicMock()
    mock_response.retrieve_number_of_seasons.return_value = 10
    app.dependency_overrides[get_maze_service] = lambda: mock_response
    client = TestClient(app)

    response = client.get("/showapi/retrieve-seasons/1000")

    assert response.status_code == 200 
    assert response.json() == 10
    app.dependency_overrides.clear()

def test_retrieve_season_data_failure(mocker):
    mock_response = mocker.MagicMock()
    mock_response.retrieve_number_of_seasons.side_effect = APIError("Season not found")
    app.dependency_overrides[get_maze_service] = lambda: mock_response
    client = TestClient(app) 

    response = client.get("/showapi/retrieve-seasons/1000")
    
    assert response.status_code == 404
    assert response.json() == {'detail': 'Season not found'}
    app.dependency_overrides.clear()

def test_retrieve_number_episodes_sucess(mocker):
    mock_response = mocker.MagicMock()
    mock_response.retrieve_number_of_episodes.return_value = 10
    app.dependency_overrides[get_maze_service] = lambda: mock_response
    client = TestClient(app)

    response = client.get("/showapi/retrieve-number-episodes/10/5")

    assert response.status_code == 200
    assert response.json() == 10
    app.dependency_overrides.clear()

def test_retrieve_number_episodes_failure(mocker):
    mock_response = mocker.MagicMock()
    mock_response.retrieve_number_of_episodes.side_effect = APIError("Season not found")
    app.dependency_overrides[get_maze_service] = lambda: mock_response
    client = TestClient(app)

    response = client.get("/showapi/retrieve-number-episodes/10/5")

    assert response.status_code == 404
    assert response.json() == {'detail': 'Season not found'}
    app.dependency_overrides.clear()

def test_retrieve_episode_data_success(mocker):
    mock_response = mocker.MagicMock()
    mock_response.retrieve_episode.return_value = {
        "id": 5,
        "episode_number": 5,
        "title": "Example Show",
        "air_date": "15th July",
    }
    app.dependency_overrides[get_maze_service] = lambda: mock_response
    client = TestClient(app)

    response = client.get("/showapi/retrieve-episodes/10000/1011/1005")

    assert response.status_code == 200
    assert response.json() == {
        "id": 5,
        "episode_number": 5,
        "title": "Example Show",
        "air_date": "15th July"
    }
    app.dependency_overrides.clear()

def test_retrieve_episode_data_failure(mocker):
    mock_response = mocker.MagicMock()
    mock_response.retrieve_episode.side_effect = APIError("Episode not found")
    app.dependency_overrides[get_maze_service] = lambda: mock_response
    client = TestClient(app)

    response = client.get("/showapi/retrieve-episodes/10000/1011/1005")

    assert response.status_code == 404
    assert response.json() == {'detail': 'Episode not found'}
    app.dependency_overrides.clear()