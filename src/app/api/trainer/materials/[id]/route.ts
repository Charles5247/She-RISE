import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";
import { materialStorage, materialStorageConfigured } from "@/lib/material-storage";

type Context = { params: Promise<{ id: string }> };
type Material = { storage_path: string; filename: string; mime_type: string; size_bytes: number; status: string };
async function ownedMaterial(id: string, trainer: string) {
  return getDb().prepare<Material>("SELECT storage_path, filename, mime_type, size_bytes, status FROM course_materials WHERE id = ? AND trainer_id = ?").get(id, trainer);
}
const missing = () => Response.json({ message: "Material not found." }, { status: 404 });
const unavailable = () => Response.json({ message: "Material storage is not configured. Contact your administrator." }, { status: 503 });

export const PATCH = withErrorHandling(async (_req: Request, context: Context) => {
  const user = await requireRole("trainer");
  if (user instanceof Response) return user;
  const { id } = await context.params;
  const row = await ownedMaterial(id, user.id);
  if (!row) return missing();
  if (!materialStorageConfigured()) return unavailable();
  const storage = await materialStorage();
  const { data, error } = await storage.info(row.storage_path);
  if (error || !data) return Response.json({ message: "Upload not found. Please upload the file again." }, { status: 409 });
  if (Number(data.size) !== Number(row.size_bytes) || data.contentType !== row.mime_type) {
    return Response.json({ message: "The uploaded file does not match its declared size or type. Remove it and try again." }, { status: 400 });
  }
  await getDb().prepare("UPDATE course_materials SET status = 'ready' WHERE id = ? AND trainer_id = ?").run(id, user.id);
  return Response.json({ ok: true });
});

export const GET = withErrorHandling(async (_req: Request, context: Context) => {
  const user = await requireRole("trainer");
  if (user instanceof Response) return user;
  const { id } = await context.params;
  const row = await ownedMaterial(id, user.id);
  if (!row || row.status !== "ready") return missing();
  if (!materialStorageConfigured()) return unavailable();
  const { data, error } = await (await materialStorage()).createSignedUrl(row.storage_path, 300, { download: row.filename });
  if (error) throw error;
  return Response.json({ url: data.signedUrl }, { headers: { "Cache-Control": "no-store" } });
});

export const DELETE = withErrorHandling(async (_req: Request, context: Context) => {
  const user = await requireRole("trainer");
  if (user instanceof Response) return user;
  const { id } = await context.params;
  const row = await ownedMaterial(id, user.id);
  if (!row) return missing();
  if (!materialStorageConfigured()) return unavailable();
  const { error } = await (await materialStorage()).remove([row.storage_path]);
  if (error) throw error;
  await getDb().prepare("DELETE FROM course_materials WHERE id = ? AND trainer_id = ?").run(id, user.id);
  return Response.json({ ok: true });
});
