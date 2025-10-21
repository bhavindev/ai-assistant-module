import { z } from 'zod';

export const assistRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be 2000 characters or less')
    .trim(),
  sessionId: z.string().uuid().optional(),
});

export const logsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
});

export const assistResponseSchema = z.object({
  reply: z.string(),
  messageId: z.string().uuid(),
  ts: z.string().datetime(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z
    .array(
      z.object({
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string(),
      })
    )
    .optional(),
});

export const logEntrySchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  reply: z.string(),
  sessionId: z.string().uuid().optional(),
  messageId: z.string().uuid(),
  timestamp: z.string().datetime(),
});
