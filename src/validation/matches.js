 import { z } from 'zod';

// Query schema for listing matches
export const listMatchesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

// Constant for match status values
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Params schema for matchId
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Helper to validate ISO-like date strings
const isIsoDateString = (val) => {
  if (typeof val !== 'string') return false;
  // Basic check: must parse and contain a "T" (ISO date-time)
  const parsed = Date.parse(val);
  return !Number.isNaN(parsed) && /^\d{4}-\d{2}-\d{2}T/.test(val);
};

// Schema to create a match
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'sport is required'),
    homeTeam: z.string().min(1, 'homeTeam is required'),
    awayTeam: z.string().min(1, 'awayTeam is required'),
    startTime: z.string().refine(isIsoDateString, {
      message: 'startTime must be a valid ISO date string',
    }),
    endTime: z.string().refine(isIsoDateString, {
      message: 'endTime must be a valid ISO date string',
    }),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startTime);
    const end = Date.parse(data.endTime);
    if (Number.isNaN(start)) {
      ctx.addIssue({ path: ['startTime'], code: z.ZodIssueCode.custom, message: 'Invalid startTime' });
    }
    if (Number.isNaN(end)) {
      ctx.addIssue({ path: ['endTime'], code: z.ZodIssueCode.custom, message: 'Invalid endTime' });
    }
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      ctx.addIssue({ path: ['endTime'], code: z.ZodIssueCode.custom, message: 'endTime must be after startTime' });
    }
  });

// Schema to update scores
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});
