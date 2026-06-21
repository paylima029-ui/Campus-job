import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, applicationsTable, usersTable, missionsTable } from "@workspace/db";
import { CreateApplicationBody, UpdateApplicationBody } from "@workspace/api-zod";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

async function enrichApplication(app: typeof applicationsTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, app.studentId));
  return {
    ...app,
    proposedBudget: app.proposedBudget != null ? parseFloat(app.proposedBudget as unknown as string) : null,
    student: student
      ? {
          id: student.id,
          email: student.email,
          name: student.name,
          role: student.role,
          avatarUrl: student.avatarUrl,
          bio: student.bio,
          university: student.university,
          skills: student.skills,
          averageRating: student.averageRating,
          totalReviews: student.totalReviews,
          createdAt: student.createdAt,
        }
      : undefined,
  };
}

router.get("/missions/:missionId/applications", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.missionId) ? req.params.missionId[0] : req.params.missionId;
  const missionId = parseInt(raw, 10);
  if (isNaN(missionId)) { res.status(400).json({ error: "Invalid missionId" }); return; }

  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.missionId, missionId));
  const enriched = await Promise.all(apps.map(enrichApplication));
  res.json(enriched);
});

router.post("/missions/:missionId/applications", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.missionId) ? req.params.missionId[0] : req.params.missionId;
  const missionId = parseInt(raw, 10);

  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [app] = await db
    .insert(applicationsTable)
    .values({
      missionId,
      studentId: user.id,
      coverLetter: parsed.data.coverLetter ?? null,
      proposedBudget: parsed.data.proposedBudget != null ? parsed.data.proposedBudget.toString() : null,
    })
    .returning();

  // Increment applicationCount
  await db
    .update(missionsTable)
    .set({ applicationCount: eq(missionsTable.id, missionId) ? undefined : undefined })
    .where(eq(missionsTable.id, missionId));

  res.status(201).json(await enrichApplication(app));
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Candidature non trouvée" }); return; }

  const [updated] = await db
    .update(applicationsTable)
    .set({ status: parsed.data.status })
    .where(eq(applicationsTable.id, id))
    .returning();

  res.json(await enrichApplication(updated));
});

export default router;
