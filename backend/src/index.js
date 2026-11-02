// ShilpMandir backend — zero native deps, file-backed JSON store.
// Env: PORT, CORS_ORIGIN (comma-separated), DATA_DIR
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3001);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:8080").split(",").map(s => s.trim());

fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
app.use(cors({ origin: (o, cb) => cb(null, !o || ORIGINS.includes("*") || ORIGINS.includes(o)) }));
app.use(express.json({ limit: "256kb" }));

function store(name) {
  const file = path.join(DATA_DIR, name + ".json");
  const read = () => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return []; } };
  const write = (rows) => fs.writeFileSync(file, JSON.stringify(rows, null, 2));
  return {
    all: read,
    add(row) {
      const rows = read();
      row.id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)).toUpperCase();
      row.createdAt = new Date().toISOString();
      rows.push(row); write(rows); return row;
    }
  };
}
const contacts = store("contacts");
const quotes = store("quotes");

const PROJECTS = require("./projects");

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get("/api/projects", (req, res) => {
  const { style, stone } = req.query;
  let list = PROJECTS;
  if (style) list = list.filter(p => p.style === style);
  if (stone) list = list.filter(p => p.stone === stone);
  res.json({ projects: list });
});

app.post("/api/contact", (req, res) => {
  const { name, phone, message, place } = req.body || {};
  if (!name || String(name).trim().length < 2) return res.status(400).json({ error: "name required" });
  if (!phone || !/^[+\d][\d\s-]{6,16}$/.test(String(phone).trim())) return res.status(400).json({ error: "valid phone required" });
  const saved = contacts.add({ name: String(name).slice(0, 80), phone: String(phone).slice(0, 24), place: String(place || "").slice(0, 120), message: String(message || "").slice(0, 2000) });
  res.json({ ok: true, id: saved.id });
});

app.post("/api/quotes", (req, res) => {
  const { name, phone, estimate } = req.body || {};
  if (!estimate || typeof estimate !== "object") return res.status(400).json({ error: "estimate required" });
  if (!name || !phone) return res.status(400).json({ error: "name and phone required" });
  const saved = quotes.add({ name: String(name).slice(0, 80), phone: String(phone).slice(0, 24), estimate });
  res.json({ ok: true, id: saved.id, reference: "QT-" + saved.id });
});

app.get("/api/leads", (req, res) => {
  // Simple local admin view (protect via reverse-proxy / VPN in production).
  res.json({ contacts: contacts.all().slice(-100).reverse(), quotes: quotes.all().slice(-100).reverse() });
});

app.listen(PORT, () => console.log("[api] listening on :" + PORT + " data=" + DATA_DIR));
