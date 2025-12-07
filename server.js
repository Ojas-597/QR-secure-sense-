import express from "express";
import path from "path";
import fs from "fs-extra";
import basicAuth from "express-basic-auth";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Admin protection
app.use(
  "/admin",
  basicAuth({
    users: { admin: "secure123" },
    challenge: true
  })
);

// Log directory
const scanFile = path.join(__dirname, "data", "scans.json");
fs.ensureFileSync(scanFile);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fake QR scan route
app.get("/scan/:id", (req, res) => {
  const scanId = req.params.id;
  res.sendFile(path.join(__dirname, "public", "scan.html"));

  // Log scan
  const logs = JSON.parse(fs.readFileSync(scanFile));
  logs.push({
    id: nanoid(6),
    scan: scanId,
    time: new Date().toISOString()
  });
  fs.writeFileSync(scanFile, JSON.stringify(logs, null, 2));
});

// Admin dashboard
app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "dashboard.html"));
});

// API to fetch logs
app.get("/api/logs", (req, res) => {
  const logs = JSON.parse(fs.readFileSync(scanFile));
  res.json(logs);
});

// Quiz API
app.post("/api/quiz/submit", (req, res) => {
  const { answers } = req.body;

  const correct = ["B", "C", "A", "D", "B"];
  let score = 0;

  answers.forEach((ans, i) => {
    if (ans === correct[i]) score++;
  });

  res.json({ score });
});

// Start server
app.listen(PORT, () => {
  console.log(`QR Secure Sense running at http://localhost:${PORT}`);
});
