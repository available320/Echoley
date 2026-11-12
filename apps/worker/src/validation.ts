export function assertOwnedStoragePath(ownerId: string, projectId: string, storagePath: string): void {
  const prefix = `${ownerId}/${projectId}/`;
  const parts = storagePath.split("/");
  if (!ownerId || !projectId || !storagePath.startsWith(prefix) || storagePath.startsWith("/") || storagePath.includes("\\") || parts.some((part) => part === "." || part === ".." || part.length === 0)) {
    throw new Error("Source path is outside the owner project folder.");
  }
}

export function assertVideoSize(bytes: number, maxBytes: number): void {
  if (!Number.isFinite(bytes) || bytes < 1) throw new Error("Video file is empty or has an invalid size.");
  if (!Number.isFinite(maxBytes) || maxBytes < 1) throw new Error("MAX_VIDEO_BYTES must be a positive number.");
  if (bytes > maxBytes) throw new Error("Source video exceeds configured MAX_VIDEO_BYTES");
}

export function validateClipInterval(startValue: unknown, endValue: unknown, duration: number): { start: number; end: number } {
  const start = Number(startValue);
  const end = Number(endValue);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start || end > duration + 0.25) {
    throw new Error("Clip timing is outside the source video");
  }
  return { start, end: Math.min(end, duration) };
}

export function validateAspectRatio(value: unknown): "9:16" | "1:1" | "4:5" | "16:9" {
  if (value === "9:16" || value === "1:1" || value === "4:5" || value === "16:9") return value;
  throw new Error("Unsupported aspect ratio.");
}

export function validateVideoUrl(value: unknown): URL {
  if (typeof value !== "string" || value.length > 4096) throw new Error("Video URL must be a valid string under 4096 characters.");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Video URL is invalid."); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Video URL must use HTTPS and must not contain embedded credentials.");
  const host = url.hostname.toLowerCase().replace(/^www\\./, "");
  const allowed = host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com" ||
    host === "tiktok.com" || host.endsWith(".tiktok.com") ||
    host === "instagram.com" || host.endsWith(".instagram.com") ||
    host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch";
  const direct = /\\.(mp4|mov|webm|m4v)$/i.test(url.pathname);
  if (!allowed && !direct) throw new Error("Unsupported video URL host or file type.");
  return url;
}
