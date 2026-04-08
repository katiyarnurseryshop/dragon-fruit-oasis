import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const PRODUCT_UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function sanitizeBaseName(fileName: string) {
  const withoutExtension = path.parse(fileName).name;
  const compact = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return compact || "product-image";
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("Invalid image payload");
  }

  return {
    mimeType: match[1],
    base64Data: match[2],
  };
}

export async function saveProductImageFromDataUrl(
  fileName: string,
  dataUrl: string,
  contentType?: string,
) {
  const parsed = parseDataUrl(dataUrl);
  const mimeType = contentType?.trim() || parsed.mimeType;
  const extension = IMAGE_EXTENSION_BY_TYPE[mimeType];

  if (!extension) {
    throw new Error("Unsupported image type");
  }

  const buffer = Buffer.from(parsed.base64Data, "base64");

  if (!buffer.length) {
    throw new Error("Image file is empty");
  }

  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Image file is too large");
  }

  await mkdir(PRODUCT_UPLOADS_DIR, { recursive: true });

  const finalName = `${Date.now()}-${sanitizeBaseName(fileName)}${extension}`;
  const outputPath = path.join(PRODUCT_UPLOADS_DIR, finalName);

  await writeFile(outputPath, buffer);

  return {
    imageUrl: `/uploads/${finalName}`,
    outputPath,
  };
}
