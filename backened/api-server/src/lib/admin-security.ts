import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const DEFAULT_ADMIN_USER = process.env["ADMIN_USER"]?.trim() || "Katiyarnursery_2026";
const DEFAULT_ADMIN_PASS = process.env["ADMIN_PASSWORD"]?.trim() || "katiyar@6172";
const SESSION_COOKIE = "kn_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 1000 * 60 * 15;
const LOGIN_BLOCK_MS = 1000 * 60 * 15;

interface StoredAdminConfig {
  username: string;
  passwordSalt: string;
  passwordHash: string;
}

interface AdminSession {
  username: string;
  expiresAt: number;
}

interface LoginAttemptState {
  count: number;
  firstAttemptAt: number;
  blockedUntil: number | null;
}

const sessionStore = new Map<string, AdminSession>();
const loginAttempts = new Map<string, LoginAttemptState>();

function getConfigPath() {
  return path.resolve(process.cwd(), "data", "admin-config.json");
}

function ensureConfigDir() {
  mkdirSync(path.dirname(getConfigPath()), { recursive: true });
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function createPasswordRecord(password: string) {
  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, passwordSalt);
  return { passwordSalt, passwordHash };
}

function writeConfig(config: StoredAdminConfig) {
  ensureConfigDir();
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), "utf8");
}

function createDefaultConfig(): StoredAdminConfig {
  const passwordRecord = createPasswordRecord(DEFAULT_ADMIN_PASS);
  const config: StoredAdminConfig = {
    username: DEFAULT_ADMIN_USER,
    ...passwordRecord,
  };
  writeConfig(config);
  return config;
}

function readConfig(): StoredAdminConfig {
  try {
    if (!existsSync(getConfigPath())) {
      return createDefaultConfig();
    }

    const parsed = JSON.parse(readFileSync(getConfigPath(), "utf8")) as Partial<StoredAdminConfig>;
    if (
      typeof parsed.username !== "string" ||
      typeof parsed.passwordSalt !== "string" ||
      typeof parsed.passwordHash !== "string"
    ) {
      return createDefaultConfig();
    }

    return {
      username: parsed.username,
      passwordSalt: parsed.passwordSalt,
      passwordHash: parsed.passwordHash,
    };
  } catch {
    return createDefaultConfig();
  }
}

function constantTimeEquals(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function clearExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessionStore.entries()) {
    if (session.expiresAt <= now) {
      sessionStore.delete(token);
    }
  }
}

function getRequestKey(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.ip || "unknown";
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: SESSION_TTL_MS,
  };
}

export function verifyAdminCredentials(username: string, password: string) {
  const config = readConfig();
  if (username !== config.username) return false;
  const candidateHash = hashPassword(password, config.passwordSalt);
  return constantTimeEquals(candidateHash, config.passwordHash);
}

export function updateAdminPassword(currentPassword: string, nextPassword: string) {
  const config = readConfig();
  const currentHash = hashPassword(currentPassword, config.passwordSalt);
  if (!constantTimeEquals(currentHash, config.passwordHash)) {
    return { ok: false as const, reason: "invalid_current_password" };
  }

  const nextRecord = createPasswordRecord(nextPassword);
  writeConfig({
    username: config.username,
    ...nextRecord,
  });

  sessionStore.clear();
  return { ok: true as const };
}

export function createAdminSession(username: string) {
  clearExpiredSessions();
  const token = randomBytes(32).toString("hex");
  sessionStore.set(token, {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function getAdminSession(token: string | undefined | null) {
  clearExpiredSessions();
  if (!token) return null;
  const session = sessionStore.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessionStore.delete(token);
    return null;
  }
  return session;
}

export function destroyAdminSession(token: string | undefined | null) {
  if (!token) return;
  sessionStore.delete(token);
}

export function getAdminSessionCookie(req: Request) {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  return cookies?.[SESSION_COOKIE];
}

export function clearLoginAttempts(req: Request) {
  loginAttempts.delete(getRequestKey(req));
}

export function registerFailedLoginAttempt(req: Request) {
  const key = getRequestKey(req);
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current || now - current.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, {
      count: 1,
      firstAttemptAt: now,
      blockedUntil: null,
    });
    return;
  }

  const nextCount = current.count + 1;
  loginAttempts.set(key, {
    count: nextCount,
    firstAttemptAt: current.firstAttemptAt,
    blockedUntil: nextCount >= MAX_LOGIN_ATTEMPTS ? now + LOGIN_BLOCK_MS : null,
  });
}

export function getLoginBlockRemainingMs(req: Request) {
  const current = loginAttempts.get(getRequestKey(req));
  if (!current?.blockedUntil) return 0;

  const remaining = current.blockedUntil - Date.now();
  if (remaining <= 0) {
    loginAttempts.delete(getRequestKey(req));
    return 0;
  }

  return remaining;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = getAdminSessionCookie(req);
  const session = getAdminSession(token);

  if (!session) {
    res.status(401).json({
      error: "unauthorized",
      message: "Admin authentication is required",
    });
    return;
  }

  next();
}

export function getAdminIdentity() {
  const config = readConfig();
  return { username: config.username };
}
