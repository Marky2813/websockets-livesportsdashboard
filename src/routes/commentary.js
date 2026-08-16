import { Router } from "express";
import { matchIdParamSchema } from "../validation/matches.js";
import { createCommentarySchema, listCommentarySchema } from "../validation/commentary.js";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";

export const commentaryRouter = Router({mergeParams:true});

const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req, res) => {
  const paramsParsed = matchIdParamSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    return res.status(400).json({ error: 'Invalid Params', details: JSON.stringify(paramsParsed.error) });
  }

  const queryParsed = listCommentarySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({ error: 'Invalid Query', details: JSON.stringify(queryParsed.error) });
  }

  try {
    const p = paramsParsed.data;
    const q = queryParsed.data;
    const limit = Math.min(q.limit ?? MAX_LIMIT, MAX_LIMIT);

    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, Number(p.id)))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    return res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch commentary', details: String(err) });
  }
})

commentaryRouter.post('/', async (req, res) => {
  console.log(req.params)
  const paramsParsed = matchIdParamSchema.safeParse(req.params);
  console.log(paramsParsed)
  if (!paramsParsed.success) {
    return res.status(400).json({ error: 'Invalid Params', details: JSON.stringify(paramsParsed.error) });
  }

  const bodyParsed = createCommentarySchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({ error: 'Invalid Payload', details: JSON.stringify(bodyParsed.error) });
  }

  try {
    const p = paramsParsed.data;
    const b = bodyParsed.data;

    const [created] = await db.insert(commentary).values({
      matchId: Number(p.id),
      minute: b.minutes ?? 0,
      sequence: b.sequence ?? 0,
      period: b.period ?? '',
      eventType: b.eventType ?? '',
      actor: b.actor ?? '',
      team: b.team ?? '',
      message: b.message,
      metadata: b.metadata ?? null,
      tags: b.tags ? JSON.stringify(b.tags) : null,
    }).returning();

    if(res.app.locals.broadcastCommentary) {
      res.app.locals.broadcastCommentary(created.matchId, created)
    }

    return res.status(201).json({ data: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create commentary', details: String(err) });
  }
})