import { Page } from "playwright";
import { SELECTORS } from "../utils/selectors";

export async function scrapeLinkedInProfile(page: Page) {
    await page.waitForSelector("body");

    const getAttr = async (selector: string, attr: string) =>
        await page.$eval(selector, (el, attrName) => el.getAttribute(attrName), attr).catch(() => null);

    const getText = async (selector: string) =>
        await page.$eval(selector, el => el.textContent?.trim()).catch(() => null);

    return {
        profilePhoto: await getAttr(SELECTORS.profilePhoto, "src"),
        bannerPhoto: await getAttr(SELECTORS.bannerPhoto, "src"),
        fullName: await getText(SELECTORS.fullName),
        headline: await getText(SELECTORS.headline),
        location: await getText(SELECTORS.location),
        websites: await page.$$eval(SELECTORS.websites, els =>
            els.map(e => e.textContent?.trim()).filter(Boolean)
        ).catch(() => []),
        featuredImages: await page.$$eval(SELECTORS.featured.image, els =>
            els.map(e => (e as HTMLImageElement).src)
        ).catch(() => [])
    };
}
