// Placeholder sin backend: luego conectamos a /api/tasks
const $ = (sel) => document.querySelector(sel);
const list = $("#tasks");
const form = $("#task-form");
const title = $("#title");
const priority = $("#priority");
const due = $("#due");

let tasks = [];

function render() {
  list.innerHTML = tasks.map(t => `
    <li class="task">
      <span class="${t.done ? "done" : ""}">${escapeHtml(t.title)}</span>
      <span class="badge">${t.priority}</span>
      <time>${t.due || "-"}</time>
      <button data-complete data-id="${t.id}">${t.done ? "Deshacer" : "Completar"}</button>
    </li>
  `).join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const ttl = (title.value || "").trim();
  if (!ttl) return alert("El título es obligatorio");
  const item = {
    id: Date.now(),
    title: ttl,
    priority: priority.value,
    due: due.value,
    done: false
  };
  tasks.unshift(item);
  render();
  form.reset();
  title.focus();
});

list.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-complete]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.done = !t.done;
    render();
  }
});

// Utilidad mínima contra XSS en este placeholder
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Render inicial (lista vacía)
render();
