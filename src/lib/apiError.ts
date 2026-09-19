/**
 * Wraps a route handler so any unhandled throw (DB connection failure, DB
 * query error, etc.) becomes a real JSON 500 response instead of a bare
 * Next.js crash with no body. Without this, a DB outage crashes the route
 * with no response body at all, and the frontend's `res.json()` call then
 * throws its own unrelated-looking "Unexpected end of JSON input" error —
 * hiding the actual problem from both the user and whoever's debugging it.
 *
 * Usage: `export const POST = withErrorHandling(async (req) => {...});`
 *
 * Currently applied to the auth routes (signup, login, admin/login,
 * verify-otp, resend-otp, forgot-password, reset-password,
 * complete-profile, logout, me) since those are the ones a broken DB
 * connection hits first (nothing works without auth). The same wrapper is
 * safe to apply to the other ~27 API routes in a follow-up pass — it's a
 * pure catch-all, it doesn't change any success-path behavior.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[api] unhandled error:", err);
      return Response.json(
        { code: "SERVER_ERROR", message: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}
