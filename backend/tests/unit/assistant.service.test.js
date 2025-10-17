import { AssistantService } from '../../src/services/assistant.service.js';

describe('AssistantService', () => {
  let service;

  beforeEach(() => {
    service = new AssistantService();
  });

  describe('validateMessage', () => {
    test('should return true for valid messages', () => {
      expect(service.validateMessage('Hello world')).toBe(true);
      expect(service.validateMessage('Test message with multiple words')).toBe(true);
      expect(service.validateMessage('a')).toBe(true);
    });

    test('should return false for empty or invalid messages', () => {
      expect(service.validateMessage('')).toBe(false);
      expect(service.validateMessage('   ')).toBe(false);
      expect(service.validateMessage(null)).toBe(false);
      expect(service.validateMessage(undefined)).toBe(false);
      expect(service.validateMessage(123)).toBe(false);
    });

    test('should return false for messages exceeding 2000 characters', () => {
      const longMessage = 'a'.repeat(2001);
      expect(service.validateMessage(longMessage)).toBe(false);
    });
  });

  describe('processMessage', () => {
    test('should process valid message and return reply with prefix', async () => {
      const result = await service.processMessage('Hello AI');
      expect(result.reply).toContain('[AI Assistant]:');
      expect(result.reply).toContain('Hello AI');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processedLength).toBe(8);
    });

    test('should throw error for empty message (guardrail)', async () => {
      await expect(service.processMessage('')).rejects.toThrow(
        'Invalid message: Message cannot be empty'
      );
      await expect(service.processMessage('   ')).rejects.toThrow(
        'Invalid message: Message cannot be empty'
      );
    });

    test('should handle questions with appropriate response', async () => {
      const result = await service.processMessage('What is the weather?');
      expect(result.reply).toContain("I understand you're asking about");
      expect(result.confidence).toBe(0.92);
    });

    test('should handle help keywords appropriately', async () => {
      const result = await service.processMessage('I need help with something');
      expect(result.reply).toContain("I'm here to help!");
      expect(result.confidence).toBe(0.9);
    });

    test('should ask for clarification on very short messages', async () => {
      const result = await service.processMessage('Hi');
      expect(result.reply).toContain('quite brief');
      expect(result.reply).toContain('Could you provide more details?');
      expect(result.confidence).toBe(0.75);
    });

    test('should include session ID in response when provided', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440000';
      const result = await service.processMessage('Test message', sessionId);
      expect(result.reply).toContain('[Session: 550e8400...]');
    });

    test('should include rules in response', async () => {
      const result = await service.processMessage('Test message');
      expect(result.rules).toContain('echo_with_prefix');
      expect(result.rules).toContain('empty_input_guardrail');
    });
  });

  describe('helper methods', () => {
    test('isQuestion should correctly identify questions', () => {
      expect(service.isQuestion('What is this?')).toBe(true);
      expect(service.isQuestion('How does it work')).toBe(true);
      expect(service.isQuestion('Tell me about it')).toBe(false);
      expect(service.isQuestion('This is a statement')).toBe(false);
    });

    test('containsKeywords should find keywords case-insensitively', () => {
      expect(service.containsKeywords('I need HELP', ['help'])).toBe(true);
      expect(service.containsKeywords('Can you assist me?', ['assist'])).toBe(true);
      expect(service.containsKeywords('Hello world', ['help', 'assist'])).toBe(false);
    });
  });
});
