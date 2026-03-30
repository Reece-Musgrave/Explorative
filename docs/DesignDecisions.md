
# Key Functionality 
## Primary Application Flow

## AI Sentiment Analysis of third-party episode reviews
As part of the application, one feature is the AI Sentiment Review and Summary functionality. N reviews are collated, mixing Rotten Tomatoes and IMdb reviews, trimmed and concatenated in to a raw data string. This data is then fed, alongside a set prompt to the Anthropic Model Haiku, to retrieve in response a JSON object including sentiment analysis and a truncated summary.

## DevOps decisions and rational 
This application is built using a three-tier architecture. The Frontend is built using React/Typescript, the Backend is built using FASTAPI/Python and the database is built using Postgres. Each tier is built in to it's own docker container with a docker compose file being used to interconnect each container. 

The codebase is stored via GitHub, with continuous-deployment being utilised via GitHub Actions. There is one workflow, split in to two jobs, with the first building the docker containers and publishing the images to the GHCR. The second job, deploys the latest version of these containers to an Ubuntu EC2 instance used for hosting.

All three containers run on a single EC2, backed by EBS. This allows for data to stay consistent in the case of stopping/starting the EC2. The primary driver for this deployment choice is cost, given the low operational cost of cheaper EC2 models. With future expanded development, it would be likely to switch a deplpoyment option with established fault-tolerance and data snapshot retention such as RDS or Aurora.

# Background Functionality 
## Personal User Accounts / Token Security 
The application allows users to create their own accounts to interact with the Application via restricted functionality such as live chats. For authentication, the application uses OAuth2 with JWTs. Token encryption is done via the pwdlib library and Argon2 encryption. Upon successful login, users are provided with a short-lived access token which is stored by the Frontend within memory. Users are also provided a longer-lived refresh token stored in a HttpOnly cookie. This is then used for the generation of future short-lived access tokens.

## Third Party API Integrations 
- This project makes use of the third-party API Maze, to retrieve meta-data associated with shows and episodes. This includes show/season/episode data, episode-airdates, show posters etc. This data is stored within a Postgres database for faster retrieval upon request from the user, wherein if the data is not stored on our end, the Maze API endpoints will be utilised to populate our own DBs with the data. This data is then displayed to the user via the frontend.
- IMDB Ratings are retrieved using the IMDBAPI.dev website / API endpoints

## Web Crawler Functionality
One obstacle to integrating with third-party data is the lack of API availability. For this reason, in certain circumstances this codebase has employed a web-crawler to retrieve the data that we need. 

- RT Rating: Simple HTML webcrawler using BeautifulSoup due to the simplicity of URL concatenation + page display 
- Serializd Rating: More complex webcrawler using Playwright to create a headless Chromium browser to correctly render JS and HTML, navigating the pages and retrieving the data

Reviews used in the AI sentiment analysis functionality are also retrieved using similiarly designed web-crawlers to retrieve third-party reviews from both IMdb and Rotten Tomatoes. 

## Rating retrieval and display
If a ratings record is stored in the database, this is returned to the frontend. If there is no available record, the logical flow is set up to retrieve ratings via the web crawler functionality. As each web page is uniquely set up, sometimes this can take a period of time, and sometimes this can not return any data. Because of this, each UI element is set up as atomic, with a spinner showing in-progress data retrieval. As each rating returns (or doesn't), the UI displays, with each returning any errors in isolation. 

## Database Schemas (Diagram)
### shows
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key |
| name | String | NOT NULL |
| tvmaze_id | Integer | |
| poster_url | String | |
| last_refreshed | String | |

---
 
### seasons
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key |
| show_id | Integer | NOT NULL, FK → shows.id |
| season_number | Integer | |
| number_episodes | Integer | |
 
---
 
### episodes
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key |
| season_id | Integer | NOT NULL, FK → seasons.id |
| episode_number | Integer | |
| title | String | |
| air_date | String | |
 
---
 
### ratings
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key |
| episode_id | Integer | NOT NULL, FK → episodes.id |
| imdb | String | Stored as JSON string `{"aggregateRating": float, "voteCount": int}` |
| rt | String | Stored as JSON string `{"score": str, "review_count": int}` |
| serializd | String | |
| ai_sent | String | |
 
---
 
### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | Primary Key |
| username | String | NOT NULL |
| email | String | |
| full_name | String | |
| password_hash | String | NOT NULL |
| disabled | Boolean | NOT NULL, default: false |
 
---
 
## Relationships
 
- **Shows** → **Seasons**: One-to-many (a show has many seasons)
- **Seasons** → **Episodes**: One-to-many (a season has many episodes)
- **Episodes** → **Ratings**: One-to-one (an episode has one ratings record)