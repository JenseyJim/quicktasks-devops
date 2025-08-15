import express from "express";
import morgan from "morgan";
import promClient from "prom-client";
import cors from "cors";
import dotenv from "dotenv";
import { initDb, listTasks, createTask, toggleDone, removeTask } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

app.get("/", (req, res) =>
  res.send("QuickTasks API up. Visita /health, /metrics o /api/tasks")
);

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const ALLOWED = ["Alta", "Media", "Baja"];

app.get("/api/tasks", async (req, res) => {
  try {
    res.json(await listTasks());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db_error" });
  }
});

app.post("/api/tasks", async (req, res) => {
  const { title, priority, due } = req.body || {};
  if (!title || !priority) {
    return res.status(400).json({ error: "title y priority son requeridos" });
  }
  if (!ALLOWED.includes(priority)) {
    return res.status(400).json({ error: "priority invalida" });
  }
  try {
    const row = await createTask({ title, priority, due });
    res.status(201).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db_error" });
  }
});

app.patch("/api/tasks/:id/done", async (req, res) => {
  try {
    const row = await toggleDone(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "id invalido" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const r = await removeTask(req.params.id);
    if (!r.deleted) return res.status(404).json({ error: "not_found" });
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "id invalido" });
  }
});

const PORT = process.env.PORT || 3000;
await initDb(); // Top-level await soportado en Node 20 con "type":"module"
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
