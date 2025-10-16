import { AssistantService } from "../services/assistantService.js";

describe("AssistantService", () => {
  const service = new AssistantService();

  test("handleTask returns structured response", async () => {
    const res = await service.handleTask("summarize calls");
    expect(res).toHaveProperty("summary");
    expect(typeof res.summary).toBe("string");
  });

  test("detects analyze type", async () => {
    const res = await service.handleTask("analyze sales data");
    expect(res.type).toBe("analyze");
  });

  test("handles unknown type gracefully", async () => {
    const res = await service.handleTask("plan event");
    expect(res.type).toBe("general");
  });
});
