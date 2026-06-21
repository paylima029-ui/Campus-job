import { Router, type IRouter } from "express";
import { eq, sql, desc, and, ilike } from "drizzle-orm";
import { db, missionsTable, usersTable } from "@workspace/db";
import { CreateMissionBody, UpdateMissionBody } from "@workspace/api-zod";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

async function enrichMission(mission: typeof missionsTable.$inferSelect) {
  const [client] = await db.select().from(usersTable).where(eq(usersTable.id, mission.clientId));
  return {
    ...mission,
    budget: parseFloat(mission.budget as unknown as string),
    client: client
      ? {
          id: client.id,
          email: client.email,
          name: client.name,
          role: client.role,
          avatarUrl: client.avatarUrl,
          bio: client.bio,
          university: client.university,
          skills: client.skills,
          averageRating: client.averageRating,
          totalReviews: client.totalReviews,
          createdAt: client.createdAt,
        }
      : undefined,
  };
}

router.get("/missions", async (req, res): Promise<void> => {
  const { status, skill, search, minBudget, maxBudget, limit = "20", offset = "0" } = req.query as Record<string, string>;

  const conditions = [];

  if (status) {
    conditions.push(eq(missionsTable.status, status as "open" | "in_progress" | "completed" | "cancelled"));
  }
  if (search) {
    conditions.push(
      sql`(${missionsTable.title} ilike ${`%${search}%`} OR ${missionsTable.description} ilike ${`%${search}%`})`
    );
  }
  if (skill) {
    conditions.push(sql`${skill}::text = ANY(${missionsTable.skills})`);
  }
  if (minBudget && !isNaN(parseFloat(minBudget))) {
    conditions.push(sql`${missionsTable.budget} >= ${parseFloat(minBudget)}`);
  }
  if (maxBudget && !isNaN(parseFloat(maxBudget))) {
    conditions.push(sql`${missionsTable.budget} <= ${parseFloat(maxBudget)}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const allMissions = await db
    .select()
    .from(missionsTable)
    .where(whereClause)
    .orderBy(desc(missionsTable.createdAt));

  const total = allMissions.length;
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  const off = parseInt(offset, 10) || 0;
  const page = allMissions.slice(off, off + lim);
  const enriched = await Promise.all(page.map(enrichMission));
  res.json({ missions: enriched, total });
});

router.get("/missions/recent", async (_req, res): Promise<void> => {
  const missions = await db
    .select()
    .from(missionsTable)
    .where(eq(missionsTable.status, "open"))
    .orderBy(desc(missionsTable.createdAt))
    .limit(6);
  const enriched = await Promise.all(missions.map(enrichMission));
  res.json(enriched);
});

router.get("/missions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Identifiant invalide" }); return; }

  const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!mission) { res.status(404).json({ error: "Mission introuvable" }); return; }

  res.json(await enrichMission(mission));
});

router.post("/missions", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const parsed = CreateMissionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const deadlineStr =
    parsed.data.deadline instanceof Date
      ? parsed.data.deadline.toISOString().slice(0, 10)
      : (parsed.data.deadline as unknown as string);

  const [mission] = await db
    .insert(missionsTable)
    .values({ ...parsed.data, clientId: user.id, budget: parsed.data.budget.toString(), deadline: deadlineStr })
    .returning();

  res.status(201).json(await enrichMission(mission));
});

router.patch("/missions/:id", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Identifiant invalide" }); return; }

  const [existing] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Mission introuvable" }); return; }
  if (existing.clientId !== user.id) { res.status(403).json({ error: "Accès interdit" }); return; }

  const parsed = UpdateMissionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.budget !== undefined) updateData.budget = parsed.data.budget.toString();

  const [updated] = await db.update(missionsTable).set(updateData).where(eq(missionsTable.id, id)).returning();
  res.json(await enrichMission(updated));
});

router.delete("/missions/:id", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Identifiant invalide" }); return; }

  const [existing] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Mission introuvable" }); return; }
  if (existing.clientId !== user.id) { res.status(403).json({ error: "Accès interdit" }); return; }

  await db.delete(missionsTable).where(eq(missionsTable.id, id));
  res.sendStatus(204);
});

export default router;
