// Ring — SVG circular progress ring, used for the /progress screen's XP/
// completion ring and small inline progress indicators.
export interface RingProps {
  percent: number;
  size?: number;
  stroke?: number;
  color?: string;
  bg?: string;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
}

export function Ring({ percent, size = 100, stroke = 8, color = "var(--c-gold)", bg = "rgba(255,255,255,0.12)", label, sublabel }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, percent)) / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={bg} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: size * 0.26, fontWeight: 800, lineHeight: 1, fontFamily: "var(--font-display)" }}>{label}</div>
        {sublabel && (
          <div className="sr-label" style={{ fontSize: 9, opacity: 0.7, marginTop: 3 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
