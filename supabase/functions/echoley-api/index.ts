import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function identifyProvider(input: URL) {
  const host = input.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") return "youtube";
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (host === "facebook.com" || host === "fb.watch" || host.endsWith(".facebook.com")) return "facebook";
  return "direct_or_unsupported";
}

async function getPublicMetadata(sourceUrl: URL, provider: string) {
  if (provider === "youtube") {
    const endpoint = new URL("https://www.youtube.com/oembed");
    endpoint.searchParams.set("url", sourceUrl.toString());
    endpoint.searchParams.set("format", "json");
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("This YouTube video could not be previewed. It may be private, restricted, or unavailable.");
    const data = await response.json();
    return { title: data.title ?? null, author_name: data.author_name ?? null, thumbnail_url: data.thumbnail_url ?? null, provider_name: "YouTube" };
  }
  if (provider === "tiktok") {
    const endpoint = new URL("https://www.tiktok.com/oembed");
    endpoint.searchParams.set("url", sourceUrl.toString());
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("This TikTok video could not be previewed. Check that it is public and the link is valid.");
    const data = await response.json();
    return { title: data.title ?? null, author_name: data.author_name ?? null, thumbnail_url: data.thumbnail_url ?? null, provider_name: "TikTok" };
  }
  if (provider === "instagram" || provider === "facebook") {
    return { provider_name: provider === "instagram" ? "Instagram" : "Facebook", preview_status: "provider_auth_required" };
  }
  return { provider_name: null, preview_status: "direct_media_validation_pending" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return respond({ error: "Authentication required" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: authError } = await userClient.auth.getUser();
  if (authError || !userData.user) return respond({ error: "Invalid or expired session" }, 401);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const userId = userData.user.id;
  const parts = new URL(req.url).pathname.split("/").filter(Boolean)
    .filter((part) => !["functions", "v1", "echoley-api"].includes(part));

  try {
    if (req.method === "GET" && parts[0] === "projects" && parts.length === 1) {
      const { data, error } = await userClient.from("projects")
        .select("id,name,description,status,created_at,updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return respond({ projects: data });
    }

    if (req.method === "POST" && parts[0] === "projects" && parts.length === 1) {
      const body = await req.json();
      const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "Untitled project";
      if (!name) return respond({ error: "Project name is required" }, 400);
      const { data, error } = await userClient.from("projects").insert({ owner_id: userId, name }).select().single();
      if (error) throw error;
      return respond({ project: data }, 201);
    }

    if (req.method === "POST" && parts[0] === "projects" && parts[2] === "sources" && parts.length === 3) {
      const projectId = parts[1];
      const body = await req.json();
      if (body.source_type !== "url" || typeof body.source_url !== "string") {
        return respond({ error: "A video URL is required." }, 400);
      }

      let sourceUrl: URL;
      try { sourceUrl = new URL(body.source_url.trim()); }
      catch { return respond({ error: "Paste a valid video URL, including https://." }, 400); }

      if (sourceUrl.protocol !== "https:") return respond({ error: "For safety, video links must use HTTPS." }, 400);
      if (sourceUrl.username || sourceUrl.password) return respond({ error: "URLs containing embedded credentials are not supported." }, 400);

      const provider = identifyProvider(sourceUrl);
      if (provider === "direct_or_unsupported") {
        const isDirectFile = /\.(mp4|mov|webm|m4v)(\?.*)?$/i.test(sourceUrl.pathname + sourceUrl.search);
        if (!isDirectFile) return respond({ error: "Supported links: public YouTube and TikTok videos, plus direct MP4, MOV or WebM media links. Instagram and Facebook importing need provider authorization." }, 422);
      }

      const { data: project, error: projectError } = await userClient.from("projects")
        .select("id").eq("id", projectId).single();
      if (projectError || !project) return respond({ error: "Project not found" }, 404);

      let metadata: Record<string, unknown> = { source_provider: provider };
      let title = typeof body.title === "string" ? body.title.slice(0, 255) : null;
      if (provider === "youtube" || provider === "tiktok") {
        try {
          const resolved = await getPublicMetadata(sourceUrl, provider);
          metadata = { ...metadata, ...resolved, import_mode: "oembed_preview" };
          if (!title && typeof resolved.title === "string") title = resolved.title.slice(0, 255);
        } catch (error) {
          return respond({ error: error instanceof Error ? error.message : "Could not read video details from this link." }, 422);
        }
      } else if (provider === "instagram" || provider === "facebook") {
        metadata = { ...metadata, import_mode: "blocked_pending_provider_authorization" };
        return respond({ error: "This link is recognised, but importing it requires an authorised Instagram/Facebook connection. Echoley will not bypass private access or platform restrictions.", provider, next_step: "Connect the official Meta video API before importing." }, 424);
      } else {
        metadata = { ...metadata, import_mode: "direct_media_pending_worker_fetch" };
      }

      const { data, error } = await userClient.from("source_media").insert({
        project_id: projectId, owner_id: userId, source_type: "url",
        source_url: sourceUrl.toString(), original_filename: title,
        metadata, status: "uploaded",
      }).select().single();
      if (error) throw error;

      return respond({
        source: data,
        provider,
        metadata,
        import_status: "link_registered",
        media_downloaded: false,
        message: "Link recognised and details saved. Downloading the media and starting clip generation requires the Echoley video worker; no video file has been downloaded yet.",
      }, 201);
    }

    if (req.method === "POST" && parts[0] === "sources" && parts[2] === "jobs" && parts.length === 3) {
      const sourceId = parts[1];
      const body = await req.json().catch(() => ({}));
      const jobType = body.job_type ?? "analyze";
      if (!["transcribe", "analyze", "render"].includes(jobType)) return respond({ error: "This operation is not available yet." }, 422);
      const { data: source, error: sourceError } = await userClient.from("source_media").select("id,project_id,storage_path,source_type").eq("id", sourceId).single();
      if (sourceError || !source) return respond({ error: "Source media not found" }, 404);
      if (source.source_type !== "upload" || !source.storage_path) return respond({ error: "Upload the original video file before processing this source." }, 422);
      let clipId: string | null = null;
      if (jobType === "render") {
        if (typeof body.clip_id !== "string" || !body.clip_id) return respond({ error: "A clip_id is required to render." }, 400);
        const { data: clip, error: clipError } = await userClient.from("clips").select("id").eq("id", body.clip_id).eq("source_media_id", sourceId).single();
        if (clipError || !clip) return respond({ error: "Clip not found for this source." }, 404);
        clipId = clip.id;
      }
      const suppliedKey = typeof body.idempotency_key === "string" ? body.idempotency_key.trim() : "";
      if (suppliedKey.length > 180) return respond({ error: "idempotency_key is too long." }, 400);
      const idempotencyKey = suppliedKey || crypto.randomUUID();
      const { data: existing, error: lookupError } = await admin.from("processing_jobs").select("*").eq("owner_id", userId).eq("idempotency_key", idempotencyKey).maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) return respond({ job: existing, dispatch_status: "queued_worker_required", message: "This request was already recorded." }, 200);
      const { data: job, error } = await admin.from("processing_jobs").insert({ owner_id: userId, project_id: source.project_id, source_media_id: sourceId, clip_id: clipId, job_type: jobType, status: "queued", input: body.options ?? {}, idempotency_key: idempotencyKey }).select().single();
      if (error) {
        if (error.code === "23505") {
          const { data: raced } = await admin.from("processing_jobs").select("*").eq("owner_id", userId).eq("idempotency_key", idempotencyKey).maybeSingle();
          if (raced) return respond({ job: raced, dispatch_status: "queued_worker_required" }, 200);
        }
        throw error;
      }
      if (jobType === "render" && clipId) {
        const { error: clipUpdateError } = await userClient.from("clips").update({ status: "rendering" }).eq("id", clipId);
        if (clipUpdateError) {
          await admin.from("processing_jobs").delete().eq("id", job.id).eq("owner_id", userId);
          throw clipUpdateError;
        }
      }
      return respond({ job, dispatch_status: "queued_worker_required", message: "Your job is safely queued. It will start when the Echoley worker is running." }, 202);
    }

    return respond({ error: "Route not found" }, 404);
  } catch (error) {
    console.error(error);
    return respond({ error: "Request could not be completed" }, 500);
  }
});