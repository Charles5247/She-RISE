"use client";
// Smaller shared primitives: ListRow, Chip, Toast, Divider, EmptyState,
// SectionHeader — matching the design reference 1:1, adapted to real click
// handlers where relevant.

export function Divider() {
  return <div style={{ height: 1, background: "var(--c-line)", margin: "10px 0" }} />;
}

export function ListRow({
  leading,
  title,
  subtitle,
  right,
  onClick,
}: {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--c-line-soft)",
        cursor: onClick ? "pointer" : "default",
        minHeight: 44,
      }}
    >
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--c-ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 12, color: "var(--c-ink-soft)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

export function Chip({
  label,
  on,
  tone,
  icon,
  onClick,
}: {
  label: React.ReactNode;
  on?: boolean;
  tone?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        borderRadius: "var(--r-pill)",
        background: on ? tone || "var(--c-magenta)" : "var(--c-cream)",
        color: on ? "#fff" : "var(--c-ink-soft)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
        border: on ? "none" : "1px solid var(--c-line)",
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
      }}
    >
      {icon} {label}
    </button>
  );
}

export function Toast({ message, kind = "info" }: { message: React.ReactNode; kind?: "info" | "success" | "error" }) {
  const bg = kind === "success" ? "var(--c-success)" : kind === "error" ? "var(--c-danger)" : "var(--c-plum)";
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "var(--r-lg)",
        background: bg,
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "var(--shadow-modal)",
      }}
    >
      {message}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 16,
      }}
    >
      {icon && (
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--c-cream)",
            color: "var(--c-magenta)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 800,
            color: "var(--c-ink)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        {body && <div style={{ marginTop: 6, fontSize: 13, color: "var(--c-ink-soft)", lineHeight: 1.5, maxWidth: 280 }}>{body}</div>}
      </div>
      {action}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  right,
  size = "md",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: size === "lg" ? 26 : size === "sm" ? 16 : 20,
            fontWeight: 800,
            lineHeight: 1.15,
            color: "var(--c-ink)",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        {subtitle && <div style={{ marginTop: 4, fontSize: 12, color: "var(--c-ink-soft)" }}>{subtitle}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid var(--c-line)",
        borderTopColor: "var(--c-magenta)",
        animation: "sr-spin 0.7s linear infinite",
      }}
    >
      <style>{`@keyframes sr-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
