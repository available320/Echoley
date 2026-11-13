# Echoley™ video worker

The worker is a separate background process. PostgreSQL `processing_jobs` is the durable queue; the existing non-persistent Render Key Value is not used as the job store.

## Implemented job types
- `transcribe`: fetch an owner-scoped private upload, probe with FFprobe, extract audio in chunks, transcribe with OpenAI and persist timestamped segments.
- `analyze`: transcribe and request suggested highlights from the configured OpenAI model, then save draft clips for user review.
- `render`: render an owner-owned clip interval with FFmpeg, upload MP4 to private render storage and mark the clip ready.

The API rejects job types not implemented by this worker. URL-only sources are metadata records; upload the original media file before processing.

## Required environment
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `OPENAI_API_KEY` (server-only)

Optional configuration includes source/render bucket names, temporary directory, maximum video size and highlight model. Never place service-role or provider keys in web/mobile public environment variables.

## Runtime
The worker claims jobs through the service-only `claim_next_processing_job()` RPC, renews 10-minute leases, persists retries and handles termination signals. The container needs FFmpeg and FFprobe. Size compute and ephemeral disk against expected video sizes.

## Verification boundary
Typechecking is not proof of a working video pipeline. After a separately approved worker deployment and credential configuration, test a real video through upload, queue, transcription, highlight review, rendering and private download. This repository update does not deploy the worker or alter production infrastructure.
