"use client";

import { useEffect, useState } from "react";

// Module-level cache: survives client-side navigations, resets on full reload/HMR
let cachedPlaylistData: any | null = null;
let cachedPlaylistError: string | null = null;
let inflight: Promise<any> | null = null;

type PlaylistTrack = {
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
    external_urls?: { spotify?: string };
    duration_ms?: number;
    album?: { images?: { url: string; width?: number; height?: number }[] };
  } | null;
};

function msToMin(ms?: number) {
  if (!ms && ms !== 0) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function SpotifyPlaylist() {
  const [data, setData] = useState<any | null>(cachedPlaylistData);
  const [error, setError] = useState<string | null>(cachedPlaylistError);
  const [loading, setLoading] = useState(!cachedPlaylistData && !cachedPlaylistError);

  useEffect(() => {
    let cancelled = false;
    if (cachedPlaylistData || cachedPlaylistError) {
      // Already have a result in memory; no fetch on navigation
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        inflight = inflight ?? fetch("/api/spotify/playlist").then(async (r) => {
          if (!r.ok) throw new Error(await r.text());
          return r.json();
        });
        const json = await inflight;
        cachedPlaylistData = json;
        cachedPlaylistError = null;
        if (!cancelled) setData(json);
      } catch (e: any) {
        const msg = e?.message ?? "Failed to load";
        cachedPlaylistError = msg;
        cachedPlaylistData = null;
        if (!cancelled) setError(msg);
      } finally {
        inflight = null;
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-white/70">Loading playlist…</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!data) return null;

  const items: PlaylistTrack[] = data?.tracks?.items ?? [];
  const cover: string | undefined = data?.images?.[0]?.url;
  const owner: string | undefined = data?.owner?.display_name;
  const playlistUrl: string | undefined = data?.external_urls?.spotify;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt="Playlist cover"
            className="h-14 w-14 rounded shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="h-14 w-14 rounded bg-white/10" />
        )}
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold text-white">{data?.name ?? "Playlist"}</div>
          <div className="truncate text-xs text-white/60">{owner ? `by ${owner}` : "Spotify"}</div>
        </div>
        {playlistUrl ? (
          <a
            href={playlistUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center rounded-md border border-[#1DB954]/30 bg-[#1DB954]/10 px-3 py-1 text-xs font-medium text-[#1DB954] hover:bg-[#1DB954]/20"
          >
            Open in Spotify
          </a>
        ) : null}
      </div>

      {/* Tracks */}
      <ul className="divide-y divide-white/10">
        {items.slice(0, 10).map((it, i) => {
          const t = it?.track;
          if (!t) return null;
          const artist = t.artists?.map((a) => a.name).join(", ") ?? "";
          const art = t.album?.images?.[t.album.images.length - 1]?.url || t.album?.images?.[0]?.url; // smaller if present
          return (
            <li key={t.id ?? `${i}`} className="group py-2 text-sm">
              <a
                href={t.external_urls?.spotify}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white/5"
              >
                {art ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={art} alt="Album art" className="h-10 w-10 rounded-sm object-cover" loading="lazy" />
                ) : (
                  <div className="h-10 w-10 rounded-sm bg-white/10" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-white">{t.name}</div>
                  <div className="truncate text-white/60">{artist}</div>
                </div>
                <div className="shrink-0 text-white/50">{msToMin(t.duration_ms)}</div>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 text-xs text-white/60">Showing first 10 tracks</div>
    </div>
  );
} 