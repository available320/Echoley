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