import { Router, type IRouter } from "express";
import { eq, count, sum, sql } from "drizzle-orm";
import { db, missionsTable, servicesTable, applicationsTable, conversationsTable, messagesTable, usersTable } from "@workspace/db";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

router.get("/dashboard/student", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const [activeServices] = await db
    .select({ count: count() })
    .from(servicesTable)
    .where(eq(servicesTable.studentId, user.id));

  const [activeApplications] = await db
    .select({ count: count() })
    .from(applicationsTable)
    .where(eq(applicationsTable.studentId, user.id));

  const [pendingApplications] = await db
    .select({ count: count() })
    .from(applicationsTable)
    .where(sql`${applicationsTable.studentId} = ${user.id} AND ${applicationsTable.status} = 'pending'`);

  res.json({
    totalEarnings: 0,
    activeServices: activeServices.count,
    activeApplications: activeApplications.count,
    pendingApplications: pendingApplications.count,
    completedMissions: user.completedMissions,
    unreadMessages: 0,
  });
});

router.get("/dashboard/client", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const [activeMissions] = await db
    .select({ count: count() })
    .from(missionsTable)
    .where(sql`${missionsTable.clientId} = ${user.id} AND ${missionsTable.status} = 'open'`);

  const [completedMissions] = await db
    .select({ count: count() })
    .from(missionsTable)
    .where(sql`${missionsTable.clientId} = ${user.id} AND ${missionsTable.status} = 'completed'`);

  const clientMissions = await db.select().from(missionsTable).where(eq(missionsTable.clientId, user.id));
  const missionIds = clientMissions.map(m => m.id);

  let totalApplications = 0;
  for (const mid of missionIds) {
    const [r] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.missionId, mid));
    totalApplications += r.count;
  }

  res.json({
    activeMissions: activeMissions.count,
    totalApplicationsReceived: totalApplications,
    completedMissions: completedMissions.count,
    totalSpent: 0,
    unreadMessages: 0,
  });
});

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [totalStudents] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "student"));
  const [totalMissions] = await db.select({ count: count() }).from(missionsTable);
  const [totalServices] = await db.select({ count: count() }).from(servicesTable);
  const [totalCompanies] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "company"));

  res.json({
    totalStudents: totalStudents.count,
    totalMissions: totalMissions.count,
    totalServices: totalServices.count,
    totalCompanies: totalCompanies.count,
  });
});

export default router;
