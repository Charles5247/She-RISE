import { getDb, newId } from "./db";
import { hashPassword } from "./auth";

// Pilot LGA is Ondo Central (Section 14). Seed demo data accordingly, with a
// handful of other Ondo State LGAs for realistic filter/chart variety.
const LGAS = ["Ondo Central", "Ondo West", "Ondo East", "Akure South", "Owo", "Ile Oluji"];

const FIRST_NAMES = [
  "Grace", "Amina", "Blessing", "Funke", "Chioma", "Ronke", "Tolu", "Peace",
  "Faith", "Bimpe", "Kemi", "Ngozi", "Aisha", "Damilola", "Yetunde", "Ijeoma",
];
const LAST_NAMES = ["Adebayo", "Okafor", "Bello", "Ogunleye", "Eze", "Adeyemi", "Musa", "Nwosu"];

// Fixed, stable demo participant login (item 2 of the follow-up request):
// documented explicitly in README.md's demo-credentials table so a new
// contributor never has to "inspect /api/admin/participants to find one."
// Hardcoded here (not randomized) so it survives every reseed.
export const DEMO_PARTICIPANT_PHONE = "08100000001";
export const DEMO_PARTICIPANT_PASSWORD = "password123";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedIfEmpty() {
  const db = getDb();
  const count = ((await db.prepare("SELECT COUNT(*) as c FROM users").get()) as { c: number }).c;
  if (count > 0) return { seeded: false };

  const insertUser = db.prepare(`
    INSERT INTO users (id, role, first_name, last_name, phone, email, password_hash, pin_hash,
      language, lga, avatar_url, bio, is_verified_trainer, panic_hide_enabled, wifi_only_downloads,
      crosspost_fb_connected, crosspost_li_connected, xp_total, streak_count, skill_category, age,
      onboarding_complete)
    VALUES (@id, @role, @first_name, @last_name, @phone, @email, @password_hash, @pin_hash,
      @language, @lga, @avatar_url, @bio, @is_verified_trainer, @panic_hide_enabled, @wifi_only_downloads,
      @crosspost_fb_connected, @crosspost_li_connected, @xp_total, @streak_count, @skill_category, @age,
      @onboarding_complete)
  `);

  const pinHash = hashPassword("1234");
  const passHash = hashPassword("password123");

  // --- Admin ---
  const adminId = newId("usr");
  await insertUser.run({
    id: adminId, role: "admin", first_name: "Morayo", last_name: "Oduya",
    phone: null, email: "admin@sherise.org", password_hash: passHash, pin_hash: pinHash,
    language: "en", lga: null, avatar_url: null, bio: null,
    is_verified_trainer: 0, panic_hide_enabled: 0, wifi_only_downloads: 0,
    crosspost_fb_connected: 0, crosspost_li_connected: 0, xp_total: 0, streak_count: 0,
    skill_category: null, age: null, onboarding_complete: 1,
  });

  // --- Sponsor ---
  const sponsorId = newId("usr");
  await insertUser.run({
    id: sponsorId, role: "sponsor", first_name: "David", last_name: "Falana",
    phone: null, email: "sponsor@bluesapphire.ng", password_hash: passHash, pin_hash: pinHash,
    language: "en", lga: null, avatar_url: null, bio: null,
    is_verified_trainer: 0, panic_hide_enabled: 0, wifi_only_downloads: 0,
    crosspost_fb_connected: 0, crosspost_li_connected: 0, xp_total: 0, streak_count: 0,
    skill_category: null, age: null, onboarding_complete: 1,
  });
  await db.prepare(`INSERT INTO sponsor_profiles (user_id, women_sponsored_count, sponsor_since_year) VALUES (?, ?, ?)`)
    .run(sponsorId, 34, 2024);

  // --- Trainers ---
  const trainerSpecs = [
    { first: "Titilayo", last: "Balogun", specialty: "Tailoring & Fashion" },
    { first: "Chidinma", last: "Obi", specialty: "Catering & Baking" },
    { first: "Halima", last: "Suleiman", specialty: "Soap & Bead Making" },
  ];
  const trainerIds: string[] = [];
  for (const t of trainerSpecs) {
    const id = newId("usr");
    await insertUser.run({
      id, role: "trainer", first_name: t.first, last_name: t.last,
      phone: `080${rand(10000000, 99999999)}`, email: `${t.first.toLowerCase()}@sherise.org`,
      password_hash: passHash, pin_hash: pinHash, language: "en", lga: pick(LGAS),
      avatar_url: null, bio: `Verified trainer · ${t.specialty}`,
      is_verified_trainer: 1, panic_hide_enabled: 0, wifi_only_downloads: 0,
      crosspost_fb_connected: 0, crosspost_li_connected: 0, xp_total: 0, streak_count: 0,
      skill_category: t.specialty, age: null, onboarding_complete: 1,
    });
    await db.prepare(`INSERT INTO trainer_profiles (user_id, rating, specialty) VALUES (?, ?, ?)`)
      .run(id, 4.5 + Math.random() * 0.5, t.specialty);
    trainerIds.push(id);
  }

  // --- Pathways & Lessons (Digital & creative skills demand ranking informs this) ---
  const pathwaySpecs = [
    { title: "Tailoring & Fashion Design", cat: "Tailoring & Fashion" },
    { title: "Catering & Baking", cat: "Catering & Baking" },
    { title: "Soap & Bead Making", cat: "Soap & Bead Making" },
    { title: "Digital Marketing Basics", cat: "Digital Marketing" },
    { title: "Content Creation Starter", cat: "Content Creation" },
  ];
  const pathwayIds: Record<string, string> = {};
  for (let i = 0; i < pathwaySpecs.length; i++) {
    const p = pathwaySpecs[i];
    const id = newId("path");
    await db.prepare(`INSERT INTO pathways (id, title, skill_category, description, order_index) VALUES (?, ?, ?, ?, ?)`)
      .run(id, p.title, p.cat, `Learn ${p.title.toLowerCase()} step by step, at your own pace.`, i);
    pathwayIds[p.cat] = id;

    for (let l = 1; l <= 6; l++) {
      const lessonId = newId("lsn");
      await db.prepare(`
        INSERT INTO lessons (id, pathway_id, title, video_url_480p, video_url_hd, xp_value, order_index, duration_seconds, steps_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        lessonId, id, `${p.title} — Module ${l}`,
        "/media/sample-480p.mp4", "/media/sample-hd.mp4",
        20, l, 240 + l * 30,
        JSON.stringify([
          { label: "Watch the demonstration", done: false },
          { label: "Practice the technique", done: false },
          { label: "Reflect: what felt hardest?", done: false },
        ])
      );
      await db.prepare(`INSERT INTO content_lessons_meta (lesson_id, views, completion_rate) VALUES (?, ?, ?)`)
        .run(lessonId, rand(40, 900), rand(55, 95) / 100);
    }
  }

  // --- Circles ---
  const circleSpecs = [
    { name: "Tailors of Ondo Central", desc: "Sewing tips, pattern swaps, and orders" },
    { name: "New Mums Support Circle", desc: "Balancing training and motherhood" },
    { name: "First Income Club", desc: "Celebrating every naira earned" },
    { name: "Bakers & Caterers Network", desc: "Recipes, pricing, and referrals" },
  ];
  const circleIds: string[] = [];
  for (const c of circleSpecs) {
    const id = newId("cir");
    await db.prepare(`INSERT INTO circles (id, name, description, lga) VALUES (?, ?, ?, ?)`)
      .run(id, c.name, c.desc, pick(LGAS));
    circleIds.push(id);
  }

  // --- Participants ---
  const participantIds: string[] = [];
  const usedNames = new Set<string>();

  // Fixed demo participant FIRST, so she gets a predictable id, a
  // guaranteed-populated pathway, and shows up in feeds/lists just like any
  // other seeded participant. Login: phone 08100000001 / password123
  // (see README.md "Demo credentials"). Hardcoded (not random) intentionally
  // so this login survives every reseed.
  const demoParticipantId = newId("usr");
  const demoCat = pathwaySpecs[0].cat; // Tailoring & Fashion — matches the first trainer's specialty
  await insertUser.run({
    id: demoParticipantId, role: "participant", first_name: "Halima", last_name: "Yusuf",
    phone: DEMO_PARTICIPANT_PHONE, email: null,
    password_hash: hashPassword(DEMO_PARTICIPANT_PASSWORD), pin_hash: pinHash,
    language: "en", lga: LGAS[0],
    avatar_url: null, bio: "Learning tailoring, one stitch at a time.",
    is_verified_trainer: 0, panic_hide_enabled: 1, wifi_only_downloads: 1,
    crosspost_fb_connected: 0, crosspost_li_connected: 0,
    xp_total: 120, streak_count: 4,
    skill_category: demoCat, age: 27, onboarding_complete: 1,
  });
  participantIds.push(demoParticipantId);
  usedNames.add("HalimaYusuf");

  for (let i = 0; i < 40; i++) {
    let first = pick(FIRST_NAMES);
    let last = pick(LAST_NAMES);
    while (usedNames.has(first + last)) {
      first = pick(FIRST_NAMES);
      last = pick(LAST_NAMES);
    }
    usedNames.add(first + last);
    const id = newId("usr");
    const cat = pick(pathwaySpecs).cat;
    await insertUser.run({
      id, role: "participant", first_name: first, last_name: last,
      phone: `081${rand(10000000, 99999999)}`, email: null,
      password_hash: passHash, pin_hash: pinHash,
      language: pick(["en", "en", "en", "yo", "ha"]), lga: pick(LGAS),
      avatar_url: null, bio: null,
      is_verified_trainer: 0, panic_hide_enabled: 1, wifi_only_downloads: 1,
      crosspost_fb_connected: rand(0, 1), crosspost_li_connected: 0,
      xp_total: rand(0, 480), streak_count: rand(0, 21),
      skill_category: cat, age: rand(19, 47), onboarding_complete: 1,
    });
    participantIds.push(id);
  }

  // lesson progress + circle membership + medals, for every participant
  // including the fixed demo one (looped uniformly so she isn't special-cased
  // twice and stays realistic/consistent with everyone else).
  for (const id of participantIds) {
    const cat = id === demoParticipantId
      ? demoCat
      : ((await db.prepare(`SELECT skill_category FROM users WHERE id = ?`).get(id)) as { skill_category: string }).skill_category;

    // join 1-2 circles
    const nCircles = rand(1, 2);
    const shuffled = [...circleIds].sort(() => Math.random() - 0.5);
    for (let c = 0; c < nCircles; c++) {
      await db.prepare(`INSERT INTO circle_members (circle_id, user_id) VALUES (?, ?) ON CONFLICT (circle_id, user_id) DO NOTHING`)
        .run(shuffled[c], id);
    }

    // lesson progress in her chosen pathway
    const pathId = pathwayIds[cat];
    const lessons = (await db.prepare(`SELECT id FROM lessons WHERE pathway_id = ? ORDER BY order_index`).all(pathId)) as { id: string }[];
    const doneCount = id === demoParticipantId ? Math.min(3, lessons.length) : rand(0, lessons.length);
    for (let idx = 0; idx < lessons.length; idx++) {
      const lsn = lessons[idx];
      const status = idx < doneCount ? "done" : idx === doneCount ? "current" : "locked";
      await db.prepare(`
        INSERT INTO lesson_progress (user_id, lesson_id, status, completed_at, downloaded_offline, accuracy)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, lsn.id, status, status === "done" ? new Date(Date.now() - rand(1, 60) * 86400000).toISOString() : null,
        rand(0, 1), status === "done" ? rand(70, 100) : null);
    }

    // medals
    if (doneCount > 0) {
      await db.prepare(`INSERT INTO medals (id, user_id, code, label) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, code) DO NOTHING`)
        .run(newId("med"), id, "first_lesson", "First Lesson");
    }
    if (doneCount >= 3) {
      await db.prepare(`INSERT INTO medals (id, user_id, code, label) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, code) DO NOTHING`)
        .run(newId("med"), id, "halfway", "Halfway Hero");
    }
    if (doneCount >= lessons.length && lessons.length > 0) {
      await db.prepare(`INSERT INTO medals (id, user_id, code, label) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, code) DO NOTHING`)
        .run(newId("med"), id, "pathway_complete", "Pathway Complete");
    }
  }

  // --- Posts + milestones + reactions + comments ---
  const milestoneStories = [
    { type: "first_income", body: "My first paying tailoring job. Three uniforms, one happy customer.", amount: 4500 },
    { type: "week_complete", body: "One full week of lessons done. My hands remember the stitches now.", amount: null },
    { type: "new_skill", body: "Learned to pipe icing today! My first proper cake decoration.", amount: null },
    { type: "first_income", body: "Sold my first batch of soap at the market this morning.", amount: 2200 },
    { type: "week_complete", body: "Finished my second week — proud of showing up every single day.", amount: null },
  ];

  for (let i = 0; i < 24; i++) {
    const author = pick(participantIds);
    const useMilestone = i < milestoneStories.length || Math.random() < 0.3;
    const story = useMilestone ? pick(milestoneStories) : null;
    const postId = newId("post");
    const body = story ? story.body : "Grateful for this community. Small steps, real progress.";
    await db.prepare(`
      INSERT INTO posts (id, author_id, body, photo_url, milestone_type, crosspost_fb, crosspost_linkedin, crosspost_copy, circle_id, created_at)
      VALUES (?, ?, ?, ?, ?, 0, 0, NULL, ?, ?)
    `).run(
      postId, author, body, story ? "photo:milestone" : null,
      story ? story.type : "none", pick(circleIds),
      new Date(Date.now() - rand(0, 20) * 86400000).toISOString()
    );

    if (story) {
      await db.prepare(`
        INSERT INTO milestones (id, user_id, post_id, type, amount, verifier_id, story)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(newId("ms"), author, postId, story.type, story.amount, pick(trainerIds), body);
    }

    // reactions from random participants
    const reactors = [...participantIds].sort(() => Math.random() - 0.5).slice(0, rand(2, 12));
    for (const r of reactors) {
      if (r === author) continue;
      await db.prepare(`INSERT INTO reactions (id, post_id, user_id, kind) VALUES (?, ?, ?, ?) ON CONFLICT (post_id, user_id) DO NOTHING`)
        .run(newId("rx"), postId, r, pick(["cheer", "hold", "celebrate"]));
    }

    // comments, including one trainer comment sometimes
    const nComments = rand(0, 3);
    for (let c = 0; c < nComments; c++) {
      const commenter = Math.random() < 0.25 ? pick(trainerIds) : pick(participantIds);
      await db.prepare(`INSERT INTO comments (id, post_id, author_id, body) VALUES (?, ?, ?, ?)`)
        .run(newId("cm"), postId, commenter,
          pick(["So proud of you!", "This made my day.", "Keep going, you're doing amazing.", "Well done o!"]));
    }
  }

  // --- Trainer notes (private) ---
  for (const p of participantIds.slice(0, 15)) {
    await db.prepare(`INSERT INTO trainer_notes (id, trainer_id, participant_id, body) VALUES (?, ?, ?, ?)`)
      .run(newId("tn"), pick(trainerIds), p,
        pick([
          "Showing strong improvement in stitching consistency this week.",
          "Missed two check-ins — following up by phone.",
          "Ready to move to the advanced module.",
          "Expressed interest in joining the cooperative group.",
        ]));
  }

  // --- Referrals funnel ---
  const dropReasons = ["Distance to training centre", "Family disapproval", "Lost contact", "Chose another program"];
  for (let i = 0; i < 220; i++) {
    const stageRoll = Math.random();
    let stage: string;
    if (stageRoll < 0.15) stage = "referred";
    else if (stageRoll < 0.35) stage = "screened";
    else if (stageRoll < 0.55) stage = "eligible";
    else stage = "enrolled";
    await db.prepare(`
      INSERT INTO referrals (id, participant_id, source, lga, stage, drop_off_reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId("ref"), stage === "enrolled" ? pick(participantIds) : null,
      pick(["Community leader", "Faith organization", "Correctional facility liaison", "Peer referral", "Radio outreach"]),
      pick(LGAS), stage,
      stage !== "enrolled" && Math.random() < 0.4 ? pick(dropReasons) : null,
      new Date(Date.now() - rand(0, 90) * 86400000).toISOString()
    );
  }

  // --- Survey responses (M&E / Perception) ---
  const communities = ["Alagbaka", "Isikan", "Oke-Aro", "Ijapo", "Fiwasaye", "Oda", "Ilesa Road"];
  for (let i = 0; i < 340; i++) {
    const wave = Math.random() < 0.85 ? "baseline" : "midline";
    await db.prepare(`
      INSERT INTO survey_responses (id, survey_wave, lga, community, respondent_gender, enumerator_id,
        gps_lat, gps_lng, duration_seconds, is_duplicate, answers, collected_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId("sv"), wave, pick(LGAS), pick(communities), pick(["female", "female", "female", "male"]),
      `enum_${rand(1, 8)}`, 7.0 + Math.random(), 4.8 + Math.random(),
      rand(180, 1400), Math.random() < 0.03 ? 1 : 0,
      JSON.stringify({
        community_acceptance: pick(["high", "medium", "low"]),
        reports_stigma: Math.random() < 0.42,
        discrimination_types: pick(["Verbal harassment", "Social exclusion", "Employment denial", "None reported"]),
        main_challenge: pick(["Stigma/discrimination", "Unemployment", "Poverty", "Lack of skills", "Family rejection", "Lack of business opportunities", "Lack of community support", "Psychosocial challenges"]),
        digital_skill_demand: pick(["Content creation", "Digital marketing", "Graphic design", "Social media management", "Online business", "Video editing", "Tailoring/fashion", "Baking", "Bead making", "Soap making"]),
        wants_counselling: Math.random() < 0.61,
        willing_to_support: Math.random() < 0.58,
        willing_to_refer: Math.random() < 0.49,
      }),
      new Date(Date.now() - rand(0, 120) * 86400000).toISOString()
    );
  }

  // --- Broadcasts ---
  await db.prepare(`
    INSERT INTO broadcasts (id, sender_id, audience_filter, title, body, reach_count, open_count, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(newId("bc"), adminId, "All participants — Ondo Central", "New cohort starts Monday",
    "Reminder: Module 3 opens Monday 9am. Bring your practice fabric.", 118, 84,
    new Date(Date.now() - 3 * 86400000).toISOString());
  await db.prepare(`
    INSERT INTO broadcasts (id, sender_id, audience_filter, title, body, reach_count, open_count, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(newId("bc"), adminId, "Baking pathway cohort", "Ingredient stipend ready",
    "Your ingredient stipend for this month is ready for pickup at the centre.", 42, 39,
    new Date(Date.now() - 8 * 86400000).toISOString());

  return { seeded: true, adminId, sponsorId, trainerIds, participantIds, demoParticipantId };
}
