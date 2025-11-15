import { chromium } from "playwright";

export async function scrapeLinkedInProfile(url: string) {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage(); // ✅ En önemli satır — gerçek Page objesi

  try {
    await page.goto(url, { waitUntil: "networkidle" });

    // Profile photo
    const profilePhoto = await page
      .locator("img.pv-top-card-profile-picture__image")
      .first()
      .getAttribute("src");

    // Banner
    const bannerPhoto = await page
      .locator("img.full-width.evi-image")
      .first()
      .getAttribute("src");

    // Name
    const fullName = await page
      .locator("h1.text-heading-xlarge")
      .first()
      .innerText();

    // Headline
    const headline = await page
      .locator(".text-body-medium.break-words")
      .first()
      .innerText();

    await browser.close();

    return {
      profilePhoto,
      bannerPhoto,
      fullName,
      headline
    };

  } catch (err) {
    await browser.close();
    throw err;
  }
}
