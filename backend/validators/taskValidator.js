export function validateTaskRequest(req, res, next) {
  const { task } = req.body;
  if (!task || typeof task !== "string" || task.trim().length === 0) {
    return res.status(400).json({ error: "Invalid task: must be a non-empty string." });
  }
  next();
}