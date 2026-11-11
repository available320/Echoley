# Environment variables

## Web
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

## Mobile
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

## Worker (server-only)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- VIDEO_TEMP_DIR (optional)
- MAX_VIDEO_BYTES (optional; default 10 GiB)
- SOURCE_BUCKET (optional; default echoley-sources)
- RENDER_BUCKET (optional; default echoley-renders)
- HIGHLIGHT_MODEL (optional; default gpt-4o-mini)

Never use the service role or provider keys in web/mobile environment variables. Set them only in the worker's private secret configuration.
