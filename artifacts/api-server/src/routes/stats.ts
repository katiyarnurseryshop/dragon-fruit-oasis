import { Router, type IRouter } from "express";
import { db, productsTable, reviewsTable } from "@workspace/db";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/store-stats", async (req, res) => {
  try {
    const [{ total: totalProducts }] = await db.select({ total: count() }).from(productsTable);
    res.json({
      totalProducts,
      happyCustomers: 500,
      yearsOfFarming: 12,
      citiesDelivered: 25,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get store stats");
    res.status(500).json({ error: "server_error", message: "Failed to get stats" });
  }
});

export default router;
