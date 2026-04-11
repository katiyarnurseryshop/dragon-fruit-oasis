const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export function resolveAssetUrl(url: string | null | undefined): string {
  const value = url?.trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return API_BASE_URL ? `${API_BASE_URL}${value}` : value;
  }

  return value;
}

export function getProductPrimaryImage(product: {
  imageUrl?: string | null;
  imageUrl1?: string | null;
  imageUrl2?: string | null;
  imageUrl3?: string | null;
  imageUrl4?: string | null;
  imageUrl5?: string | null;
} | null | undefined): string {
  if (!product) return "";

  const candidates = [
    product.imageUrl,
    product.imageUrl1,
    product.imageUrl2,
    product.imageUrl3,
    product.imageUrl4,
    product.imageUrl5,
  ];

  const firstValid = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
  return resolveAssetUrl(firstValid);
}
