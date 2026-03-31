import { Router, type IRouter } from "express";
import { db, galleryTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/gallery", async (req, res) => {
  try {
    const images = await db.select().from(galleryTable);
    res.json(images);
  } catch (err) {
    req.log.error({ err }, "Failed to get gallery");
    res.status(500).json({ error: "server_error", message: "Failed to get gallery" });
  }
});

export default router;
