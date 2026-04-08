import { Router, type IRouter } from "express";
import { db, reviewsTable } from "@workspace/db";
import { getMockReviews } from "../lib/mock-store";

const router: IRouter = Router();

router.get("/reviews", async (req, res) => {
  if (!db) {
    res.json(getMockReviews());
    return;
  }

  try {
    const reviews = await db.select().from(reviewsTable).orderBy(reviewsTable.createdAt);
    res.json(reviews.map((r) => ({ ...r, avatarUrl: r.avatarUrl ?? null })));
  } catch (err) {
    req.log.warn({ err }, "Database reviews unavailable, falling back to mock data");
    res.json(getMockReviews());
  }
});

export default router;
