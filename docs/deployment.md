# Deployment guide

## Web (Render or another Node host)
- Root directory: `apps/web` (or use monorepo-aware commands from root).
- Install: `corepack enable && pnpm install`.
- Build: `pnpm --filter @echoley/web build`.
- Start: `pnpm --filter @echoley/web start`.
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Worker (Render background worker)
- Runtime: Docker; Dockerfile: `apps/worker/Dockerfile`; context: repository root.
- Set server-only secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`.
- Optional: `VIDEO_TEMP_DIR`, `MAX_VIDEO_BYTES`, `SOURCE_BUCKET`, `RENDER_BUCKET`, `HIGHLIGHT_MODEL`.
- Worker requires FFmpeg/FFprobe and sufficient RAM/disk for the chosen video size. A free Redis instance with persistence disabled is not a durable queue.
- Use a paid worker plan appropriate to media duration and concurrency; do not enable autoscaling until costs and limits are known.

## Mobile
- Set Expo public environment variables `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Configure matching Supabase Auth redirect URLs, iOS bundle ID and Android package ID.
- Build signed Android/iOS artifacts with EAS after store accounts, privacy disclosures and signing credentials are available.

## Before connecting production
1. Run CI and a staging end-to-end test.
2. Add secrets through host dashboards; never commit them.
3. Configure health checks, logs, alerts, backups and rollback.
4. Verify the worker can claim, process, retry and complete a real uploaded video.
5. Verify account deletion and storage cleanup.
