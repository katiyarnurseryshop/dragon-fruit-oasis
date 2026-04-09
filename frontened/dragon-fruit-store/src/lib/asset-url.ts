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
