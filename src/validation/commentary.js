import { z } from 'zod';

export const listCommentarySchema = z.object({
  limit: z.coerce.number().positive().max(100).optional(),
});

export const createCommentarySchema = z.object({
  minute: z.number().int().nonnegative().optional(),
  sequence: z.number().int().nonnegative().optional(),
  period: z.string().optional(),
  eventType: z.string().optional(),
  actor: z.string().optional(),
  team: z.string().optional(),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});
