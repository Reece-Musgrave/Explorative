import os
from anthropic import Anthropic
from backend.core.config import settings

def get_ai_sentiment_analysis(reviews):
    try:
        client = Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )

        response = client.messages.create(
            max_tokens=3100,
            messages=[{
                "role": "user",
                "content": f"Analyse these reviews and return: 1) percentage positive/neutral/negative sentiment 2) a 2-3 sentence summary of overall reception. {reviews}",
            }],
            model="claude-haiku-4-5-20251001",
        )

        return response.content[0].text
    
    except Exception as e:
        print(f"AI sentiment analysis error: {str(e)}")
        raise RuntimeError("Failed to generate sentiment analysis")