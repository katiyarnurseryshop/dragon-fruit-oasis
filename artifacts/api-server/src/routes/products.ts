import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.createdAt);
    const result = products.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      badge: p.badge ?? null,
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get products");
    res.status(500).json({ error: "server_error", message: "Failed to get products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { name, description, price, unit, imageUrl, badge, inStock, featured } = req.body;
    if (!name || !description || price == null || !unit || !imageUrl) {
      res.status(400).json({ error: "validation_error", message: "Missing required fields" });
      return;
    }
    const [product] = await db
      .insert(productsTable)
      .values({
        name,
        description,
        price: String(price),
        unit: unit || "Kg",
        imageUrl,
        badge: badge || null,
        inStock: inStock ?? true,
        featured: featured ?? false,
      })
      .returning();
    res.status(201).json({ ...product, price: parseFloat(product.price), badge: product.badge ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "server_error", message: "Failed to create product" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });
      return;
    }
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "not_found", message: "Product not found" });
      return;
    }
    res.json({ ...product, price: parseFloat(product.price), badge: product.badge ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    res.status(500).json({ error: "server_error", message: "Failed to get product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });
      return;
    }
    const { name, description, price, unit, imageUrl, badge, inStock, featured } = req.body;
    const [product] = await db
      .update(productsTable)
      .set({
        name,
        description,
        price: String(price),
        unit,
        imageUrl,
        badge: badge || null,
        inStock,
        featured,
      })
      .where(eq(productsTable.id, id))
      .returning();
    if (!product) {
      res.status(404).json({ error: "not_found", message: "Product not found" });
      return;
    }
    res.json({ ...product, price: parseFloat(product.price), badge: product.badge ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "server_error", message: "Failed to update product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });
      return;
    }
    const deleted = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted.length) {
      res.status(404).json({ error: "not_found", message: "Product not found" });
      return;
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "server_error", message: "Failed to delete product" });
  }
});

export default router;
