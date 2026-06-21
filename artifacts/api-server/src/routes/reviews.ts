import { Router, type IRouter } from "express";
import { eq, avg } from "drizzle-orm";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { CreateReviewBody } from "@workspace/api-zod";
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

router.get("/reviews/user/:userId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.revieweeId, userId));

  const enriched = await Promise.all(
    reviews.map(async (r) => {
      const [reviewer] = await db.select().from(usersTable).where(eq(usersTable.id, r.reviewerId));
      return {
        id: r.id,
        reviewerId: r.reviewerId,
        reviewer: reviewer ? formatUser(reviewer) : undefined,
        revieweeId: r.revieweeId,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      };
    })
  );

  res.json(enriched);
});

router.post("/reviews", async (req, res): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) { res.status(401).json({ error: "Non authentifié" }); return; }
  const user = await getSessionUser(token);
  if (!user) { res.status(401).json({ error: "Session expirée" }); return; }

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [review] = await db
    .insert(reviewsTable)
    .values({ ...parsed.data, reviewerId: user.id })
    .returning();

  // Update reviewee averageRating and totalReviews
  const allReviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.revieweeId, parsed.data.revieweeId));

  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db
    .update(usersTable)
    .set({ averageRating: avgRating, totalReviews: allReviews.length })
    .where(eq(usersTable.id, parsed.data.revieweeId));

  const [reviewer] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));

  res.status(201).json({
    id: review.id,
    reviewerId: review.reviewerId,
    reviewer: reviewer ? formatUser(reviewer) : undefined,
    revieweeId: review.revieweeId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  });
});

export default router;
