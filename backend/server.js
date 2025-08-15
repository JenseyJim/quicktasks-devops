import express from "express";
import cors from "cors";
import { getTasks, addTask, toggleTask } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/tasks", (req, res) => {
  res.json(getTasks());
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Título requerido" });
  const newTask = addTask(title);
  res.status(201).json(newTask);
});

app.patch("/tasks/:id/toggle", (req, res) => {
  const id = parseInt(req.params.id);
  const updated = toggleTask(id);
  if (!updated) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json(updated);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor backend corriendo en puerto ${PORT}`));
