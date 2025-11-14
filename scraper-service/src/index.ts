import express from "express";
import { scrapeLinkedInProfile as scrapeProfile } from "./services/scrapeService";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/scrape", async (req, res) => {
  try {
    const data = await scrapeProfile(req.body.url);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Scraper service running on port ${PORT}`));
