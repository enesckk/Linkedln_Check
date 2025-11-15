import { chromium } from "playwright";

export async function scrapeLinkedInProfile(url: string) {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage(); // 🔥 En kritik satır (gerçek Page objesi)

  try {
    await page.goto(url, { waitUntil: "networkidle" });

    // ⭐️ Profile Photo
    const profilePhoto = await page
      .locator("img.pv-top-card-profile-picture__image")
      .first()
      .getAttribute("src");

    // ⭐️ Banner
    const bannerPhoto = await page
      .locator("img.full-width.evi-image")
      .first()
      .getAttribute("src");

    // ⭐️ Full Name
    const fullName = await page
      .locator("h1.text-heading-xlarge")
      .first()
      .innerText()
      .catch(() => null);

    // ⭐️ Headline
    const headline = await page
      .locator("div.text-body-medium.break-words")
      .first()
      .innerText()
      .catch(() => null);

    // ⭐️ Location
    const location = await page
      .locator("span.text-body-small.inline.t-black--light.break-words")
      .first()
      .innerText()
      .catch(() => null);

    // ⭐️ Current Position
    const position = await page
      .locator("div.pv-text-details__right-panel div.t-14.t-normal")
      .first()
      .innerText()
      .catch(() => null);

    return {
      profilePhoto,
      bannerPhoto,
      fullName,
      headline,
      location,
      position,
    };

  } catch (err) {
    console.error("SCRAPER ERROR:", err);
    return null;
  } finally {
    await browser.close();
  }
}
