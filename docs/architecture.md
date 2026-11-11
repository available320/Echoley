# Echoley™ architecture

## Existing verified foundation
The existing healthy Supabase project has profiles, projects, source_media, clips, processing_jobs, subscriptions, credit_transactions and transcriptions tables. Private Storage buckets echoley-sources and echoley-renders exist. The active echoley-api Edge Function authenticates user bearer sessions, lists/creates projects, registers supported URL metadata and creates job rows. It explicitly does not download videos or process queued jobs.

## Target topology
- Web: Next.js App Router.
- Mobile: Expo / React Native.
- Identity/data: existing Supabase Auth + PostgreSQL + RLS.
- Media: existing private Supabase Storage buckets.
- API: authenticated Supabase Edge Functions and user-scoped database operations.
- Processing: separate worker using a durable PostgreSQL-backed queue with atomic job claiming.
- Rendering: FFmpeg in a worker container.
- AI: configured transcription and highlight-analysis providers.
- Billing: provider-neutral records until merchant eligibility and webhook secrets are configured.

## Trust boundaries
1. Clients use only the publishable key and signed-in user's access token.
2. RLS enforces ownership for user-owned rows and storage objects.
3. Secret/service keys stay on trusted servers only.
4. Workers validate job ownership and source paths.
5. Payment state changes only from verified provider webhooks.
6. Import only media users have rights to process and platform terms permit.

## Queue decision
The existing Render Key Value instance has persistence disabled and must not be the only durable queue. PostgreSQL processing_jobs is the source of truth. A worker should atomically claim jobs using row locking (e.g. FOR UPDATE SKIP LOCKED), then persist progress, retries and terminal state.

## Known API limitations
No direct upload intent, media download, transcription, highlight scoring, FFmpeg rendering, editor, billing webhook or worker dispatch exists yet. Do not describe these as working features.
