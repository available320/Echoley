# Echoley™ architecture

## Components
- Web: Next.js App Router with Supabase SSR/browser clients.
- Mobile: Expo / React Native with persistent Supabase Auth sessions and native file transfer.
- Identity and data: Supabase Auth, PostgreSQL and row-level security.
- Media: private `echoley-sources` and `echoley-renders` buckets.
- API: authenticated Edge Function, source maintained at `supabase/functions/echoley-api/index.ts`.
- Processing: separate Node worker using the PostgreSQL `processing_jobs` queue and atomic claim RPC.
- Media processing: FFmpeg/FFprobe, OpenAI audio transcription and highlight suggestions.

## Upload-to-review flow
1. A signed-in user creates a project.
2. The client uploads an original video into the user's project folder in private source storage.
3. A source_media row is recorded and the authenticated API creates an idempotent analysis job.
4. The worker claims the job, checks source ownership and expected owner/project storage path, probes the video, transcribes audio and saves suggested draft clips.
5. The dashboard refreshes source and clip status and displays reviewable moments.
6. The user can request a render for an owned clip. The worker stores the MP4 in private render storage.
7. The dashboard creates a short-lived signed download URL for a ready render.

## Security boundaries
- Clients use only the publishable key and signed-in user's access token.
- Supabase RLS is relied on for owner-scoped reads and writes.
- Service-role and AI provider keys stay in the worker/API server environment only.
- The worker validates that source storage paths begin with the expected owner/project prefix.
- Import only media users have rights to process and platform terms permit.
- Payment state must only be changed by verified provider webhooks when billing is implemented.

## Queue and retry model
PostgreSQL is the durable queue. The existing Render Key Value has persistence disabled and is not used as the source of truth. The worker calls `claim_next_processing_job()`, renews leases and persists retry/terminal states. The API accepts only `transcribe`, `analyze`, and `render` jobs, which correspond to worker operations.

## Current product boundaries
- Social URL registration stores metadata only; it does not download the video.
- The web upload path is not yet a resumable/chunked upload implementation.
- Mobile upload uses native file transfer to avoid loading the full video into JavaScript memory, but needs device and large-file testing.
- The dashboard offers media status, suggested clip review and render requests; it is not a full multitrack editor.
- Billing, entitlements, account deletion, support tooling, analytics and production-grade observability remain incomplete.
- No real-video end-to-end run is claimed until one is successfully tested after worker deployment.
