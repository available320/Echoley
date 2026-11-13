# Echoley™

Echoley™ is an AI-assisted video clipping studio with a Next.js creator workspace, an Expo mobile companion, a Supabase-backed data and media layer, and a background processing worker.

## Repository layout
- `apps/web` — creator workspace, authentication, project management, uploads and clip review.
- `apps/mobile` — Expo / React Native sign-in, projects and video upload.
- `apps/worker` — PostgreSQL queue consumer, FFmpeg processing, OpenAI transcription and highlight suggestions.
- `supabase/functions/echoley-api` — authenticated API source.
- `supabase/migrations` — checked-in migration sources.
- `docs/architecture.md` — system topology and trust boundaries.
- `docs/launch-readiness.md` — remaining validation and release gates.

## Important operating facts
The worker must be deployed separately and requires server-only Supabase service credentials and an OpenAI API key. No secrets belong in client builds or Git. The social-link flow currently registers metadata; it does not download a video. The editor is a clip-review and render-request foundation, not a full timeline editor.

A successful typecheck/build does not prove real-video processing, billing, or app-store readiness. Follow the launch checklist and verify a real video end to end before advertising those capabilities.
