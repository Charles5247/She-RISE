import Link from "next/link";

// Root landing — routes into the participant onboarding flow (screen 01 preloader
// leads here in the full build). Kept minimal: this scaffold's priority was the
// data layer, auth, and full API surface (see README/BUILD_STATUS.md for the
// complete state and next steps).
export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "var(--c-plum)", color: "var(--c-dark-text)" }}
    >
      <div
        className="text-6xl font-extrabold"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.035em", color: "var(--c-gold)" }}
      >
        SR
      </div>
      <h1 className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
        SheRISE
      </h1>
      <p className="max-w-sm text-sm" style={{ color: "var(--c-dark-text-soft)" }}>
        Community, skill-training, and reintegration support for women rising
        after correctional and rehabilitation centres in Nigeria.
      </p>
      <div className="flex gap-3 mt-2">
        <Link
          href="/signup"
          className="px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider"
          style={{ background: "var(--c-magenta)", color: "#fff", fontFamily: "var(--font-display)" }}
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider border"
          style={{ borderColor: "var(--c-dark-border)", color: "var(--c-dark-text)", fontFamily: "var(--font-display)" }}
        >
          Log in
        </Link>
      </div>
      <Link href="/admin/login" className="text-[11px] mt-8 underline" style={{ color: "var(--c-dark-text-soft)", fontFamily: "var(--font-mono)" }}>
        Staff / trainer / sponsor login →
      </Link>
    </main>
  );
}
