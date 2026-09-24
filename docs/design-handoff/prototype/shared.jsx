// Shared components across all 3 concepts
// - Phone frame wrapper
// - Avatar (initials + gradient)
// - Photo placeholder (striped SVG + mono caption)
// - Nigeria map SVG (stylized states)
// - Small icons as inline SVG

const { useState, useEffect, useMemo, useRef } = React;

// Deterministic hash for stable avatar colors from a name
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Avatar — a gradient plate with initial(s)
function Avatar({ name, size = 40, palette = 'warm', ring = null, badge = null, style }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const h = hashStr(name);

  const palettes = {
    warm: [
      ['#E8B858', '#C55A3B'],
      ['#D89B8B', '#8B4A3B'],
      ['#C97B57', '#6B3520'],
      ['#E8C288', '#A85838'],
      ['#B78560', '#4A2D22'],
      ['#D4A574', '#8B5A3C'],
    ],
    bold: [
      ['#E8B84A', '#D4306E'],
      ['#F06292', '#2A0E2E'],
      ['#E8B84A', '#7B2D8E'],
      ['#D4306E', '#2A0E2E'],
      ['#F5A623', '#B0236A'],
      ['#7B2D8E', '#E8B84A'],
    ],
    clean: [
      ['#0F6B70', '#1A4448'],
      ['#5B8A8E', '#264447'],
      ['#8FA9AB', '#3A5658'],
      ['#446B6E', '#1A2028'],
      ['#7CA4A7', '#2E4548'],
      ['#4A7377', '#1A2028'],
    ],
  };
  const [a, b] = palettes[palette][h % palettes[palette].length];

  const fonts = {
    warm: "'Instrument Serif', serif",
    bold: "'Bricolage Grotesque', sans-serif",
    clean: "'IBM Plex Serif', serif",
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
      {ring && (
        <div style={{
          position: 'absolute', inset: -3,
          borderRadius: '50%',
          border: `2px solid ${ring}`,
        }} />
      )}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts[palette],
          fontWeight: palette === 'bold' ? 700 : 500,
          fontSize: size * 0.42,
          letterSpacing: '-0.02em',
        }}
      >
        {initials}
      </div>
      {badge && (
        <div style={{
          position: 'absolute',
          right: -2, bottom: -2,
          width: size * 0.36, height: size * 0.36,
          borderRadius: '50%',
          background: badge.bg,
          border: '2px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.2,
        }}>{badge.icon}</div>
      )}
    </div>
  );
}

// Photo placeholder
function Photo({ label, tone = '#E8DDD0', height, aspectRatio, style, dark = false, hint }) {
  return (
    <div
      className="sr-photo-ph"
      style={{
        '--ph-tone': tone,
        height,
        aspectRatio,
        color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)',
        ...style,
      }}
    >
      <div>
        {hint && <div style={{ marginBottom: 4, opacity: 0.7 }}>{hint}</div>}
        <div>[ photo: {label} ]</div>
      </div>
    </div>
  );
}

// Phone frame — status bar + home indicator, no bezel. Caption below.
function Phone({ children, bg = '#fff', fg = '#111', time = '9:41', label, labelColor }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div className="sr-phone" style={{ '--phone-bg': bg, '--phone-fg': fg }}>
        <div className="sr-phone-status">
          <span>{time}</span>
          <span className="icons">
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
              <rect x="0" y="7" width="3" height="3" rx="0.5" fill="currentColor"/>
              <rect x="5" y="5" width="3" height="5" rx="0.5" fill="currentColor"/>
              <rect x="10" y="2" width="3" height="8" rx="0.5" fill="currentColor"/>
              <rect x="15" y="0" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.4"/>
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path d="M7.5 10.5L7.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 7c2-2 5-2 7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M1.5 4.5c3.3-3.3 8.7-3.3 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
              <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" fill="none" opacity="0.5"/>
              <rect x="2" y="2" width="14" height="8" rx="1" fill="currentColor"/>
              <rect x="24" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
            </svg>
          </span>
        </div>
        <div className="sr-phone-body">{children}</div>
        <div className="sr-phone-home" />
      </div>
      {label && <div className="sr-phone-caption" style={labelColor ? { color: labelColor } : {}}>{label}</div>}
    </div>
  );
}

