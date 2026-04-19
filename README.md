🎬 REYAPP 
One-stop spoiler-free TV engagement platform
Full-stack distributed web application with AI-driven sentiment analysis, built for aggregating and enhancing cross-platform TV show discussions. 

🚀 Overview
This project is a WIP full-stack platform designed to provide users with a unified, spoiler-free experience for engaging with TV shows and episodes.
It aggregates third-party ratings, reviews, and metadata, while enabling users to create episode-based discussions and interact with AI-generated sentiment summaries.
The system is built using a production-style 3-tier architecture and deployed on AWS using Docker containerisation.

## 🏗️ Architecture

This project follows a 3-tier architecture deployed on AWS EC2 using Docker containers:

- **Frontend:** React + TypeScript (served via Nginx)
- **Backend:** FastAPI (Python REST API)
- **Database:** PostgreSQL

Each service runs in an isolated Docker container and communicates over an internal network.

## Features Implemented

### Core Platform
- User authentication with JWT + refresh tokens
- User-generated posts per episode
- Show/season/episode metadata management
- Real time chat functionality via Websockets

### Data & Integrations
- Web scraping of third-party ratings (IMDb, Rotten Tomatoes, Serializd)
- External TV metadata integration service
- Automated show/season refresh pipeline

### AI & Analytics
- AI-powered sentiment analysis and summarisation (Claude Haiku)
- Aggregation of review sentiment across sources

### Infrastructure
- PostgreSQL database with SQLAlchemy ORM
- Alembic database migrations
- Fully containerised Docker deployment
- Nginx reverse proxy
- GitHub Actions CI/CD pipeline

## Planned Features
- Analytics dashboard 
- Rate limiting 
- Active buffer for chat messages 
- Expanded profile features
- Email functionality for locked-out users
- MFA login

## 🌍 Live version of web app
"https://sandbox.reecemus.com"

## Project Structure
Below is a high-level breakdown of the codebase.

```text
backend/
├── api/        → FastAPI route controllers
├── services/   → Business logic layer
├── models/     → Database ORM models
├── schemas/    → API request/response validation
├── auth/       → JWT authentication & security logic
├── db/         → Database session & configuration
├── core/       → App config & shared utilities
└── alembic/    → Database migrations

frontend/
├── src/pages/      → Route-level views
├── src/components/ → Reusable UI components
├── src/api/        → Backend API client layer
├── src/context/    → Global state management
├── src/lib/        → Utilities/helpers
└── src/types/      → TypeScript types
```

## Deployment

- Hosted on AWS EC2 (Ubuntu, T3.small instance)
- Fully containerised using Docker
- Frontend served via Nginx reverse proxy
- Backend exposed via FastAPI (Uvicorn)
- Database runs in isolated PostgreSQL container
- CI/CD pipeline builds and deploys images via GitHub Actions to GHCR

## Dev Setup
Activate Virtual Env: 'source venv/bin/activate'

###
Build and launch latest containers locally
'docker compose build --no-cache'
'docker compose up'