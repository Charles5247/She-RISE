// Concept 2 — Auth & onboarding (Bold & Empowering)
// Same 7 screens as C1, in bold editorial voice

function C2AuthShell({ title, subtitle, children }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 22px 24px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: c2Palette.creamDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.chevronLeft size={18} />
        </div>
        <div className="mono" style={{ fontFamily: c2Palette.displayFont, fontSize: 12, letterSpacing: '0.2em', color: c2Palette.gold, textTransform: 'uppercase', fontWeight: 700 }}>
          SHE.
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 36, lineHeight: 0.95, letterSpacing: '-0.03em' }}>{title}</div>
        {subtitle && <div style={{ marginTop: 8, fontSize: 13, color: c2Palette.inkSoft, lineHeight: 1.5, maxWidth: 300 }}>{subtitle}</div>}
      </div>
      <div style={{ marginTop: 20, flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function C2Stage({ children }) {
  return (
    <div className="sr-mobile-stage" style={{
      background: `radial-gradient(1400px 800px at 100% 0%, rgba(232,184,74,0.12), transparent 55%), radial-gradient(1000px 700px at 10% 100%, rgba(212,48,110,0.10), transparent 55%), ${c2Palette.off}`,
    }}>
      {children}
    </div>
  );
}

function C2Preloader() {
  return (
    <div className="sr-mobile-stage" style={{ background: `linear-gradient(180deg, ${c2Palette.plum} 0%, ${c2Palette.plumMid} 100%)` }}>
      <Phone bg={c2Palette.plum} fg={c2Palette.cream} label="Preloader · bold editorial">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(232,184,74,0.2), transparent 70%)`, filter: 'blur(20px)' }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 88, height: 88, borderRadius: 12,
              background: c2Palette.gold, color: c2Palette.plum,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: c2Palette.displayFont, fontWeight: 900, fontSize: 44, letterSpacing: '-0.05em',
              boxShadow: '0 20px 40px -12px rgba(232,184,74,0.6)',
            }}>SR</div>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 56, letterSpacing: '-0.04em', color: c2Palette.cream }}>
              SHE<span style={{ color: c2Palette.gold }}>.</span>
            </div>
            <div style={{ fontSize: 12, color: c2Palette.gold, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: c2Palette.displayFont, fontWeight: 700 }}>A movement.</div>
          </div>
          <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 160, height: 3, background: 'rgba(232,184,74,0.15)', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: c2Palette.gold }} />
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'rgba(245,239,230,0.5)', textTransform: 'uppercase' }}>Loading your rise…</div>
          </div>
        </div>
      </Phone>
    </div>
  );
}

function C2Welcome() {
  return (
    <C2Stage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Welcome · slide 2 of 3">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: c2Palette.inkSoft, fontFamily: c2Palette.displayFont, fontWeight: 600 }}>SKIP</div>
            <div className="mono" style={{ fontFamily: c2Palette.displayFont, fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: c2Palette.magenta }}>2 / 3</div>
            <div style={{ fontSize: 13, color: 'transparent' }}>SKIP</div>
          </div>

          <div style={{ padding: '18px 20px 0' }}>
            <div style={{ borderRadius: 8, overflow: 'hidden', height: 340, position: 'relative' }}>
              <Photo label="women in workshop" tone={c2Palette.magentaDeep} dark style={{ height: '100%', borderRadius: 8 }} />
              <div style={{ position: 'absolute', top: 14, left: 14 }}>
                <div style={{ padding: '4px 10px', borderRadius: 6, background: c2Palette.gold, color: c2Palette.plum, fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>02 · Skill</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '30px 22px 20px' }}>
            <div style={{ fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 44, lineHeight: 0.92, letterSpacing: '-0.03em', color: c2Palette.ink }}>
              Learn a skill.<br /><span style={{ color: c2Palette.magenta }}>Own the money.</span>
            </div>
            <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.55, color: c2Palette.inkSoft, maxWidth: 320 }}>
              Tailoring, catering, hairdressing — pick one and finish it your way. Every lesson works offline.
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ padding: '0 22px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[false, true, false].map((on, i) => (
                <div key={i} style={{ flex: 1, height: 3, background: on ? c2Palette.magenta : c2Palette.creamDeep }} />
              ))}
            </div>
            <PButton label="Continue" palette={c2Palette} icon={<Icon.chevronRight size={16} />} size="lg" />
          </div>
        </div>
      </Phone>
    </C2Stage>
  );
}

function C2SignUp() {
  return (
    <C2Stage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Sign up · phone or email">
        <C2AuthShell title="Join the movement" subtitle="Your name, your pace, your rise.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="Phone number" prefix="+234" value="805 471 2233" palette={c2Palette} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: c2Palette.inkLight, fontFamily: c2Palette.displayFont, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <div style={{ flex: 1, height: 1, background: c2Palette.line }} />
              OR
              <div style={{ flex: 1, height: 1, background: c2Palette.line }} />
            </div>
            <FormField label="Email" placeholder="you@example.com" palette={c2Palette} />
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 18, height: 18, borderRadius: 3, border: `1.5px solid ${c2Palette.magenta}`, background: c2Palette.magenta, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <Icon.check size={12} style={{ color: '#fff' }} />
            </div>
            <div style={{ fontSize: 12, color: c2Palette.inkSoft, lineHeight: 1.45 }}>
              I accept the SheRISE <b style={{ color: c2Palette.magenta }}>Terms</b> and <b style={{ color: c2Palette.magenta }}>Privacy Notice</b>.
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PButton label="Continue" palette={c2Palette} size="lg" />
            <div style={{ fontSize: 12, color: c2Palette.inkSoft, textAlign: 'center', fontFamily: c2Palette.displayFont, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              Have an account? <b style={{ color: c2Palette.magenta }}>Log in</b>
            </div>
          </div>
        </C2AuthShell>
      </Phone>
    </C2Stage>
  );
}

function C2OTP() {
  return (
    <C2Stage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Verify · 6-digit code">
        <C2AuthShell title="Confirm your number" subtitle="We sent a code to +234 805 471 2233.">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
            {['4', '8', '2', '1', '', ''].map((d, i) => (
              <div key={i} style={{
                width: 46, height: 60, borderRadius: 8,
                border: `2px solid ${d ? c2Palette.magenta : c2Palette.line}`,
                background: d ? '#fff' : c2Palette.off,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: c2Palette.displayFont, fontWeight: 800, fontSize: 32, color: d ? c2Palette.magenta : c2Palette.inkLight,
              }}>{d}</div>
            ))}
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: c2Palette.inkSoft, fontFamily: c2Palette.displayFont, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
            Didn't get it? <b style={{ color: c2Palette.magenta }}>Resend in 0:24</b>
          </div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PButton label="Verify" palette={c2Palette} size="lg" />
            <PButton label="Change number" palette={c2Palette} variant="ghost" size="lg" />
          </div>
        </C2AuthShell>
      </Phone>
    </C2Stage>
  );
}

function C2CreateProfile() {
  return (
    <C2Stage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Create profile · you">
        <C2AuthShell title="Tell us who you are" subtitle="Only your first name and LGA are shown.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <Avatar name="Amara O" size={84} palette="bold" ring={c2Palette.gold} />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderRadius: '50%', background: c2Palette.magenta, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${c2Palette.off}` }}>
                  <Icon.camera size={14} />
                </div>
              </div>
              <div className="mono" style={{ fontSize: 10, color: c2Palette.inkLight, letterSpacing: '0.14em' }}>OPTIONAL</div>
            </div>

            <FormField label="First name" value="Amara" palette={c2Palette} />
            <FormField label="Last name (private)" value="Okafor" palette={c2Palette} />
            <FormField label="Age" value="27" palette={c2Palette} suffix="years" />
            <FormField label="Your LGA" value="Ondo · Akure South" palette={c2Palette} suffix={<Icon.pin size={14} style={{ color: c2Palette.magenta }} />} />
          </div>

          <div style={{ marginTop: 20 }}>
            <PButton label="Continue" palette={c2Palette} size="lg" />
          </div>
        </C2AuthShell>
      </Phone>
    </C2Stage>
  );
}

