import express from "express";
import fs from "fs-extra";
import { handleTask } from "../services/aiService.js";

const router = express.Router();
const LOG_FILE = "./data/logs.json";

fs.ensureFileSync(LOG_FILE);
fs.readJson(LOG_FILE).catch(() => fs.writeJson(LOG_FILE, []));

router.post("/", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: "Task is required" });

    const aiResponse = await handleTask(task);

    const existingLogs = (await fs.readJson(LOG_FILE).catch(() => [])) || [];
    const logEntry = {
      id: Date.now(),
      task,
      response: aiResponse,
      timestamp: new Date().toISOString()
    };
    existingLogs.push(logEntry);
    await fs.writeJson(LOG_FILE, existingLogs, { spaces: 2 });

    return res.json(aiResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/logs", async (_req, res) => {
  const logs = (await fs.readJson(LOG_FILE).catch(() => [])) || [];
  res.json(logs);
});

export default router;
