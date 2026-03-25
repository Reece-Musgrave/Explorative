import os
from anthropic import Anthropic
import json
from backend.core.config import settings

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
        client = Anthropic(
            api_key=settings.ANTHROPIC_API_KEY
        )

        response = client.messages.create(
            max_tokens=3100,
            tools=tools,
            tool_choice={"type": "tool", "name": "sentiment_analysis"},
            messages=[{
                "role": "user",
                "content": f"Analyze these reviews:\n{reviews}"
            }],
            model="claude-haiku-4-5-20251001",
        )
        print(response)
        return response.content[0].input
    
    except Exception as e:
        print(f"AI sentiment analysis error: {str(e)}")
        raise RuntimeError("Failed to generate sentiment analysis")