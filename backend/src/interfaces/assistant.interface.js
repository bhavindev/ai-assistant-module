export class AssistantInterface {
  async processMessage(_message, _sessionId) {
    throw new Error('processMessage() must be implemented by subclass');
  }

  validateMessage(_message) {
    throw new Error('validateMessage() must be implemented by subclass');
  }
}
