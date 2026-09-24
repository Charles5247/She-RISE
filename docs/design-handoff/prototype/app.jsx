/* SheRISE Bold & Empowering — design reference prototype (C2 only) */

const { useState, useEffect, useCallback } = React;

const INVENTORY = [
  {
    g: 'Onboarding & Auth',
    items: [
      { k: 'preloader',      l: 'Preloader',        C: 'C2Preloader' },
      { k: 'welcome',        l: 'Welcome carousel', C: 'C2Welcome' },
      { k: 'signup',         l: 'Sign up',          C: 'C2SignUp' },
      { k: 'otp',            l: 'Verify code (OTP)', C: 'C2OTP' },
      { k: 'create-profile', l: 'Create profile',   C: 'C2CreateProfile' },
      { k: 'pick-path',      l: 'Language & skill', C: 'C2PickPath' },
      { k: 'login',          l: 'Login',            C: 'C2Login' },
      { k: 'forgot',         l: 'Forgot password',  C: 'C2Forgot' },
    ],
  },
  {
    g: 'Participant App',
    items: [
      { k: 'feed',            l: 'Community feed',      C: 'C2FeedScreen' },
      { k: 'composer',        l: 'Feed composer',       C: 'C2FeedScreen' },
      { k: 'post-detail',     l: 'Post detail',         C: 'C2PostDetail' },
      { k: 'notifications',   l: 'Notifications',       C: 'C2Notifications' },
      { k: 'circles',         l: 'Circles directory',   C: 'C2Circles' },
      { k: 'training-home',   l: 'Skill pathway home',  C: 'C2TrainingHome' },
      { k: 'lesson',          l: 'Lesson detail',       C: 'C2TrainingScreen' },
      { k: 'lesson-complete', l: 'Lesson complete',     C: 'C2LessonComplete' },
      { k: 'progress',        l: 'Progress tracker',    C: 'C2ProgressScreen' },
      { k: 'milestone',       l: 'Milestone detail',    C: 'C2MilestoneDetail' },
      { k: 'profile',         l: 'My profile',          C: 'C2Profile' },
      { k: 'edit-profile',    l: 'Edit profile',        C: 'C2EditProfile' },
      { k: 'settings',        l: 'Settings',            C: 'C2Settings' },
      { k: 'trainer-chat',    l: 'Trainer chat',        C: 'C2TrainerChat' },
      { k: 'help-safety',     l: 'Help & safety',       C: 'C2HelpSafety' },
    ],
  },
  {
    g: 'Admin Web',
    items: [
      { k: 'admin-login',        l: 'Admin login',           C: 'C2AdminLogin' },
      { k: 'admin-overview',     l: 'Dashboard home',        C: 'C2AdminScreen' },
      { k: 'admin-participants', l: 'Participants list',     C: 'C2AdminParticipants' },
      { k: 'admin-participant',  l: 'Participant detail',    C: 'C2AdminParticipantDetail' },
      { k: 'admin-referrals',    l: 'Referral pipeline',     C: 'C2AdminReferrals' },
      { k: 'admin-content',      l: 'Content library',       C: 'C2AdminContent' },
      { k: 'admin-reports',      l: 'Reports & exports',     C: 'C2AdminReports' },
      { k: 'admin-broadcasts',   l: 'Broadcasts',            C: 'C2AdminBroadcasts' },
      { k: 'admin-trainers',     l: 'Trainers & sponsors',   C: 'C2AdminTrainers' },
    ],
  },
  {
    g: 'States',
    items: [
      { k: 'empty-feed', l: 'Empty feed (newcomer)', C: 'C2EmptyFeed' },
      { k: 'no-wifi',    l: 'Offline mode',          C: 'C2NoWifi' },
      { k: 'error',      l: 'Error / retry',         C: 'C2Error' },
    ],
  },
];

const flat = INVENTORY.flatMap(g => g.items);

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h || 'feed';
}

function App() {
  const [screen, setScreen] = useState(() => {
    if (window.location.hash) return parseHash();
    return localStorage.getItem('sr-c2-screen') || 'feed';
  });

  useEffect(() => {
    const hash = `#/${screen}`;
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
    localStorage.setItem('sr-c2-screen', screen);
  }, [screen]);

  useEffect(() => {
    const onHash = () => {
      const s = parseHash();
      if (s !== screen && flat.find(f => f.k === s)) setScreen(s);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [screen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const keys = flat.map(f => f.k);
      const idx = keys.indexOf(screen);
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setScreen(keys[(idx + 1) % keys.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setScreen(keys[(idx - 1 + keys.length) % keys.length]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen]);

  const activeItem = flat.find(i => i.k === screen) || flat[0];
  const Comp = window[activeItem.C];
  const isDesktop = activeItem.k.startsWith('admin-');

  return (
    <>
      {/* Header */}
      <div className="sr-dirbar">
        <div className="sr-dirbar-item" data-active="true" data-concept="c2">
          <span className="dot" style={{ background: '#D4306E' }} />
          SheRISE · Bold &amp; Empowering
        </div>
        <div className="sr-dirbar-hint">
          <span className="sr-kbd">←</span><span className="sr-kbd">→</span>
          <span style={{ marginLeft: 4 }}>screens</span>
        </div>
      </div>

      {/* Left rail */}
      <div className="sr-screenbar">
        {INVENTORY.map((g, gi) => (
          <details key={g.g} open={gi < 2 || g.items.some(it => it.k === screen)}>
            <summary>{g.g} <span className="group-count">{g.items.length}</span></summary>
            {g.items.map((it, i) => (
              <div
                key={it.k}
                className="sr-screenbar-item"
                data-active={screen === it.k}
                data-concept="c2"
                onClick={() => setScreen(it.k)}
              >
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                {it.l}
              </div>
            ))}
          </details>
        ))}
      </div>

      {/* Main */}
      <div className="sr-canvas" data-concept="c2">
        <div style={{ width: '100%', maxWidth: 1440 }}>
          <div className="sr-frame-label">
            <div className="concept-tag">
              <span className="swatch" style={{ background: '#D4306E' }} />
              <span>Bold &amp; Empowering</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{activeItem.l}</span>
            </div>
            <div className="title">{activeItem.l}</div>
            <div>{isDesktop ? 'DESKTOP · 1440' : 'MOBILE · 390'}</div>
          </div>
          <div className="sr-frame">
            {Comp ? <Comp /> : <div style={{ padding: 60, textAlign: 'center', color: '#fff' }}>Component not found: {activeItem.C}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

function bootstrap() {
  const root = document.getElementById('root');
  ReactDOM.createRoot(root).render(<App />);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