// Small icons
const Icon = {
  heart: ({ size, filled, ...p }) => <svg viewBox="0 0 24 24" fill="none" width={size||20} height={size||20} {...p}><path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" strokeWidth="1.6" fill={filled?'currentColor':'none'}/></svg>,
  comment: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6l-4 3v-3H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>,
  share: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><path d="M12 3v13M12 3l-4 4M12 3l4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/></svg>,
  bookmark: ({ size, filled, ...p }) => <svg viewBox="0 0 24 24" fill="none" width={size||20} height={size||20} {...p}><path d="M6 3h12v18l-6-4-6 4V3z" stroke="currentColor" strokeWidth="1.6" fill={filled?'currentColor':'none'}/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  home: ({ size, filled, ...p }) => <svg viewBox="0 0 24 24" fill="none" width={size||24} height={size||24} {...p}><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V11z" stroke="currentColor" strokeWidth="1.6" fill={filled?'currentColor':'none'}/></svg>,
  book: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||24} height={p.size||24} {...p}><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5zM6 3v18" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>,
  chart: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||24} height={p.size||24} {...p}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||24} height={p.size||24} {...p}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  bell: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><path d="M6 9a6 6 0 0 1 12 0v4l2 4H4l2-4V9zM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  play: (p) => <svg viewBox="0 0 24 24" width={p.size||20} height={p.size||20} {...p}><path d="M7 4v16l14-8z" fill="currentColor"/></svg>,
  chevronRight: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronLeft: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fb: (p) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} {...p}><path fill="currentColor" d="M13 21v-8h3l0.5-4H13V6.5c0-1.2 0.3-2 2-2h2V1.2C16.6 1.1 15.4 1 14 1c-2.9 0-5 1.8-5 5v3H6v4h3v8h4z"/></svg>,
  li: (p) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} {...p}><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2.1 3.7-2.1 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4V9z"/></svg>,
  camera: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||20} height={p.size||20} {...p}><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  medal: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||22} height={p.size||22} {...p}><path d="M8 3l1 6h6l1-6M12 9v3M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM10 15l2 2 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  flame: (p) => <svg viewBox="0 0 24 24" width={p.size||22} height={p.size||22} {...p}><path d="M12 3s5 4.5 5 10a5 5 0 1 1-10 0c0-1.5 1-3 1-3s0 2 2 2c0-3-2-4 2-9z" fill="currentColor"/></svg>,
  spark: (p) => <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} {...p}><path fill="currentColor" d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>,
  filter: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||18} height={p.size||18} {...p}><path d="M4 5h16M7 12h10M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  more: (p) => <svg viewBox="0 0 24 24" width={p.size||18} height={p.size||18} fill="currentColor" {...p}><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||18} height={p.size||18} {...p}><path d="M12 21s-6-6-6-11a6 6 0 1 1 12 0c0 5-6 11-6 11z" stroke="currentColor" strokeWidth="1.6" fill="none"/><circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.6"/></svg>,
  download: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||18} height={p.size||18} {...p}><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" width={p.size||18} height={p.size||18} {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
};

