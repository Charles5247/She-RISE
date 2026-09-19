"use client";
// TabBar — bottom nav for the participant app: home/learn/plus(FAB)/progress/me.
// Real navigation via next/link, active state derived from usePathname().
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HomeIcon, BookIcon, PlusIcon, ChartIcon, UserIcon } from "./Icon";

const TABS = [
  { id: "home", href: "/feed", icon: HomeIcon, label: "Feed" },
  { id: "learn", href: "/pathways", icon: BookIcon, label: "Learn" },
  { id: "plus", href: "/composer", icon: PlusIcon, label: "" },
  { id: "progress", href: "/progress", icon: ChartIcon, label: "Progress" },
  { id: "me", href: "/profile", icon: UserIcon, label: "Me" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 78,
        paddingBottom: 20,
        background: "rgba(42,14,46,0.97)",
        borderTop: "1px solid var(--c-dark-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        backdropFilter: "blur(20px)",
        zIndex: 40,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {TABS.map((t) => {
        const isActive = pathname === t.href || (t.id === "home" && pathname === "/");
        const Icon = t.icon;
        if (t.id === "plus") {
          return (
            <button
              key={t.id}
              aria-label="Create post"
              onClick={() => router.push(t.href)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: "var(--c-magenta)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px -6px var(--c-magenta)",
                marginTop: -6,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Icon size={24} />
            </button>
          );
        }
        return (
          <Link
            key={t.id}
            href={t.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: isActive ? "var(--c-gold)" : "var(--c-dark-text-soft)",
              minWidth: 44,
              minHeight: 44,
              justifyContent: "center",
            }}
          >
            <Icon size={22} filled={isActive} />
            <div style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{t.label}</div>
          </Link>
        );
      })}
    </nav>
  );
}
