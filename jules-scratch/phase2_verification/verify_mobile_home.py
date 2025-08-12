import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # iPhone X viewport
        context = await browser.new_context(
            viewport={'width': 375, 'height': 812},
            is_mobile=True,
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1'
        )
        page = await context.new_page()

        try:
            # Go to home page
            await page.goto("http://localhost:5173/", timeout=60000)

            # Wait for the main heading to be visible
            await expect(page.get_by_role("heading", name="Capture Every Moment")).to_be_visible(timeout=30000)
            print("✅ Home page loaded successfully.")

            # Take a screenshot
            screenshot_path = "jules-scratch/phase2_verification/mobile_home_analysis.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"❌ An error occurred: {e}")
            await page.screenshot(path="jules-scratch/phase2_verification/mobile_home_error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
