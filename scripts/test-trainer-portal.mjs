import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import postgres from "postgres";
import env from "@next/env";
env.loadEnvConfig(process.cwd());
if (process.env.ALLOW_PORTAL_TEST_WRITES !== "1") {
  throw new Error("Confirm a development/test DATABASE_URL and set ALLOW_PORTAL_TEST_WRITES=1 before running this suite. It applies schema and creates temporary records.");
}
const sql = postgres(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL, { prepare: false, max: 1, connect_timeout: 10, onnotice: () => {} });
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const prefix = "qa_trainer_" + crypto.randomBytes(6).toString("hex");
const email = prefix + "@example.test";
const password = crypto.randomBytes(18).toString("hex");
const ids = [];
let connected = false;
async function request(path, method = "GET", body, cookie = "", status = 200) {
  const r = await fetch(base + path, { method, signal: AbortSignal.timeout(60000), headers: { "Content-Type": "application/json", Cookie: cookie }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await r.json();
  assert.equal(r.status, status, path + ": " + JSON.stringify(data));
  return { data, cookie: r.headers.get("set-cookie")?.split(";")[0] || cookie };
}
async function fixture(role) {
  const id = prefix + "_" + role;
  ids.push(id);
  await sql`INSERT INTO users(id,role,first_name,password_hash) VALUES (${id},${role},'QA portal','disabled')`;
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  await sql`INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES (${id},${id},${hash},NOW()+INTERVAL '1 hour')`;
  return "sherise_session=" + token;
}
try {
  await sql`SELECT 1`;
  connected = true;
  await sql.unsafe(fs.readFileSync("src/lib/schema.sql", "utf8"));
  const created = await request("/api/trainer/signup", "POST", { name: "QA trainer", email, password, specialty: "Testing", acceptedTerms: true, role: "admin" }, "", 201);
  const [user] = await sql`SELECT id,role,is_verified_trainer FROM users WHERE email=${email}`;
  ids.push(user.id);
  assert.equal(user.role, "trainer");
  assert.equal(user.is_verified_trainer, 0);
  const [profile] = await sql`SELECT specialty FROM trainer_profiles WHERE user_id=${user.id}`;
  assert.equal(profile.specialty, "Testing");
  await request("/api/trainer/signup", "POST", { name: "QA", email, password: "replacement123", specialty: "QA", acceptedTerms: true }, "", 409);
  await request("/api/auth/signup", "POST", { identifier: email, password: "replacement123", acceptedTerms: true }, "", 409);
  const loggedIn = await request("/api/admin/login", "POST", { identifier: email, password });
  assert.equal(loggedIn.data.role, "trainer");
  await request("/api/trainer/dashboard", "GET", null, loggedIn.cookie);
  await request("/api/trainer/signup", "POST", { email, password: "short" }, "", 400);
  await request("/api/trainer/materials", "GET", null, "", 401);
  const sponsor = await fixture("sponsor");
  const participant = await fixture("participant");
  const other = await fixture("trainer");
  for (const cookie of [sponsor, participant]) {
    await request("/api/trainer/materials", "GET", null, cookie, 403);
    await request("/api/trainer/materials", "POST", {}, cookie, 403);
  }
  const library = await request("/api/trainer/materials", "GET", null, created.cookie);
  assert.equal(library.data.materials.length, 0);
  await sql`INSERT INTO pathways(id,title,skill_category) VALUES (${prefix},'QA course','Testing')`;
  const valid = { title: "QA module", filename: "module.pdf", size: 32, courseId: prefix };
  for (const changes of [{ filename: "bad.exe" }, { size: 52428801 }, { size: 0 }, { filename: "../module.pdf" }, { title: "" }]) {
    await request("/api/trainer/materials", "POST", { ...valid, ...changes }, created.cookie, 400);
  }
  await request("/api/trainer/materials", "POST", { ...valid, courseId: "missing" }, created.cookie, 404);
  if (!library.data.storageReady) await request("/api/trainer/materials", "POST", valid, created.cookie, 503);
  await sql`INSERT INTO course_materials(id,trainer_id,pathway_id,title,filename,storage_path,mime_type,size_bytes) VALUES (${prefix},${user.id},${prefix},'QA module','module.pdf',${prefix},'application/pdf',32)`;
  for (const method of ["GET", "PATCH", "DELETE"]) {
    await request("/api/trainer/materials/" + prefix, method, null, other, 404);
    await request("/api/trainer/materials/" + prefix, method, null, sponsor, 403);
  }
  const otherLibrary = await request("/api/trainer/materials", "GET", null, other);
  assert.equal(otherLibrary.data.materials.length, 0);
  await request("/api/trainer/materials/" + prefix, "GET", null, created.cookie, 404);
  const [rls] = await sql`SELECT relrowsecurity FROM pg_class WHERE oid='course_materials'::regclass`;
  assert.equal(rls.relrowsecurity, true);
  const participantId = prefix + "_participant";
  const admin = await fixture("admin");
  const task = { participantId, title: "QA practice", instructions: "Practise the first module.", dueDate: "2026-10-10" };
  await request("/api/admin/learning-assignments", "POST", task, participant, 403);
  await request("/api/admin/learning-assignments", "POST", task, sponsor, 403);
  await request("/api/admin/learning-assignments", "POST", task, created.cookie, 403);
  await sql`INSERT INTO trainer_assignments(id,trainer_id,participant_id,assigned_by) VALUES (${prefix},${user.id},${participantId},${prefix + "_admin"})`;
  const assigned = await request("/api/admin/learning-assignments", "POST", task, created.cookie, 201);
  await request("/api/admin/learning-assignments", "POST", { ...task, title: "QA admin activity" }, admin, 201);
  await request("/api/admin/learning-assignments", "POST", { ...task, dueDate: "2026-02-30" }, admin, 400);
  const tasks = await request("/api/me/assignments", "GET", null, participant);
  assert.equal(tasks.data.assignments.length, 2);
  assert.ok(tasks.data.assignments.some(t => t.id === assigned.data.id));
  let inbox = await request("/api/notifications", "GET", null, participant);
  assert.equal(inbox.data.unreadCount, 2);
  const note = [...inbox.data.today, ...inbox.data.earlier].find(n => n.href === "/dashboard#assignment-" + assigned.data.id);
  assert.ok(note);
  await request("/api/notifications", "PATCH", { id: note.id }, other);
  inbox = await request("/api/notifications", "GET", null, participant);
  assert.equal(inbox.data.unreadCount, 2, "Another user cannot mark a notification read");
  await request("/api/notifications", "PATCH", { id: note.id }, participant);
  inbox = await request("/api/notifications", "GET", null, participant);
  assert.equal(inbox.data.unreadCount, 1);
  await request("/api/notifications", "PATCH", {}, participant);
  inbox = await request("/api/notifications", "GET", null, participant);
  assert.equal(inbox.data.unreadCount, 0);
  await request("/api/trainer/chat/" + user.id, "POST", { participantId, body: "QA message" }, created.cookie, 200);
  inbox = await request("/api/notifications", "GET", null, participant);
  assert.equal(inbox.data.unreadCount, 1);
  assert.ok([...inbox.data.today, ...inbox.data.earlier].some(n => n.href === "/trainer-chat/" + user.id));
  await sql`INSERT INTO milestones(id,user_id,type,amount) VALUES (${prefix + "_income"},${participantId},'first_income',1500)`;
  await sql`INSERT INTO lessons(id,pathway_id,title,xp_value) VALUES (${prefix},${prefix},'QA lesson',10)`;
  await request("/api/lessons/" + prefix + "/complete", "POST", {}, participant);
  const repeat = await request("/api/lessons/" + prefix + "/complete", "POST", {}, participant);
  assert.equal(repeat.data.xpAwarded, 0);
  const progress = await request("/api/me/progress", "GET", null, participant);
  assert.equal(progress.data.incomeTotal, 1500);
  assert.equal(progress.data.xpTotal, 10);
  assert.equal(progress.data.lessonsCompleted, 1);
  assert.equal(progress.data.streakCount, 1);
  assert.equal(progress.data.weeklyActivity.length, 7);
  console.log("PASS: assignment delivery, recipient notifications, read-state ownership, message links, income totals and idempotent lesson XP.");
  console.log("PASS: trainer signup/login, duplicate-account protection, role isolation, ownership, file validation, pending-file access, and RLS.");
  console.log(library.data.storageReady ? "Live upload/download still requires a storage smoke test." : "Live storage test unavailable: SUPABASE_SERVICE_ROLE_KEY is missing.");
} finally {
  if (connected) {
    await sql`DELETE FROM trainer_assignments WHERE id=${prefix}`;
    await sql`DELETE FROM pathways WHERE id=${prefix}`;
    await sql`DELETE FROM users WHERE id = ANY(${ids}) OR email=${email}`;
  }
  await sql.end();
}
