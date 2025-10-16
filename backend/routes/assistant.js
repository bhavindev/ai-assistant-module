import express from "express";
import { AssistantService } from "../services/assistantService.js";
import { logRepository } from "../repositories/logRepository.js";
import { validateTaskRequest } from "../validators/taskValidator.js";

const router = express.Router();
const assistant = new AssistantService();

router.post("/", validateTaskRequest, async (req, res) => {
  try {
    const { task } = req.body;
    const response = await assistant.handleTask(task);

    const logEntry = {
      id: Date.now(),
      task,
      response,
      timestamp: new Date().toISOString()
    };

    await logRepository.addLog(logEntry);
    res.json(response);
  } catch (err) {
    console.error("Error in /assistant:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/logs", async (_req, res) => {
  try {
    const logs = await logRepository.readAll();
    res.json(logs.reverse());
  } catch {
    res.status(500).json({ error: "Failed to load logs" });
  }
});

router.delete("/logs", async (_req, res) => {
  await logRepository.clearAll();
  res.json({ message: "Logs cleared" });
});

export default router;
