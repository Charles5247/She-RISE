import { getSessionUser } from "@/lib/auth";
import { seedIfEmpty } from "@/lib/seed";

export async function GET() {
  await seedIfEmpty();
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Not signed in." }, { status: 401 });
  // last_name is included here because this is the user's OWN record being
  // returned to herself — not a public/peer-facing read. See access.ts.
  return Response.json({ user });
}