// Stylized Nigeria map — simplified state polygons approximating major regions.
// Not geographically precise; recognizably Nigeria-shaped.
function NigeriaMap({ palette, showLabels = true, highlighted = [] }) {
  // Coordinates roughly mimicking Nigeria outline; state dots placed by rough regions.
  const states = [
    { id: 'Lagos',   x: 155, y: 315, size: 30, cases: 412 },
    { id: 'Ogun',    x: 180, y: 300, size: 22, cases: 210 },
    { id: 'Oyo',     x: 195, y: 265, size: 24, cases: 268 },
    { id: 'Osun',    x: 220, y: 285, size: 18, cases: 152 },
    { id: 'Ondo',    x: 235, y: 315, size: 20, cases: 178 },
    { id: 'Edo',     x: 260, y: 300, size: 18, cases: 165 },
    { id: 'Delta',   x: 245, y: 340, size: 20, cases: 189 },
    { id: 'Rivers',  x: 285, y: 355, size: 22, cases: 224 },
    { id: 'A. Ibom', x: 320, y: 355, size: 16, cases: 118 },
    { id: 'Anambra', x: 290, y: 315, size: 18, cases: 145 },
    { id: 'Enugu',   x: 305, y: 290, size: 16, cases: 128 },
    { id: 'Imo',     x: 300, y: 335, size: 14, cases: 96 },
    { id: 'Abuja',   x: 300, y: 220, size: 26, cases: 340 },
    { id: 'Kaduna',  x: 305, y: 175, size: 24, cases: 265 },
    { id: 'Kano',    x: 335, y: 130, size: 28, cases: 385 },
    { id: 'Katsina', x: 305, y: 110, size: 18, cases: 165 },
    { id: 'Sokoto',  x: 235, y: 105, size: 18, cases: 155 },
    { id: 'Kebbi',   x: 220, y: 145, size: 16, cases: 122 },
    { id: 'Zamfara', x: 275, y: 130, size: 16, cases: 135 },
    { id: 'Niger',   x: 250, y: 205, size: 20, cases: 178 },
    { id: 'Kwara',   x: 235, y: 240, size: 18, cases: 152 },
    { id: 'Plateau', x: 340, y: 210, size: 18, cases: 168 },
    { id: 'Bauchi',  x: 375, y: 175, size: 18, cases: 148 },
    { id: 'Gombe',   x: 405, y: 175, size: 14, cases: 92 },
    { id: 'Adamawa', x: 425, y: 210, size: 18, cases: 132 },
    { id: 'Taraba',  x: 395, y: 240, size: 16, cases: 108 },
    { id: 'Benue',   x: 340, y: 265, size: 20, cases: 168 },
    { id: 'Borno',   x: 430, y: 145, size: 22, cases: 195 },
    { id: 'Yobe',    x: 400, y: 130, size: 14, cases: 88 },
    { id: 'Jigawa',  x: 370, y: 118, size: 14, cases: 92 },
    { id: 'C. River',x: 340, y: 340, size: 16, cases: 122 },
    { id: 'Bayelsa', x: 270, y: 365, size: 12, cases: 74 },
    { id: 'Kogi',    x: 275, y: 240, size: 16, cases: 118 },
    { id: 'Ekiti',   x: 220, y: 305, size: 12, cases: 68 },
    { id: 'Nasarawa',x: 315, y: 245, size: 16, cases: 108 },
    { id: 'Ebonyi',  x: 320, y: 305, size: 12, cases: 72 },
  ];

  const outline = "M170,90 L235,80 L310,88 L400,105 L455,140 L465,190 L440,230 L430,290 L390,320 L370,340 L340,360 L295,378 L260,375 L220,360 L180,335 L150,310 L135,270 L125,225 L130,180 L145,135 Z";

  return (
    <svg viewBox="80 60 400 340" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={`map-bg-${palette.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.mapBgA} />
          <stop offset="100%" stopColor={palette.mapBgB} />
        </linearGradient>
      </defs>

      <path d={outline} fill={`url(#map-bg-${palette.id})`} stroke={palette.mapStroke} strokeWidth="1.2" strokeLinejoin="round" />

      {/* Subtle inner grid lines suggesting states */}
      <g stroke={palette.mapStroke} strokeWidth="0.6" opacity="0.35" fill="none">
        <path d="M170,90 Q260,170 260,340" />
        <path d="M310,88 Q290,200 295,378" />
        <path d="M400,105 Q380,220 340,360" />
        <path d="M125,225 Q280,220 465,190" />
      </g>

      {states.map((s) => {
        const isHi = highlighted.includes(s.id);
        const r = Math.max(3, s.size * 0.18);
        return (
          <g key={s.id}>
            <circle
              cx={s.x} cy={s.y} r={r}
              fill={isHi ? palette.mapDotHi : palette.mapDot}
              opacity={isHi ? 1 : 0.85}
            />
            {isHi && (
              <circle
                cx={s.x} cy={s.y} r={r + 4}
                fill="none"
                stroke={palette.mapDotHi}
                strokeWidth="1.2"
                opacity="0.4"
              />
            )}
          </g>
        );
      })}

      {showLabels && (
        <g fontFamily="'IBM Plex Mono', monospace" fontSize="8" fill={palette.mapLabel} opacity="0.7">
          <text x="155" y="335" textAnchor="middle">LAGOS · 412</text>
          <text x="335" y="118" textAnchor="middle">KANO · 385</text>
          <text x="300" y="207" textAnchor="middle">ABUJA · 340</text>
          <text x="305" y="163" textAnchor="middle">KADUNA · 265</text>
          <text x="285" y="367" textAnchor="middle">RIVERS · 224</text>
        </g>
      )}
    </svg>
  );
}

// Bottom tab bar for phone
function TabBar({ palette, active = 'home', variant = 'warm' }) {
  const tabs = [
    { id: 'home', icon: Icon.home, label: 'Feed' },
    { id: 'learn', icon: Icon.book, label: 'Learn' },
    { id: 'plus', icon: Icon.plus, label: '' },
    { id: 'progress', icon: Icon.chart, label: 'Progress' },
    { id: 'me', icon: Icon.user, label: 'Me' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 78,
      paddingBottom: 20,
      background: palette.tabBg,
      borderTop: `1px solid ${palette.tabBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      backdropFilter: 'blur(20px)',
      zIndex: 10,
    }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        const isPlus = t.id === 'plus';
        if (isPlus) {
          return (
            <div key={t.id} style={{
              width: 48, height: 48, borderRadius: 24,
              background: palette.accent,
              color: palette.accentFg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 20px -6px ${palette.accent}`,
              marginTop: -6,
            }}>
              <t.icon size={24} />
            </div>
          );
        }
        return (
          <div key={t.id} style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap: 3,
            color: isActive ? palette.tabActive : palette.tabInactive,
          }}>
            <t.icon size={22} filled={isActive} />
            <div style={{ fontSize: 10, fontWeight: isActive ? 600 : 500 }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// Sparkline
function Spark({ data, color, height = 40, width = 120 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polygon points={areaPoints} fill={color} opacity="0.12" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length-1] - min) / range) * height} r="3" fill={color} />
    </svg>
  );
}

