export const MATERIAL_MAX_BYTES = 50 * 1024 * 1024;
export const MATERIAL_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};
export function materialType(filename: string): string | undefined {
  return MATERIAL_TYPES[filename.split(".").pop()?.toLowerCase() ?? ""];
}
export interface CourseMaterial {
  id: string;
  title: string;
  course_title: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
  status: "pending" | "ready";
  created_at: string;
}
