import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import postgres from "postgres";
import env from "@next/env";
env.loadEnvConfig(process.cwd());
const sql = postgres(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL, { prepare: false, max: 1, connect_timeout: 10, onnotice: () => {} });
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
const prefix = "qa_trainer_" + crypto.randomBytes(6).toString("hex");
const email = prefix + "@example.test";
const password = crypto.randomBytes(18).toString("hex");
const ids = [];
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
  console.log("PASS: trainer signup/login, duplicate-account protection, role isolation, ownership, file validation, pending-file access, and RLS.");
  console.log(library.data.storageReady ? "Live upload/download still requires a storage smoke test." : "Live storage test unavailable: SUPABASE_SERVICE_ROLE_KEY is missing.");
} finally {
  await sql`DELETE FROM pathways WHERE id=${prefix}`;
  await sql`DELETE FROM users WHERE id = ANY(${ids}) OR email=${email}`;
  await sql.end();
}
