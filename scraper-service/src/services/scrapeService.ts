import { chromium } from "playwright";
import { extractSelectors } from "../utils/selectors";

export async function scrapeLinkedInProfile(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });

    const data = await extractSelectors(page);

    return {
      bannerUrl: data.bannerUrl ?? null,
      profilePhoto: data.profilePhoto ?? null,
      connections: data.connections ?? null,
      featured: data.featured ?? [],
      endorsements: data.endorsements ?? [],
      media: data.media ?? [],
      activity: data.activity ?? [],
      recommendations: data.recommendations ?? [],
    };

  } catch (err) {
    console.error("SCRAPER ERROR", err);
    return {
      bannerUrl: null,
      profilePhoto: null,
      connections: null,
      featured: [],
      endorsements: [],
      media: [],
      activity: [],
      recommendations: []
    };

  } finally {
    await browser.close();
  }
}