function C2PickPath() {
  return (
    <C2Stage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Language">
        <C2AuthShell title="Pick your language" subtitle="You can change this anytime.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { l: 'English', native: 'English', on: true },
              { l: 'Yoruba', native: 'Yorùbá' },
              { l: 'Hausa', native: 'Hausa' },
              { l: 'Igbo', native: 'Ìgbò' },
            ].map((lang, i) => (
              <div key={i} style={{
                padding: '14px 16px', borderRadius: 6,
                background: lang.on ? c2Palette.plum : '#fff',
                color: lang.on ? c2Palette.cream : c2Palette.ink,
                border: `2px solid ${lang.on ? c2Palette.gold : c2Palette.line}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: c2Palette.displayFont }}>{lang.l}</div>
                  <div style={{ fontSize: 11, color: lang.on ? c2Palette.gold : c2Palette.inkLight, marginTop: 2 }}>{lang.native}</div>
                </div>
                {lang.on && <div style={{ padding: '3px 8px', borderRadius: 4, background: c2Palette.gold, color: c2Palette.plum, fontFamily: c2Palette.displayFont, fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SELECTED</div>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <PButton label="Continue" palette={c2Palette} size="lg" />
          </div>
        </C2AuthShell>
      </Phone>

      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Pick your skill">
        <C2AuthShell title="Your first skill" subtitle="You can start another one later.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { l: 'Tailoring', hint: '8 mod · 6 wk', on: true, tone: c2Palette.magenta },
              { l: 'Catering', hint: '10 mod · 8 wk', tone: c2Palette.gold },
              { l: 'Hairdressing', hint: '6 mod · 5 wk', tone: c2Palette.magenta },
              { l: 'Small business', hint: '8 mod · 6 wk', tone: c2Palette.gold },
              { l: 'Digital literacy', hint: '5 mod · 4 wk', tone: c2Palette.magenta },
              { l: 'Book-keeping', hint: '7 mod · 6 wk', tone: c2Palette.gold },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '14px 12px', borderRadius: 6,
                background: s.on ? c2Palette.plum : '#fff',
                color: s.on ? c2Palette.cream : c2Palette.ink,
                border: s.on ? `2px solid ${c2Palette.gold}` : `1px solid ${c2Palette.line}`,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: s.tone, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.medal size={16} />
                </div>
                <div style={{ marginTop: 10, fontSize: 13, fontFamily: c2Palette.displayFont, fontWeight: 700 }}>{s.l}</div>
                <div style={{ fontSize: 10, color: s.on ? c2Palette.gold : c2Palette.inkLight, marginTop: 2, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.06em' }}>{s.hint}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <PButton label="Start Tailoring" palette={c2Palette} icon={<Icon.chevronRight size={16} />} size="lg" />
          </div>
        </C2AuthShell>
      </Phone>
    </C2Stage>
  );
}

function C2Login() {
  return (
    <C2Stage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Login">
        <C2AuthShell title="Welcome back" subtitle="Log in to your movement.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormField label="Phone or email" value="+234 805 471 2233" palette={c2Palette} />
            <FormField label="Password" value="••••••••" palette={c2Palette} suffix={<Icon.chevronRight size={14} />} />
          </div>
          <div style={{ marginTop: 12, textAlign: 'right', fontSize: 12, color: c2Palette.magenta, fontFamily: c2Palette.displayFont, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Forgot password?
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PButton label="Log in" palette={c2Palette} size="lg" />
            <div style={{ fontSize: 12, color: c2Palette.inkSoft, textAlign: 'center', fontFamily: c2Palette.displayFont, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              New here? <b style={{ color: c2Palette.magenta }}>Create account</b>
            </div>
          </div>

          <div style={{ marginTop: 32, padding: '14px', border: `2px solid ${c2Palette.gold}`, borderRadius: 8, background: c2Palette.plum, color: c2Palette.cream, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: c2Palette.gold, color: c2Palette.plum, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.check size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: c2Palette.displayFont, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Trainer or sponsor?</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>Sign in to admin</div>
            </div>
            <Icon.chevronRight size={16} />
          </div>
        </C2AuthShell>
      </Phone>
    </C2Stage>
  );
}

function C2Forgot() {
  return (
    <C2Stage>
      <Phone bg={c2Palette.off} fg={c2Palette.ink} label="Forgot password">
        <C2AuthShell title="Reset password" subtitle="We'll send you a link. It works for 15 minutes.">
          <FormField label="Phone or email" value="+234 805 471 2233" palette={c2Palette} />
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 6, background: c2Palette.creamDeep, fontSize: 12, color: c2Palette.inkSoft, lineHeight: 1.45, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon.check size={14} style={{ color: c2Palette.magenta, marginTop: 2, flexShrink: 0 }} />
            <div>Your identity is safe. SheRISE never mentions program history in communications.</div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PButton label="Send reset link" palette={c2Palette} size="lg" />
            <PButton label="Back to login" palette={c2Palette} variant="ghost" size="lg" />
          </div>
        </C2AuthShell>
      </Phone>
    </C2Stage>
  );
}

Object.assign(window, {
  C2Preloader, C2Welcome, C2SignUp, C2OTP, C2CreateProfile, C2PickPath, C2Login, C2Forgot,
});
