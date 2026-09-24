// Concept 2 — Bold & Empowering
const c2Palette = {
  id: 'c2',
  plum: '#2A0E2E',
  plumMid: '#4A1F52',
  plumSoft: '#3A1740',
  magenta: '#D4306E',
  magentaDeep: '#9E1E52',
  gold: '#E8B84A',
  goldDeep: '#B08820',
  cream: '#F5EFE6',
  creamDeep: '#E8DDCB',
  off: '#F9F5EE',
  ink: '#1A0A1E',
  inkSoft: '#4A3A44',
  line: '#DED3C0',

  accent: '#D4306E',
  accentFg: '#FFFFFF',

  tabBg: 'rgba(42,14,46,0.95)',
  tabBorder: 'rgba(232,184,74,0.15)',
  tabActive: '#E8B84A',
  tabInactive: 'rgba(245,239,230,0.5)',

  mapBgA: '#3A1740',
  mapBgB: '#2A0E2E',
  mapStroke: 'rgba(232,184,74,0.3)',
  mapDot: '#E8B84A',
  mapDotHi: '#D4306E',
  mapLabel: 'rgba(245,239,230,0.7)',
};

function C2MobileStage({ children }) {
  return (
    <div className="sr-mobile-stage" style={{
      background: `radial-gradient(1400px 800px at 100% 0%, rgba(232,184,74,0.12), transparent 55%),
                   radial-gradient(1000px 700px at 10% 100%, rgba(212,48,110,0.10), transparent 55%),
                   ${c2Palette.off}`
    }}>
      {children}
    </div>
  );
}

/* ================= C2 · FEED ================= */
function C2FeedScreen() {
  return (
    <C2MobileStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Milestone hero post">
        <C2FeedHero />
        <TabBar palette={c2Palette} active="home" />
      </Phone>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Composer + amplify">
        <C2Composer />
        <TabBar palette={c2Palette} active="plus" />
      </Phone>
    </C2MobileStage>
  );
}

