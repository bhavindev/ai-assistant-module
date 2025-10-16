export class AssistantInterface {
  async handleTask(task) {
    throw new Error("handleTask() must be implemented");
  }
}