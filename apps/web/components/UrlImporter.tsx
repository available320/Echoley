"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UrlImporter({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<"success" | "error" | "info">("info");

  async function addLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== "https:") throw new Error("Use a secure https:// video link.");
      const sb = createSupabaseBrowserClient();
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw new Error("Your session expired. Sign in again.");
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!base) throw new Error("Supabase is not configured.");
      const response = await fetch(
        base + "/functions/v1/echoley-api/projects/" + projectId + "/sources",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + session.access_token,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ source_type: "url", source_url: parsed.toString() }),
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Echoley could not add this link.");
      setKind("success");
      setMessage(payload.message ?? "Video link added to your project.");
      setUrl("");
    } catch (error) {
      setKind("error");
      setMessage(error instanceof Error ? error.message : "Could not add this link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ marginTop: 14, padding: 14, border: "1px solid var(--line)", borderRadius: 12 }}>
      <h4 style={{ margin: "0 0 6px" }}>Add a video using a URL</h4>
      <p className="muted" style={{ margin: "0 0 12px", fontSize: 13 }}>
        Paste a public YouTube or TikTok link, or a direct MP4, MOV or WebM link.
      </p>
      <form onSubmit={addLink} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className="text-input"
          type="url"
          inputMode="url"
          autoComplete="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://…"
          aria-label="Video URL"
          disabled={busy}
          style={{ flex: "1 1 240px", minWidth: 0 }}
        />
        <button className="button" type="submit" disabled={busy || !url.trim()}>
          {busy ? "Adding link…" : "Add video link"}
        </button>
      </form>
      <p className="muted" style={{ margin: "10px 0 0", fontSize: 12 }}>
        Link support is currently a preview/registration step. The video is not downloaded or processed yet; the worker and any required platform authorization must be enabled first.
      </p>
      {message && (
        <p role="status" aria-live="polite" style={{ margin: "10px 0 0", fontSize: 13, color: kind === "error" ? "#ff9b9b" : kind === "success" ? "#b8f28a" : "inherit" }}>
          {message}
        </p>
      )}
    </section>
  );
}
