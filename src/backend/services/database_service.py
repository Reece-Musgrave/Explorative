import datetime
from sqlalchemy.orm import Session
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes

def get_show(db: Session, show_name: str):
    return (
        db.query(Shows)
        .filter(Shows.name.ilike(show_name))
        .first()
    )

def get_n_shows(db: Session, show_string: str, n: int):
    return (
        db.query(Shows.id, Shows.name, Shows.tvmaze_id)
        .filter(Shows.name.ilike(f"{show_string}%"))
        .order_by(Shows.name.asc())
        .limit(n)
        .all()
    )

def get_episode_timestamp(db: Session, show_string: str, season_number: int, episode_number: int):
    episode = (
        db.query(Episodes)
        .join(Episodes.seasons)
        .join(Seasons.shows)
        .filter(Shows.name == show_string)
        .filter(Seasons.season_number == season_number)
        .filter(Episodes.episode_number == episode_number)
        .first()
    )

    return episode.air_date if episode else None
      
def create_show(db: Session, show_name: str, maze_id: int, poster_url: str):
    new_show = Shows(
        name=show_name,
        tvmaze_id=maze_id,
        poster_url=poster_url,
        last_refreshed=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

    db.add(new_show)
    db.commit()

def create_season(db: Session, show_id: int, season_number: int, number_episodes: int):
    new_season = Seasons(
        show_id=show_id,
        season_number=season_number,
        number_episodes=number_episodes
    )
    db.add(new_season)
    db.commit()

def create_episodes(db: Session, season_id: int, episode_number: int, title: str, air_date: int):
    new_episode = Episodes(
        season_id=season_id,
        episode_number=episode_number,
        title=title,
        air_date=air_date
    )
    db.add(new_episode)
    db.commit()

def get_seasons(db: Session, show_id: str):
    return (
        db.query(
            Seasons.id,
            Seasons.season_number,
            Seasons.number_episodes
        )
        .filter(Seasons.show_id == show_id)
        .all()
    )

def get_single_season(db: Session, show_id: int, season_number: int):
    return (
        db.query(Seasons.id)
        .filter(Seasons.show_id == show_id)
        .filter(Seasons.season_number == season_number)
        .first()
    )

def get_episodes_by_season(db: Session, show_name: str, season_number: int):
    return (
        db.query(
            Episodes.id,
            Episodes.episode_number,
            Episodes.title,
            Episodes.air_date
        )
        .join(Seasons, Seasons.id == Episodes.season_id)
        .join(Shows, Shows.id == Seasons.show_id)
        .filter(
            Shows.name == show_name,
            Seasons.season_number == season_number
        )
        .order_by(Episodes.episode_number.asc())
        .all()
    )

def reset(db: Session):
    db.query(Episodes).delete()
    db.query(Seasons).delete()
    db.query(Shows).delete()
    
    db.commit()
    print("Database reset completed")