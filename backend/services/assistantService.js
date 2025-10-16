import { AssistantInterface } from "../interfaces/assistantInterface.js";

export class AssistantService extends AssistantInterface {
  async handleTask(task) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lower = task.toLowerCase();
    const type = lower.includes("summarize")
      ? "summarize"
      : lower.includes("analyze")
      ? "analyze"
      : lower.includes("update")
      ? "update"
      : "general";

    return {
      task,
      type,
      summary: `Simulated result for task "${task}".`,
      actionItems: [
        `1) Understand "${task}"`,
        `2) Produce short summary`,
        `3) (Simulated) suggested steps`,
      ],
      metadata: {
        processedAt: new Date().toISOString(),
        simulatedConfidence: `${Math.floor(Math.random() * 20) + 80}%`,
      },
    };
  }
}