// Ring progress
function Ring({ percent, size = 100, stroke = 8, color, bg, label, sublabel, fontFamily }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (percent / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={bg} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily,
      }}>
        <div style={{ fontSize: size * 0.28, fontWeight: 600, lineHeight: 1 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{sublabel}</div>}
      </div>
    </div>
  );
}

/* ------------ Additional shared primitives ------------ */

// A blank stage wrapper (for scenes containing a single-phone screen)
function SoloStage({ background, children }) {
  return (
    <div className="sr-mobile-stage" style={{ background }}>
      {children}
    </div>
  );
}

// Form input — pass palette for correct focus color
function FormField({ label, value, placeholder, type = 'text', palette, mono, prefix, suffix, hint, error, autofocus }) {
  const font = palette?.formFont || "'Inter', sans-serif";
  const labelFont = palette?.labelFont || "'IBM Plex Mono', monospace";
  const border = error ? '#B4463B' : (palette?.line || '#E5E5DE');
  const focusColor = palette?.accent || '#0F6B70';
  return (
    <div>
      {label && (
        <div style={{
          fontFamily: labelFont, fontSize: 10, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: palette?.inkLight || '#6B7684',
          marginBottom: 6,
        }}>{label}</div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '10px 12px',
        border: `1px solid ${border}`,
        borderRadius: palette?.radius || 8,
        background: '#fff',
        color: palette?.ink || '#1A2028',
        outline: autofocus ? `2px solid ${focusColor}` : 'none',
        outlineOffset: 1,
      }}>
        {prefix && <span style={{ marginRight: 8, color: palette?.inkLight || '#6B7684', fontSize: 14 }}>{prefix}</span>}
        <span style={{
          flex: 1, fontFamily: mono ? "'IBM Plex Mono', monospace" : font,
          fontSize: mono ? 15 : 14, letterSpacing: mono ? '0.08em' : 'normal',
          color: value ? (palette?.ink || '#1A2028') : (palette?.inkLight || '#B0B5BC'),
        }}>{value || placeholder}</span>
        {suffix && <span style={{ marginLeft: 8, color: palette?.inkLight || '#6B7684', fontSize: 12 }}>{suffix}</span>}
      </div>
      {hint && !error && (
        <div style={{ marginTop: 4, fontSize: 11, color: palette?.inkLight || '#6B7684' }}>{hint}</div>
      )}
      {error && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#B4463B' }}>{error}</div>
      )}
    </div>
  );
}

