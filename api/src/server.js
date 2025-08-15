import express from "express";
import morgan from "morgan";
import promClient from "prom-client";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

// Métricas (Prometheus)
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Métricas
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Placeholder de tareas (luego conectamos SQLite)
app.get("/api/tasks", (req, res) => {
  res.json([{ id: 1, title: "(demo) Comprar café", priority: "Alta", due: "2025-08-31", done: false }]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API lista en http://localhost:${PORT}`));
