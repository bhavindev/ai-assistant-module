import {
  assistRequestSchema,
  logsQuerySchema,
  assistResponseSchema,
  errorResponseSchema,
} from '../../src/schemas/validation.schemas.js';

describe('Validation Schemas', () => {
  describe('assistRequestSchema', () => {
    test('should validate correct request', () => {
      const validRequest = {
        message: 'Hello AI assistant',
      };
      expect(() => assistRequestSchema.parse(validRequest)).not.toThrow();
    });

    test('should validate request with sessionId', () => {
      const validRequest = {
        message: 'Hello',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = assistRequestSchema.parse(validRequest);
      expect(result.sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    test('should reject empty message', () => {
      const invalidRequest = { message: '' };
      expect(() => assistRequestSchema.parse(invalidRequest)).toThrow();
    });

    test('should reject message over 2000 characters', () => {
      const invalidRequest = { message: 'a'.repeat(2001) };
      expect(() => assistRequestSchema.parse(invalidRequest)).toThrow();
    });

    test('should trim whitespace from message', () => {
      const request = { message: '  hello world  ' };
      const result = assistRequestSchema.parse(request);
      expect(result.message).toBe('hello world');
    });

    test('should reject invalid sessionId format', () => {
      const invalidRequest = {
        message: 'Hello',
        sessionId: 'not-a-uuid',
      };
      expect(() => assistRequestSchema.parse(invalidRequest)).toThrow();
    });

    test('should reject non-string message', () => {
      const invalidRequests = [
        { message: 123 },
        { message: null },
        { message: undefined },
        { message: {} },
        { message: [] },
      ];

      for (const request of invalidRequests) {
        expect(() => assistRequestSchema.parse(request)).toThrow();
      }
    });
  });

  describe('logsQuerySchema', () => {
    test('should validate query with valid limit', () => {
      const query = { limit: '25' };
      const result = logsQuerySchema.parse(query);
      expect(result.limit).toBe(25);
    });

    test('should use default limit when not provided', () => {
      const result = logsQuerySchema.parse({});
      expect(result.limit).toBeUndefined();
    });

    test('should coerce string to number', () => {
      const query = { limit: '10' };
      const result = logsQuerySchema.parse(query);
      expect(result.limit).toBe(10);
      expect(typeof result.limit).toBe('number');
    });

    test('should reject limit over 100', () => {
      const query = { limit: '101' };
      expect(() => logsQuerySchema.parse(query)).toThrow();
    });

    test('should reject limit less than 1', () => {
      const queries = [{ limit: '0' }, { limit: '-1' }];
      for (const query of queries) {
        expect(() => logsQuerySchema.parse(query)).toThrow();
      }
    });

    test('should reject non-integer limits', () => {
      const query = { limit: '10.5' };
      expect(() => logsQuerySchema.parse(query)).toThrow();
    });
  });

  describe('assistResponseSchema', () => {
    test('should validate correct response format', () => {
      const response = {
        reply: 'This is the AI response',
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        ts: '2024-01-15T10:30:00.000Z',
      };
      expect(() => assistResponseSchema.parse(response)).not.toThrow();
    });

    test('should reject invalid UUID in messageId', () => {
      const response = {
        reply: 'Response',
        messageId: 'invalid-id',
        ts: '2024-01-15T10:30:00.000Z',
      };
      expect(() => assistResponseSchema.parse(response)).toThrow();
    });

    test('should reject invalid timestamp format', () => {
      const response = {
        reply: 'Response',
        messageId: '550e8400-e29b-41d4-a716-446655440000',
        ts: '2024-01-15',
      };
      expect(() => assistResponseSchema.parse(response)).toThrow();
    });
  });

  describe('errorResponseSchema', () => {
    test('should validate error with details', () => {
      const error = {
        error: 'ValidationError',
        details: [
          { path: ['message'], message: 'Message is required' },
          { path: ['sessionId', 0], message: 'Invalid UUID' },
        ],
      };
      expect(() => errorResponseSchema.parse(error)).not.toThrow();
    });

    test('should validate error without details', () => {
      const error = { error: 'InternalServerError' };
      expect(() => errorResponseSchema.parse(error)).not.toThrow();
    });
  });
});