// Primary button (fills width)
function PButton({ label, palette, variant = 'primary', icon, disabled, full = true, size = 'md' }) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const bg = isGhost ? 'transparent' : (isPrimary ? (palette?.accent || '#0F6B70') : '#F1F1EC');
  const fg = isGhost ? (palette?.accent || '#0F6B70') : (isPrimary ? (palette?.accentFg || '#fff') : (palette?.ink || '#1A2028'));
  const padY = size === 'lg' ? 14 : size === 'sm' ? 8 : 12;
  const padX = size === 'lg' ? 20 : size === 'sm' ? 12 : 16;
  return (
    <div style={{
      width: full ? '100%' : 'auto',
      padding: `${padY}px ${padX}px`,
      background: bg,
      color: fg,
      opacity: disabled ? 0.4 : 1,
      borderRadius: palette?.buttonRadius || palette?.radius || 8,
      border: isGhost ? `1px solid ${palette?.line || '#E5E5DE'}` : 'none',
      textAlign: 'center',
      fontWeight: palette?.buttonWeight || 600,
      fontSize: size === 'lg' ? 15 : 14,
      fontFamily: palette?.buttonFont || palette?.formFont || "'Inter', sans-serif",
      letterSpacing: palette?.buttonSpacing || 'normal',
      textTransform: palette?.buttonUppercase ? 'uppercase' : 'none',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer',
    }}>
      {label}
      {icon}
    </div>
  );
}

