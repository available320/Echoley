# Launch readiness
- [ ] Configure and test email verification, password reset and leaked-password protection.
- [ ] Verify RLS owner policies for every table and private storage operation.
- [ ] Implement resumable uploads and cleanup.
- [ ] Implement durable job claiming, retries, idempotency and cancellation.
- [ ] Deploy worker with FFmpeg and verify real output.
- [ ] Configure transcription/highlight provider and cost limits.
- [ ] Add unit, integration, browser and mobile end-to-end tests.
- [ ] Add observability, alerts, backups and recovery tests.
- [ ] Select billing provider after merchant eligibility and webhook verification.
- [ ] Publish privacy, terms, copyright and retention policies.
- [ ] Complete mobile deep links, signing and app store compliance.
- [ ] Verify domain, TLS, production secrets and rollback.

Never commit real credentials. Missing provider keys must fail clearly, not simulate success.
