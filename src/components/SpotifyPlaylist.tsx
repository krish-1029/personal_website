"use client";

import { useEffect, useState } from "react";

type PlaylistTrack = {
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
    external_urls?: { spotify?: string };
    duration_ms?: number;
  } | null;
};

function msToMin(ms?: number) {
  if (!ms && ms !== 0) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function SpotifyPlaylist() {
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/spotify/playlist")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => !cancelled && setError(e?.message ?? "Failed to load"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-white/70">Loading playlist…</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!data) return null;

  const items: PlaylistTrack[] = data?.tracks?.items ?? [];

  return (
    <div>
      <div className="mb-3 text-lg font-semibold text-white">{data?.name ?? "Playlist"}</div>
      <ul className="divide-y divide-white/10">
        {items.slice(0, 10).map((it, i) => {
          const t = it?.track;
          if (!t) return null;
          const artist = t.artists?.map((a) => a.name).join(", ") ?? "";
          return (
            <li key={t.id ?? `${i}`} className="py-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-white">{t.name}</div>
                  <div className="truncate text-white/60">{artist}</div>
                </div>
                <div className="shrink-0 text-white/50">{msToMin(t.duration_ms)}</div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 text-xs text-white/60">Showing first 10 tracks</div>
    </div>
  );
} 