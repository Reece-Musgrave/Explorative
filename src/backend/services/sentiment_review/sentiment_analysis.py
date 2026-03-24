import os
from anthropic import Anthropic
from backend.core.config import settings

def get_ai_sentiment_analysis(reviews):
    client = Anthropic( api_key=os.environ.get(settings.ANTHROPIC_API_KEY), )
    for message in client.messages.create(
        max_tokens=3100,
        messages=[{
            "content": f'Analyse these reviews and return: 1) percentage positive/neutral/negative sentiment 2) a 2-3 sentence summary of overall reception. {reviews}',
            "role": "user",
        }],
        model="claude-haiku-4-5-20251001",
    ):    
        print(message)
        return message