function C2FeedHero() {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em' }}>
          SHE<span style={{ color: c2Palette.magenta }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: 12, color: c2Palette.ink }}>
          <Icon.search size={20} />
          <div style={{ position: 'relative' }}>
            <Icon.bell size={20} />
            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: c2Palette.magenta }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 10 }}>
        {['Chidera', 'Amara', 'Grace', 'Blessing'].map((n, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Avatar name={n} size={54} palette="bold" ring={c2Palette.gold} />
            <div style={{ fontSize: 10, color: c2Palette.inkSoft }}>{n}</div>
          </div>
        ))}
      </div>

      <div style={{ margin: '0 20px', borderRadius: 12, overflow: 'hidden', background: c2Palette.plum, color: c2Palette.cream, position: 'relative' }}>
        <Photo label="portrait · Chidera" tone={c2Palette.magentaDeep} dark style={{ aspectRatio: '4/5' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 30%, ${c2Palette.plum} 100%)` }} />
        <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', gap: 8 }}>
          <div style={{ padding: '4px 10px', borderRadius: 999, background: c2Palette.gold, color: c2Palette.plum, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon.medal size={11} /> Milestone
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: c2Palette.cream, fontSize: 10, fontWeight: 600, backdropFilter: 'blur(8px)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon.flame size={11} /> 42 day streak
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 22, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            "My name is on the shop sign now."
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name="Chidera E" size={26} palette="bold" />
            <div style={{ fontSize: 12, fontWeight: 600 }}>Chidera E.</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>· Anambra · 3h</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16, color: c2Palette.inkSoft, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c2Palette.magenta, fontWeight: 700 }}>
          <Icon.heart size={18} filled /> 284
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon.comment size={18} /> 47
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon.share size={18} /> 18
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: c2Palette.plum, color: c2Palette.gold, fontSize: 10, fontWeight: 600 }}>
          <Icon.fb size={10} /><Icon.li size={10} /> shared
        </div>
      </div>

      <div style={{ margin: '0 20px', padding: '12px 0', borderTop: `1px solid ${c2Palette.line}` }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Avatar name="Amara O" size={36} palette="bold" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Amara O.</div>
            <div style={{ fontSize: 11, color: c2Palette.inkSoft }}>Ondo · 6h</div>
          </div>
          <div style={{ padding: '3px 8px', borderRadius: 999, background: c2Palette.gold, color: c2Palette.plum, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Week 4 done</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: c2Palette.ink, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, lineHeight: 1.35 }}>
          Finished bodice block. My hands finally know the pattern without looking.
        </div>
      </div>
    </div>
  );
}

function C2Composer() {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, color: c2Palette.inkSoft }}>Close</div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18 }}>New post</div>
        <div style={{ background: c2Palette.magenta, color: '#fff', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif" }}>PUBLISH</div>
      </div>

      <div style={{ margin: '6px 20px 0', padding: '12px 14px', borderRadius: 10,
        background: `linear-gradient(135deg, ${c2Palette.plum} 0%, ${c2Palette.plumMid} 100%)`, color: c2Palette.cream }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: c2Palette.gold, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>
          Tag a milestone
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { l: 'First income', on: true, icon: 'medal' },
            { l: 'Week complete', icon: 'check' },
            { l: 'New skill', icon: 'spark' },
            { l: 'None', icon: null },
          ].map((m, i) => {
            const IconEl = m.icon ? Icon[m.icon] : null;
            return (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: m.on ? c2Palette.gold : 'rgba(245,239,230,0.08)',
                color: m.on ? c2Palette.plum : c2Palette.cream,
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}>
                {IconEl && <IconEl size={12} />} {m.l}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 20px 0', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Avatar name="Amara O" size={36} palette="bold" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Amara O.</div>
            <div style={{ fontSize: 11, color: c2Palette.inkSoft }}>To: Ondo Circle · 24</div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 20, lineHeight: 1.2, color: c2Palette.ink, letterSpacing: '-0.01em' }}>
          Three uniforms. My first ₦4,500 that nobody handed to me.
        </div>

        <div style={{ marginTop: 12 }}>
          <Photo label="uniform · finished" tone={c2Palette.magentaDeep} style={{ borderRadius: 8, aspectRatio: '4/3' }} dark />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c2Palette.inkSoft, fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 6 }}>
            Amplify to
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.fb size={18} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Facebook</div>
                <div style={{ fontSize: 9, opacity: 0.85 }}>ON</div>
              </div>
              <div style={{ width: 32, height: 18, borderRadius: 10, background: 'rgba(255,255,255,0.35)', position: 'relative' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', right: 2, top: 2 }} />
              </div>
            </div>
            <div style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#0A66C2', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.li size={18} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif" }}>LinkedIn</div>
                <div style={{ fontSize: 9, opacity: 0.85 }}>ON</div>
              </div>
              <div style={{ width: 32, height: 18, borderRadius: 10, background: 'rgba(255,255,255,0.35)', position: 'relative' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', right: 2, top: 2 }} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: c2Palette.creamDeep, fontSize: 10, color: c2Palette.inkSoft, lineHeight: 1.4 }}>
            <b style={{ color: c2Palette.ink }}>Preview:</b> "First paying tailoring job. Three uniforms. #SheRISE"
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= C2 · TRAINING ================= */
function C2TrainingScreen() {
  return (
    <C2MobileStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Lesson complete · Financial Literacy">
        <C2TrainingLesson />
        <TabBar palette={c2Palette} active="learn" />
      </Phone>
    </C2MobileStage>
  );
}

function C2TrainingLesson() {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: c2Palette.off }}>
      <div style={{ padding: '10px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Icon.chevronLeft size={22} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 999, background: c2Palette.plum, color: c2Palette.gold }}>
          <Icon.flame size={14} /> <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 13 }}>12</span>
        </div>
        <Icon.more />
      </div>

      <div style={{ padding: '8px 20px' }}>
        <div style={{ height: 8, background: c2Palette.creamDeep, borderRadius: 4, overflow: 'hidden', border: `1px solid ${c2Palette.line}` }}>
          <div style={{ height: '100%', width: '80%', background: `linear-gradient(90deg, ${c2Palette.magenta} 0%, ${c2Palette.gold} 100%)`, borderRadius: 4 }} />
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: c2Palette.magenta, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>
          Lesson complete
        </div>
        <div style={{ marginTop: 10, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 40, lineHeight: 0.95, letterSpacing: '-0.03em', color: c2Palette.ink }}>
          You made it,<br /><span style={{ color: c2Palette.magenta }}>Amara.</span>
        </div>
      </div>

      <div style={{ padding: '18px 20px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${c2Palette.gold} 0%, ${c2Palette.goldDeep} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c2Palette.plum,
          boxShadow: `0 20px 40px -20px ${c2Palette.gold}, inset 0 -8px 20px rgba(0,0,0,0.15)`,
          position: 'relative',
        }}>
          <Icon.medal size={68} />
          <div style={{ position: 'absolute', inset: -10, border: `2px dashed ${c2Palette.gold}`, borderRadius: '50%', opacity: 0.4 }} />
        </div>
      </div>

      <div style={{ padding: '18px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { l: 'XP earned', v: '+48', tone: c2Palette.magenta },
          { l: 'Streak', v: '12d', tone: c2Palette.gold, deepTone: c2Palette.goldDeep },
          { l: 'Accuracy', v: '94%', tone: c2Palette.plum },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '12px 10px', borderRadius: 8,
            background: '#fff', border: `2px solid ${s.tone}`,
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, color: s.deepTone || s.tone, letterSpacing: '-0.02em' }}>{s.v}</div>
            <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: c2Palette.inkSoft, fontWeight: 600, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: c2Palette.inkSoft, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, marginBottom: 8 }}>
          Next in Financial Literacy
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '12px', borderRadius: 8, background: c2Palette.plum, color: c2Palette.cream, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: c2Palette.gold, color: c2Palette.plum, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18 }}>05</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 13 }}>Pricing for profit</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>8 min · unlocked</div>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 6, background: c2Palette.magenta, color: '#fff', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.06em' }}>START</div>
        </div>
      </div>
    </div>
  );
}

/* ================= C2 · PROGRESS ================= */
function C2ProgressScreen() {
  return (
    <C2MobileStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="My rise · progress + medals">
        <C2ProgressBody />
        <TabBar palette={c2Palette} active="progress" />
      </Phone>
    </C2MobileStage>
  );
}

function C2ProgressBody() {
  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>My rise</div>
        <Icon.share size={20} />
      </div>

      <div style={{ margin: '4px 20px 0', borderRadius: 10, background: c2Palette.plum, color: c2Palette.cream, padding: '18px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${c2Palette.magenta} 0%, transparent 70%)`, opacity: 0.5 }} />
        <div style={{ position: 'relative', display: 'flex', gap: 18, alignItems: 'center' }}>
          <Ring
            percent={68} size={100} stroke={10}
            color={c2Palette.gold}
            bg="rgba(232,184,74,0.15)"
            label="68%"
            sublabel="Complete"
            fontFamily="'Bricolage Grotesque', sans-serif"
          />
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: c2Palette.gold, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>Cohort 04 · Ondo</div>
            <div style={{ marginTop: 6, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 26, lineHeight: 1.0, letterSpacing: '-0.02em' }}>
              Amara.<br />Month 4 / 6.
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { l: 'Streak', v: '42d', icon: 'flame' },
            { l: 'Earned', v: '₦18k', icon: 'medal' },
            { l: 'Medals', v: '7', icon: 'spark' },
          ].map((s, i) => {
            const IconEl = Icon[s.icon];
            return (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 6, background: 'rgba(245,239,230,0.08)', border: `1px solid rgba(232,184,74,0.2)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: c2Palette.gold }}><IconEl size={11} /> {s.l}</div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, marginTop: 4 }}>{s.v}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '16px 20px 6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>Medals</div>
          <div style={{ fontSize: 11, color: c2Palette.inkSoft }}>7 of 12</div>
        </div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { l: 'First income', on: true, tone: c2Palette.gold },
            { l: 'First sale', on: true, tone: c2Palette.magenta },
            { l: '30d streak', on: true, tone: c2Palette.gold },
            { l: 'Pattern master', on: true, tone: c2Palette.magenta },
            { l: 'Mentor', on: false },
            { l: 'Book keeper', on: false },
            { l: 'Trainer pick', on: false },
            { l: 'Alumnae', on: false },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 10,
                background: m.on ? m.tone : c2Palette.creamDeep,
                color: m.on ? '#fff' : 'rgba(74,58,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: m.on ? 'none' : `1px dashed ${c2Palette.line}`,
              }}>
                <Icon.medal size={24} />
              </div>
              <div style={{ fontSize: 9, textAlign: 'center', color: m.on ? c2Palette.ink : c2Palette.inkSoft, fontWeight: m.on ? 700 : 400, lineHeight: 1.15, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '10px 20px 90px' }}>
        <div style={{ padding: '12px 14px', borderRadius: 8, background: c2Palette.magenta, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.share size={18} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 13 }}>Share this month's rise</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Preview appears before posting</div>
          </div>
          <Icon.chevronRight size={18} />
        </div>
      </div>
    </div>
  );
}

/* ================= C2 · ADMIN ================= */
function C2AdminScreen() {
  return (
    <div style={{
      width: '100%',
      padding: '44px 56px',
      background: c2Palette.plum,
      color: c2Palette.cream,
      minHeight: 940,
      fontFamily: "'Inter', sans-serif",
    }}>
      <C2AdminContent />
    </div>
  );
}

function C2AdminContent() {
  const cream = c2Palette.cream;
  const soft = 'rgba(245,239,230,0.65)';
  const border = 'rgba(232,184,74,0.15)';
  const cardBg = 'rgba(245,239,230,0.04)';

  return (
    <div style={{ width: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', gap: 22, color: cream }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: c2Palette.gold, color: c2Palette.plum, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: '-0.05em' }}>SR</div>
          <div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>
              SheRISE<span style={{ color: c2Palette.gold }}>.</span> Command
            </div>
            <div className="mono" style={{ fontSize: 11, color: soft, letterSpacing: '0.08em', marginTop: 4 }}>
              MOVEMENT MODE · SEPTEMBER 2026
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: cardBg, border: `1px solid ${border}`, borderRadius: 8, padding: 4 }}>
            {['30d', '90d', 'YTD', 'All'].map((t, i) => (
              <div key={i} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: i === 1 ? c2Palette.gold : 'transparent', color: i === 1 ? c2Palette.plum : soft, fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '0.02em' }}>{t}</div>
            ))}
          </div>
          <div style={{ padding: '10px 18px', borderRadius: 8, background: c2Palette.magenta, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif", letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.download size={14} /> EXPORT
          </div>
          <Avatar name="Ola A" size={36} palette="bold" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              { label: 'Respondents', value: '2,847', delta: '+184', tone: c2Palette.gold },
              { label: 'Communities', value: '34', delta: '+3', tone: c2Palette.cream },
              { label: 'LGAs', value: '12', delta: '+1', tone: c2Palette.cream },
              { label: 'Women', value: '2,102', delta: '+142', tone: c2Palette.magenta },
              { label: 'Men', value: '745', delta: '+42', tone: c2Palette.cream, hint: 'allies · sponsors' },
            ].map((k, i) => (
              <div key={i} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 14px 12px' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: soft, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>{k.label}</div>
                <div style={{ marginTop: 6, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', color: k.tone, lineHeight: 1 }}>{k.value}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: c2Palette.gold, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>{k.delta} · 30d</div>
                {k.hint && <div style={{ fontSize: 9, color: soft, fontStyle: 'italic', marginTop: 2 }}>{k.hint}</div>}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Priorities</div>
                  <div style={{ fontSize: 12, color: soft, marginTop: 2 }}>Top 6 challenges reported this quarter</div>
                </div>
                <div style={{ fontSize: 11, color: soft, fontFamily: "'IBM Plex Mono', monospace" }}>n = 2,847</div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { l: 'Startup capital', v: 68, rank: 1 },
                  { l: 'Family acceptance', v: 54, rank: 2 },
                  { l: 'Reliable customer base', v: 47, rank: 3 },
                  { l: 'Childcare during training', v: 38, rank: 4 },
                  { l: 'Housing stability', v: 30, rank: 5 },
                  { l: 'Legal ID / documents', v: 22, rank: 6 },
                ].map((row) => (
                  <div key={row.rank} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18, color: c2Palette.gold, letterSpacing: '-0.02em' }}>0{row.rank}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{row.l}</div>
                      <div style={{ marginTop: 4, height: 5, background: 'rgba(245,239,230,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${row.v}%`, background: `linear-gradient(90deg, ${c2Palette.magenta} 0%, ${c2Palette.gold} 100%)`, borderRadius: 3 }} />
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 14, color: c2Palette.gold }}>{row.v}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: 20 }}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Momentum</div>
              <div style={{ fontSize: 12, color: soft, marginTop: 2 }}>Practice streaks · this week</div>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { l: '30+ day streaks', v: 342, delta: '+58', big: true },
                  { l: '14+ day streaks', v: 812, delta: '+124' },
                  { l: 'At least 1 post', v: 1904, delta: '+312' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 10, borderBottom: i < 2 ? `1px dashed ${border}` : 'none' }}>
                    <div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: s.big ? 34 : 24, letterSpacing: '-0.03em', color: s.big ? c2Palette.gold : cream, lineHeight: 1 }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: soft, marginTop: 2 }}>{s.l}</div>
                    </div>
                    <div style={{ fontSize: 12, color: c2Palette.magenta, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>{s.delta}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 6, background: 'rgba(212,48,110,0.12)', border: `1px solid ${c2Palette.magenta}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: c2Palette.magenta, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>
                  <Icon.flame size={12} /> Signal
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: cream, lineHeight: 1.4 }}>
                  Ondo Central's streaks are 3× the platform average. Consider profiling the trainer for a case study.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Where we're rising</div>
              <div style={{ fontSize: 12, color: soft, marginTop: 2 }}>Respondents by LGA</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ padding: '4px 10px', borderRadius: 4, background: c2Palette.gold, color: c2Palette.plum, fontSize: 11, fontWeight: 700, fontFamily: "'Bricolage Grotesque', sans-serif" }}>LGA</div>
              <div style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, color: soft }}>STATE</div>
            </div>
          </div>

          <div style={{ marginTop: 4, flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <NigeriaMap palette={c2Palette} highlighted={['Lagos', 'Kano', 'Abuja', 'Ondo', 'Rivers']} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
            {[
              { l: 'Top LGA', v: 'Lagos Mainland', sub: '412 respondents' },
              { l: 'Fastest', v: 'Ondo Central', sub: '+68% MoM' },
              { l: 'Balance', v: '73% / 27%', sub: 'Women / Men' },
              { l: 'Milestones', v: '4.2 avg.', sub: 'per participant' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 6, background: 'rgba(245,239,230,0.04)', border: `1px solid ${border}` }}>
                <div style={{ fontSize: 9, color: soft, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}>{s.l}</div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 18, marginTop: 2, letterSpacing: '-0.02em', color: c2Palette.gold }}>{s.v}</div>
                <div style={{ fontSize: 10, color: soft }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Extend palette
Object.assign(c2Palette, {
  displayFont: "'Bricolage Grotesque', sans-serif",
  displayWeight: 800,
  formFont: "'Inter', sans-serif",
  labelFont: "'Bricolage Grotesque', sans-serif",
  radius: 8,
  buttonRadius: 8,
  buttonWeight: 700,
  buttonFont: "'Bricolage Grotesque', sans-serif",
  buttonUppercase: true,
  buttonSpacing: '0.06em',
  paper2: c2Palette.creamDeep,
  green: '#5F7A5A',
  red: '#B4463B',
  adminBg: c2Palette.plum,
  adminHeaderText: c2Palette.cream,
  adminHeaderSub: 'rgba(245,239,230,0.65)',
  adminLine: 'rgba(232,184,74,0.15)',
  avatarPalette: 'bold',
  logoRadius: 8,
  lineSoft: 'rgba(232,184,74,0.1)',
});

Object.assign(window, {
  C2FeedScreen, C2TrainingScreen, C2ProgressScreen, C2AdminScreen, c2Palette,
});
