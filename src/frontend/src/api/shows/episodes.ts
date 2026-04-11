import { type Episode } from "@/types/episode";


export async function retrieveEpisode(showName: string, seasonNumber: number, episodeNumber: number, showImageURL: string): Promise<Episode>{
    const retrieveEpisodeResponse = await fetch(`/api/v1/database/episode/${showName}/${seasonNumber}`);
    if (retrieveEpisodeResponse.ok){
        const episodes = await retrieveEpisodeResponse.json();
        try{
            const episode = episodes.find((ep: { episode_number: number }) => ep.episode_number === episodeNumber);
            const {id, episode_number, title, air_date} = episode;
            return {
                episodeId: id,
                episodeNumber,
                episodeTitle: title,
                episodeAirdate: air_date,
                showName,
                showImageURL,
                seasonNumber
            };
        }
        catch{
            throw new Error("API Response did not contain the searched for episode");
        }
    }
    else{
        throw new Error("Unable to retrieve show data from database");
    }
}