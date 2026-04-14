

export async function refreshShowDB(id: number, maze_id: number): Promise<void> {
  
    const responseDB = await fetch(`/api/v1/database/season/${id}`);
    if (!responseDB.ok) {
      throw new Error("Failed to fetch DB seasons");
    }
    const dbSeasons: {id: number; season_number: number; number_episodes: number; }[] = await responseDB.json();
  

    const responseMaze = await fetch(`/api/v1/showapi/seasons/${maze_id}`);
    if (!responseMaze.ok) {
      throw new Error("Failed to fetch API seasons");
    }
    const apiSeasonCount: number = await responseMaze.json();
  
    for (let i = 1; i <= apiSeasonCount; i++) {
        const episodeResponse = await fetch(`/api/v1/showapi/number-episodes/${maze_id}/${i}`);
        if (!episodeResponse.ok) {
            throw new Error(`Failed episode count for season ${i}`);
        }
        const apiEpisodeCount: number = await episodeResponse.json();
        const dbSeason = dbSeasons.find(s => s.season_number === i);
    
        if (!dbSeason) {
            const seasonInsert = await fetch(`/api/v1/database/season`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                show_id: id,
                season_number: i,
                episode_number: apiEpisodeCount
            })
            });
  
            if (seasonInsert.status !== 204) {
            throw new Error(`Failed to insert season ${i}`);
            }
  
            const refreshedSeasonsRes = await fetch(`/api/v1/database/season/${id}`);
            const refreshedSeasons = await refreshedSeasonsRes.json();
            const newSeason = refreshedSeasons.find((s: any) => s.season_number === i);
            const season_id = newSeason.id;
  
            for (let j = 1; j <= apiEpisodeCount; j++) {
                const responseEpisodeData = await fetch(`/api/v1/showapi/episodes/${maze_id}/${i}/${j}`);
                if (!responseEpisodeData.ok) {
                    throw new Error(`Failed episode S${i}E${j}`);
                }
                const { title, episode_number, air_date } = await responseEpisodeData.json();
  
                await fetch(`/api/v1/database/episode`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify({
                    season_id,
                    episode_number,
                    title,
                    air_date
                    })
                });
            }
        }
        else if (dbSeason.number_episodes < apiEpisodeCount) {
            for (let j = dbSeason.number_episodes + 1; j <= apiEpisodeCount; j++) {
            const responseEpisodeData = await fetch(`/api/v1/showapi/episodes/${maze_id}/${i}/${j}`);
    
            if (!responseEpisodeData.ok) {
                throw new Error(`Failed episode S${i}E${j}`);
            }
    
            const { title, episode_number, air_date } = await responseEpisodeData.json();
            await fetch(`/api/v1/database/episode`, {
                method: "PUT",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({
                season_id: dbSeason.id,
                episode_number,
                title,
                air_date
                })
            });
            }

            await fetch(`/api/v1/database/season`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                show_id: id,
                season_number: i,
                episode_number: apiEpisodeCount
            })
            });
        }
    }
}