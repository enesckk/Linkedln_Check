import { chromium } from "playwright";
import {
  PHOTO_SELECTOR,
  BANNER_SELECTOR,
  HEADLINE_SELECTOR,
  ABOUT_SELECTOR,
  EXPERIENCE_SECTION,
  EXPERIENCE_ITEMS,
  EXPERIENCE_TITLE,
  EXPERIENCE_COMPANY,
  EDUCATION_SECTION,
  EDUCATION_ITEMS,
  EDUCATION_SCHOOL,
  EDUCATION_DEGREE,
  CONNECTIONS_SELECTOR
} from '../utils/selectors';

export async function scrapeLinkedInProfile(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });

    const bannerUrl = await page.evaluate((selector) => {
      const el: any = document.querySelector(selector);
      return (el as any)?.src || null;
    }, BANNER_SELECTOR);

    const profilePhoto = await page.evaluate((selector) => {
      const el: any = document.querySelector(selector);
      return (el as any)?.src || null;
    }, PHOTO_SELECTOR);

    const connections = await page.evaluate((selector) => {
      const el: any = document.querySelector(selector);
      if (!el) return null;
      const text = (el as any).innerText;
      const num = parseInt(text);
      return isNaN(num) ? null : num;
    }, CONNECTIONS_SELECTOR);

    return {
      bannerUrl: bannerUrl ?? null,
      profilePhoto: profilePhoto ?? null,
      connections: connections ?? null,
      featured: [],
      endorsements: [],
      media: [],
      activity: [],
      recommendations: [],
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
