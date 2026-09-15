import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getDb, newId } from "./db";

export type Role = "participant" | "trainer" | "admin" | "sponsor";

export interface SessionUser {
  id: string;
  role: Role;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  language: string;
  lga: string | null;
  avatar_url: string | null;
  is_verified_trainer: number;
  panic_hide_enabled: number;
  onboarding_complete: number;
}

const SESSION_COOKIE = "sherise_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const id = newId("sess");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`
  ).run(id, userId, hashToken(token), expires.toISOString());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
  return token;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = getDb();
    db.prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(hashToken(token));
  }
  store.delete(SESSION_COOKIE);
}

// Public-safe user row: NEVER includes last_name for participant-facing contexts.
// Use getFullSessionUser() only in admin/trainer-note contexts (Section 9 rule).
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const session = db
    .prepare(`SELECT * FROM sessions WHERE token_hash = ? AND expires_at > datetime('now')`)
    .get(hashToken(token)) as { user_id: string } | undefined;
  if (!session) return null;
  const user = db
    .prepare(
      `SELECT id, role, first_name, last_name, phone, email, language, lga, avatar_url,
              is_verified_trainer, panic_hide_enabled, onboarding_complete
       FROM users WHERE id = ?`
    )
    .get(session.user_id) as SessionUser | undefined;
  return user ?? null;
}

export function unauthorized() {
  return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
}

export function forbidden() {
  return Response.json({ code: "FORBIDDEN", message: "You do not have access to this resource." }, { status: 403 });
}

export async function requireRole(...roles: Role[]): Promise<SessionUser | Response> {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!roles.includes(user.role)) return forbidden();
  return user;
}
