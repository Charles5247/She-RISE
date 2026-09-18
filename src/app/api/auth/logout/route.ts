import { destroySession } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";

export const POST = withErrorHandling(async () => {
  await destroySession();
  return Response.json({ ok: true });
});
