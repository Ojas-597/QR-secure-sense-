const express = require("express");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

// data paths
const dataDir = path.join(__dirname, "data");
const scansFile = path.join(dataDir, "scans.json");
const surveysFile = path.join(dataDir, "surveys.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(scansFile)) fs.writeFileSync(scansFile, JSON.stringify([]));
if (!fs.existsSync(surveysFile)) fs.writeFileSync(surveysFile, JSON.stringify([]));

// home, pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/fake-malware", (req, res) => res.sendFile(path.join(__dirname, "public", "malware.html")));

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/phishing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "phishing.html"));
});

app.get("/quiz", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "quiz.html"));
});

// generate QR (returns dataURL)
app.post("/generate-qr", async (req, res) => {
  try {
    const { text } = req.body;
    const qr = await QRCode.toDataURL(text || "");
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: "QR Code generation failed" });
  }
});

// log fake scan (already used by malware page)
app.post("/log-scan", (req, res) => {
  try {
    const scans = JSON.parse(fs.readFileSync(scansFile));
    const fakeRisk = Math.floor(Math.random() * 100) + 1;
    scans.push({ time: new Date().toISOString(), risk: fakeRisk });
    fs.writeFileSync(scansFile, JSON.stringify(scans, null, 2));
    res.json({ status: "scan logged", risk: fakeRisk });
  } catch (err) {
    res.status(500).json({ error: "Logging failed" });
  }
});

// survey submission (simple, anonymized)
app.post("/survey", (req, res) => {
  try {
    const { understood, willChangeBehavior, comments } = req.body || {};
    const surveys = JSON.parse(fs.readFileSync(surveysFile));
    surveys.push({
      time: new Date().toISOString(),
      understood: !!understood,
      willChangeBehavior: !!willChangeBehavior,
      comments: comments ? String(comments).slice(0, 500) : ""
    });
    fs.writeFileSync(surveysFile, JSON.stringify(surveys, null, 2));
    res.json({ status: "survey saved" });
  } catch (err) {
    res.status(500).json({ error: "Survey save failed" });
  }
});

// stats API — counts, average risk, last N
app.get("/api/stats", (req, res) => {
  try {
    const scans = JSON.parse(fs.readFileSync(scansFile));
    const surveys = JSON.parse(fs.readFileSync(surveysFile));
    const count = scans.length;
    const avgRisk = count ? (scans.reduce((s, x) => s + (x.risk||0), 0) / count) : 0;
    res.json({
      scansCount: count,
      avgRisk: Math.round(avgRisk*100)/100,
      recentScans: scans.slice(-20),
      surveysCount: surveys.length
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// api to fetch scan array (for chart)
app.get("/api/scans", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(scansFile));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load scan data" });
  }
});

app.get("/api/surveys", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(surveysFile));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load surveys" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

