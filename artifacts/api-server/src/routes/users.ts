import { Router, type IRouter } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { UpdateUserBody } from "@workspace/api-zod";
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
    portfolioUrl: user.portfolioUrl,
    cvUrl: user.cvUrl,
    averageRating: user.averageRating,
    totalReviews: user.totalReviews,
    completedMissions: user.completedMissions,
    createdAt: user.createdAt,
  };
}

router.get("/users", async (req, res): Promise<void> => {
  const { role, skill, search, limit = "20", offset = "0" } = req.query as Record<string, string>;

  let query = db.select().from(usersTable).$dynamic();

  const conditions = [];
  if (role) conditions.push(eq(usersTable.role, role as "student" | "company" | "individual"));
  if (search) conditions.push(or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.bio, `%${search}%`)));
  if (skill) conditions.push(sql`${skill} = ANY(${usersTable.skills})`);

  if (conditions.length > 0) {
    query = query.where(sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`);
  }

  const allUsers = await query;
  const total = allUsers.length;
  const users = allUsers.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({ users: users.map(formatUser), total });
});

router.get("/users/featured", async (_req, res): Promise<void> => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "student"))
    .orderBy(sql`${usersTable.averageRating} DESC NULLS LAST, ${usersTable.completedMissions} DESC`)
    .limit(6);
  res.json(users.map(formatUser));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Utilisateur non trouvé" }); return; }

  res.json(formatUser(user));
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const sessionUser = await getSessionUser(token);
  if (!sessionUser || sessionUser.id !== id) { res.status(403).json({ error: "Interdit" }); return; }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, id))
    .returning();

  res.json(formatUser(updated));
});

export default router;
