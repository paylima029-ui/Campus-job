import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, applicationsTable, usersTable, missionsTable } from "@workspace/db";
import { CreateApplicationBody, UpdateApplicationBody } from "@workspace/api-zod";
import { getSessionUser } from "./auth";
import { notifyUser } from "../lib/notifyUser";

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
  if (isNaN(missionId)) { res.status(400).json({ error: "Identifiant de mission invalide" }); return; }

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
  if (isNaN(missionId)) { res.status(400).json({ error: "Identifiant de mission invalide" }); return; }

  const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, missionId));
  if (!mission) { res.status(404).json({ error: "Mission introuvable" }); return; }
  if (mission.status !== "open") { res.status(400).json({ error: "Cette mission n'accepte plus de candidatures" }); return; }
  if (mission.clientId === user.id) { res.status(400).json({ error: "Vous ne pouvez pas postuler à votre propre mission" }); return; }

  const [existing] = await db
    .select()
    .from(applicationsTable)
    .where(sql`${applicationsTable.missionId} = ${missionId} AND ${applicationsTable.studentId} = ${user.id}`);
  if (existing) { res.status(409).json({ error: "Vous avez déjà postulé à cette mission" }); return; }

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

  await db
    .update(missionsTable)
    .set({ applicationCount: sql`${missionsTable.applicationCount} + 1` })
    .where(eq(missionsTable.id, missionId));

  // Notifier le propriétaire de la mission
  await notifyUser(
    mission.clientId,
    "application_received",
    "Nouvelle candidature reçue",
    `${user.name} a postulé à votre mission « ${mission.title} ».`,
    missionId,
  );

  res.status(201).json(await enrichApplication(app));
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Identifiant invalide" }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Candidature introuvable" }); return; }

  const [mission] = await db.select().from(missionsTable).where(eq(missionsTable.id, app.missionId));
  if (!mission || mission.clientId !== user.id) {
    res.status(403).json({ error: "Accès interdit : vous n'êtes pas le propriétaire de cette mission" });
    return;
  }

  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db
    .update(applicationsTable)
    .set({ status: parsed.data.status })
    .where(eq(applicationsTable.id, id))
    .returning();

  // Notifier l'étudiant du changement de statut
  if (parsed.data.status === "accepted") {
    await notifyUser(
      app.studentId,
      "application_accepted",
      "Candidature acceptée 🎉",
      `Votre candidature pour la mission « ${mission.title} » a été acceptée. Félicitations !`,
      mission.id,
    );
  } else if (parsed.data.status === "rejected") {
    await notifyUser(
      app.studentId,
      "application_rejected",
      "Candidature non retenue",
      `Votre candidature pour la mission « ${mission.title} » n'a pas été retenue cette fois-ci.`,
      mission.id,
    );
  }

  res.json(await enrichApplication(updated));
});

export default router;
