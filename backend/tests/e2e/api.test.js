import request from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import assistantRoutes from '../../src/routes/assistant.routes.js';
import { storageRepository } from '../../src/repositories/storage.repository.js';

describe('API E2E Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/', assistantRoutes);
    app.use((err, req, res, _next) => {
      res.status(500).json({
        error: 'InternalServerError',
        details: [{ path: [], message: err.message }],
      });
    });
  });

  beforeEach(async () => {
    await storageRepository.clear();
  });

  describe('POST /assist', () => {
    test('should process valid message and return structured response', async () => {
      const validRequest = {
        message: 'Hello, can you help me with a task?',
      };

      const response = await request(app)
        .post('/assist')
        .send(validRequest)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('reply');
      expect(response.body).toHaveProperty('messageId');
      expect(response.body).toHaveProperty('ts');
      expect(response.body.reply).toContain('[AI Assistant]:');
      expect(response.body.reply).toContain('help');

      expect(response.body.messageId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
      expect(new Date(response.body.ts).toISOString()).toBe(response.body.ts);
    });

    test('should include sessionId in processing when provided', async () => {
      const sessionId = uuidv4();
      const request_data = {
        message: 'Process this with session',
        sessionId,
      };

      const response = await request(app).post('/assist').send(request_data).expect(200);

      expect(response.body.reply).toContain(`[Session: ${sessionId.slice(0, 8)}...]`);
    });

    test('should return 400 for empty message', async () => {
      const invalidRequest = {
        message: '',
      };

      const response = await request(app).post('/assist').send(invalidRequest).expect(400);

      expect(response.body.error).toBe('ValidationError');
      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.details[0]).toHaveProperty('path');
      expect(response.body.details[0]).toHaveProperty('message');
      expect(response.body.details[0].message).toContain('empty');
    });

    test('should return 400 for message exceeding 2000 characters', async () => {
      const invalidRequest = {
        message: 'a'.repeat(2001),
      };

      const response = await request(app).post('/assist').send(invalidRequest).expect(400);

      expect(response.body.error).toBe('ValidationError');
      expect(response.body.details[0].message).toContain('2000 characters or less');
    });

    test('should return 400 for invalid sessionId format', async () => {
      const invalidRequest = {
        message: 'Valid message',
        sessionId: 'not-a-valid-uuid',
      };

      const response = await request(app).post('/assist').send(invalidRequest).expect(400);

      expect(response.body.error).toBe('ValidationError');
      expect(response.body.details).toBeInstanceOf(Array);
    });

    test('should return 400 for missing message field', async () => {
      const response = await request(app).post('/assist').send({}).expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    test('should handle whitespace-only messages as empty', async () => {
      const invalidRequest = {
        message: '   ',
      };

      const response = await request(app).post('/assist').send(invalidRequest).expect(400);

      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('GET /logs', () => {
    test('should return empty array when no logs exist', async () => {
      const response = await request(app).get('/logs').expect(200).expect('Content-Type', /json/);

      expect(response.body).toEqual([]);
    });

    test('should return logs with default limit', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/assist')
          .send({ message: `Test message ${i + 1}` });
      }

      const response = await request(app).get('/logs').expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(5);

      expect(response.body[0].message).toBe('Test message 5');
      expect(response.body[4].message).toBe('Test message 1');
    });

    test('should respect limit query parameter', async () => {
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/assist')
          .send({ message: `Message ${i + 1}` });
      }

      const response = await request(app).get('/logs?limit=3').expect(200);

      expect(response.body.length).toBe(3);
      expect(response.body[0].message).toBe('Message 10');
      expect(response.body[1].message).toBe('Message 9');
      expect(response.body[2].message).toBe('Message 8');
    }, 10000);

    test('should return 400 for invalid limit parameter', async () => {
      const response = await request(app).get('/logs?limit=invalid').expect(400);

      expect(response.body.error).toBe('ValidationError');
    });

    test('should return 400 for limit exceeding maximum', async () => {
      const response = await request(app).get('/logs?limit=101').expect(400);

      expect(response.body.error).toBe('ValidationError');
      expect(response.body.details[0].message).toContain('100');
    });
  });

  describe('DELETE /logs', () => {
    test('should clear all logs successfully', async () => {
      await request(app).post('/assist').send({ message: 'Test message' });

      let response = await request(app).get('/logs');
      expect(response.body.length).toBeGreaterThan(0);

      response = await request(app).delete('/logs').expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('cleared');
      response = await request(app).get('/logs');
      expect(response.body).toEqual([]);
    });

    test('should return 403 in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app).delete('/logs').expect(403);

      expect(response.body.error).toBe('ForbiddenError');
      expect(response.body.details[0].message).toContain('not allowed in production');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health').expect(200).expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('storage');
      expect(response.body).toHaveProperty('environment');
      expect(response.body.storage).toHaveProperty('entryCount');
      expect(response.body.storage).toHaveProperty('filePath');
    });
  });
});
