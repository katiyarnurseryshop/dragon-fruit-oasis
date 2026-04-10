import { Router, type IRouter } from "express";
import {
  clearLoginAttempts,
  createAdminSession,
  destroyAdminSession,
  getAdminCookieOptions,
  getAdminIdentity,
  getAdminSession,
  getAdminSessionCookie,
  getLoginBlockRemainingMs,
  registerFailedLoginAttempt,
  requireAdmin,
  updateAdminPassword,
  verifyAdminCredentials,
} from "../lib/admin-security";
import { db, productsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { getMockProducts } from "../lib/mock-store";

const router: IRouter = Router();

function normalizeProductResponse<T extends Record<string, unknown>>(product: T) {
  const imageUrl1 = typeof product.imageUrl1 === "string" && product.imageUrl1.trim()
    ? product.imageUrl1
    : typeof product.imageUrl === "string" && product.imageUrl.trim()
      ? product.imageUrl
      : "";

  return {
    ...product,
    imageUrl: imageUrl1,
    imageUrl1,
    imageUrl2: (product.imageUrl2 as string | null | undefined) ?? null,
    imageUrl3: (product.imageUrl3 as string | null | undefined) ?? null,
    imageUrl4: (product.imageUrl4 as string | null | undefined) ?? null,
    imageUrl5: (product.imageUrl5 as string | null | undefined) ?? null,
  };
}

router.get("/admin/session", (req, res) => {
  const token = getAdminSessionCookie(req);
  const session = getAdminSession(token);

  if (!session) {
    res.status(401).json({
      authenticated: false,
      error: "unauthorized",
      message: "Admin session not found",
    });
    return;
  }

  res.json({
    authenticated: true,
    username: session.username,
  });
});

router.get("/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const products = !db
      ? getMockProducts()
      : (await db.select().from(productsTable).orderBy(desc(productsTable.createdAt))).map(
          (product) => ({
            ...normalizeProductResponse(product),
            price: Number(product.price),
            badge: product.badge ?? null,
          }),
        );

    const totalProducts = products.length;
    const featuredProducts = products.filter((product) => product.featured).length;
    const inStockProducts = products.filter((product) => product.inStock).length;

    res.json({
      username: getAdminIdentity().username,
      summary: {
        totalProducts,
        featuredProducts,
        inStockProducts,
        outOfStockProducts: totalProducts - inStockProducts,
      },
      recentProducts: products.slice(0, 6),
    });
  } catch (err) {
    req.log.warn({ err }, "Database admin dashboard unavailable, falling back to mock data");
    const products = getMockProducts();
    const totalProducts = products.length;
    const featuredProducts = products.filter((product) => product.featured).length;
    const inStockProducts = products.filter((product) => product.inStock).length;

    res.json({
      username: getAdminIdentity().username,
      summary: {
        totalProducts,
        featuredProducts,
        inStockProducts,
        outOfStockProducts: totalProducts - inStockProducts,
      },
      recentProducts: products.slice(0, 6),
    });
  }
});

router.post("/admin/session", (req, res) => {
  const blockRemainingMs = getLoginBlockRemainingMs(req);
  if (blockRemainingMs > 0) {
    res.status(429).json({
      error: "too_many_attempts",
      message: `Too many failed attempts. Try again in ${Math.ceil(blockRemainingMs / 60000)} minute(s).`,
    });
    return;
  }

  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !password) {
    res.status(400).json({
      error: "validation_error",
      message: "Username and password are required",
    });
    return;
  }

  if (!verifyAdminCredentials(username, password)) {
    registerFailedLoginAttempt(req);
    req.log.warn({ username }, "Admin login failed");
    res.status(401).json({
      error: "invalid_credentials",
      message: "Invalid username or password",
    });
    return;
  }

  clearLoginAttempts(req);
  const token = createAdminSession(username);
  res.cookie("kn_admin_session", token, getAdminCookieOptions());
  req.log.info({ username }, "Admin login successful");
  res.json({
    authenticated: true,
    username,
  });
});

router.delete("/admin/session", (req, res) => {
  const token = getAdminSessionCookie(req);
  const session = getAdminSession(token);
  destroyAdminSession(token);
  res.clearCookie("kn_admin_session", getAdminCookieOptions());
  if (session) {
    req.log.info({ username: session.username }, "Admin logout successful");
  }
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

router.post("/admin/change-password", requireAdmin, (req, res) => {
  const currentPassword =
    typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
  const nextPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

  if (!currentPassword || !nextPassword) {
    res.status(400).json({
      error: "validation_error",
      message: "Current password and new password are required",
    });
    return;
  }

  if (nextPassword.length < 6) {
    res.status(400).json({
      error: "validation_error",
      message: "New password must be at least 6 characters",
    });
    return;
  }

  const result = updateAdminPassword(currentPassword, nextPassword);
  if (!result.ok) {
    req.log.warn("Admin password change failed");
    res.status(400).json({
      error: result.reason,
      message: "Current password is incorrect",
    });
    return;
  }

  destroyAdminSession(getAdminSessionCookie(req));
  res.clearCookie("kn_admin_session", getAdminCookieOptions());
  req.log.info({ username: getAdminIdentity().username }, "Admin password changed");
  res.json({
    success: true,
    message: "Password updated successfully. Please sign in again.",
  });
});

export default router;
