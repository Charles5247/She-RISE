// Concept 2 — Admin web + states (Bold & Empowering)

/* ============ ADMIN LOGIN ============ */
function C2AdminLogin() {
  return (
    <div style={{ width: '100%', minHeight: 940, background: c2Palette.plum, color: c2Palette.cream, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ padding: '80px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${c2Palette.magenta}, transparent 70%)`, opacity: 0.4 }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: c2Palette.gold, color: c2Palette.plum, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c2Palette.displayFont, fontWeight: 900, fontSize: 22, letterSpacing: '-0.05em' }}>SR</div>
          <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em' }}>SheRISE<span style={{ color: c2Palette.gold }}>.</span> Command</div>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="mono" style={{ fontSize: 12, letterSpacing: '0.2em', color: c2Palette.gold, textTransform: 'uppercase', fontFamily: c2Palette.displayFont, fontWeight: 700, marginBottom: 20 }}>Movement mode</div>
          <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 88, lineHeight: 0.9, letterSpacing: '-0.035em' }}>
            Every rise,<br /><span style={{ color: c2Palette.gold }}>on record.</span>
          </div>
          <div style={{ marginTop: 24, maxWidth: 400, fontSize: 16, lineHeight: 1.55, color: 'rgba(245,239,230,0.75)' }}>
            The window you sign into is the same window funders and committee see.
          </div>
        </div>

        <div className="mono" style={{ position: 'relative', fontSize: 11, letterSpacing: '0.16em', color: c2Palette.gold, textTransform: 'uppercase', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>
          v.2026.09 · CONSENT-FIRST
        </div>
      </div>

      <div style={{ padding: '80px 72px 60px', display: 'flex', alignItems: 'center', background: c2Palette.off, color: c2Palette.ink }}>
        <div style={{ width: '100%', maxWidth: 440, padding: '40px 36px', borderRadius: 8, background: '#fff', border: `2px solid ${c2Palette.gold}` }}>
          <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em' }}>Sign in</div>
          <div style={{ marginTop: 4, fontSize: 12, color: c2Palette.inkSoft, fontFamily: c2Palette.displayFont, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Trainer · sponsor · staff</div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="Work email" value="ola@sherise.ng" palette={c2Palette} />
            <FormField label="Password" value="••••••••••" palette={c2Palette} />
          </div>
          <div style={{ marginTop: 16 }}>
            <PButton label="Sign in" palette={c2Palette} size="lg" />
          </div>
          <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 6, background: c2Palette.plum, color: c2Palette.cream, fontSize: 11, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon.check size={14} style={{ color: c2Palette.gold, marginTop: 2, flexShrink: 0 }} />
            <div style={{ lineHeight: 1.5 }}>All access is <b style={{ color: c2Palette.gold }}>audited</b>. Downloads require documented purpose.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ PARTICIPANTS LIST ============ */
function C2AdminParticipants() {
  const rows = [
    { n: 'Amara Okafor', lga: 'Akure S., Ondo', cohort: '04', skill: 'Tailoring', progress: 62, milestones: 7, streak: 42, status: 'ACTIVE' },
    { n: 'Blessing Eze', lga: 'Ondo West, Ondo', cohort: '04', skill: 'Tailoring', progress: 74, milestones: 8, streak: 51, status: 'ACTIVE' },
    { n: 'Chidera Nwafor', lga: 'Onitsha N.', cohort: '03', skill: 'Alumnae', progress: 100, milestones: 12, streak: 82, status: 'ALUMNA' },
    { n: 'Fatima Sani', lga: 'Kano N.', cohort: '04', skill: 'Catering', progress: 48, milestones: 5, streak: 28, status: 'ACTIVE' },
    { n: 'Ese Adejumo', lga: 'Ikeja, Lagos', cohort: '04', skill: 'Hair', progress: 35, milestones: 3, streak: 14, status: 'SUPPORT' },
    { n: 'Ada Iheanacho', lga: 'Enugu N.', cohort: '05', skill: 'Business', progress: 12, milestones: 1, streak: 6, status: 'NEW' },
    { n: 'Ngozi Ibe', lga: 'Aba S., Abia', cohort: '04', skill: 'Book-kp', progress: 58, milestones: 6, streak: 32, status: 'ACTIVE' },
    { n: 'Halima Yusuf', lga: 'Kaduna N.', cohort: '04', skill: 'Catering', progress: 71, milestones: 7, streak: 44, status: 'ACTIVE' },
  ];
  const statusTone = { ACTIVE: c2Palette.gold, ALUMNA: c2Palette.magenta, SUPPORT: '#B4463B', NEW: c2Palette.gold };
  const soft = 'rgba(245,239,230,0.65)';
  const border = 'rgba(232,184,74,0.15)';
  const cardBg = 'rgba(245,239,230,0.04)';

  return (
    <AdminShell palette={c2Palette} activeNav="participants" title="Participants" subtitle="2,847 total · Sep 2026">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 16 }}>
        <div style={{ display: 'flex', border: `1px solid ${border}`, borderRadius: 6, background: cardBg, overflow: 'hidden' }}>
          {['ALL', 'ACTIVE', 'NEW', 'SUPPORT', 'ALUMNAE'].map((t, i) => (
            <div key={t} style={{ padding: '7px 14px', fontSize: 11, fontFamily: c2Palette.displayFont, fontWeight: 700, letterSpacing: '0.06em', borderRight: i < 4 ? `1px solid ${border}` : 'none', background: i === 1 ? c2Palette.gold : 'transparent', color: i === 1 ? c2Palette.plum : soft }}>{t}</div>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: soft, fontFamily: 'IBM Plex Mono, monospace' }}>2,847 · 8 SHOWN</div>
      </div>

      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 60px 1fr 1.4fr 90px 80px 100px', padding: '12px 20px', background: c2Palette.plumMid, fontSize: 10, letterSpacing: '0.14em', color: c2Palette.gold, textTransform: 'uppercase', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>
          <div>NAME</div><div>LGA</div><div>COHORT</div><div>SKILL</div><div>PROGRESS</div><div>MEDALS</div><div>STREAK</div><div>STATUS</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 60px 1fr 1.4fr 90px 80px 100px', padding: '14px 20px', borderTop: `1px solid ${border}`, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Avatar name={r.n} size={30} palette="bold" />
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: c2Palette.displayFont }}>{r.n}</div>
            </div>
            <div style={{ fontSize: 12, color: soft }}>{r.lga}</div>
            <div style={{ fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', color: c2Palette.gold, letterSpacing: '0.08em' }}>{r.cohort}</div>
            <div style={{ fontSize: 12 }}>{r.skill}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(245,239,230,0.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.progress}%`, background: `linear-gradient(90deg, ${c2Palette.magenta}, ${c2Palette.gold})` }} />
              </div>
              <div style={{ fontSize: 11, color: c2Palette.gold, fontFamily: 'IBM Plex Mono, monospace', minWidth: 30 }}>{r.progress}%</div>
            </div>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 18, color: c2Palette.gold }}>{r.milestones}</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12 }}>
              <Icon.flame size={12} style={{ color: c2Palette.magenta }} />
              <span style={{ fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{r.streak}d</span>
            </div>
            <div>
              <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 3, background: statusTone[r.status], color: r.status === 'ACTIVE' || r.status === 'NEW' ? c2Palette.plum : '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', fontFamily: c2Palette.displayFont }}>{r.status}</div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

/* ============ PARTICIPANT DETAIL ============ */
function C2AdminParticipantDetail() {
  const cardBg = 'rgba(245,239,230,0.04)';
  const border = 'rgba(232,184,74,0.15)';
  const soft = 'rgba(245,239,230,0.65)';

  return (
    <AdminShell palette={c2Palette} activeNav="participants" subtitle="Sep 2026">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 20 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.gold, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>PARTICIPANT</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar name="Amara Okafor" size={64} palette="bold" ring={c2Palette.gold} />
              <div>
                <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 30, lineHeight: 1, letterSpacing: '-0.03em' }}>Amara Okafor</div>
                <div style={{ fontSize: 11, color: soft, marginTop: 4, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em' }}>27 · AKURE S., ONDO</div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[{ l: 'COHORT', v: '04' }, { l: 'JOINED', v: 'MAY 12' }, { l: 'SKILL', v: 'TAILORING' }, { l: 'LANG', v: 'YORÙBÁ' }].map((s, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(232,184,74,0.06)', borderRadius: 4, border: `1px solid ${border}` }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: c2Palette.gold, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{s.l}</div>
                  <div style={{ marginTop: 3, fontSize: 13, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 20, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.gold, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>TRAINER NOTES · PRIVATE</div>
            <div style={{ marginTop: 12, padding: '12px', borderRadius: 4, background: 'rgba(232,184,74,0.05)', fontFamily: c2Palette.displayFont, fontWeight: 500, fontSize: 15, lineHeight: 1.5, letterSpacing: '-0.01em' }}>
              "Amara has strong hands. She is beginning to lead in the Ondo circle."
            </div>
            <div style={{ marginTop: 6, fontSize: 10, color: soft, fontFamily: 'IBM Plex Mono, monospace' }}>— GRACE M. · AUG 30</div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { l: 'PATHWAY', v: '62%', s: '5 / 8', tone: c2Palette.gold },
              { l: 'MEDALS', v: '7', s: 'of 12', tone: c2Palette.gold },
              { l: 'EARNED', v: '₦18k', s: '+₦4.5k wk', tone: c2Palette.magenta },
              { l: 'STREAK', v: '42d', s: 'run', tone: c2Palette.gold },
            ].map((k, i) => (
              <div key={i} style={{ padding: 14, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: c2Palette.gold, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{k.l}</div>
                <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4, color: k.tone }}>{k.v}</div>
                <div style={{ fontSize: 10, color: soft, marginTop: 3, fontFamily: 'IBM Plex Mono, monospace' }}>{k.s}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: 20, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Income · 8 weeks</div>
                <div style={{ fontSize: 11, color: soft, marginTop: 2 }}>Self-reported, trainer-verified</div>
              </div>
              <div className="mono" style={{ fontSize: 11, color: c2Palette.gold, letterSpacing: '0.08em' }}>+184%</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Spark data={[400, 1200, 1800, 1600, 2400, 3600, 4200, 4500]} color={c2Palette.gold} width={640} height={80} />
            </div>
          </div>

          <div style={{ padding: 20, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Timeline</div>
            <div style={{ marginTop: 16, position: 'relative', paddingLeft: 24 }}>
              <div style={{ position: 'absolute', left: 8, top: 6, bottom: 6, width: 2, background: 'rgba(232,184,74,0.2)' }} />
              {[
                { d: 'AUG 28', t: 'First paying job · ₦4,500', tone: c2Palette.magenta },
                { d: 'AUG 12', t: 'Sewing kit received', tone: c2Palette.gold },
                { d: 'JUL 30', t: 'Bodice block · 92%', tone: c2Palette.gold },
                { d: 'JUL 15', t: 'Skill picked: Tailoring', tone: c2Palette.gold },
                { d: 'MAY 12', t: 'Enrolled · Cohort 04', tone: 'rgba(245,239,230,0.4)' },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: 12, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -24, top: 3, width: 16, height: 16, borderRadius: 3, background: r.tone, border: `2px solid ${c2Palette.plum}` }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, fontFamily: c2Palette.displayFont }}>{r.t}</div>
                    <div style={{ fontSize: 10, color: soft, fontFamily: 'IBM Plex Mono, monospace' }}>{r.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

/* ============ REFERRALS ============ */
function C2AdminReferrals() {
  const cardBg = 'rgba(245,239,230,0.04)';
  const border = 'rgba(232,184,74,0.15)';
  const soft = 'rgba(245,239,230,0.65)';

  return (
    <AdminShell palette={c2Palette} activeNav="referrals" title="Referral pipeline" subtitle="Last 90 days">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24, letterSpacing: '-0.03em' }}>Referred → Enrolled</div>
              <div className="mono" style={{ fontSize: 11, color: c2Palette.gold, letterSpacing: '0.08em' }}>CONV · 33.8%</div>
            </div>

            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', alignItems: 'center', gap: 4 }}>
              {[
                { l: 'REFERRED', v: 3842, pct: 100, tone: 'rgba(245,239,230,0.06)' },
                { arrow: true, drop: '-42.1%' },
                { l: 'SCREENED', v: 2224, pct: 58, tone: 'rgba(232,184,74,0.15)' },
                { arrow: true, drop: '-23.4%' },
                { l: 'ELIGIBLE', v: 1704, pct: 44, tone: 'rgba(212,48,110,0.2)' },
                { arrow: true, drop: '-23.7%' },
                { l: 'ENROLLED', v: 1300, pct: 34, tone: c2Palette.magenta, fg: '#fff' },
              ].map((s, i) => {
                if (s.arrow) return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Icon.chevronRight size={20} style={{ color: soft }} />
                    <div className="mono" style={{ fontSize: 9, color: '#EF6E6E', letterSpacing: '0.08em' }}>{s.drop}</div>
                  </div>
                );
                return (
                  <div key={i} style={{ background: s.tone, color: s.fg || c2Palette.cream, padding: '22px 16px', borderRadius: 6, textAlign: 'center', border: !s.fg ? `1px solid ${border}` : 'none' }}>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', opacity: 0.9, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{s.l}</div>
                    <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', marginTop: 4, lineHeight: 1 }}>{s.v.toLocaleString()}</div>
                    <div style={{ fontSize: 11, marginTop: 4, opacity: 0.9, fontFamily: 'IBM Plex Mono, monospace' }}>{s.pct}%</div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[{ l: 'No-show at screening', v: 1618, pct: 42 }, { l: 'Not eligible', v: 520, pct: 23 }, { l: 'Withdrew after eligibility', v: 404, pct: 24 }].map((r, i) => (
                <div key={i} style={{ padding: 14, background: 'rgba(232,184,74,0.06)', borderRadius: 6, border: `1px solid ${border}` }}>
                  <div className="mono" style={{ fontSize: 9, color: c2Palette.gold, letterSpacing: '0.14em', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>DROP</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, fontFamily: c2Palette.displayFont }}>{r.l}</div>
                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22 }}>{r.v.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: soft }}>{r.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Top LGA conversion</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { l: 'Ondo Central', ratio: '58%', v: 220 },
                { l: 'Anambra East', ratio: '52%', v: 165 },
                { l: 'Lagos Mainland', ratio: '48%', v: 412 },
                { l: 'Kaduna North', ratio: '39%', v: 122 },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 10, borderBottom: i < 3 ? `1px dashed ${border}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{r.l}</div>
                    <div style={{ fontSize: 10, color: soft, marginTop: 2, fontFamily: 'IBM Plex Mono, monospace' }}>{r.v} ENROLLED</div>
                  </div>
                  <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22, color: c2Palette.gold, letterSpacing: '-0.03em' }}>{r.ratio}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 20, background: 'rgba(212,48,110,0.15)', border: `2px solid ${c2Palette.magenta}`, borderRadius: 8 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.magenta, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>SIGNAL</div>
            <div style={{ marginTop: 6, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 20, lineHeight: 1.2, letterSpacing: '-0.02em' }}>Ondo Central's screening no-show is 12 pts below platform average.</div>
            <div style={{ marginTop: 8, fontSize: 12, color: soft, lineHeight: 1.5 }}>Investigate: SMS reminders? Roll to other LGAs.</div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

/* ============ CONTENT LIBRARY ============ */
function C2AdminContent() {
  const cardBg = 'rgba(245,239,230,0.04)';
  const border = 'rgba(232,184,74,0.15)';
  const soft = 'rgba(245,239,230,0.65)';
  const lessons = [
    { path: 'TAILORING', mod: '04', title: 'Cutting a uniform pattern', dur: '12 min', views: 2214, completion: 78 },
    { path: 'TAILORING', mod: '05', title: 'Zip insertion', dur: '9 min', views: 1876, completion: 71 },
    { path: 'CATERING', mod: '02', title: 'Costing your jollof rice', dur: '11 min', views: 1522, completion: 82 },
    { path: 'FINANCIAL', mod: '05', title: 'Understanding profit', dur: '10 min', views: 1102, completion: 68 },
    { path: 'HAIR', mod: '03', title: 'Client safety & hygiene', dur: '7 min', views: 908, completion: 91 },
    { path: 'BOOK-KP', mod: '02', title: 'Recording daily sales', dur: '8 min', views: 812, completion: 65 },
  ];
  return (
    <AdminShell palette={c2Palette} activeNav="content" title="Content library" subtitle="34 lessons · 5 pathways">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 16 }}>
        <div style={{ padding: '7px 14px', border: `1px solid ${border}`, borderRadius: 6, background: cardBg, fontSize: 11, color: soft, fontFamily: c2Palette.displayFont, fontWeight: 700, letterSpacing: '0.08em' }}>ALL PATHWAYS</div>
        <div style={{ padding: '7px 14px', border: `1px solid ${border}`, borderRadius: 6, background: cardBg, fontSize: 11, color: soft, fontFamily: c2Palette.displayFont, fontWeight: 700, letterSpacing: '0.08em' }}>ENGLISH</div>
        <div style={{ padding: '7px 14px', border: `1px solid ${border}`, borderRadius: 6, background: cardBg, fontSize: 11, color: soft, fontFamily: c2Palette.displayFont, fontWeight: 700, letterSpacing: '0.08em' }}>PUBLISHED</div>
        <div style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 6, background: c2Palette.magenta, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: c2Palette.displayFont, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon.plus size={12} /> NEW LESSON
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {lessons.map((l, i) => (
          <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 6, overflow: 'hidden' }}>
            <Photo label={l.title} tone={c2Palette.magentaDeep} dark style={{ aspectRatio: '16/9' }} />
            <div style={{ padding: '14px 16px' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: c2Palette.gold, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{l.path} · M{l.mod}</div>
              <div style={{ marginTop: 6, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 20, lineHeight: 1.15, letterSpacing: '-0.02em' }}>{l.title}</div>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {[{ l: 'DUR', v: l.dur }, { l: 'VIEWS', v: l.views.toLocaleString() }, { l: 'DONE', v: l.completion + '%' }].map((s, si) => (
                  <div key={si}>
                    <div className="mono" style={{ fontSize: 9, color: soft, letterSpacing: '0.14em', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{s.l}</div>
                    <div style={{ fontSize: 13, fontFamily: c2Palette.displayFont, fontWeight: 700, marginTop: 2 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

/* ============ REPORTS ============ */
function C2AdminReports() {
  const cardBg = 'rgba(245,239,230,0.04)';
  const border = 'rgba(232,184,74,0.15)';
  const soft = 'rgba(245,239,230,0.65)';
  return (
    <AdminShell palette={c2Palette} activeNav="reports" title="Reports &amp; exports">
      <div style={{ padding: 24, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
        <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24, letterSpacing: '-0.03em' }}>Standard reports</div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { title: 'MONTHLY PROGRAMME REPORT', period: 'AUG 2026', size: '3.2 MB · PDF', tone: c2Palette.gold },
            { title: 'QUARTERLY FUNDER PACK', period: 'Q3 2026', size: '8.1 MB · PDF+XLSX', tone: c2Palette.magenta },
            { title: 'COMMUNITY PERCEPTION SUMMARY', period: 'AUG 2026', size: '1.4 MB · PDF', tone: c2Palette.gold },
            { title: 'REFERRAL PARTNER SCORECARD', period: 'AUG 2026', size: '840 KB · XLSX', tone: c2Palette.magenta },
            { title: 'TRAINER PERFORMANCE', period: 'AUG 2026', size: '620 KB · PDF', tone: c2Palette.gold },
          ].map((r, i) => (
            <div key={i} style={{ padding: '14px 16px', borderRadius: 6, background: 'rgba(232,184,74,0.06)', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 4, background: r.tone, color: r.tone === c2Palette.gold ? c2Palette.plum : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.download size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, fontFamily: c2Palette.displayFont, letterSpacing: '0.02em' }}>{r.title}</div>
                <div style={{ fontSize: 10, color: soft, marginTop: 3, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em' }}>{r.period} · {r.size}</div>
              </div>
              <div style={{ padding: '7px 14px', borderRadius: 4, background: c2Palette.gold, color: c2Palette.plum, fontSize: 11, fontWeight: 800, fontFamily: c2Palette.displayFont, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Download</div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

/* ============ BROADCASTS ============ */
function C2AdminBroadcasts() {
  const cardBg = 'rgba(245,239,230,0.04)';
  const border = 'rgba(232,184,74,0.15)';
  const soft = 'rgba(245,239,230,0.65)';
  return (
    <AdminShell palette={c2Palette} activeNav="broadcasts" title="Broadcasts" subtitle="Announcements to circles, cohorts, or the platform">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <div style={{ padding: 24, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
          <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24, letterSpacing: '-0.03em' }}>Compose broadcast</div>
          <div style={{ fontSize: 12, color: soft, marginTop: 2 }}>Cannot include program-history language.</div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="Audience" value="Cohort 04 · Ondo (24 women)" palette={c2Palette} />
            <FormField label="Title" value="Week 4 gathering — bring your offcuts" palette={c2Palette} />
            <div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: c2Palette.gold, fontFamily: c2Palette.displayFont, fontWeight: 700, marginBottom: 6 }}>BODY</div>
              <div style={{ padding: '12px 14px', borderRadius: 4, background: '#fff', color: c2Palette.ink, border: `1px solid ${c2Palette.line}`, minHeight: 100, fontSize: 13, lineHeight: 1.5 }}>
                Sisters — Friday at 10am we'll practice French seams on real work. Bring any fabric offcuts. See you then. — Grace
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 4, background: c2Palette.magenta, color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: c2Palette.displayFont, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Send broadcast</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 20, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
          <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>Sent recently</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { t: 'Ondo — pattern day', reach: 24, opened: 22, when: 'SEP 02' },
              { t: 'All cohorts — safety refresher', reach: 2847, opened: 1804, when: 'SEP 01' },
              { t: 'Kano — kitchen visit', reach: 42, opened: 39, when: 'AUG 28' },
            ].map((b, i) => (
              <div key={i} style={{ padding: '12px 14px', borderRadius: 6, background: 'rgba(232,184,74,0.06)', border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{b.t}</div>
                  <div style={{ fontSize: 10, color: soft, fontFamily: 'IBM Plex Mono, monospace' }}>{b.when}</div>
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: soft }}>
                  {b.reach.toLocaleString()} recipients · <b style={{ color: c2Palette.gold, fontFamily: c2Palette.displayFont }}>{Math.round(b.opened / b.reach * 100)}%</b> opened
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

/* ============ TRAINERS ============ */
function C2AdminTrainers() {
  const cardBg = 'rgba(245,239,230,0.04)';
  const border = 'rgba(232,184,74,0.15)';
  const soft = 'rgba(245,239,230,0.65)';
  const trainers = [
    { n: 'Grace Ma.', lga: 'Ondo C.', skill: 'Tailoring', cohorts: 3, rating: 4.9 },
    { n: 'Ade Ola.', lga: 'Ikeja', skill: 'Business', cohorts: 4, rating: 4.7 },
    { n: 'Halima B.', lga: 'Kano N.', skill: 'Catering', cohorts: 2, rating: 4.8 },
    { n: 'Chika E.', lga: 'Onitsha', skill: 'Book-kp', cohorts: 3, rating: 4.6 },
  ];
  const sponsors = [
    { n: 'Deloitte Nigeria', kind: 'CORPORATE', women: 210, since: '2024' },
    { n: 'UN Women', kind: 'PARTNER', women: 468, since: '2023' },
    { n: 'MacArthur Fdn.', kind: 'GRANT', women: 1200, since: '2022' },
    { n: 'Access Bank', kind: 'CORPORATE', women: 84, since: '2025' },
  ];
  return (
    <AdminShell palette={c2Palette} activeNav="trainers" title="Trainers &amp; sponsors">
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <div style={{ padding: 24, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24, letterSpacing: '-0.03em' }}>Trainers</div>
            <div style={{ padding: '6px 12px', borderRadius: 4, background: c2Palette.magenta, color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: c2Palette.displayFont, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Invite</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 60px 60px', padding: '10px 16px', fontSize: 10, letterSpacing: '0.14em', color: c2Palette.gold, textTransform: 'uppercase', fontFamily: c2Palette.displayFont, fontWeight: 700, background: c2Palette.plumMid }}>
              <div>NAME</div><div>LGA</div><div>SKILL</div><div>COH.</div><div>★</div>
            </div>
            {trainers.map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 60px 60px', padding: '12px 16px', borderTop: `1px solid ${border}`, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Avatar name={t.n} size={26} palette="bold" ring={c2Palette.gold} />
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{t.n}</div>
                </div>
                <div style={{ fontSize: 12, color: soft }}>{t.lga}</div>
                <div style={{ fontSize: 12 }}>{t.skill}</div>
                <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 16, color: c2Palette.gold }}>{t.cohorts}</div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <Icon.spark size={12} style={{ color: c2Palette.gold }} />
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{t.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 24, background: cardBg, border: `1px solid ${border}`, borderRadius: 8 }}>
          <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24, letterSpacing: '-0.03em' }}>Sponsors</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sponsors.map((s, i) => (
              <div key={i} style={{ padding: '12px 14px', borderRadius: 6, background: 'rgba(232,184,74,0.06)', border: `1px solid ${border}`, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 4, background: c2Palette.gold, color: c2Palette.plum, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 18 }}>{s.n[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{s.n}</div>
                  <div className="mono" style={{ fontSize: 9, color: soft, marginTop: 2, letterSpacing: '0.14em', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{s.kind} · SINCE {s.since}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 20, color: c2Palette.gold }}>{s.women.toLocaleString()}</div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: soft }}>WOMEN</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

/* ============ STATES ============ */
function C2EmptyFeed() {
  return (
    <div className="sr-mobile-stage" style={{ background: c2Palette.off }}>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Empty feed">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 26, letterSpacing: '-0.03em' }}>SHE<span style={{ color: c2Palette.magenta }}>.</span></div>
            <Icon.bell size={20} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', maxWidth: 280 }}>
              <div style={{ width: 88, height: 88, borderRadius: 12, background: c2Palette.plum, color: c2Palette.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: `0 12px 30px -12px ${c2Palette.magenta}` }}>
                <Icon.spark size={36} />
              </div>
              <div style={{ marginTop: 20, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.05 }}>Your movement<br />starts now.</div>
              <div style={{ marginTop: 8, fontSize: 13, color: c2Palette.inkSoft, lineHeight: 1.55 }}>Post your first win or join a circle nearby. Even a hopeful sentence counts.</div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PButton label="Browse circles" palette={c2Palette} icon={<Icon.chevronRight size={16} />} />
              </div>
            </div>
          </div>
        </div>
        <TabBar palette={c2Palette} active="home" />
      </Phone>
    </div>
  );
}

function C2NoWifi() {
  return (
    <div className="sr-mobile-stage" style={{ background: c2Palette.off }}>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Offline mode">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24 }}>Learn</div>
            <Icon.filter size={20} />
          </div>
          <div style={{ margin: '4px 20px 12px', padding: '10px 12px', borderRadius: 6, background: c2Palette.gold, color: c2Palette.plum, display: 'flex', gap: 10, alignItems: 'center' }}>
            <Icon.flame size={16} />
            <div style={{ flex: 1, fontSize: 12, fontWeight: 700, fontFamily: c2Palette.displayFont, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Offline — showing downloads</div>
            <div style={{ fontSize: 11, fontWeight: 800, fontFamily: c2Palette.displayFont, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Retry</div>
          </div>
          <div style={{ padding: '0 20px', flex: 1, overflow: 'hidden' }}>
            {[
              { t: 'Cutting a uniform', dur: '12 MIN', size: '18 MB', ready: true },
              { t: 'Zip insertion', dur: '9 MIN', size: '14 MB', ready: true },
              { t: 'Bodice block draft', dur: '15 MIN', size: '22 MB', ready: true },
            ].map((l, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: `1px solid ${c2Palette.line}`, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 4, background: c2Palette.magenta, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.play size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{l.t}</div>
                  <div className="mono" style={{ fontSize: 10, color: c2Palette.inkLight, marginTop: 2, letterSpacing: '0.08em' }}>{l.dur} · {l.size}</div>
                </div>
                <div style={{ padding: '3px 8px', borderRadius: 3, background: c2Palette.gold, color: c2Palette.plum, fontSize: 10, fontWeight: 800, fontFamily: c2Palette.displayFont, letterSpacing: '0.08em' }}>READY</div>
              </div>
            ))}
          </div>
        </div>
        <TabBar palette={c2Palette} active="learn" />
      </Phone>
    </div>
  );
}

function C2Error() {
  return (
    <div className="sr-mobile-stage" style={{ background: c2Palette.off }}>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Error · retry">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Icon.chevronLeft size={22} />
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 16 }}>Feed</div>
            <div style={{ width: 22 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', maxWidth: 280 }}>
              <div style={{ width: 80, height: 80, borderRadius: 12, background: c2Palette.magenta, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <Icon.flame size={36} />
              </div>
              <div style={{ marginTop: 18, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em' }}>We couldn't reach the circle.</div>
              <div style={{ marginTop: 8, fontSize: 13, color: c2Palette.inkSoft, lineHeight: 1.55 }}>Network hiccup. Your unsent posts are safe.</div>
              <div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'center' }}>
                <PButton label="Retry" palette={c2Palette} full={false} />
                <PButton label="View downloads" palette={c2Palette} variant="ghost" full={false} />
              </div>
            </div>
          </div>
        </div>
        <TabBar palette={c2Palette} active="home" />
      </Phone>
    </div>
  );
}

Object.assign(window, {
  C2AdminLogin, C2AdminParticipants, C2AdminParticipantDetail, C2AdminReferrals,
  C2AdminContent, C2AdminReports, C2AdminBroadcasts, C2AdminTrainers,
  C2EmptyFeed, C2NoWifi, C2Error,
});
