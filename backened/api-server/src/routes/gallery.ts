import { Router, type IRouter } from "express";
import { db, galleryTable } from "@workspace/db";
import { getMockGallery } from "../lib/mock-store";

const router: IRouter = Router();

router.get("/gallery", async (req, res) => {
  if (!db) {
    res.json(getMockGallery());
    return;
  }

  try {
    const images = await db.select().from(galleryTable);
    res.json(images);
  } catch (err) {
    req.log.warn({ err }, "Database gallery unavailable, falling back to mock data");
    res.json(getMockGallery());
  }
});

export default router;
