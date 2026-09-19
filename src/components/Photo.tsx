// Photo placeholder — per BUILD_PROMPT / BUILD_STATUS, real photography
// hasn't been commissioned yet, so every image slot renders a labeled
// placeholder rather than shipping stock/stand-in art. Uses the
// `.sr-photo-ph` utility class already defined in globals.css.
export interface PhotoProps {
  label: string;
  tone?: string;
  height?: number | string;
  aspectRatio?: string;
  dark?: boolean;
  hint?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Photo({ label, tone = "var(--c-cream-deep)", height, aspectRatio, dark = false, hint, className, style }: PhotoProps) {
  return (
    <div
      className={`sr-photo-ph${dark ? " dark" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--ph-tone": tone,
          height,
          aspectRatio,
          ...style,
        } as React.CSSProperties
      }
    >
      <div>
        {hint && <div style={{ marginBottom: 4, opacity: 0.7 }}>{hint}</div>}
        <div>[ photo: {label} ]</div>
      </div>
    </div>
  );
}
