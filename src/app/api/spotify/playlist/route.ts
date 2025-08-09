import { env } from "@/env";

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
  const playlistId = env.SPOTIFY_PLAYLIST_ID;

  if (!clientId || !clientSecret || !playlistId) {
    return new Response(JSON.stringify({ error: "Missing Spotify env vars" }), { status: 500 });
  }

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    // no-store since token is short-lived; rely on playlist cache separately
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return new Response(JSON.stringify({ error: "Token fetch failed", detail: text }), { status: 500 });
  }

  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const playlistRes = await fetch(`https://api.spotify.com/v1/playlists/${encodeURIComponent(playlistId)}`, {
    headers: { Authorization: `Bearer ${access_token}` },
    // Let Next cache this response per revalidate
    next: { revalidate },
  });

  if (!playlistRes.ok) {
    const text = await playlistRes.text();
    return new Response(JSON.stringify({ error: "Playlist fetch failed", detail: text }), { status: 500 });
  }

  const json = await playlistRes.json();
  return new Response(JSON.stringify(json), { headers: { "Content-Type": "application/json" } });
} 