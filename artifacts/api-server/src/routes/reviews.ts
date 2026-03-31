import { Router, type IRouter } from "express";
import { db, reviewsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await db.select().from(reviewsTable).orderBy(reviewsTable.createdAt);
    res.json(reviews.map((r) => ({ ...r, avatarUrl: r.avatarUrl ?? null })));
  } catch (err) {
    req.log.error({ err }, "Failed to get reviews");
    res.status(500).json({ error: "server_error", message: "Failed to get reviews" });
  }
});

export default router;
