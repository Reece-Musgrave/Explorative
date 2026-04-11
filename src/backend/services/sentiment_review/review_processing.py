import httpx
from backend.services.utils.browser_manager import new_page


base_url_imdb_api = "https://api.imdbapi.dev"
base_url_imdb = "https://www.imdb.com"
base_url_rt = "https://www.rottentomatoes.com"

async def get_reviews_from_imdb(show: str, season: int, episode: int, review_count=20):
    show = show.replace(" ", "+")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{base_url_imdb_api}/search/titles?query={show}&limit=1")
        if response.is_success:
            data = response.json()
            imdb_id = data["titles"][0]["id"]
            response = await client.get(f"{base_url_imdb_api}/titles/{imdb_id}/episodes?season={season}")
            if response.is_success:
                episodes = response.json()
                episode_id = episodes["episodes"][episode - 1]["id"]
                review_url = f"{base_url_imdb}/title/{episode_id}/reviews/?ref_=tt_ururv_sm"

                page = await new_page(extra_http_headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                })
                try:
                    await page.goto(review_url)
                    await page.wait_for_timeout(3000)

                    spoiler_buttons = await page.query_selector_all("button.review-spoiler-button")
                    for button in spoiler_buttons:
                        await button.click()
                        await page.wait_for_timeout(500)
                    await page.wait_for_timeout(2000)

                    review_elements = await page.query_selector_all("div.ipc-overflowText--long")
                    spoiler_elements = await page.query_selector_all("[data-testid='review-spoiler-content']")

                    reviews = []
                    for el in review_elements + spoiler_elements:
                        text = await el.inner_text()
                        reviews.append(text)
                        if len(reviews) == review_count:
                            break
                    return reviews
                finally:
                    await page.close()


async def get_reviews_from_rt(show: str, season: int, episode: int, review_count=20):
    show_string = show.replace(" ", "_").lower()
    search_url = f"{base_url_rt}/tv/{show_string}/s{str(season).zfill(2)}/e{str(episode).zfill(2)}/reviews"

    page = await new_page(extra_http_headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    try:
        await page.goto(search_url)
        await page.wait_for_timeout(3000)
        review_elements = await page.query_selector_all('div[slot="review"]')

        reviews = []
        for el in review_elements:
            text = await el.inner_text()
            reviews.append(text)
            if len(reviews) == review_count:
                break
        return reviews
    finally:
        await page.close()

def format_and_truncate_reviews(imdb, rt, max_words = 200):
    def truncate(text):
        words = text.split()
        return " ".join(words[:max_words])
    
    formatted = []
    for r in imdb[:10]:
        formatted.append(f"[IMDB] {truncate(r)}")
    for r in rt[:10]:
        formatted.append(f"[RT] {truncate(r)}")
    
    return "\n\n".join(formatted)