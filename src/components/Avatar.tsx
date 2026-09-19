// Avatar — initials-based circular avatar with a gradient hashed from the
// person's name, three palette variants, optional colored ring (used to mark
// "story"/highlight state), optional badge overlay (used for the verified-
// trainer checkmark per Design Principle 05). Reimplemented 1:1 from the
// design reference's `Avatar` + `hashStr` functions.
export type AvatarPalette = "warm" | "bold" | "clean";

const PALETTES: Record<AvatarPalette, [string, string][]> = {
  warm: [
    ["#E8B858", "#C55A3B"],
    ["#D89B8B", "#8B4A3B"],
    ["#C97B57", "#6B3520"],
    ["#E8C288", "#A85838"],
    ["#B78560", "#4A2D22"],
    ["#D4A574", "#8B5A3C"],
  ],
  bold: [
    ["#E8B84A", "#D4306E"],
    ["#F06292", "#2A0E2E"],
    ["#E8B84A", "#7B2D8E"],
    ["#D4306E", "#2A0E2E"],
    ["#F5A623", "#B0236A"],
    ["#7B2D8E", "#E8B84A"],
  ],
  clean: [
    ["#0F6B70", "#1A4448"],
    ["#5B8A8E", "#264447"],
    ["#8FA9AB", "#3A5658"],
    ["#446B6E", "#1A2028"],
    ["#7CA4A7", "#2E4548"],
    ["#4A7377", "#1A2028"],
  ],
};

const FONTS: Record<AvatarPalette, string> = {
  warm: "var(--font-body)",
  bold: "var(--font-display)",
  clean: "var(--font-body)",
};

export function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export interface AvatarProps {
  name: string;
  size?: number;
  palette?: AvatarPalette;
  ring?: string | null;
  badge?: { bg: string; icon: React.ReactNode } | null;
  className?: string;
}

export function Avatar({ name, size = 40, palette = "warm", ring = null, badge = null, className }: AvatarProps) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  const h = hashStr(name);
  const [a, b] = PALETTES[palette][h % PALETTES[palette].length];

  return (
    <div className={className} style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {ring && (
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            border: `2px solid ${ring}`,
          }}
        />
      )}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONTS[palette],
          fontWeight: palette === "bold" ? 700 : 500,
          fontSize: size * 0.42,
          letterSpacing: "-0.02em",
        }}
      >
        {initials}
      </div>
      {badge && (
        <div
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: "50%",
            background: badge.bg,
            border: "2px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.2,
          }}
        >
          {badge.icon}
        </div>
      )}
    </div>
  );
}

// Verified-trainer badge helper — gold check on the avatar, per Design
// Principle 05 ("Trainers are visible").
export function trainerBadge() {
  return { bg: "var(--c-gold)", icon: <span style={{ color: "var(--c-plum)", fontSize: 9, fontWeight: 800 }}>✓</span> };
}
