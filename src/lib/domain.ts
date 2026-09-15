/**
 * Deployment-time surface separation.
 *
 * Per the user's note: "although admin and participant are in the same
 * codebase, for security reasons, both would be deployed separately... a
 * participant would go to https://sherise.com and an admin to
 * https://sherise-admin.com."
 *
 * We implement that with ONE env var per deployment:
 *   NEXT_PUBLIC_APP_SURFACE = "participant" | "admin"
 *
 * - The participant deployment (sherise.com) sets APP_SURFACE=participant.
 *   middleware.ts blocks all /admin/* routes with a 404 on that deployment.
 * - The admin deployment (sherise-admin.com) sets APP_SURFACE=admin.
 *   middleware.ts redirects "/" and all participant routes to /admin/login.
 *
 * Locally (no env var set) both surfaces are reachable for development/demo
 * convenience — see the surface switcher in the dev banner.
 */
export type AppSurface = "participant" | "admin" | "both";

export function getAppSurface(): AppSurface {
  const v = process.env.NEXT_PUBLIC_APP_SURFACE;
  if (v === "participant" || v === "admin") return v;
  return "both";
}
