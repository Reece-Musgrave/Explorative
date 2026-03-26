from anthropic import Anthropic
from backend.core.config import settings
from sqlalchemy.orm import Session
from backend.models.shows import Shows
from backend.models.seasons import Seasons
from backend.models.episodes import Episodes
from backend.models.ratings import Ratings
from backend.core.exceptions import NotFoundError

tools = [
    {
        "name": "sentiment_analysis",
        "description": "Analyze sentiment of reviews",
        "input_schema": {
            "type": "object",
            "properties": {
                "positive": {"type": "integer"},
                "neutral": {"type": "integer"},
                "negative": {"type": "integer"},
                "summary": {"type": "string"}
            },
            "required": ["positive", "neutral", "negative", "summary"]
        }
    }
]

def get_ai_sentiment_analysis(reviews):
    try:
        print(reviews)
        client = Anthropic(
            api_key=settings.ANTHROPIC_API_KEY
        )

        response = client.messages.create(
            max_tokens=3100,
            tools=tools,
            tool_choice={"type": "tool", "name": "sentiment_analysis"},
            messages=[{
                "role": "user",
                "content": f"Analyze these reviews, with a max word count of 65 for the summary:\n{reviews}"
            }],
            model="claude-haiku-4-5-20251001",
        )
        return response.content[0].input
    
    except Exception as e:
        print(f"AI sentiment analysis error: {str(e)}")
        raise RuntimeError("Failed to generate sentiment analysis")

def insert_ai_sentiment_analysis_for_episode(db: Session, analysis: str, show: str, season: int, episode_number: int):
    episode = (
        db.query(Episodes)
        .join(Episodes.seasons)
        .join(Seasons.shows)
        .filter(Shows.name == show)
        .filter(Seasons.season_number == season)
        .filter(Episodes.episode_number == episode_number)
        .first()
    )
  
    if not episode:
        raise NotFoundError(f"Episode S{season}E{episode_number} of {show} not found in database")

    existing_rating = db.query(Ratings).filter(Ratings.episode_id == episode.id).first()

    if existing_rating:
        existing_rating.ai_sent = analysis
    
    db.commit()

def get_ai_sentiment_analysis_from_db(db: Session, show: str, season: int, episode_number: int):
    episode = (
        db.query(Episodes)
        .join(Episodes.seasons)
        .join(Seasons.shows)
        .filter(Shows.name == show)
        .filter(Seasons.season_number == season)
        .filter(Episodes.episode_number == episode_number)
        .first()
    )
    if not episode:
        raise NotFoundError(f"Episode S{season}E{episode_number} of {show} not found in database")

    existing_rating = db.query(Ratings).filter(Ratings.episode_id == episode.id).first()

    if not existing_rating or not existing_rating.ai_sent:
        return None
    
    return existing_rating.ai_sent