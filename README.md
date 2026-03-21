This project is currently WIP. The main motivation behind the project is to create a one stop site for users to access and engage with cross-site, spoiler free content for whatever TV-show and episode they are currently watching.

## Architecture 
This project is built with a three-tier architecture:
- React / Typescript frontend 
- FastAPI / Python backend 
- Postgres database

Each tier is built in to Docker containers, and deployed to an AWS Ubuntu EC2 instance.

## Features Implemented So Far:
- User Authentication using JWT, Refresh Tokens, and Password Hashing
- Postgres Database for housing User Data and TV Show metadata
- Backend database service, I/O database operations 
- Backend MazeTV service for integrating with a Third Party API to source TV Metadata
- FASTAPI endpoints to cover user authentication & backend services 
- React/Typescript/Tailwind frontend
- Environment based config + containerised deployments
- Nginx Reverse Proxy
- SQLAlchemy ORM
- Alembic migrations
- Unit test coverage for FAST API Endpoints and Underlying services (No longer working post Postgres migration)

## Planned Features
- Media collation and display from other sites (Webscraper)
- Official and Unofficial episode / show reviews, with AI sentiment analysis 
- Real-time chat feature ("Watch Parties")
- Analytics dashboard 
- Rate limiting 
- Active buffer for chat messages 
- Expanded profile features
- Email functionality for locked-out users
- MFA login

## Live version of web app
"https://sandbox.reecemus.com"

## Prod Setup
GitHub Actions is set up with two optional jobs that run of the main branch. The "Optional Build & Deploy" workflow, will build the latest version of the codebase in to container images and publish these to the GHCR. If the deploy job is run, these latest images will be built and deployed on the AWS infrastructure, being reflected the active site URL.

## Dev Setup
Activate Virtual Env: 'source venv/bin/activate'

###
Build and launch latest containers locally
'docker compose build --no-cache'
'docker compose up'

###
Run Test Suite
Backend Test Suite: pytest 