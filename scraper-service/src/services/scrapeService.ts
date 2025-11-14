import { chromium, Page } from "playwright";
import { SELECTORS } from '../utils/selectors';

export interface ScrapedData {
  bannerUrl?: string | null;
  profilePhoto?: string | null;
  photoResolution?: string | null;
  connections?: number | null;
  featured?: Array<{
    type: string;
    title: string;
    url: string;
  }>;
  endorsements?: Array<{
    skill: string;
    count: number;
  }>;
  activity?: Array<{
    type: string;
    content: string;
    date: string;
  }>;
  recommendations?: Array<{
    author: string;
    text: string;
    date: string;
  }>;
  media?: Array<{
    type: string;
    url: string;
  }>;
}

export async function scrapeLinkedInProfile(url: string): Promise<ScrapedData> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"]
  });

  const context = await browser.newContext();

  // Login cookie inject
  await context.addCookies([
    {
      name: "li_at",
      value: process.env.LINKEDIN_LI_AT || "",
      domain: ".www.linkedin.com",
      path: "/",
      httpOnly: true,
      secure: true
    }
  ]);

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    // Helpers
    const getText = async (sel: string) =>
      await page.$eval(sel, (el) => el.textContent?.trim() || null).catch(() => null);

    const getImage = async (sel: string) =>
      await page.$eval(sel, (el) => el.getAttribute("src")).catch(() => null);

    const getAllTexts = async (selector: string) => {
      try {
        const elements = await page.$$(selector);
        const results: string[] = [];
        for (const el of elements) {
          const t = await el.innerText().catch(() => null);
          if (t) results.push(t.trim());
        }
        return results;
      } catch {
        return [];
      }
    };

    const getAllImages = async (selector: string) => {
      try {
        const elements = await page.$$(selector);
        const results: string[] = [];
        for (const el of elements) {
          const t = await el.getAttribute("src").catch(() => null);
          if (t) results.push(t);
        }
        return results;
      } catch {
        return [];
      }
    };

    // Extraction -----------------------------------

    const banner = await getImage(SELECTORS.profile.banner);
    const profilePhoto = await getImage(SELECTORS.profile.profilePhoto);
    const about = await getText(SELECTORS.about.text);

    // Experience
    const experienceList: Array<{ role?: string | null; company?: string | null; date?: string | null }> = [];
    try {
      const expItems = await page.$$(SELECTORS.experience.items);
      for (const item of expItems) {
        const role = await item.$eval(SELECTORS.experience.role, el => el.textContent?.trim()).catch(() => null);
        const company = await item.$eval(SELECTORS.experience.company, el => el.textContent?.trim()).catch(() => null);
        const date = await item.$eval(SELECTORS.experience.date, el => el.textContent?.trim()).catch(() => null);
        experienceList.push({ role, company, date });
      }
    } catch (err) {
      console.error("Experience extraction error:", err);
    }

    // Education
    const educationList: Array<{ school?: string | null; degree?: string | null; date?: string | null }> = [];
    try {
      const eduItems = await page.$$(SELECTORS.education.items);
      for (const item of eduItems) {
        const school = await item.$eval(SELECTORS.education.school, el => el.textContent?.trim()).catch(() => null);
        const degree = await item.$eval(SELECTORS.education.degree, el => el.textContent?.trim()).catch(() => null);
        const date = await item.$eval(SELECTORS.education.date, el => el.textContent?.trim()).catch(() => null);
        educationList.push({ school, degree, date });
      }
    } catch (err) {
      console.error("Education extraction error:", err);
    }

    // Skills (for endorsements)
    const skillsList: Array<{ name?: string | null; endorsement?: string | null }> = [];
    const endorsementsList: Array<{ skill: string; count: number }> = [];
    try {
      const skillItems = await page.$$(SELECTORS.skills.items);
      for (const item of skillItems) {
        const name = await item.$eval(SELECTORS.skills.name, el => el.textContent?.trim()).catch(() => null);
        const endorsement = await item.$eval(SELECTORS.skills.endorsements, el => el.textContent?.trim()).catch(() => null);
        if (name) {
          skillsList.push({ name, endorsement });
          // Parse endorsement count
          const countMatch = endorsement?.match(/(\d+)/);
          const count = countMatch ? parseInt(countMatch[1]) : 0;
          endorsementsList.push({ skill: name, count });
        }
      }
    } catch (err) {
      console.error("Skills extraction error:", err);
    }

    // Certificates
    const certificateList: Array<{ name?: string | null; issuer?: string | null; date?: string | null }> = [];
    try {
      const certItems = await page.$$(SELECTORS.certificates.items);
      for (const item of certItems) {
        const name = await item.$eval(SELECTORS.certificates.name, el => el.textContent?.trim()).catch(() => null);
        const issuer = await item.$eval(SELECTORS.certificates.issuer, el => el.textContent?.trim()).catch(() => null);
        const date = await item.$eval(SELECTORS.certificates.date, el => el.textContent?.trim()).catch(() => null);
        certificateList.push({ name, issuer, date });
      }
    } catch (err) {
      console.error("Certificates extraction error:", err);
    }

    // Languages
    const languagesList: Array<{ name?: string | null; level?: string | null }> = [];
    try {
      const langItems = await page.$$(SELECTORS.languages.items);
      for (const item of langItems) {
        const name = await item.$eval(SELECTORS.languages.name, el => el.textContent?.trim()).catch(() => null);
        const level = await item.$eval(SELECTORS.languages.level, el => el.textContent?.trim()).catch(() => null);
        languagesList.push({ name, level });
      }
    } catch (err) {
      console.error("Languages extraction error:", err);
    }

    // Featured — basic extraction
    const featuredTitles = await getAllTexts(SELECTORS.featured.title);
    const featuredImages = await getAllImages(SELECTORS.featured.image);
    const featuredList: Array<{ type: string; title: string; url: string }> = [];
    featuredTitles.forEach((title, index) => {
      featuredList.push({
        type: "link",
        title: title,
        url: featuredImages[index] || ""
      });
    });

    // Activity
    const activityTexts = await getAllTexts(SELECTORS.activity.text);
    const activityList: Array<{ type: string; content: string; date: string }> = [];
    activityTexts.forEach((text) => {
      activityList.push({
        type: "post",
        content: text,
        date: new Date().toISOString() // LinkedIn'den tarih çekilemiyorsa şimdilik current date
      });
    });

    // Recommendations
    const recNames = await getAllTexts(SELECTORS.recommendations.name);
    const recRelations = await getAllTexts(SELECTORS.recommendations.relation);
    const recommendationsList: Array<{ author: string; text: string; date: string }> = [];
    recNames.forEach((name, index) => {
      recommendationsList.push({
        author: name,
        text: recRelations[index] || "",
        date: new Date().toISOString()
      });
    });

    // Media (from featured images)
    const mediaList: Array<{ type: string; url: string }> = [];
    featuredImages.forEach((imgUrl) => {
      if (imgUrl) {
        mediaList.push({
          type: "image",
          url: imgUrl
        });
      }
    });

    // Connections count extraction (try multiple selectors)
    let connections: number | null = null;
    try {
      // Try to find connections text
      const connectionsText = await page.evaluate(() => {
        const elements = document.querySelectorAll('span.t-bold[aria-hidden="true"]');
        for (const el of elements) {
          const text = el.textContent || "";
          const match = text.match(/(\d+)\s*\+?\s*connections?/i);
          if (match) {
            return parseInt(match[1]);
          }
        }
        return null;
      });
      connections = connectionsText;
    } catch (err) {
      console.error("Connections extraction error:", err);
    }

    // Photo resolution (if available)
    let photoResolution: string | null = null;
    if (profilePhoto) {
      try {
        // Try to get image dimensions from img element
        const dimensions = await page.evaluate((sel) => {
          const img = document.querySelector(sel) as HTMLImageElement;
          if (img && img.naturalWidth && img.naturalHeight) {
            return `${img.naturalWidth}x${img.naturalHeight}`;
          }
          return null;
        }, SELECTORS.profile.profilePhoto);
        photoResolution = dimensions;
      } catch (err) {
        // Ignore
      }
    }

    // Final result ----------------------------------
    const result: ScrapedData = {
      bannerUrl: banner ?? null,
      profilePhoto: profilePhoto ?? null,
      photoResolution: photoResolution ?? null,
      connections: connections ?? null,
      featured: featuredList.length > 0 ? featuredList : undefined,
      endorsements: endorsementsList.length > 0 ? endorsementsList : undefined,
      activity: activityList.length > 0 ? activityList : undefined,
      recommendations: recommendationsList.length > 0 ? recommendationsList : undefined,
      media: mediaList.length > 0 ? mediaList : undefined,
    };

    await browser.close();
    return result;

  } catch (err) {
    console.error("SCRAPER ERROR", err);
    await browser.close();
    return {
      bannerUrl: null,
      profilePhoto: null,
      photoResolution: null,
      connections: null,
      featured: [],
      endorsements: [],
      media: [],
      activity: [],
      recommendations: [],
    };
  }
}
