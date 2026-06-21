import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
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

  let missions = await db.select().from(missionsTable).orderBy(desc(missionsTable.createdAt));

  if (status) missions = missions.filter(m => m.status === status);
  if (search) missions = missions.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()));
  if (skill) missions = missions.filter(m => m.skills.includes(skill));
  if (minBudget) missions = missions.filter(m => parseFloat(m.budget as unknown as string) >= parseFloat(minBudget));
  if (maxBudget) missions = missions.filter(m => parseFloat(m.budget as unknown as string) <= parseFloat(maxBudget));

  const total = missions.length;
  const page = missions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
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
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!mission) { res.status(404).json({ error: "Mission non trouvée" }); return; }

  res.json(await enrichMission(mission));
});

router.post("/missions", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const parsed = CreateMissionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [mission] = await db
    .insert(missionsTable)
    .values({ ...parsed.data, clientId: user.id, budget: parsed.data.budget.toString() })
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

  const [existing] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Mission non trouvée" }); return; }
  if (existing.clientId !== user.id) { res.status(403).json({ error: "Interdit" }); return; }

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

  const [existing] = await db.select().from(missionsTable).where(eq(missionsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Mission non trouvée" }); return; }
  if (existing.clientId !== user.id) { res.status(403).json({ error: "Interdit" }); return; }

  await db.delete(missionsTable).where(eq(missionsTable.id, id));
  res.sendStatus(204);
});

export default router;
