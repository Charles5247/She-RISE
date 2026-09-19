"use client";
// FormField — labeled input matching the design reference's `FormField`
// component, adapted to a real controlled `<input>`/`<textarea>` (the
// reference version was a static display-only mock).
import { useId } from "react";

export interface FormFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  hint?: string;
  error?: string;
  autoComplete?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
  prefix,
  suffix,
  hint,
  error,
  autoComplete,
  required,
  multiline,
  rows = 3,
  maxLength,
  autoFocus,
  disabled,
}: FormFieldProps) {
  const id = useId();
  const border = error ? "var(--c-danger)" : "var(--c-line)";

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="sr-label"
          style={{ display: "block", fontSize: 10, color: "var(--c-ink-soft)", marginBottom: 6 }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: multiline ? "flex-start" : "center",
          padding: "10px 12px",
          border: `1px solid ${border}`,
          borderRadius: "var(--r-lg)",
          background: disabled ? "var(--c-cream)" : "#fff",
        }}
      >
        {prefix && <span style={{ marginRight: 8, color: "var(--c-ink-soft)", fontSize: 14 }}>{prefix}</span>}
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={rows}
            maxLength={maxLength}
            autoFocus={autoFocus}
            disabled={disabled}
            style={{
              flex: 1,
              fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
              fontSize: 14,
              color: "var(--c-ink)",
              resize: "vertical",
              border: "none",
              outline: "none",
              background: "transparent",
            }}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            maxLength={maxLength}
            autoFocus={autoFocus}
            disabled={disabled}
            style={{
              flex: 1,
              fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
              fontSize: mono ? 15 : 14,
              letterSpacing: mono ? "0.08em" : "normal",
              color: "var(--c-ink)",
              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
            }}
          />
        )}
        {suffix && <span style={{ marginLeft: 8, color: "var(--c-ink-soft)", fontSize: 12 }}>{suffix}</span>}
      </div>
      {hint && !error && (
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--c-ink-soft)" }}>{hint}</div>
      )}
      {error && (
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--c-danger)" }}>{error}</div>
      )}
    </div>
  );
}
