// api/src/db.js
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.DB_NAME || "quicktasks";

let client;
let tasksCol;

export async function initDb() {
  const maxAttempts = 20;
  const delayMs = 1500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      client = new MongoClient(uri, { ignoreUndefined: true });
      await client.connect();
      const db = client.db(dbName);
      tasksCol = db.collection("tasks");
      await tasksCol.createIndex({ created_at: -1 });
      console.log("[db] Conectado a MongoDB");
      return;
    } catch (err) {
      console.warn(`[db] Intento ${attempt}/${maxAttempts} falló: ${err.message}`);
      if (attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

function serialize(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest, done: !!rest.done };
}

export async function listTasks() {
  const rows = await tasksCol.find({}).sort({ created_at: -1 }).toArray();
  return rows.map(serialize);
}

export async function createTask({ title, priority, due }) {
  const doc = {
    title: String(title).trim(),
    priority,
    due: due || null,
    done: false,
    created_at: new Date(),
  };
  const { insertedId } = await tasksCol.insertOne(doc);
  return serialize({ _id: insertedId, ...doc });
}

export async function toggleDone(id) {
  const _id = new ObjectId(String(id));
  const curr = await tasksCol.findOne({ _id });
  if (!curr) return null;
  const next = !curr.done;
  await tasksCol.updateOne({ _id }, { $set: { done: next } });
  const updated = await tasksCol.findOne({ _id });
  return serialize(updated);
}

export async function removeTask(id) {
  const _id = new ObjectId(String(id));
  const r = await tasksCol.deleteOne({ _id });
  return { deleted: r.deletedCount > 0 };
}
