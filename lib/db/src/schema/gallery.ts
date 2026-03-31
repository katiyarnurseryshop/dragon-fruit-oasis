import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryTable = pgTable("gallery", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption").notNull(),
  category: text("category").notNull().default("farm"),
});

export const insertGallerySchema = createInsertSchema(galleryTable).omit({
  id: true,
});
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type GalleryImage = typeof galleryTable.$inferSelect;
