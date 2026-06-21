import { Router, type IRouter } from "express";
import { eq, or, desc } from "drizzle-orm";
import { db, conversationsTable, messagesTable, usersTable } from "@workspace/db";
import { CreateConversationBody, SendMessageBody } from "@workspace/api-zod";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    university: user.university,
    skills: user.skills,
    averageRating: user.averageRating,
    totalReviews: user.totalReviews,
    createdAt: user.createdAt,
  };
}

router.get("/conversations", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const convs = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.participant1Id, user.id),
        eq(conversationsTable.participant2Id, user.id)
      )
    )
    .orderBy(desc(conversationsTable.lastMessageAt));

  const enriched = await Promise.all(
    convs.map(async (c) => {
      const p1Id = c.participant1Id === user.id ? c.participant1Id : c.participant2Id;
      const p2Id = c.participant1Id === user.id ? c.participant2Id : c.participant1Id;
      const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, p1Id));
      const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, p2Id));
      return {
        id: c.id,
        participants: [p1, p2].filter(Boolean).map(formatUser),
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unreadCount: 0,
        createdAt: c.createdAt,
      };
    })
  );

  res.json(enriched);
});

router.post("/conversations", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { participantId } = parsed.data;

  // Check if conversation already exists
  const existing = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.participant1Id, user.id),
        eq(conversationsTable.participant2Id, user.id)
      )
    );

  const found = existing.find(
    c =>
      (c.participant1Id === user.id && c.participant2Id === participantId) ||
      (c.participant2Id === user.id && c.participant1Id === participantId)
  );

  let conv = found;
  if (!conv) {
    const [created] = await db
      .insert(conversationsTable)
      .values({ participant1Id: user.id, participant2Id: participantId })
      .returning();
    conv = created;
  }

  const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
  const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, participantId));

  res.status(201).json({
    id: conv.id,
    participants: [p1, p2].filter(Boolean).map(formatUser),
    lastMessage: conv.lastMessage,
    lastMessageAt: conv.lastMessageAt,
    unreadCount: 0,
    createdAt: conv.createdAt,
  });
});

router.get("/conversations/:id/messages", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(messagesTable.createdAt);

  const enriched = await Promise.all(
    msgs.map(async (m) => {
      const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, m.senderId));
      return {
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        sender: sender ? formatUser(sender) : undefined,
        content: m.content,
        createdAt: m.createdAt,
      };
    })
  );

  res.json(enriched);
});

router.post("/conversations/:id/messages", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [msg] = await db
    .insert(messagesTable)
    .values({ conversationId: id, senderId: user.id, content: parsed.data.content })
    .returning();

  await db
    .update(conversationsTable)
    .set({ lastMessage: parsed.data.content, lastMessageAt: new Date() })
    .where(eq(conversationsTable.id, id));

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));

  res.status(201).json({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    sender: sender ? formatUser(sender) : undefined,
    content: msg.content,
    createdAt: msg.createdAt,
  });
});

export default router;
