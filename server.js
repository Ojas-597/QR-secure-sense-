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

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", basicAuth({ users:{admin:"admin"}, challenge:true }));

const scanFile = path.join(__dirname,"data","scans.json");
fs.ensureFileSync(scanFile);

app.get("/", (req,res)=> res.sendFile(path.join(__dirname,"public","index.html")));

app.get("/scan/:id",(req,res)=>{
  const scanId=req.params.id;
  res.sendFile(path.join(__dirname,"public","scan.html"));
  const logs=JSON.parse(fs.readFileSync(scanFile));
  logs.push({ id:nanoid(6), scan:scanId, time:new Date().toISOString() });
  fs.writeFileSync(scanFile, JSON.stringify(logs,null,2));
});

app.get("/admin/dashboard",(req,res)=>{
  res.sendFile(path.join(__dirname,"public","admin","dashboard.html"));
});

app.get("/api/logs",(req,res)=>{
  const logs=JSON.parse(fs.readFileSync(scanFile));
  res.json(logs);
});

app.post("/api/quiz/submit",(req,res)=>{
  const correct=["B","C","A"];
  let score=0;
  req.body.answers.forEach((a,i)=>{ if(a===correct[i]) score++; });
  res.json({score});
});

app.listen(PORT,()=>console.log("Updated QR Secure Sense running on http://localhost:"+PORT));
