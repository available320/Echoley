import test from "node:test";
import assert from "node:assert/strict";
import { assertOwnedStoragePath, assertVideoSize, validateClipInterval } from "./validation.js";

test("accepts a source path inside its owner project folder", () => {
  assert.doesNotThrow(() => assertOwnedStoragePath("user-1", "project-1", "user-1/project-1/video.mp4"));
});
test("rejects paths outside the owner project prefix", () => {
  assert.throws(() => assertOwnedStoragePath("user-1", "project-1", "user-2/project-1/video.mp4"));
  assert.throws(() => assertOwnedStoragePath("user-1", "project-1", "user-1/project-1/../private.mp4"));
  assert.throws(() => assertOwnedStoragePath("user-1", "project-1", "user-1\\project-1\\video.mp4"));
});
test("enforces positive video size and configured limit", () => {
  assert.doesNotThrow(() => assertVideoSize(1024, 2048));
  assert.throws(() => assertVideoSize(0, 2048));
  assert.throws(() => assertVideoSize(2049, 2048), /MAX_VIDEO_BYTES/);
});
test("validates clip ranges against source duration", () => {
  assert.deepEqual(validateClipInterval(5, 15, 30), { start: 5, end: 15 });
  assert.throws(() => validateClipInterval(-1, 10, 30));
  assert.throws(() => validateClipInterval(10, 10, 30));
  assert.throws(() => validateClipInterval(10, 31, 30));
});