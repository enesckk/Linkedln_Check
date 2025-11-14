import { Request, Response } from "express";
import { scrapeLinkedInProfile } from "../services/scrapeService";
import { validateUrl } from "../utils/validateUrl";

export const scrapeController = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!validateUrl(url)) {
      return res.status(400).json({ error: "Invalid LinkedIn URL" });
    }

    const data = await scrapeLinkedInProfile(url);
    return res.json(data);

  } catch (err: any) {
    console.error("Scrape error:", err);
    return res.status(500).json({ error: "Scraping failed", details: err.message });
  }
};
