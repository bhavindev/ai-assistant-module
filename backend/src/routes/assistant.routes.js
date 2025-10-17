import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { assistantService } from '../services/assistant.service.js';
import { storageRepository } from '../repositories/storage.repository.js';
import { validateRequest, validateQuery } from '../middleware/validation.middleware.js';
import { assistRequestSchema, logsQuerySchema } from '../schemas/validation.schemas.js';

const router = express.Router();

router.post('/assist', validateRequest(assistRequestSchema), async (req, res) => {
  try {
    const { message, sessionId } = req.validated;
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    const result = await assistantService.processMessage(message, sessionId);

    const response = {
      reply: result.reply,
      messageId,
      ts: timestamp,
    };

    const logEntry = {
      id: uuidv4(),
      message,
      reply: result.reply,
      sessionId: sessionId || null,
      messageId,
      timestamp,
      confidence: result.confidence,
      metadata: {
        processedLength: result.processedLength,
        rules: result.rules,
      },
    };

    await storageRepository.write(logEntry);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in POST /assist:', error);

    if (error.message.includes('Invalid message')) {
      return res.status(400).json({
        error: 'ValidationError',
        details: [{ path: ['message'], message: error.message }],
      });
    }

    res.status(500).json({
      error: 'InternalServerError',
      details: [{ path: [], message: 'An unexpected error occurred' }],
    });
  }
});

router.get('/logs', validateQuery(logsQuerySchema), async (req, res) => {
  try {
    const { limit = 50 } = req.validatedQuery;
    const logs = await storageRepository.list(limit);
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error in GET /logs:', error);
    res.status(500).json({
      error: 'InternalServerError',
      details: [{ path: [], message: 'Failed to retrieve logs' }],
    });
  }
});

router.delete('/logs', async (_req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        error: 'ForbiddenError',
        details: [{ path: [], message: 'Log deletion is not allowed in production' }],
      });
    }

    const result = await storageRepository.clear();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in DELETE /logs:', error);
    res.status(500).json({
      error: 'InternalServerError',
      details: [{ path: [], message: 'Failed to clear logs' }],
    });
  }
});

router.get('/health', async (_req, res) => {
  try {
    const storageInfo = await storageRepository.getInfo();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      storage: storageInfo,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

export default router;
