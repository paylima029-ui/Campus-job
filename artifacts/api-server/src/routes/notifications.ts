import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

router.get("/notifications", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const unreadOnly = req.query["unread_only"] === "true";

  const conditions = unreadOnly
    ? and(eq(notificationsTable.userId, user.id), eq(notificationsTable.isRead, false))
    : eq(notificationsTable.userId, user.id);

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(conditions)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(30);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.json({ notifications, unreadCount });
});

router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.userId, user.id), eq(notificationsTable.isRead, false)));

  res.json({ success: true });
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Identifiant invalide" }); return; }

  const [notif] = await db
    .select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)));

  if (!notif) { res.status(404).json({ error: "Notification introuvable" }); return; }

  const [updated] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id))
    .returning();

  res.json(updated);
});

export default router;
