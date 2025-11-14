export async function extractSelectors(page: any) {
  const bannerUrl = await page.evaluate(() => {
    const el: any = document.querySelector("img.pv-profile-sticky-header__image");
    return (el as any)?.src || null;
  });

  const profilePhoto = await page.evaluate(() => {
    const el: any = document.querySelector(".pv-top-card-profile-picture__image");
    return (el as any)?.src || null;
  });

  const connections = await page.evaluate(() => {
    const el: any = document.querySelector(".pv-top-card--list-bullet li span");
    if (!el) return null;
    const text = (el as any).innerText;
    const num = parseInt(text);
    return isNaN(num) ? null : num;
  });

  // TODO: featured, endorsements, media, recommendations, activity selectors iyileştirilecek

  return {
    bannerUrl,
    profilePhoto,
    connections,
    featured: [],
    endorsements: [],
    media: [],
    recommendations: [],
    activity: []
  };
}
