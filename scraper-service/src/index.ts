import express from "express";
import cors from "cors";
import scraper from "./scrape";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/scrape", scraper);

// PORT'u Railway'den al
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Scraper service running on port ${PORT}`);
});
