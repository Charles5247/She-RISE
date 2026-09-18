import { getSessionUser } from "@/lib/auth";
import { seedIfEmpty } from "@/lib/seed";
import { withErrorHandling } from "@/lib/apiError";

export const GET = withErrorHandling(async () => {
  await seedIfEmpty();
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Not signed in." }, { status: 401 });
  // last_name is included here because this is the user's OWN record being
  // returned to herself — not a public/peer-facing read. See access.ts.
  return Response.json({ user });
});
