# Echoley™ video worker

The worker will run as a separate Render background service. It must atomically claim queued processing_jobs rows, validate and fetch owned source media, probe media with FFprobe, transcribe, derive reviewable highlight suggestions, render with FFmpeg, upload to private echoley-renders storage and persist progress/errors/retries. It must handle SIGTERM gracefully. Do not use the existing non-persistent Render Key Value as the sole job store. Worker is not yet deployed or complete.
