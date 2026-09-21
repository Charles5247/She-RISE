import { redirect } from "next/navigation";

// Root — the real app entry point is the preloader (screen 01), which then
// decides whether to route into /welcome (first run), /signup, /feed, or
// /onboarding/profile based on session + first-run state. See
// src/app/preloader/page.tsx.
export default function Home() {
  redirect("/preloader");
}
