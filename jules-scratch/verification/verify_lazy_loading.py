import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # 1. Go to home page
            await page.goto("http://localhost:5173/", timeout=60000)
            await expect(page.get_by_role("heading", name="Capture Every Moment")).to_be_visible()
            print("✅ Home page loaded successfully.")

            # 2. Navigate to Products page
            await page.get_by_role("navigation").get_by_role("link", name="Products").click()
            await expect(page.get_by_role("heading", name="Products", exact=True)).to_be_visible()
            print("✅ Products page loaded successfully.")

            # 3. Navigate to Login page
            await page.get_by_role("link", name="Sign in").click()
            await expect(page.get_by_role("heading", name="Sign In")).to_be_visible()
            print("✅ Login page loaded successfully.")

            # 4. Navigate to Admin login page
            await page.goto("http://localhost:5173/admin/login", timeout=60000)
            await expect(page.get_by_role("heading", name="Admin Login")).to_be_visible()
            print("✅ Admin login page loaded successfully.")

            # Take a final screenshot
            await page.screenshot(path="jules-scratch/verification/lazy_loading_success.png")
            print("📸 Screenshot taken. Verification successful!")

        except Exception as e:
            print(f"❌ An error occurred: {e}")
            await page.screenshot(path="jules-scratch/verification/lazy_loading_error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
