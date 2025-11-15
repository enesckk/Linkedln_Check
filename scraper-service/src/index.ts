import express from "express";
import scrapeRoute from "./routes/scrapeRoute";
import { errorHandler } from "./utils/errorHandler";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Routes
app.use("/", scrapeRoute);

// Health check endpoint (Railway için)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Scraper service running on port ${PORT}`);
});

export default app;
