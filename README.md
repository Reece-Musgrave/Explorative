This is a work in progress project with the intention to integrate with other online content, to provide a central location to view and engage in spoiler free content and discussions surroudning popular TV Shows.

## Features Implemented So Far:
- User Authentication using JWT, Refresh Tokens, and Password Hashing
- SQLite Databases for housing User Data and TV Show metadata
- Backend database service, I/O database operations 
- Backend MazeTV service for integrating with a Third Party API to source TV Metadata
- FASTAPI endpoints to cover user authentication & backend services 
- React/Typescript/Tailwind frontend

## Setup Instructions/ Commands
Activate Virtual Env: 'source venv/bin/activate'
###
Start Frontend: 
'npm run dev'
###
Start Backend: 
'cd src'
'uvicorn backend.main:app --reload'   
###
Run Test Suite
Backend Test Suite: pytest 
