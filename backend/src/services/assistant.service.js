import { AssistantInterface } from '../interfaces/assistant.interface.js';

export class AssistantService extends AssistantInterface {
  constructor() {
    super();
    this.prefix = '[AI Assistant]:';
    this.processingDelay = 500;
  }

  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return false;
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return false;
    }

    if (trimmed.length > 2000) {
      return false;
    }

    return true;
  }

  async processMessage(message, sessionId = null) {
    if (!this.validateMessage(message)) {
      throw new Error('Invalid message: Message cannot be empty');
    }
    await this.simulateProcessing();

    const trimmedMessage = message.trim();

    let reply;
    let confidence = 0.95;

    if (this.isQuestion(trimmedMessage)) {
      reply = `${this.prefix} I understand you're asking about "${trimmedMessage}". Here's a simulated response with helpful information.`;
      confidence = 0.92;
    } else if (this.containsKeywords(trimmedMessage, ['help', 'assist', 'support'])) {
      reply = `${this.prefix} I'm here to help! You mentioned: "${trimmedMessage}". How can I assist you further?`;
      confidence = 0.9;
    } else if (trimmedMessage.length < 10) {
      reply = `${this.prefix} Your message "${trimmedMessage}" is quite brief. Could you provide more details?`;
      confidence = 0.75;
    } else {
      reply = `${this.prefix} Received your message: "${trimmedMessage}". Processing complete.`;
      confidence = 0.85;
    }
    if (sessionId) {
      reply += ` [Session: ${sessionId.slice(0, 8)}...]`;
    }

    return {
      reply,
      confidence,
      processedLength: trimmedMessage.length,
      rules: ['echo_with_prefix', 'empty_input_guardrail'],
    };
  }

  isQuestion(message) {
    const questionIndicators = ['?', 'what', 'why', 'how', 'when', 'where', 'who', 'which'];
    const lowerMessage = message.toLowerCase();
    return questionIndicators.some((indicator) => lowerMessage.includes(indicator));
  }

  containsKeywords(message, keywords) {
    const lowerMessage = message.toLowerCase();
    return keywords.some((keyword) => lowerMessage.includes(keyword.toLowerCase()));
  }

  async simulateProcessing() {
    return new Promise((resolve) => setTimeout(resolve, this.processingDelay));
  }
}

export const assistantService = new AssistantService();
