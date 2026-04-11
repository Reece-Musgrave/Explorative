import asyncio
from playwright.async_api import async_playwright

_playwright = None
_browser = None
_lock = asyncio.Lock() 

async def get_browser():
    global _playwright, _browser
    async with _lock:
        if _browser is None or not _browser.is_connected():
            await _reset_browser()
    return _browser

async def _reset_browser():
    global _playwright, _browser
    try:
        if _browser:
            await _browser.close()
    except Exception:
        pass
    try:
        if _playwright:
            await _playwright.stop()
    except Exception:
        pass
    _playwright = await async_playwright().start()
    _browser = await _playwright.chromium.launch(
        args=[
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote",
            "--disable-extensions",
            "--disable-background-networking",
            "--disable-sync",
            "--no-first-run",
        ]
    )

async def new_page(**kwargs):
    try:
        browser = await get_browser()
        page = await browser.new_page(**kwargs)
    except Exception:
        await _reset_browser()
        page = await _browser.new_page(**kwargs)

    await page.route("**/*", lambda route: (
        route.abort() if route.request.resource_type in ("image", "media", "font", "stylesheet")
        else route.continue_()
    ))
    return page