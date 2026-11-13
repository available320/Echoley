# Security review — foundation branch

## Verified controls
- Supabase Auth verifies users in the API function.
- API gateway JWT verification is enabled (deployed function version 3).
- User-owned projects, media and clips have owner-scoped RLS policies.
- Source and render buckets are private; source uploads and reads are scoped to the user's first path segment.
- Worker uses server-only Supabase credentials; client apps use only publishable keys.
- Queue claim RPC execution is restricted to service_role.

## Findings / required work
- Supabase leaked-password protection was reported disabled; enable it in Auth security settings.
- Review password/email confirmation, redirect allowlists, rate limits and MFA policy before public release.
- Existing storage policies allow upload without an explicit maximum file size policy in the inspected SQL; set bucket-level size/MIME restrictions and test actual limits.
- Validate storage object ownership against source_media rows before worker download, and implement quota enforcement.
- Add account deletion with cascade cleanup for storage objects, job cancellation and provider data deletion.
- Add malware/content safety checks and secure temporary-file cleanup.
- Restrict CORS from wildcard to approved production domains before public release.
- Add abuse protection, API rate limiting, audit logging and webhook signature verification.
- Do not accept arbitrary remote URLs in the worker; the current worker only processes uploaded storage objects.
