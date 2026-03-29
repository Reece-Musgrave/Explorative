import { type RetrieveRatingsOutput , type IMDBRating, type RTRating} from "./types"

export async function retrieveAllRatings(show: string, season: number, episode: number): Promise<RetrieveRatingsOutput> {
    const responseRatingsCall = await fetch(`/api/v1/ratings/retrieve-rating/${show}/${season}/${episode}`);
    let id, episode_id, imdb, rt, serializd, ai_sent;

    if (responseRatingsCall.ok) {
        ({ id, episode_id, imdb, rt, serializd, ai_sent } = await responseRatingsCall.json());
        if (imdb) imdb = JSON.parse(imdb)
        if (rt) rt = JSON.parse(rt)
    }

    if(!imdb) imdb = await insertRating("imdb", show, season, episode)
    if(!rt) rt = await insertRating("rt", show, season, episode)
    if(!serializd) serializd = await insertRating("serializd", show, season, episode)

    return { id, episode_id, imdb, rt, serializd, ai_sent }
}

export async function retrieveRTRating(show: string, season: number, episode: number): Promise<RTRating> {
    const response = await fetch(`/api/v1/ratings/retrieve-rating/${show}/${season}/${episode}`);
    let id, episode_id, imdb, rt, serializd, ai_sent;
    
    if (response.ok){
        ({ id, episode_id, imdb, rt, serializd, ai_sent } = await response.json());
        if (rt) rt = JSON.parse(rt)
    }
    
    if(!rt) rt = await insertRating("rt", show, season, episode)
    return (rt)
}

export async function retrieveSerializdRating(show: string, season: number, episode: number): Promise<string> {
    const response = await fetch(`/api/v1/ratings/retrieve-rating/${show}/${season}/${episode}`);
    let id, episode_id, imdb, rt, serializd, ai_sent;
    
    if (response.ok){
        ({ id, episode_id, imdb, rt, serializd, ai_sent } = await response.json());
    }
    
    if(!serializd) serializd = await insertRating("serializd", show, season, episode)
    return (serializd)
}

export async function retrieveIMDBRating(show: string, season: number, episode: number): Promise<IMDBRating> {
    const response = await fetch(`/api/v1/ratings/retrieve-rating/${show}/${season}/${episode}`);
    let id, episode_id, imdb, rt, serializd, ai_sent;
    
    if (response.ok){
        ({ id, episode_id, imdb, rt, serializd, ai_sent } = await response.json());
        if (imdb) imdb = JSON.parse(imdb)
    }
    
    if(!imdb) imdb = await insertRating("imdb", show, season, episode)
    return (imdb)
}

async function insertRating(method: string, show: string, season: number, episode: number): Promise<string>{
    const responseRetrieveRating = await fetch(`/api/v1/ratings/retrieve-${method}/${show}/${season}/${episode}`)
    if (responseRetrieveRating.ok) {
        const rating = await responseRetrieveRating.json();
        const ratingsData = {
            show,
            season,
            episode,
            rating
        }

        const responseInsertRating = await fetch(`/api/v1/ratings/insert-${method}-rating`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ratingsData)
        })

        if (responseInsertRating.ok){
            return rating
        } else{
            throw new Error(`DB Error: Unable to insert ratings for ${method} for given episode`);
        }
    } else{
        throw new Error(`API Error: Unable to retrieve ratings for ${method} for given episode`);
    }
}