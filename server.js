const express = require("express");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();
const PORT = 3000;

// Allow mobile + other devices to access
const HOST = "0.0.0.0";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- Helpers to get local IP ----
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let name of Object.keys(interfaces)) {
    for (let net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

const localIP = getLocalIP();

// ---- Data setup ----
const dataDir = path.join(__dirname, "data");
const scansFile = path.join(dataDir, "scans.json");
const surveysFile = path.join(dataDir, "surveys.json");
const quizFile = path.join(dataDir, "quiz.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(scansFile)) fs.writeFileSync(scansFile, "[]");
if (!fs.existsSync(surveysFile)) fs.writeFileSync(surveysFile, "[]");
if (!fs.existsSync(quizFile)) fs.writeFileSync(quizFile, "[]");

// ---- Pages ----
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/fake-malware", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "malware.html"));
});

app.get("/phishing", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "phishing.html"));
});

app.get("/quiz", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "quiz.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "TeacherDashboard.html"));
});

// ---- QR Generator ----
app.post("/generate-qr", async (req, res) => {
  try {
    const { text } = req.body;
    const qr = await QRCode.toDataURL(text);
    res.json({ qr });
  } catch (err) {
    res.status(500).json({ error: "QR failed" });
  }
});

// ---- Scan Logging ----
app.post("/log-scan", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(scansFile));
    const fakeRisk = Math.floor(Math.random() * 100) + 1;

    data.push({
      time: new Date().toISOString(),
      risk: fakeRisk
    });

    fs.writeFileSync(scansFile, JSON.stringify(data, null, 2));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "log failed" });
  }
});

// ---- API ----
app.get("/api/stats", (req, res) => {
  const scans = JSON.parse(fs.readFileSync(scansFile));
  const surveys = JSON.parse(fs.readFileSync(surveysFile));

  res.json({
    scansCount: scans.length,
    surveysCount: surveys.length,
    recentScans: scans.slice(-10)
  });
});

// ---- Start Server ----
app.listen(PORT, HOST, () => {
  console.log("✅ Server running:");
  console.log(`➡ Local: http://localhost:${PORT}`);
  console.log(`➡ Mobile: http://${localIP}:${PORT}`);
});
