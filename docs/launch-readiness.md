# Launch readiness

## Repository and code
- [x] Version the Edge Function source in this repository.
- [x] Add web build/typecheck, worker typecheck and mobile typecheck CI jobs.
- [x] Connect dashboard to source media and suggested clip review.
- [x] Run CI and fix all failures (web build, worker typecheck, mobile typecheck and Expo export pass on the foundation branch).
- [ ] Add automated tests for API authorization/idempotency and worker queue retry/render behavior.
- [ ] Recover the original six missing migration source files; do not reconstruct historical SQL from live state or memory.
- [ ] Reconcile migration history and prove a clean development bootstrap.
- [ ] Add resumable uploads, quota enforcement and orphan cleanup.
- [ ] Complete editor timeline, captions, crop/reframe and export controls.

## External operations — separate approval required
- [ ] Configure and test email verification, password reset and leaked-password protection.
- [ ] Verify RLS and private storage behavior with real user accounts.
- [ ] Configure worker service and server-only Supabase/OpenAI credentials.
- [ ] Run a real video through upload → queue → transcription → highlights → render → private download.
- [ ] Add provider cost controls, observability, alerts, backups and recovery tests.
- [ ] Choose billing provider after merchant eligibility; implement verified webhooks and entitlements.
- [ ] Publish privacy, terms, copyright and retention policies.
- [ ] Complete mobile deep links, signing, physical-device testing and app-store compliance.
- [ ] Verify domain, TLS, production secrets, rollback and support operations.

Never commit real credentials. Do not represent a successful build as proof that production video processing, billing or app-store release is ready.
