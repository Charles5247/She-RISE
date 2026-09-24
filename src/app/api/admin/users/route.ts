import { getDb, newId } from "@/lib/db";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

export const GET = withErrorHandling(async () => {
  const actor = await getSessionUser();
  if (!actor) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (actor.role !== "admin") return Response.json({ message: "Admin access required." }, { status: 403 });
  const users = await getDb().prepare(`SELECT id, role, first_name, last_name, email, phone, created_at FROM users ORDER BY created_at DESC`).all();
  return Response.json({ users });
});

export const POST = withErrorHandling(async (req: Request) => {
  const actor = await getSessionUser();
  if (!actor) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (actor.role !== "admin") return Response.json({ message: "Admin access required." }, { status: 403 });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const role = body?.role;
  const email = typeof body?.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : null;
  const phone = typeof body?.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
  const password = typeof body?.password === "string" ? body.password : "";
  const specialty = typeof body?.specialty === "string" ? body.specialty.trim() : "";
  if (!firstName || !["participant", "trainer", "sponsor", "admin"].includes(String(role)) || (!email && !phone) || password.length < 8) {
    return Response.json({ message: "Enter a name, role, email or phone, and a password of at least 8 characters." }, { status: 400 });
  }

  const db = getDb();
  const id = newId("usr");
  try {
    await db.transaction(async (tx) => {
      await tx.prepare(`INSERT INTO users (id, role, first_name, last_name, email, phone, password_hash, is_verified_trainer, onboarding_complete, panic_hide_enabled, wifi_only_downloads)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0)`)
        .run(id, role, firstName, lastName || null, email, phone, hashPassword(password), role === "trainer" ? 1 : 0);
      if (role === "trainer") {
        await tx.prepare(`INSERT INTO trainer_profiles (user_id, specialty) VALUES (?, ?)`)
          .run(id, specialty || "General training");
      }
      if (role === "sponsor") {
        await tx.prepare(`INSERT INTO sponsor_profiles (user_id, women_sponsored_count, sponsor_since_year) VALUES (?, 0, ?)`)
          .run(id, new Date().getFullYear());
      }
    })();
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return Response.json({ message: "That email address or phone number is already in use." }, { status: 409 });
    throw error;
  }
  return Response.json({ ok: true, id }, { status: 201 });
});

export const PATCH = withErrorHandling(async (req: Request) => {
  const actor = await getSessionUser();
  if (!actor) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (actor.role !== "admin") return Response.json({ message: "Admin access required." }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ message: "User ID is required." }, { status: 400 });
  const existing = await getDb().prepare(`SELECT id FROM users WHERE id = ?`).get(id);
  if (!existing) return Response.json({ message: "User not found." }, { status: 404 });
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (Object.hasOwn(body, "firstName") && (typeof body.firstName !== "string" || !body.firstName.trim())) {
    return Response.json({ message: "First name cannot be empty." }, { status: 400 });
  }
  const updates: string[] = [];
  const values: unknown[] = [];
  const fieldMap = { firstName: "first_name", lastName: "last_name", email: "email", phone: "phone" } as const;
  for (const [key, column] of Object.entries(fieldMap)) {
    if (!Object.hasOwn(body, key)) continue;
    const value = body[key];
    if (value !== null && typeof value !== "string") return Response.json({ message: `Invalid ${key}.` }, { status: 400 });
    updates.push(`${column} = ?`);
    values.push(typeof value === "string" ? (key === "email" ? value.trim().toLowerCase() || null : value.trim() || null) : null);
  }
  if (typeof body.password === "string" && body.password.length > 0) {
    if (body.password.length < 8) return Response.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    updates.push("password_hash = ?");
    values.push(hashPassword(body.password));
  }
  if (!updates.length) return Response.json({ message: "No changes provided." }, { status: 400 });
  values.push(id);
  try {
    await getDb().prepare(`UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`).run(...values);
    if (typeof body.password === "string" && body.password.length > 0) {
      await getDb().prepare(`DELETE FROM sessions WHERE user_id = ?`).run(id);
    }
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return Response.json({ message: "That email address or phone number is already in use." }, { status: 409 });
    throw error;
  }
  return Response.json({ ok: true });
});

export const DELETE = withErrorHandling(async (req: Request) => {
  const actor = await getSessionUser();
  if (!actor) return Response.json({ message: "Sign in required." }, { status: 401 });
  if (actor.role !== "admin") return Response.json({ message: "Admin access required." }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ message: "User ID is required." }, { status: 400 });
  if (id === actor.id) return Response.json({ message: "You cannot remove the account you are using." }, { status: 400 });
  const db = getDb();
  const target = await db.prepare(`SELECT role FROM users WHERE id = ?`).get(id) as { role: string } | undefined;
  if (!target) return Response.json({ message: "User not found." }, { status: 404 });
  if (target.role === "admin") {
    const admins = await db.prepare(`SELECT COUNT(*) AS count FROM users WHERE role = 'admin'`).get() as { count: number };
    if (admins.count <= 1) return Response.json({ message: "The last administrator account cannot be removed." }, { status: 400 });
  }
  await db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  return Response.json({ ok: true });
});
