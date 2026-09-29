import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiError";
import { MATERIAL_MAX_BYTES, materialType } from "@/lib/course-materials";
import { materialStorage, materialStorageConfigured } from "@/lib/material-storage";

export const GET = withErrorHandling(async () => {
  const user = await requireRole("trainer");
  if (user instanceof Response) return user;
  const db = getDb();
  const [courses, materials] = await Promise.all([
    db.prepare("SELECT id, title FROM pathways ORDER BY order_index, title").all(),
    db.prepare(`SELECT m.id, m.title, p.title AS course_title, m.filename, m.size_bytes, m.mime_type, m.status, m.created_at
      FROM course_materials m JOIN pathways p ON p.id = m.pathway_id WHERE m.trainer_id = ? ORDER BY m.created_at DESC`).all(user.id),
  ]);
  return Response.json({ courses, materials, storageReady: materialStorageConfigured() });
});

export const POST = withErrorHandling(async (req: Request) => {
  const user = await requireRole("trainer");
  if (user instanceof Response) return user;
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
  const mime = materialType(filename);
  if (!title || title.length > 150 || !filename || filename.length > 240 || /[\/\\\x00-\x1f]/.test(filename) || !mime ||
      typeof body?.courseId !== "string" || !Number.isSafeInteger(body?.size) || body.size < 1 || body.size > MATERIAL_MAX_BYTES) {
    return Response.json({ message: "Choose a course, title, and a video, PDF, or PowerPoint file up to 50 MB." }, { status: 400 });
  }
  const db = getDb();
  if (!await db.prepare("SELECT id FROM pathways WHERE id = ?").get(body.courseId)) {
    return Response.json({ message: "Course not found. Refresh the course list." }, { status: 404 });
  }
  if (!materialStorageConfigured()) return Response.json({ message: "Uploads are not configured yet. Contact your administrator." }, { status: 503 });
  const storage = await materialStorage();
  const id = randomUUID();
  const path = `${user.id}/${id}.${filename.split(".").pop()!.toLowerCase()}`;
  const { data, error } = await storage.createSignedUploadUrl(path);
  if (error) throw error;
  await db.prepare(`INSERT INTO course_materials (id, trainer_id, pathway_id, title, filename, storage_path, mime_type, size_bytes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, user.id, body.courseId, title, filename, path, mime, body.size);
  return Response.json({ id, uploadUrl: data.signedUrl, mimeType: mime }, { status: 201 });
});
