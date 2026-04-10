import { type PostOutput } from "./types"


export async function insertPost(
    message: string, 
    username: string, 
    show_name: string, 
    season_number: number, 
    episode_number: number, 
    post_type: string): Promise<PostOutput>{

        const params = new URLSearchParams({
            message,
            username,
            show_name,
            season_number: season_number.toString(),
            episode_number: episode_number.toString(),
            post_type
        });

        const response = await fetch(`/api/v1/posts/insert-post?${params}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok){
            const output = await response.json();
            return output
        }
        else{
            throw new Error(`DB Error: Unable to insert post`);
        };
}

export async function retrievePosts(
    show_name: string, 
    season_number: number, 
    episode_number: number, 
    post_range: number[]): Promise<PostOutput[]>{

        const params = new URLSearchParams();
        post_range.forEach(n => params.append("post_range", n.toString()));

        const response = await fetch(`/api/v1/posts/retrieve-post/${show_name}/${season_number}/${episode_number}?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok){
            const data = await response.json();
            return data
        }
        else{
            throw new Error(`DB Error: unable to retrieve posts`)
        }
}


