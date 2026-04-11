import { type Post } from "@/types/posts";


export async function insertPost(
    message: string, 
    username: string, 
    showName: string, 
    seasonNumber: number, 
    episodeNumber: number, 
    postType: string): Promise<Post>{

        const params = new URLSearchParams({
            message,
            username,
            show_name: showName,
            season_number: seasonNumber.toString(),
            episode_number: episodeNumber.toString(),
            post_type: postType
        });

        const response = await fetch(`/api/v1/posts/insert-post?${params}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok){
            const output = await response.json();
            return output;
        }
        else{
            throw new Error(`DB Error: Unable to insert post`);
        };
}

export async function retrievePosts(
    showName: string, 
    seasonNumber: number, 
    episodeNumber: number, 
    postRange: number[]): Promise<Post[]>{

        const params = new URLSearchParams();
        postRange.forEach(n => params.append("post_range", n.toString()));

        const response = await fetch(`/api/v1/posts/retrieve-post/${showName}/${seasonNumber}/${episodeNumber}?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok){
            const data = await response.json();
            return data;
        }
        else{
            throw new Error(`DB Error: unable to retrieve posts`);
        }
}


