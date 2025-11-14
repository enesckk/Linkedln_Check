import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import scrapeRoute from "./routes/scrapeRoute";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// API Key middleware
app.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.SCRAPER_API_KEY) {
    return res.status(401).json({ error: "Unauthorized (invalid API key)" });
  }
  next();
});

app.use("/scrape", scrapeRoute);

app.listen(PORT, () => {
  console.log(`Scraper service running on port ${PORT}`);
});
