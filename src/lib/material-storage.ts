import { getSupabaseAdminClient } from "./supabase";
import { MATERIAL_MAX_BYTES, MATERIAL_TYPES } from "./course-materials";

export const MATERIAL_BUCKET = "course-materials";
export function materialStorageConfigured() {
  return Boolean((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
export async function materialStorage() {
  const client = getSupabaseAdminClient();
  const { data: bucket, error } = await client.storage.getBucket(MATERIAL_BUCKET);
  if (error) {
    if (String(error.statusCode) !== "404") throw error;
    const created = await client.storage.createBucket(MATERIAL_BUCKET, {
      public: false, fileSizeLimit: MATERIAL_MAX_BYTES, allowedMimeTypes: Object.values(MATERIAL_TYPES),
    });
    if (created.error && String(created.error.statusCode) !== "409") throw created.error;
    // Recheck even after a concurrent create; never issue URLs to a public bucket.
    const check = await client.storage.getBucket(MATERIAL_BUCKET);
    if (check.error || !check.data || check.data.public) throw new Error("Private material storage is unavailable.");
  } else if (bucket.public) {
    throw new Error("Course materials must use a private bucket.");
  }
  return client.storage.from(MATERIAL_BUCKET);
}
