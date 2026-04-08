import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  createMockProduct,
  deleteMockProduct,
  getMockProductById,
  getMockProducts,
  updateMockProduct,
} from "../lib/mock-store";
import { requireAdmin } from "../lib/admin-security";
import { saveProductImageFromDataUrl } from "../lib/product-image-storage";

const router: IRouter = Router();

function parseProductId(rawId: string | string[]) {
  return Number.parseInt(Array.isArray(rawId) ? rawId[0] ?? "" : rawId, 10);
}

router.get("/products", async (req, res) => {
  if (!db) {
    res.json(getMockProducts());
    return;
  }

  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.createdAt);
    const result = products.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      badge: p.badge ?? null,
    }));
    res.json(result);
  } catch (err) {
    req.log.warn({ err }, "Database products unavailable, falling back to mock data");
    res.json(getMockProducts());
  }
});

router.post("/products", requireAdmin, async (req, res) => {
  try {
    const { name, description, price, unit, imageUrl, badge, inStock, featured } = req.body;
    if (!name || !description || price == null || !unit || !imageUrl) {
      res.status(400).json({ error: "validation_error", message: "Missing required fields" });
      return;
    }

    if (!db) {
      const product = createMockProduct({
        name,
        description,
        price: Number(price),
        unit,
        imageUrl,
        badge: badge || null,
        inStock: inStock ?? true,
        featured: featured ?? false,
      });
      res.status(201).json(product);
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

router.post("/products/upload", requireAdmin, async (req, res) => {
  try {
    const { fileName, dataUrl, contentType } = req.body as {
      fileName?: string;
      dataUrl?: string;
      contentType?: string;
    };

    if (!fileName || !dataUrl) {
      res.status(400).json({ error: "validation_error", message: "Missing image file data" });
      return;
    }

    const uploadedImage = await saveProductImageFromDataUrl(fileName, dataUrl, contentType);

    res.status(201).json({
      success: true,
      imageUrl: uploadedImage.imageUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload product image";
    const statusCode =
      message === "Unsupported image type" ||
      message === "Invalid image payload" ||
      message === "Image file is too large" ||
      message === "Image file is empty"
        ? 400
        : 500;

    req.log.error({ err }, "Failed to upload product image");
    res.status(statusCode).json({ error: "upload_error", message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseProductId(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });
      return;
    }

    if (!db) {
      const product = getMockProductById(id);
      if (!product) {
        res.status(404).json({ error: "not_found", message: "Product not found" });
        return;
      }
      res.json(product);
      return;
    }

    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "not_found", message: "Product not found" });
      return;
    }
    res.json({ ...product, price: parseFloat(product.price), badge: product.badge ?? null });
  } catch (err) {
    req.log.warn({ err, id: req.params.id }, "Database product lookup unavailable, falling back to mock data");
    const id = parseProductId(req.params.id);
    const product = Number.isNaN(id) ? null : getMockProductById(id);
    if (!product) {
      res.status(404).json({ error: "not_found", message: "Product not found" });
      return;
    }
    res.json(product);
  }
});

router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseProductId(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });
      return;
    }
    const { name, description, price, unit, imageUrl, badge, inStock, featured } = req.body;

    if (!db) {
      const product = updateMockProduct(id, {
        name,
        description,
        price: Number(price),
        unit,
        imageUrl,
        badge: badge || null,
        inStock,
        featured,
      });
      if (!product) {
        res.status(404).json({ error: "not_found", message: "Product not found" });
        return;
      }
      res.json(product);
      return;
    }

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

router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseProductId(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "invalid_id", message: "Invalid product ID" });
      return;
    }

    if (!db) {
      const deleted = deleteMockProduct(id);
      if (!deleted) {
        res.status(404).json({ error: "not_found", message: "Product not found" });
        return;
      }
      res.json({ success: true, message: "Product deleted" });
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
