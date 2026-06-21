import { Router, type IRouter } from "express";
import { eq, ilike, gte, lte, sql, and } from "drizzle-orm";
import { db, servicesTable, usersTable } from "@workspace/db";
import { CreateServiceBody, UpdateServiceBody } from "@workspace/api-zod";
import { getSessionUser } from "./auth";

const router: IRouter = Router();

async function enrichService(service: typeof servicesTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, service.studentId));
  return {
    ...service,
    price: parseFloat(service.price as unknown as string),
    averageRating: service.averageRating,
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

router.get("/services", async (req, res): Promise<void> => {
  const { category, search, minPrice, maxPrice, limit = "20", offset = "0" } = req.query as Record<string, string>;

  let services = await db.select().from(servicesTable);

  if (category) services = services.filter(s => s.category === category);
  if (search) services = services.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()));
  if (minPrice) services = services.filter(s => parseFloat(s.price as unknown as string) >= parseFloat(minPrice));
  if (maxPrice) services = services.filter(s => parseFloat(s.price as unknown as string) <= parseFloat(maxPrice));

  const total = services.length;
  const page = services.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  const enriched = await Promise.all(page.map(enrichService));
  res.json({ services: enriched, total });
});

router.get("/services/popular", async (_req, res): Promise<void> => {
  const services = await db
    .select()
    .from(servicesTable)
    .orderBy(sql`${servicesTable.totalOrders} DESC, ${servicesTable.averageRating} DESC NULLS LAST`)
    .limit(8);
  const enriched = await Promise.all(services.map(enrichService));
  res.json(enriched);
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, id));
  if (!service) { res.status(404).json({ error: "Service non trouvé" }); return; }

  res.json(await enrichService(service));
});

router.post("/services", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [service] = await db
    .insert(servicesTable)
    .values({ ...parsed.data, studentId: user.id, price: parsed.data.price.toString() })
    .returning();

  res.status(201).json(await enrichService(service));
});

router.patch("/services/:id", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [existing] = await db.select().from(servicesTable).where(eq(servicesTable.id, id));
  if (!existing) { res.status(404).json({ error: "Service non trouvé" }); return; }
  if (existing.studentId !== user.id) { res.status(403).json({ error: "Interdit" }); return; }

  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price !== undefined) updateData.price = parsed.data.price.toString();

  const [updated] = await db.update(servicesTable).set(updateData).where(eq(servicesTable.id, id)).returning();
  res.json(await enrichService(updated));
});

router.delete("/services/:id", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [existing] = await db.select().from(servicesTable).where(eq(servicesTable.id, id));
  if (!existing) { res.status(404).json({ error: "Service non trouvé" }); return; }
  if (existing.studentId !== user.id) { res.status(403).json({ error: "Interdit" }); return; }

  await db.delete(servicesTable).where(eq(servicesTable.id, id));
  res.sendStatus(204);
});

export default router;
