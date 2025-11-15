import { chromium } from "playwright";

export async function scrapeLinkedInProfile(url: string) {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });

  // ---------------------------
  // 1️⃣ LinkedIn login cookie ekleniyor
  // ---------------------------
  const rawCookie = process.env.LINKEDIN_COOKIE;

  if (!rawCookie) {
    console.error("❌ LINKEDIN_COOKIE missing in Railway env");
    return null;
  }

  const li_at = rawCookie.replace("li_at=", "").trim();

  await context.addCookies([
    {
      name: "li_at",
      value: li_at,
      domain: ".linkedin.com",
      path: "/",
      httpOnly: true,
      secure: true,
    },
  ]);

  const page = await context.newPage();

  try {
    // 2️⃣ Profil sayfasına login cookie ile git
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    await page.waitForTimeout(3000);

    // 3️⃣ Selectorları bekle
    await page.waitForSelector("img.full-width.evi-image", { timeout: 15000 });

    // 📌 Profil resmi
    const profilePhoto = await page
      .locator("img.pv-top-card-profile-picture__image")
      .first()
      .getAttribute("src")
      .catch(() => null);

    // 📌 Banner
    const banner = await page
      .locator("img.full-width.evi-image")
      .first()
      .getAttribute("src")
      .catch(() => null);

    // 📌 İsim
    const fullName = await page
      .locator("h1.text-heading-xlarge")
      .first()
      .innerText()
      .catch(() => null);

    return { profilePhoto, banner, fullName };

  } catch (err) {
    console.error("SCRAPER ERROR:", err);
    return null;
  } finally {
    await browser.close();
  }
}
