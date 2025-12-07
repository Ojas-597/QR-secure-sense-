const express = require("express");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());

// --------- Data File Setup ----------
const dataDir = path.join(__dirname, "data");
const logFile = path.join(dataDir, "scans.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, JSON.stringify([]));
}

// --------- Routes ----------

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fake malware simulation page
app.get("/fake-malware", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "malware.html"));
});

// Dashboard page
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Generate QR code
app.post("/generate-qr", async (req, res) => {
  try {
    const { text } = req.body;
    const qr = await QRCode.toDataURL(text);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: "QR Code generation failed" });
  }
});

// Log fake scan data
app.post("/log-scan", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(logFile));
    const fakeRisk = Math.floor(Math.random() * 100) + 1;

    data.push({
      time: new Date().toISOString(),
      risk: fakeRisk
    });

    fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
    res.json({ status: "scan logged" });
  } catch (err) {
    res.status(500).json({ error: "Logging failed" });
  }
});

// API for chart data
app.get("/api/scans", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(logFile));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load scan data" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

