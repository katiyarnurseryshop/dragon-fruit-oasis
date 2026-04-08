import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { getMockStoreStats } from "../lib/mock-store";

const router: IRouter = Router();

router.get("/store-stats", async (req, res) => {
  if (!db) {
    res.json(getMockStoreStats());
    return;
  }

  try {
    const [{ total: totalProducts }] = await db.select({ total: count() }).from(productsTable);
    res.json({
      totalProducts,
      happyCustomers: 500,
      yearsOfFarming: 12,
      citiesDelivered: 25,
    });
  } catch (err) {
    req.log.warn({ err }, "Database store stats unavailable, falling back to mock data");
    res.json(getMockStoreStats());
  }
});

export default router;
