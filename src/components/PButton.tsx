"use client";
// PButton — primary/ghost/secondary button matching the design reference's
// `PButton`, adapted to a real <button> element (clickable + disableable).
export interface PButtonProps {
  label: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "secondary";
  icon?: React.ReactNode;
  disabled?: boolean;
  full?: boolean;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
  className?: string;
}

export function PButton({
  label,
  onClick,
  variant = "primary",
  icon,
  disabled,
  full = true,
  size = "md",
  type = "button",
  className,
}: PButtonProps) {
  const isPrimary = variant === "primary";
  const isGhost = variant === "ghost";
  const bg = isGhost ? "transparent" : isPrimary ? "var(--c-magenta)" : "var(--c-cream)";
  const fg = isGhost ? "var(--c-magenta)" : isPrimary ? "#fff" : "var(--c-ink)";
  const padY = size === "lg" ? 14 : size === "sm" ? 8 : 12;
  const padX = size === "lg" ? 20 : size === "sm" ? 12 : 16;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        width: full ? "100%" : "auto",
        padding: `${padY}px ${padX}px`,
        background: bg,
        color: fg,
        opacity: disabled ? 0.5 : 1,
        borderRadius: "var(--r-lg)",
        border: isGhost ? "1px solid var(--c-line)" : "none",
        textAlign: "center",
        fontWeight: 700,
        fontSize: size === "lg" ? 13 : 12,
        fontFamily: "var(--font-display)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
      {icon}
    </button>
  );
}
