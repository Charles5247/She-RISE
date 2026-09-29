import { getDb, newId } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const specialty = typeof body?.specialty === "string" ? body.specialty.trim() : "";
  const password = body?.password;
  if (!name || name.length > 100 || !specialty || specialty.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      typeof password !== "string" || password.length < 8 || password.length > 128 || body?.acceptedTerms !== true) {
    return Response.json({ message: "Enter your name, valid email, specialty, and an 8–128 character password. Accept the terms to continue." }, { status: 400 });
  }
  const db = getDb();
  const id = newId("usr");
  try {
    await db.transaction(async (tx) => {
      const existing = await tx.prepare("SELECT id FROM users WHERE LOWER(email) = ?").get(email);
      if (existing) throw new Error("ACCOUNT_EXISTS");
      await tx.prepare(`INSERT INTO users (id, role, first_name, email, password_hash, onboarding_complete)
        VALUES (?, 'trainer', ?, ?, ?, 1)`).run(id, name, email, hashPassword(password));
      await tx.prepare("INSERT INTO trainer_profiles (user_id, specialty) VALUES (?, ?)").run(id, specialty);
    })();
  } catch (error) {
    if ((error as { code?: string }).code === "23505" || (error instanceof Error && error.message === "ACCOUNT_EXISTS")) {
      return Response.json({ message: "An account already exists with this email. Please sign in." }, { status: 409 });
    }
    throw error;
  }
  await createSession(id);
  return Response.json({ ok: true }, { status: 201 });
});
