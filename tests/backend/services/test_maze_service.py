from backend.services.maze_service import ShowAPI, APIError
import pytest


def test_retrieve_show_returns_show_id(requests_mock):
    #Arrange 
    api = ShowAPI()
    example_show = "The Walking Dead"
    #Act
    requests_mock.get(
        f"{api.base_url}/singlesearch/shows?q={example_show}",
        json={
            "id": 123,
            "name": "The Walking Dead",
            "image": {"medium": "http://image.url"},
        },
        status_code=200,
    )
    #Assert
    result = api.retrieve_show(example_show)
    assert result == (123, "The Walking Dead", "http://image.url")

def test_retrieve_show_returns_exception(requests_mock):
    #Arrange 
    api = ShowAPI()
    example_show = "example show "
    #Act
    requests_mock.get(
        f"{api.base_url}/singlesearch/shows?q={example_show}",
        status_code=404,
    )
    #Assert
    with pytest.raises(APIError) as excinfo:
        api.retrieve_show(example_show)    

def test_retrieve_number_of_seasons_returns_number_of_seasons(requests_mock):
    #Arrange
    api = ShowAPI()
    example_show_id = "30082"
    #Act
    requests_mock.get(
        f"{api.base_url}/shows/{example_show_id}/seasons",
        json=[{"id": 1}, {"id": 2}, {"id": 3}],
        status_code=200,
    )
    #Assert
    result = api.retrieve_number_of_seasons(example_show_id)
    assert result == (3)

def test_retrieve_number_of_seasons_returns_exception(requests_mock):
    #Arrange
    api = ShowAPI()
    example_show_id = "00000"
    #Act
    requests_mock.get(
        f"{api.base_url}/shows/{example_show_id}/seasons",
        status_code=404,
    )
    #Assert
    with pytest.raises(APIError) as excinfo:
        api.retrieve_number_of_seasons(example_show_id)

def test_retrieve_number_of_episodes_returns_episodes(requests_mock):
    #Arrange
    api = ShowAPI()
    example_show_id = "30010"
    example_season_number = 1
    #Act
    requests_mock.get(
        f"{api.base_url}/shows/{example_show_id}/seasons",
        json=[{"id": 1, "episodeOrder": 8}],
        status_code = 200
    )
    #Assert
    result = api.retrieve_number_of_episodes(example_show_id, example_season_number)
    assert result == 8

def test_retrieve_number_of_episodes_returns_exception(requests_mock):
    #Arrange
    api = ShowAPI()
    example_show_id = "00000"
    example_season_number = 0
    #Act
    requests_mock.get(
        f"{api.base_url}/shows/{example_show_id}/seasons",
        status_code=404
    )
    #Assert
    with pytest.raises(APIError) as excinfo:
        api.retrieve_number_of_episodes(example_show_id, example_season_number)

def test_return_episode_returns_episode_data(requests_mock):
    #Arrange
    api = ShowAPI()
    example_episode_id = 10
    example_show_id = "1000"
    example_season_id = 3
    #Act
    requests_mock.get(
        f"{api.base_url}/shows/{example_show_id}/episodebynumber?season={example_season_id}&number={example_episode_id}",
        json={
            "season": 3,
            "number": 10,
            "name": "Example Title",
            "airdate": "21/08/0000",
        },
        status_code=200
    )
    #Assert
    result = api.retrieve_episode(example_episode_id, example_show_id, example_season_id)
    assert result["season_ID"] == 3

def test_return_episode_returns_exception(requests_mock):
    #Arrange
    api = ShowAPI()
    example_episode_id = 10
    example_show_id = "1000"
    example_season_id = 3
    #Act
    requests_mock.get(
        f"{api.base_url}/shows/{example_show_id}/episodebynumber?season={example_season_id}&number={example_episode_id}",
        status_code=404
    )
    #Assert
    with pytest.raises(APIError) as excinfo:
        api.retrieve_episode(example_episode_id, example_show_id, example_season_id)