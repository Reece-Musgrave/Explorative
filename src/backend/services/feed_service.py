from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.core.exceptions import NotFoundError
from backend.models.episodes import Episodes
from backend.models.posts import Posts
from backend.models.seasons import Seasons
from backend.models.shows import Shows
from backend.models.users import Users
from backend.models.user_follow_user import UserFollowUser
from backend.models.user_liked_post import UserLikedPost
from backend.services.chat_manager import manager


def get_feed_posts(db: Session, username: str, limit: int = 20, offset: int = 0) -> list[dict]:
    user = db.query(Users).filter(Users.username == username).first()
    if not user:
        raise NotFoundError(f"User {username} not found")

    rows = (
        db.query(Posts, Episodes, Seasons, Shows)
        .join(Episodes, Posts.episode_id == Episodes.id)
        .join(Seasons, Episodes.season_id == Seasons.id)
        .join(Shows, Seasons.show_id == Shows.id)
        .join(Users, Users.username == Posts.username)
        .join(
            UserFollowUser,
            (UserFollowUser.target_id == Users.id) &
            (UserFollowUser.user_id == user.id),
        )
        .order_by(Posts.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    post_ids = [post.id for post, _, _, _ in rows]
    liked_ids = {
        row.post_id
        for row in db.query(UserLikedPost.post_id)
        .filter(UserLikedPost.username == username)
        .filter(UserLikedPost.post_id.in_(post_ids))
        .all()
    }

    return [
        {
            "id": post.id,
            "username": post.username,
            "show_name": show.name,
            "season": season.season_number,
            "episode": episode.episode_number,
            "episode_title": episode.title or "",
            "thumbnail": show.poster_url,
            "message": post.message,
            "created_at": post.created_at,
            "likes": post.likes,
            "post_type": post.post_type,
            "user_has_liked": post.id in liked_ids,
        }
        for post, episode, season, show in rows
    ]


def get_trending_shows(db: Session, limit: int = 5) -> list[dict]:
    rows = (
        db.query(
            Shows.name,
            Shows.poster_url,
            Seasons.season_number,
            Episodes.episode_number,
            Episodes.title,
            func.count(Posts.id).label("post_count"),
        )
        .join(Seasons, Shows.id == Seasons.show_id)
        .join(Episodes, Seasons.id == Episodes.season_id)
        .join(Posts, Episodes.id == Posts.episode_id)
        .group_by(
            Shows.name,
            Shows.poster_url,
            Seasons.season_number,
            Episodes.episode_number,
            Episodes.title,
        )
        .order_by(func.count(Posts.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "show_name": name,
            "detail": f"S{str(season_number).zfill(2)} E{str(episode_number).zfill(2)}",
            "post_count": post_count,
            "thumbnail": poster_url,
            "season": season_number,
            "episode": episode_number,
        }
        for name, poster_url, season_number, episode_number, _title, post_count in rows
    ]


def get_live_chats(limit: int = 5) -> list[dict]:
    rooms = manager.get_active_rooms()
    return [
        {
            "show_name": r["show_name"],
            "episode": f"S{str(r['season']).zfill(2)} E{str(r['episode']).zfill(2)}",
            "users": r["users"],
            "pulse": r["pulse"],
        }
        for r in rooms[:limit]
    ]


def search_users(db: Session, query: str, current_username: str | None = None, limit: int = 10) -> list[dict]:
    q = db.query(Users).filter(Users.username.ilike(f"%{query}%"))
    if current_username:
        q = q.filter(Users.username != current_username)
    users = q.limit(limit).all()

    if not users:
        return []

    current_user = None
    current_follows: set[int] = set()
    if current_username:
        current_user = db.query(Users).filter(Users.username == current_username).first()
        if current_user:
            current_follows = {
                row.target_id
                for row in db.query(UserFollowUser.target_id)
                .filter(UserFollowUser.user_id == current_user.id)
                .all()
            }

    results = []
    for user in users:
        mutuals = 0
        if current_follows:
            user_follows = {
                row.target_id
                for row in db.query(UserFollowUser.target_id)
                .filter(UserFollowUser.user_id == user.id)
                .all()
            }
            mutuals = len(current_follows & user_follows)
        results.append({"username": user.username, "mutuals": mutuals})

    return results
