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