// Empty state
function EmptyState({ icon, title, body, action, palette }) {
  return (
    <div style={{
      padding: '48px 32px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: 16,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: palette?.paper2 || palette?.creamDeep || '#F1F1EC',
        color: palette?.accent || '#0F6B70',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div>
        <div style={{
          fontFamily: palette?.displayFont || "'Instrument Serif', serif",
          fontSize: 22, fontWeight: 500, color: palette?.ink || '#1A2028',
          lineHeight: 1.2,
        }}>{title}</div>
        <div style={{ marginTop: 6, fontSize: 13, color: palette?.inkSoft || '#3A4552', lineHeight: 1.5, maxWidth: 260 }}>{body}</div>
      </div>
      {action}
    </div>
  );
}

// Section header
function SectionHeader({ title, subtitle, right, palette, size = 'md' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{
          fontFamily: palette?.displayFont || "'Instrument Serif', serif",
          fontSize: size === 'lg' ? 26 : size === 'sm' ? 18 : 22,
          fontWeight: palette?.displayWeight || 500,
          lineHeight: 1.1,
          color: palette?.ink || '#1A2028',
          letterSpacing: '-0.01em',
        }}>{title}</div>
        {subtitle && (
          <div style={{ marginTop: 4, fontSize: 12, color: palette?.inkLight || '#6B7684' }}>{subtitle}</div>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// Screen container (used by admin desktop pages)
function AdminShell({ palette, title, subtitle, activeNav, children }) {
  const p = palette;
  const nav = [
    { k: 'overview', l: 'Overview' },
    { k: 'participants', l: 'Participants' },
    { k: 'referrals', l: 'Referrals' },
    { k: 'content', l: 'Content' },
    { k: 'perception', l: 'Perception' },
    { k: 'reports', l: 'Reports' },
    { k: 'broadcasts', l: 'Broadcasts' },
    { k: 'trainers', l: 'Trainers' },
  ];
  return (
    <div style={{
      width: '100%', padding: '40px 48px', color: p.ink,
      background: p.adminBg || p.paper || '#FAFAF7',
      minHeight: 940,
      fontFamily: p.formFont || "'Inter', sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: `1px solid ${p.adminLine || p.line || '#E5E5DE'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: p.logoRadius || 6,
              background: p.accent, color: p.accentFg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: p.displayFont, fontSize: 18, fontWeight: p.displayWeight || 500,
            }}>S</div>
            <div>
              <div style={{ fontFamily: p.displayFont, fontSize: 20, fontWeight: p.displayWeight || 500, letterSpacing: '-0.01em', color: p.adminHeaderText || p.ink }}>SheRISE M&amp;E</div>
              <div className="mono" style={{ fontSize: 10, color: p.adminHeaderSub || p.inkLight, letterSpacing: '0.06em' }}>{subtitle || 'ADMIN · SEP 2026'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            {nav.map((t, i) => (
              <div key={t.k} style={{
                padding: '4px 0',
                color: t.k === activeNav ? (p.adminHeaderText || p.ink) : (p.adminHeaderSub || p.inkSoft),
                fontWeight: t.k === activeNav ? 600 : 400,
                borderBottom: t.k === activeNav ? `2px solid ${p.accent}` : '2px solid transparent',
                cursor: 'pointer',
              }}>{t.l}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ padding: '8px 12px', border: `1px solid ${p.adminLine || p.line}`, borderRadius: 6, fontSize: 12, color: p.adminHeaderSub || p.inkSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.search size={14} /> Search…
          </div>
          <div style={{ padding: '8px 14px', borderRadius: 6, background: p.accent, color: p.accentFg, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.download size={12} /> Export PDF
          </div>
          <Avatar name="M O" size={32} palette={p.avatarPalette || 'clean'} />
        </div>
      </div>
      {title && (
        <div style={{ padding: '20px 0 12px' }}>
          <div style={{ fontFamily: p.displayFont, fontSize: 28, fontWeight: p.displayWeight || 500, letterSpacing: '-0.015em' }}>{title}</div>
        </div>
      )}
      <div style={{ marginTop: title ? 0 : 20 }}>{children}</div>
    </div>
  );
}

// Toast
function Toast({ message, kind = 'info', palette }) {
  const bg = kind === 'success' ? (palette?.green || '#4A7C4E') : (palette?.accent || '#0F6B70');
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8,
      background: bg, color: '#fff',
      fontSize: 13, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      <Icon.check size={14} /> {message}
    </div>
  );
}

// Divider
function Divider({ palette }) {
  return <div style={{ height: 1, background: palette?.line || '#E5E5DE', margin: '10px 0' }} />;
}

// List row
function ListRow({ leading, title, subtitle, right, palette, onClick }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: `1px solid ${palette?.lineSoft || palette?.line || '#EFEFE9'}`,
      cursor: onClick ? 'pointer' : 'default',
    }} onClick={onClick}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: palette?.ink || '#1A2028', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: palette?.inkLight || '#6B7684', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// Chip
function Chip({ label, on, tone, palette, icon }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: on ? (tone || palette?.accent) : (palette?.paper2 || '#F1F1EC'),
      color: on ? (palette?.accentFg || '#fff') : (palette?.inkSoft || '#3A4552'),
      fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
      border: on ? 'none' : `1px solid ${palette?.line || '#E5E5DE'}`,
    }}>
      {icon} {label}
    </div>
  );
}

Object.assign(window, {
  Avatar, Photo, Phone, Icon, NigeriaMap, TabBar, Spark, Ring, hashStr,
  SoloStage, FormField, PButton, EmptyState, SectionHeader, AdminShell, Toast, Divider, ListRow, Chip,
});
