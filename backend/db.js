// Datos en memoria (pueden migrarse a MongoDB o SQLite en producción)
let tasks = [
  { id: 1, title: "Revisar tareas pendientes", completed: false },
  { id: 2, title: "Enviar reporte semanal", completed: true }
];

export function getTasks() {
  return tasks;
}

export function addTask(title) {
  const newTask = { id: tasks.length + 1, title, completed: false };
  tasks.push(newTask);
  return newTask;
}

export function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  return task;
}
