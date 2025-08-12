"use client";

import { useEffect, useRef, useState } from "react";

export type Track = { title: string; src: string };

export default function AutoBlobTracks({ onLoaded }: { onLoaded?: (demos: Track[], completed: Track[]) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return; // run once per mount
    calledRef.current = true;

    // Try hydrate from sessionStorage for instant UI on navigation
    try {
      const cached = sessionStorage.getItem("blob-tracks-cache");
      if (cached) {
        const parsed = JSON.parse(cached) as { demos: Track[]; completed: Track[] };
        onLoaded?.(parsed.demos ?? [], parsed.completed ?? []);
        setLoading(false);
      }
    } catch {}

    let cancelled = false;
    fetch("/api/music/list", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        const demos: Track[] = (json?.demos ?? []).map((x: any) => ({ title: x.title, src: x.src }));
        const completed: Track[] = (json?.completed ?? []).map((x: any) => ({ title: x.title, src: x.src }));
        onLoaded?.(demos, completed);
        try {
          sessionStorage.setItem("blob-tracks-cache", JSON.stringify({ demos, completed }));
        } catch {}
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ?? "Failed to load");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-white/70">Scanning uploads…</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  return null;
} 