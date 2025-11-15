import { chromium } from "playwright";

export async function scrapeLinkedInProfile(url: string) {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,

    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

    viewport: { width: 1280, height: 900 },

    javaScriptEnabled: true,
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(4000); // LinkedIn load delay

    // Wait for profile section
    await page.waitForSelector("img.full-width.evi-image", { timeout: 15000 });

    const profilePhoto = await page
      .locator("img.pv-top-card-profile-picture__image")
      .first()
      .getAttribute("src");

    const bannerPhoto = await page
      .locator("img.full-width.evi-image")
      .first()
      .getAttribute("src");

    const fullName = await page
      .locator("h1.text-heading-xlarge")
      .first()
      .innerText()
      .catch(() => null);

    return {
      profilePhoto,
      bannerPhoto,
      fullName,
    };

  } catch (err) {
    console.error("SCRAPER ERROR:", err);
    return null;
  } finally {
    await browser.close();
  }
}
