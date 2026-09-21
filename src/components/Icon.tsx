// Custom SVG icon set — replicated 1:1 from docs/design-handoff/SheRISE Bold
// - Design Reference.html (the `Icon` object, lines ~1490-1518). Kept as
// individual named exports (rather than an indexed object) so each icon is
// tree-shakeable and gets full TS prop typing.
import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  filled?: boolean;
}

function base(size: number | undefined, fallback: number) {
  return size ?? fallback;
}

export function HeartIcon({ size, filled, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" strokeWidth="1.6" fill={filled ? "currentColor" : "none"} />
    </svg>
  );
}

export function CommentIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6l-4 3v-3H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function ShareIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M12 3v13M12 3l-4 4M12 3l4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function BookmarkIcon({ size, filled, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M6 3h12v18l-6-4-6 4V3z" stroke="currentColor" strokeWidth="1.6" fill={filled ? "currentColor" : "none"} />
    </svg>
  );
}

export function PlusIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon({ size, filled, ...p }: IconProps) {
  const s = base(size, 24);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V11z" stroke="currentColor" strokeWidth="1.6" fill={filled ? "currentColor" : "none"} />
    </svg>
  );
}

export function BookIcon({ size, filled, ...p }: IconProps) {
  const s = base(size, 24);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5zM6 3v18" stroke="currentColor" strokeWidth="1.6" fill={filled ? "currentColor" : "none"} />
    </svg>
  );
}

export function ChartIcon({ size, filled, ...p }: IconProps) {
  const s = base(size, 24);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill={filled ? "currentColor" : "none"} />
    </svg>
  );
}

export function UserIcon({ size, filled, ...p }: IconProps) {
  const s = base(size, 24);
  const f = filled ? "currentColor" : "none";
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" fill={f} />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill={f} />
    </svg>
  );
}

export function BellIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M6 9a6 6 0 0 1 12 0v4l2 4H4l2-4V9zM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function SearchIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function PlayIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} {...p}>
      <path d="M7 4v16l14-8z" fill="currentColor" />
    </svg>
  );
}

export function ChevronRightIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FacebookIcon({ size, ...p }: IconProps) {
  const s = base(size, 18);
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} {...p}>
      <path fill="currentColor" d="M13 21v-8h3l0.5-4H13V6.5c0-1.2 0.3-2 2-2h2V1.2C16.6 1.1 15.4 1 14 1c-2.9 0-5 1.8-5 5v3H6v4h3v8h4z" />
    </svg>
  );
}

export function LinkedInIcon({ size, ...p }: IconProps) {
  const s = base(size, 18);
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} {...p}>
      <path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2.1 3.7-2.1 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4V9z" />
    </svg>
  );
}

export function CameraIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function MedalIcon({ size, ...p }: IconProps) {
  const s = base(size, 22);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M8 3l1 6h6l1-6M12 9v3M12 21a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM10 15l2 2 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function FlameIcon({ size, ...p }: IconProps) {
  const s = base(size, 22);
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} {...p}>
      <path d="M12 3s5 4.5 5 10a5 5 0 1 1-10 0c0-1.5 1-3 1-3s0 2 2 2c0-3-2-4 2-9z" fill="currentColor" />
    </svg>
  );
}

export function SparkIcon({ size, ...p }: IconProps) {
  const s = base(size, 16);
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} {...p}>
      <path fill="currentColor" d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
    </svg>
  );
}

export function FilterIcon({ size, ...p }: IconProps) {
  const s = base(size, 18);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M4 5h16M7 12h10M10 19h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function MoreIcon({ size, ...p }: IconProps) {
  const s = base(size, 18);
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor" {...p}>
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

export function PinIcon({ size, ...p }: IconProps) {
  const s = base(size, 18);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M12 21s-6-6-6-11a6 6 0 1 1 12 0c0 5-6 11-6 11z" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function DownloadIcon({ size, ...p }: IconProps) {
  const s = base(size, 18);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ size, ...p }: IconProps) {
  const s = base(size, 18);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function WifiOffIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M1 5l22 14M4 8.5c1.8-1.5 4-2.5 6.3-2.9M9 12c1-.5 2-.7 3-.7 1.4 0 2.7.3 3.9 1M12 16.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM16.5 9.7c1.4.5 2.7 1.3 3.8 2.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function AlertIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M12 9v4M12 17h.01M10.3 3.9L2.5 18a1.5 1.5 0 0 0 1.3 2.2h16.4a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function PhoneCallIcon({ size, ...p }: IconProps) {
  const s = base(size, 20);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function LockIcon({ size, ...p }: IconProps) {
  const s = base(size, 18);
  return (
    <svg viewBox="0 0 24 24" fill="none" width={s} height={s} {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
