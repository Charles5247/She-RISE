// Concept 2 — Participant app screens (Bold & Empowering)
// 14 screens paralleling C1

function C2AppStage({ children }) {
  return (
    <div className="sr-mobile-stage" style={{
      background: `radial-gradient(1400px 800px at 100% 0%, rgba(232,184,74,0.12), transparent 55%), radial-gradient(1000px 700px at 10% 100%, rgba(212,48,110,0.10), transparent 55%), ${c2Palette.off}`,
    }}>
      {children}
    </div>
  );
}

function C2PhoneScr({ label, active = 'home', children }) {
  return (
    <Phone bg={c2Palette.off} fg={c2Palette.ink} label={label}>
      {children}
      <TabBar palette={c2Palette} active={active} />
    </Phone>
  );
}

/* ============ POST DETAIL ============ */
function C2PostDetail() {
  return (
    <C2AppStage>
      <C2PhoneScr label="Post detail · celebration">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Icon.chevronLeft size={22} />
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Blessing's win</div>
            <Icon.more />
          </div>

          {/* Hero */}
          <div style={{ margin: '4px 20px 12px', borderRadius: 8, overflow: 'hidden', background: c2Palette.plum, color: c2Palette.cream, position: 'relative' }}>
            <Photo label="uniform · finished" tone={c2Palette.magentaDeep} dark style={{ aspectRatio: '4/3' }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 40%, ${c2Palette.plum} 100%)` }} />
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 4, background: c2Palette.gold, color: c2Palette.plum, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              <Icon.medal size={11} /> First income
            </div>
            <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
              <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 700, fontSize: 18, lineHeight: 1.15 }}>
                "Small money, but it's mine."
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Avatar name="Blessing E" size={36} palette="bold" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>Blessing E.</div>
              <div style={{ fontSize: 10, color: c2Palette.inkSoft, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em' }}>2H · ONDO CIRCLE</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 4, background: c2Palette.plum, color: c2Palette.gold, fontSize: 11, fontWeight: 700, fontFamily: c2Palette.displayFont }}>
              <Icon.flame size={11} /> 51d
            </div>
          </div>

          <div style={{ padding: '12px 20px 0', flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              Finished my first paying alteration job today — three school uniforms. She paid ₦4,500.
            </div>

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: c2Palette.inkSoft }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c2Palette.magenta, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>
                <Icon.heart size={16} filled /> 24
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon.comment size={16} /> 6</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon.share size={16} /> 3</div>
            </div>

            {/* Comments */}
            <div style={{ marginTop: 14 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: c2Palette.inkLight, textTransform: 'uppercase', marginBottom: 8, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>Comments</div>
              {[
                { n: 'Grace M', role: 'TRAINER', time: '1H', body: 'The seam on the sleeve is beautiful. Well done.' },
                { n: 'Amina Y', time: '45M', body: 'Starting my first sample this weekend!' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: `1px solid ${c2Palette.line}` }}>
                  <Avatar name={c.n} size={28} palette="bold" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{c.n}</div>
                      {c.role && <div style={{ fontSize: 9, padding: '1px 6px', background: c2Palette.gold, color: c2Palette.plum, fontFamily: c2Palette.displayFont, fontWeight: 700, letterSpacing: '0.1em' }}>{c.role}</div>}
                      <div style={{ marginLeft: 'auto', fontSize: 10, color: c2Palette.inkLight, fontFamily: 'IBM Plex Mono, monospace' }}>{c.time}</div>
                    </div>
                    <div style={{ marginTop: 3, fontSize: 12, lineHeight: 1.4 }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </C2PhoneScr>
    </C2AppStage>
  );
}

/* ============ NOTIFICATIONS ============ */
function C2Notifications() {
  return (
    <C2AppStage>
      <C2PhoneScr label="Notifications">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Signals</div>
            <div style={{ fontSize: 11, color: c2Palette.magenta, fontWeight: 700, fontFamily: c2Palette.displayFont, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mark all read</div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            {['Today', 'Earlier this week'].map((label, gi) => (
              <div key={gi}>
                <div className="mono" style={{ padding: '8px 20px', fontSize: 10, letterSpacing: '0.16em', color: c2Palette.gold, textTransform: 'uppercase', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{label}</div>
                {(gi === 0 ? [
                  { who: 'Grace M', kind: 'trainer', body: 'commented on your post', time: '10m' },
                  { who: 'Amina Y', kind: 'cheer', body: 'cheered your milestone', time: '45m' },
                  { who: 'SheRISE', kind: 'system', body: 'You unlocked "Pricing for profit"', time: '2h' },
                ] : [
                  { who: 'Ondo Circle', kind: 'circle', body: 'Friday gathering at 10am', time: 'Mon' },
                  { who: 'Sister Grace', kind: 'trainer', body: 'private note', time: 'Sun' },
                ]).map((n, i) => (
                  <div key={i} style={{ padding: '10px 20px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar name={n.who} size={38} palette="bold" />
                      <div style={{
                        position: 'absolute', right: -3, bottom: -3,
                        width: 18, height: 18, borderRadius: 4,
                        background: n.kind === 'cheer' ? c2Palette.magenta : n.kind === 'trainer' ? c2Palette.gold : n.kind === 'system' ? c2Palette.magenta : c2Palette.gold,
                        color: n.kind === 'trainer' ? c2Palette.plum : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${c2Palette.off}`,
                      }}>
                        {n.kind === 'cheer' ? <Icon.heart size={9} filled /> : n.kind === 'trainer' ? <Icon.check size={10} /> : <Icon.spark size={10} />}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                        <b style={{ fontFamily: c2Palette.displayFont }}>{n.who}</b> <span style={{ color: c2Palette.inkSoft }}>{n.body}</span>
                      </div>
                      <div style={{ fontSize: 10, color: c2Palette.inkLight, marginTop: 2, fontFamily: 'IBM Plex Mono, monospace' }}>{n.time.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </C2PhoneScr>
    </C2AppStage>
  );
}

