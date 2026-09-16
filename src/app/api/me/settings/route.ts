import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// GET/PATCH /api/me/settings — screen 21: account, wifi-only downloads,
// panic-hide toggle (on by default per spec), language, crosspost connections.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const db = getDb();
  const row = (await db
    .prepare(
      `SELECT language, wifi_only_downloads, panic_hide_enabled, crosspost_fb_connected, crosspost_li_connected
       FROM users WHERE id = ?`
    )
    .get(user.id)) as Record<string, unknown>;
  return Response.json({
    settings: {
      language: row.language,
      wifiOnlyDownloads: !!row.wifi_only_downloads,
      panicHideEnabled: !!row.panic_hide_enabled,
      fbConnected: !!row.crosspost_fb_connected,
      liConnected: !!row.crosspost_li_connected,
    },
  });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ code: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { language, wifiOnlyDownloads, panicHideEnabled, fbConnected, liConnected, pin } = body as {
    language?: string;
    wifiOnlyDownloads?: boolean;
    panicHideEnabled?: boolean;
    fbConnected?: boolean;
    liConnected?: boolean;
    pin?: string;
  };
  const db = getDb();
  await db.prepare(
    `UPDATE users SET
       language = COALESCE(?, language),
       wifi_only_downloads = COALESCE(?, wifi_only_downloads),
       panic_hide_enabled = COALESCE(?, panic_hide_enabled),
       crosspost_fb_connected = COALESCE(?, crosspost_fb_connected),
       crosspost_li_connected = COALESCE(?, crosspost_li_connected),
       updated_at = NOW()
     WHERE id = ?`
  ).run(
    language ?? null,
    wifiOnlyDownloads === undefined ? null : wifiOnlyDownloads ? 1 : 0,
    panicHideEnabled === undefined ? null : panicHideEnabled ? 1 : 0,
    fbConnected === undefined ? null : fbConnected ? 1 : 0,
    liConnected === undefined ? null : liConnected ? 1 : 0,
    user.id
  );
  if (pin) {
    const { hashPassword } = await import("@/lib/auth");
    await db.prepare(`UPDATE users SET pin_hash = ? WHERE id = ?`).run(hashPassword(pin), user.id);
  }
  return Response.json({ ok: true });
}
