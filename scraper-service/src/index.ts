import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { scrapeLinkedInProfile as scrapeProfile } from "./services/scrapeService";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// HEALTHCHECK (Railway)
app.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// SCRAPE ENDPOINT
app.post("/scrape", async (req, res) => {
  try {
    const { url, cookie } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: "Missing URL" });
    }

    const result = await scrapeProfile(url);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error("Scrape error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// KEEP ALIVE → Railway'in container'ı durdurmaması için
setInterval(() => {
  console.log("⚡ keep-alive ping");
}, 25000); // 25 saniye

// SERVER START
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Scraper service running on port ${PORT}`);
});
