import { NextRequest, NextResponse } from "next/server";

/**
 * Enforces the two-deployment separation described in the build prompt:
 * one Vercel/Render deployment serves participants at sherise.com with
 * NEXT_PUBLIC_APP_SURFACE=participant, a second serves admins at
 * sherise-admin.com with NEXT_PUBLIC_APP_SURFACE=admin. Locally/preview
 * (surface="both") everything is reachable so you can demo both sides.
 */
export function proxy(req: NextRequest) {
  const surface = process.env.NEXT_PUBLIC_APP_SURFACE;
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isTrainerPath = pathname.startsWith("/trainer");
  const isSponsorPath = pathname.startsWith("/sponsor");
  const isStaffPath = isAdminPath || isTrainerPath || isSponsorPath;
  const isApiAdminPath = pathname.startsWith("/api/admin");
  const isApiStaffPath = isApiAdminPath || pathname.startsWith("/api/trainer/dashboard") || pathname.startsWith("/api/sponsor/dashboard");
  const isMarketingOrApp = !isStaffPath && !pathname.startsWith("/api/") && !pathname.startsWith("/_next");

  if (surface === "participant" && (isStaffPath || isApiStaffPath)) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  if (surface === "admin" && isMarketingOrApp && pathname !== "/") {
    // Admin-only deployment: any non-admin app route bounces to admin login.
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (surface === "admin" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
};
