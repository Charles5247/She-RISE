import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import postgres from "postgres";
import env from "@next/env";
env.loadEnvConfig(process.cwd());
const sql = postgres(
  process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL,
  { prepare: false, max: 1, onnotice: () => {} },
);
const prefix = "qa_" + crypto.randomBytes(6).toString("hex");
const ids = [];
const results = [];
let courseId;
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
async function fixture(role) {
  const id = prefix + "_" + role;
  ids.push(id);
  await sql`INSERT INTO users(id,role,first_name,password_hash) VALUES (${id},${role},'QA relationship test','disabled')`;
  return id;
}
async function session(id) {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  await sql`INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES (${prefix + "_" + id},${id},${hash},NOW()+INTERVAL '1 hour')`;
  return token;
}
async function request(path, token, method = "GET", body, status = 200) {
  console.log(method, path);
  const r = await fetch(base + path, {
    signal: AbortSignal.timeout(90000),
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: "sherise_session=" + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(path + " returned " + r.status + " " + text.slice(0, 250));
  }
  assert.equal(r.status, status, path + " " + JSON.stringify(data));
  return data;
}
try {
  const admin = await fixture("admin");
  const participant = await fixture("participant");
  const a = await session(admin);
  const p = await session(participant);
  const course = await request("/api/admin/courses",a,"POST",{title:"QA temporary course",skillCategory:"QA"},201);
  courseId = course.id;
  await request("/api/admin/courses?id="+courseId,a,"PATCH",{title:"QA updated course",skillCategory:"QA"});
  const lesson = {id:prefix+"_lesson"};
  await sql`INSERT INTO lessons(id,pathway_id,title) VALUES (${lesson.id},${courseId},'QA temporary lesson')`;
  await sql`INSERT INTO lesson_progress(user_id,lesson_id,status,completed_at) VALUES (${participant},${lesson.id},'done',NOW())`;
  const accounts = {};
  for (const role of ["trainer", "sponsor"]) {
    const created = await request(
      "/api/admin/users",
      a,
      "POST",
      {
        role,
        firstName: "QA " + role,
        email: prefix + role + "@example.invalid",
        password: crypto.randomBytes(16).toString("hex"),
      },
      201,
    );
    ids.push(created.id);
    accounts[role] = { id: created.id, token: await session(created.id) };
    await request("/api/admin/users?id=" + created.id, a, "PATCH", {
      firstName: "QA updated " + role,
    });
  }
  results.push("Existing account POST and PATCH work for both staff roles");
  for (const role of ["trainer", "sponsor"]) {
    const { id, token } = accounts[role];
    const path =
      "/api/admin/" +
      (role === "trainer" ? "trainers/" : "sponsors/") +
      id +
      (role === "trainer" ? "/assignments" : "/sponsorships");
    await request(path, null, "GET", null, 401);
    await request(path, p, "POST", { participantId: participant }, 403);
    await request(path, token, "POST", { participantId: participant }, 403);
    await request(path, a, "POST", { participantId: admin }, 404);
    await request(path, a, "POST", {}, 400);
    await Promise.all([
      request(path, a, "POST", { participantId: participant }),
      request(path, a, "POST", { participantId: participant }),
    ]);
    assert.equal((await request(path, a)).participants.length, 1);
    const d = await request("/api/" + role + "/dashboard", token);
    assert.equal(d.participants.length, 1);
    assert.equal(d.participants[0].id, participant);
    assert.ok(!("last_name" in d.participants[0]));
    assert.ok(!("email" in d.participants[0]));
    if (role === "trainer") {
      await request(
        "/api/admin/participants/" + participant + "/notes",
        token,
        "POST",
        { body: "QA scoped note" },
      );
      const dashboard = await request("/api/trainer/dashboard", token);
      assert.equal(
        dashboard.participants[0].recent_notes[0].body,
        "QA scoped note",
      );
      await request("/api/trainer/chat/" + id, token, "POST", {
        participantId: participant,
        body: "QA message",
      });
      assert.equal(
        (
          await request(
            "/api/trainer/chat/" + id + "?participantId=" + participant,
            token,
          )
        ).messages.length,
        1,
      );
      assert.equal(
        (await request("/api/trainer/chat/" + id, p)).messages.length,
        1,
      );
      await request(
        "/api/trainer/chat/" + admin + "?participantId=" + participant,
        token,
        "GET",
        null,
        403,
      );
    } else {
      assert.ok(!("recent_notes" in d.participants[0]));
      assert.equal(Number(d.participants[0].lessons_completed), 1);
      results.push("Sponsor completed-lesson count matches real lesson_progress");
      await request("/api/trainer/dashboard", token, "GET", null, 403);
    }
    await request(path + "?participantId=" + participant, a, "DELETE");
    assert.equal(
      (await request("/api/" + role + "/dashboard", token)).participants.length,
      0,
    );
    if (role === "trainer")
      await request(
        "/api/admin/participants/" + participant + "/notes",
        token,
        "POST",
        { body: "Denied after removal" },
        403,
      );
    await request(path, a, "POST", { participantId: participant });
    const table =
      role === "trainer" ? "trainer_assignments" : "sponsor_sponsorships";
    const owner = role === "trainer" ? "trainer_id" : "sponsor_id";
    const rows = await sql.unsafe(
      "SELECT * FROM " + table + " WHERE " + owner + " = $1",
      [id],
    );
    assert.equal(rows.length, 2);
    results.push(
      role +
        ": authorization, duplicate concurrency, roster, soft removal, reassignment history passed",
    );
  }
  await request(
    "/api/admin/trainers",
    accounts.trainer.token,
    "GET",
    null,
    403,
  );
  const directory = await request("/api/admin/trainers", a);
  assert.equal(
    Number(
      directory.trainers.find((t) => t.id === accounts.trainer.id)
        .participant_count,
    ),
    1,
  );
  await request("/api/admin/content", a);
  results.push("Admin directory counts and existing content GET passed");
  for (const role of ["trainer", "sponsor"])
    await request("/api/admin/users?id=" + accounts[role].id, a, "DELETE");
  results.push(
    "Existing account DELETE remains functional with relationship history",
  );
  await request("/api/admin/courses?id="+courseId,a,"DELETE");
  results.push("Existing course POST, PATCH, content GET and DELETE passed");
  const rls =
    await sql`SELECT relname,relrowsecurity FROM pg_class WHERE oid IN ('trainer_assignments'::regclass,'sponsor_sponsorships'::regclass)`;
  assert.ok(rls.every((r) => r.relrowsecurity));
  const grants =
    await sql`SELECT * FROM information_schema.role_table_grants WHERE table_name IN ('trainer_assignments','sponsor_sponsorships') AND grantee IN ('anon','authenticated')`;
  assert.equal(grants.length, 0);
  results.push("RLS enabled and no anon/authenticated grants");
  fs.writeFileSync(
    "docs/verification/relationships-tests.json",
    JSON.stringify({ at: new Date().toISOString(), results }, null, 2),
  );
  console.log(results.join("\n"));
} finally {
  // Only test-created users/rows are cleaned up, including orphan history after deletion.
  await sql`DELETE FROM trainer_assignments WHERE assigned_by = ${prefix + "_admin"}`;
  await sql`DELETE FROM sponsor_sponsorships WHERE participant_id = ${prefix + "_participant"}`;
  await sql`DELETE FROM users WHERE id = ANY(${ids})`;
  if(courseId) await sql`DELETE FROM pathways WHERE id = ${courseId}`;
  await sql.end();
}
