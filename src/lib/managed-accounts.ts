import { hashPassword } from "./auth";
import { newId, type DbLike } from "./db";

export const ACCOUNT_LANGUAGES = ["en", "ha", "yo", "pcm", "ig"];
export interface AccountInput { firstName: string; lastName: string; email: string | null; phone: string | null; password: string; role: string; language: string; specialty: string }
export function validateAccount(body: Record<string, unknown>): AccountInput {
  const text = (key: string) => typeof body[key] === "string" ? (body[key] as string).trim() : "";
  const account: AccountInput = { firstName: text("firstName"), lastName: text("lastName"), email: text("email").toLowerCase() || null, phone: text("phone") || null, password: typeof body.password === "string" ? body.password : "", role: text("role"), language: text("language") || "ha", specialty: text("specialty") };
  if (!account.firstName || account.firstName.length > 100 || account.lastName.length > 100) throw new Error("Enter a first name of up to 100 characters.");
  if (!["participant", "trainer", "sponsor", "admin"].includes(account.role)) throw new Error("Select a valid account role.");
  if (!account.phone && !account.email) throw new Error("A phone number or email is required.");
  if (account.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email) || account.email.length > 254)) throw new Error("Enter a valid email address.");
  if (account.phone && !/^\+?[0-9]{7,15}$/.test(account.phone)) throw new Error("Phone numbers must contain 7–15 digits with an optional leading +.");
  if (account.password.length < 8 || account.password.length > 128) throw new Error("Passwords must contain 8–128 characters.");
  if (!ACCOUNT_LANGUAGES.includes(account.language)) throw new Error("Choose en, ha, yo, pcm, or ig for language.");
  return account;
}
export async function accountExists(tx: DbLike, a: AccountInput) {
  return tx.prepare("SELECT id FROM users WHERE LOWER(email) = ? OR phone = ?").get(a.email, a.phone);
}
export async function insertAccount(tx: DbLike, a: AccountInput) {
  const id = newId("usr");
  await tx.prepare(`INSERT INTO users (id, role, first_name, last_name, email, phone, password_hash, language, is_verified_trainer, onboarding_complete, panic_hide_enabled, wifi_only_downloads)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0)`).run(id, a.role, a.firstName, a.lastName || null, a.email, a.phone, hashPassword(a.password), a.language, a.role === "trainer" ? 1 : 0);
  if (a.role === "trainer") await tx.prepare("INSERT INTO trainer_profiles (user_id, specialty) VALUES (?, ?)").run(id, a.specialty || "General training");
  if (a.role === "sponsor") await tx.prepare("INSERT INTO sponsor_profiles (user_id, women_sponsored_count, sponsor_since_year) VALUES (?, 0, ?)").run(id, new Date().getFullYear());
  return id;
}