/* ============ CIRCLES ============ */
function C2Circles() {
  return (
    <C2AppStage>
      <C2PhoneScr label="Circles">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Circles</div>
            <Icon.search size={20} />
          </div>

          <div style={{ padding: '0 20px 12px', display: 'flex', gap: 6 }}>
            {['All', 'Near me', 'Tailoring', 'Alumnae'].map((t, i) => (
              <div key={i} style={{ padding: '5px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: i === 0 ? c2Palette.gold : 'transparent', color: i === 0 ? c2Palette.plum : c2Palette.inkSoft, border: i === 0 ? 'none' : `1px solid ${c2Palette.line}`, fontFamily: c2Palette.displayFont, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t}</div>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'hidden', paddingBottom: 82 }}>
            {[
              { l: 'Ondo Central', m: 24, joined: true, tone: c2Palette.magenta },
              { l: 'Akure South Tailors', m: 18, joined: true, tone: c2Palette.gold },
              { l: 'Lagos Mainland', m: 62, tone: c2Palette.magenta },
              { l: 'Alumnae · 2025', m: 84, tone: c2Palette.gold },
              { l: 'Kano North', m: 41, tone: c2Palette.magenta },
              { l: 'Enugu Cooks', m: 22, tone: c2Palette.gold },
            ].map((c, i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: `1px solid ${c2Palette.line}`, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 6, background: c.tone, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em' }}>{c.l[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{c.l}</div>
                  <div style={{ fontSize: 11, color: c2Palette.inkLight, marginTop: 2, fontFamily: 'IBM Plex Mono, monospace' }}>{c.m} SISTERS</div>
                </div>
                <div style={{ padding: '5px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: c.joined ? 'transparent' : c2Palette.magenta, color: c.joined ? c2Palette.inkSoft : '#fff', border: c.joined ? `1px solid ${c2Palette.line}` : 'none', fontFamily: c2Palette.displayFont, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {c.joined ? 'Joined' : 'Join'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </C2PhoneScr>
    </C2AppStage>
  );
}

/* ============ TRAINING HOME ============ */
function C2TrainingHome() {
  return (
    <C2AppStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Pathway home">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>Learn</div>
            <Icon.filter size={20} />
          </div>

          <div style={{ margin: '4px 20px 0', padding: '20px', borderRadius: 8, background: c2Palette.plum, color: c2Palette.cream, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${c2Palette.magenta}, transparent 70%)`, opacity: 0.5 }} />
            <div style={{ position: 'relative' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.gold, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>CURRENT PATHWAY</div>
              <div style={{ marginTop: 6, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 38, letterSpacing: '-0.03em', lineHeight: 1 }}>Tailoring</div>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>3 / 8 modules</div>
                  <div style={{ marginTop: 6, width: 180, height: 5, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '37.5%', background: c2Palette.gold }} />
                  </div>
                </div>
                <div style={{ padding: '7px 14px', background: c2Palette.gold, color: c2Palette.plum, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Continue</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '18px 20px 0', flex: 1, overflow: 'hidden' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.inkLight, textTransform: 'uppercase', marginBottom: 8, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>MODULES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { n: '01', l: 'Measuring the body', dur: '8 min', s: 'done' },
                { n: '02', l: 'Basic seams', dur: '11 min', s: 'done' },
                { n: '03', l: 'Bodice block draft', dur: '15 min', s: 'done' },
                { n: '04', l: 'Cutting a uniform', dur: '12 min', s: 'current' },
                { n: '05', l: 'Zip insertion', dur: '9 min', s: 'locked' },
                { n: '06', l: 'Fitting adjustments', dur: '10 min', s: 'locked' },
              ].map((m, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 6,
                  background: m.s === 'current' ? c2Palette.plum : 'transparent',
                  color: m.s === 'current' ? c2Palette.cream : c2Palette.ink,
                  border: m.s === 'current' ? `2px solid ${c2Palette.gold}` : 'none',
                  display: 'flex', gap: 12, alignItems: 'center',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 4, background: m.s === 'done' ? c2Palette.magenta : m.s === 'current' ? c2Palette.gold : c2Palette.creamDeep, color: m.s === 'locked' ? c2Palette.inkLight : (m.s === 'current' ? c2Palette.plum : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 12 }}>
                    {m.s === 'done' ? <Icon.check size={16} /> : m.n}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: m.s === 'current' ? 700 : 500, fontFamily: c2Palette.displayFont, color: m.s === 'locked' ? c2Palette.inkLight : (m.s === 'current' ? c2Palette.cream : c2Palette.ink) }}>{m.l}</div>
                    <div style={{ fontSize: 10, color: m.s === 'current' ? c2Palette.gold : c2Palette.inkLight, marginTop: 1, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em' }}>{m.dur.toUpperCase()}</div>
                  </div>
                  {m.s === 'current' && <Icon.chevronRight size={16} style={{ color: c2Palette.gold }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
        <TabBar palette={c2Palette} active="learn" />
      </Phone>
    </C2AppStage>
  );
}

/* ============ LESSON COMPLETE ============ */
function C2LessonComplete() {
  // Already very close to C2TrainingScreen — reuse
  return <C2TrainingScreen />;
}

/* ============ MILESTONE DETAIL ============ */
function C2MilestoneDetail() {
  return (
    <C2AppStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Milestone · First income">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Icon.chevronLeft size={22} />
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.inkLight, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>MILESTONE 07 / 12</div>
            <Icon.share size={20} />
          </div>

          <div style={{ margin: '10px 20px 0', borderRadius: 8, overflow: 'hidden', background: c2Palette.plum, color: c2Palette.cream, position: 'relative' }}>
            <Photo label="uniform · delivered" tone={c2Palette.magentaDeep} dark style={{ aspectRatio: '4/3' }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 30%, ${c2Palette.plum} 100%)` }} />
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <div style={{ padding: '5px 12px', borderRadius: 4, background: c2Palette.gold, color: c2Palette.plum, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Milestone · Aug 28</div>
            </div>
            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
              <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 34, lineHeight: 0.95, letterSpacing: '-0.03em' }}>First income.</div>
              <div style={{ marginTop: 6, fontFamily: c2Palette.displayFont, fontWeight: 700, fontSize: 22, color: c2Palette.gold }}>₦4,500</div>
            </div>
          </div>

          <div style={{ padding: '16px 20px 0', flex: 1, overflow: 'hidden' }}>
            <div style={{ padding: '14px', borderRadius: 6, background: '#fff', border: `1px solid ${c2Palette.line}` }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.inkLight, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>STORY</div>
              <div style={{ marginTop: 6, fontFamily: c2Palette.displayFont, fontWeight: 700, fontSize: 18, lineHeight: 1.25, color: c2Palette.ink, letterSpacing: '-0.01em' }}>
                "Three uniforms. My first ₦4,500 nobody handed to me."
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { l: 'Amount', v: '₦4.5k', tone: c2Palette.magenta },
                { l: 'Client', v: 'Mrs. Ade', tone: c2Palette.gold },
                { l: 'Verified', v: 'Grace M.', tone: c2Palette.plum },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px', borderRadius: 6, background: c2Palette.creamDeep, border: `1px solid ${c2Palette.line}` }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: c2Palette.inkLight, fontFamily: c2Palette.displayFont, fontWeight: 700, textTransform: 'uppercase' }}>{s.l}</div>
                  <div style={{ marginTop: 2, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 16, color: s.tone, letterSpacing: '-0.02em' }}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, padding: '12px', borderRadius: 6, background: c2Palette.creamDeep, border: `1px solid ${c2Palette.magenta}`, fontSize: 12, color: c2Palette.inkSoft, lineHeight: 1.5 }}>
              <b style={{ color: c2Palette.magenta, fontFamily: c2Palette.displayFont, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Note:</b> This income is a receipt of your work — not of your history.
            </div>
          </div>

          <div style={{ padding: '14px 20px 20px' }}>
            <PButton label="Share this milestone" palette={c2Palette} icon={<Icon.share size={16} />} size="lg" />
          </div>
        </div>
      </Phone>
    </C2AppStage>
  );
}

/* ============ PROFILE ============ */
function C2Profile() {
  return (
    <C2AppStage>
      <C2PhoneScr label="My profile" active="me">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Icon.chevronLeft size={22} />
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Me</div>
            <Icon.more />
          </div>

          {/* Hero */}
          <div style={{ margin: '4px 20px 0', padding: '20px', borderRadius: 8, background: c2Palette.plum, color: c2Palette.cream, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${c2Palette.magenta}, transparent 70%)`, opacity: 0.4 }} />
            <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'center' }}>
              <Avatar name="Amara O" size={68} palette="bold" ring={c2Palette.gold} />
              <div>
                <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1 }}>Amara O.</div>
                <div style={{ fontSize: 11, color: c2Palette.gold, marginTop: 4, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em' }}>ONDO · COHORT 04</div>
              </div>
            </div>
            <div style={{ position: 'relative', marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[{ l: 'MEDALS', v: '7' }, { l: 'STREAK', v: '42d' }, { l: 'EARNED', v: '₦18k' }].map((s, i) => (
                <div key={i} style={{ padding: '8px', borderRadius: 4, background: 'rgba(245,239,230,0.08)', border: `1px solid rgba(232,184,74,0.2)` }}>
                  <div className="mono" style={{ fontSize: 9, color: c2Palette.gold, letterSpacing: '0.14em', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{s.l}</div>
                  <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 18, marginTop: 2 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Linked */}
          <div style={{ padding: '16px 20px 0' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: c2Palette.inkLight, textTransform: 'uppercase', marginBottom: 8, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>LINKED ACCOUNTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '10px 12px', borderRadius: 6, background: '#1877F2', color: '#fff', display: 'flex', gap: 10, alignItems: 'center' }}>
                <Icon.fb size={18} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>Facebook</div>
                  <div style={{ fontSize: 10, opacity: 0.85 }}>Amara Okafor · connected</div>
                </div>
                <div style={{ padding: '3px 8px', borderRadius: 3, background: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, fontFamily: c2Palette.displayFont, letterSpacing: '0.08em' }}>ON</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 6, background: '#fff', border: `1px solid ${c2Palette.line}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 26, height: 26, borderRadius: 4, background: '#0A66C2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.li size={14} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>LinkedIn</div>
                  <div style={{ fontSize: 10, color: c2Palette.inkLight }}>Not connected</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 4, background: c2Palette.magenta, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: c2Palette.displayFont, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Connect</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px 90px', flex: 1, overflow: 'hidden' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: c2Palette.inkLight, textTransform: 'uppercase', marginBottom: 8, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>RECENT</div>
            {[{ l: 'First income · ₦4,500', d: 'Aug 28' }, { l: 'Sewing kit', d: 'Aug 12' }, { l: 'Bodice block passed', d: 'Jul 30' }].map((r, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${c2Palette.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: c2Palette.displayFont }}>{r.l}</div>
                <div style={{ fontSize: 10, color: c2Palette.inkLight, fontFamily: 'IBM Plex Mono, monospace' }}>{r.d.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </C2PhoneScr>
    </C2AppStage>
  );
}

/* ============ EDIT PROFILE ============ */
function C2EditProfile() {
  return (
    <C2AppStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Edit profile">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: c2Palette.inkSoft, fontFamily: c2Palette.displayFont, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Cancel</div>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Edit profile</div>
            <div style={{ fontSize: 13, color: c2Palette.magenta, fontFamily: c2Palette.displayFont, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Save</div>
          </div>
          <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Avatar name="Amara O" size={80} palette="bold" ring={c2Palette.gold} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: c2Palette.magenta, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${c2Palette.off}` }}>
                <Icon.camera size={12} />
              </div>
            </div>
          </div>
          <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="First name" value="Amara" palette={c2Palette} />
            <FormField label="Bio" value="Learning to make school uniforms. Ondo Central." palette={c2Palette} />
            <FormField label="LGA" value="Akure South, Ondo" palette={c2Palette} suffix={<Icon.chevronRight size={14} />} />
            <FormField label="Language" value="English" palette={c2Palette} suffix={<Icon.chevronRight size={14} />} />
          </div>
        </div>
      </Phone>
    </C2AppStage>
  );
}

/* ============ SETTINGS ============ */
function C2Settings() {
  return (
    <C2AppStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Settings">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Icon.chevronLeft size={22} />
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Settings</div>
            <div style={{ width: 22 }} />
          </div>
          <div style={{ padding: '0 20px', flex: 1, overflow: 'hidden' }}>
            {[
              { h: 'ACCOUNT', items: [{ l: 'Edit profile' }, { l: 'Phone', v: '+234 805…' }, { l: 'Password', chev: true }] },
              { h: 'LANGUAGE & DATA', items: [{ l: 'App language', v: 'English' }, { l: 'Wifi-only downloads', on: true, toggle: true }] },
              { h: 'SAFETY', items: [{ l: 'Panic hide', on: true, toggle: true, warn: true }, { l: 'Blocked · 2', chev: true }] },
            ].map((g, gi) => (
              <div key={gi} style={{ marginTop: 14 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.gold, marginBottom: 6, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{g.h}</div>
                <div style={{ borderRadius: 6, background: '#fff', border: `1px solid ${c2Palette.line}`, overflow: 'hidden' }}>
                  {g.items.map((it, i) => (
                    <div key={i} style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8, borderTop: i > 0 ? `1px solid ${c2Palette.lineSoft}` : 'none' }}>
                      <div style={{ flex: 1, fontSize: 13, color: it.warn ? c2Palette.magenta : c2Palette.ink, fontWeight: it.warn ? 700 : 500, fontFamily: c2Palette.displayFont }}>{it.l}</div>
                      {it.toggle ? (
                        <div style={{ width: 34, height: 20, borderRadius: 10, background: it.on ? c2Palette.magenta : c2Palette.line, position: 'relative' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, [it.on ? 'right' : 'left']: 2 }} />
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 11, color: c2Palette.inkLight, fontFamily: 'IBM Plex Mono, monospace' }}>{it.v}</div>
                          {it.chev && <Icon.chevronRight size={14} style={{ color: c2Palette.inkLight }} />}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: c2Palette.magenta, fontFamily: c2Palette.displayFont, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Log out
            </div>
          </div>
        </div>
      </Phone>
    </C2AppStage>
  );
}

/* ============ TRAINER CHAT ============ */
function C2TrainerChat() {
  const msgs = [
    { from: 'trainer', body: 'Your bodice block came back beautifully. Zip insertion Friday?', time: '9:04' },
    { from: 'me', body: 'Yes Sister. I have the fabric.', time: '9:12' },
    { from: 'trainer', body: 'Bring extra thread too.', time: '9:13' },
    { from: 'me', body: 'Thank you 🙏', time: '9:14' },
    { from: 'trainer', body: 'And well done on the paying job. That is real.', time: '9:20' },
  ];
  return (
    <C2AppStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Chat · Sister Grace">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: `1px solid ${c2Palette.line}` }}>
            <Icon.chevronLeft size={22} />
            <Avatar name="Grace M" size={36} palette="bold" ring={c2Palette.gold} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: c2Palette.displayFont }}>Sister Grace</div>
              <div className="mono" style={{ fontSize: 9, color: c2Palette.gold, letterSpacing: '0.14em', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>TRAINER · ONLINE</div>
            </div>
            <Icon.more />
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%' }}>
                  <div style={{
                    padding: '9px 13px', borderRadius: 8,
                    background: m.from === 'me' ? c2Palette.magenta : '#fff',
                    color: m.from === 'me' ? '#fff' : c2Palette.ink,
                    border: m.from === 'me' ? 'none' : `1px solid ${c2Palette.line}`,
                    fontSize: 13, lineHeight: 1.4,
                  }}>{m.body}</div>
                  <div style={{ fontSize: 9, color: c2Palette.inkLight, marginTop: 3, textAlign: m.from === 'me' ? 'right' : 'left', fontFamily: 'IBM Plex Mono, monospace' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 16px 26px', borderTop: `1px solid ${c2Palette.line}`, display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 4, background: c2Palette.creamDeep, color: c2Palette.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.plus size={16} />
            </div>
            <div style={{ flex: 1, padding: '9px 14px', borderRadius: 6, background: '#fff', border: `1px solid ${c2Palette.line}`, fontSize: 13, color: c2Palette.inkLight }}>Message…</div>
            <div style={{ width: 34, height: 34, borderRadius: 4, background: c2Palette.magenta, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.chevronRight size={16} />
            </div>
          </div>
        </div>
      </Phone>
    </C2AppStage>
  );
}

/* ============ HELP & SAFETY ============ */
function C2HelpSafety() {
  return (
    <C2AppStage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Help & safety · panic hide">
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Icon.chevronLeft size={22} />
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Safety</div>
            <div style={{ width: 22 }} />
          </div>

          <div style={{ margin: '4px 20px 0', padding: '18px', borderRadius: 8, background: c2Palette.magenta, color: '#fff' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 6, background: c2Palette.gold, color: c2Palette.plum, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.flame size={22} />
              </div>
              <div>
                <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>In danger right now?</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Reach a counsellor in seconds.</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, padding: '10px 12px', borderRadius: 4, background: c2Palette.gold, color: c2Palette.plum, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center' }}>Call 08000-SHERISE</div>
              <div style={{ padding: '10px 14px', borderRadius: 4, background: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: c2Palette.displayFont, fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Text</div>
            </div>
          </div>

          <div style={{ margin: '14px 20px 0', padding: '14px', borderRadius: 6, background: c2Palette.plum, color: c2Palette.cream, border: `2px solid ${c2Palette.gold}` }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon.spark size={16} style={{ color: c2Palette.gold }} />
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: c2Palette.displayFont }}>Panic hide gesture</div>
              <div style={{ marginLeft: 'auto', width: 32, height: 20, borderRadius: 10, background: c2Palette.gold, position: 'relative' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: c2Palette.plum, position: 'absolute', top: 2, right: 2 }} />
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.85, lineHeight: 1.5 }}>
              Long-press the home indicator to hide SheRISE behind a Calculator screen until you PIN back in.
            </div>
          </div>

          <div style={{ padding: '16px 20px 0', flex: 1, overflow: 'hidden' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: c2Palette.inkLight, textTransform: 'uppercase', marginBottom: 8, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>SUPPORT</div>
            {['Report a person', 'Report a bug', 'Suggest a feature', 'Contact my trainer'].map((l, i) => (
              <div key={i} style={{ padding: '12px 0', borderTop: i > 0 ? `1px solid ${c2Palette.line}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 4, background: c2Palette.creamDeep, color: c2Palette.magenta, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.chevronRight size={14} /></div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, fontFamily: c2Palette.displayFont }}>{l}</div>
                <Icon.chevronRight size={14} style={{ color: c2Palette.inkLight }} />
              </div>
            ))}
          </div>
        </div>
      </Phone>
    </C2AppStage>
  );
}

Object.assign(window, {
  C2PostDetail, C2Notifications, C2Circles, C2TrainingHome, C2LessonComplete,
  C2MilestoneDetail, C2Profile, C2EditProfile, C2Settings, C2TrainerChat, C2HelpSafety,
});
