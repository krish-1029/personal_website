"use client";

import { useAudioPlayer } from "./AudioPlayerProvider";
import { Pause, Play, Rewind, FastForward, Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function GlobalMiniPlayer({ position = "fixed" as "fixed" | "sticky" }) {
  const { currentTrack, isPlaying, currentTime, duration, volume, togglePlayPause, playNext, playPrev, seek, setVolume, lastPauseSource, globalOrigin } = useAudioPlayer();
  const pathname = usePathname();

  const onMusicPage = pathname?.startsWith("/music");
  const eligible = globalOrigin === "music" && !!currentTrack;
  const shouldShow = eligible && !onMusicPage && (isPlaying || lastPauseSource === "mini");

  // Hooks with stable order
  const [lift, setLift] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!shouldShow || position !== "fixed") return; // only needed for fixed mode
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setLift(entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [shouldShow, position]);

  if (!shouldShow) return null;

  const Bar = (
    <div className="border-t border-white/10 bg-white/5 backdrop-blur-md" aria-hidden={false}>
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 text-white">
        <div className="min-w-0 grow truncate text-sm text-white/80">
          {currentTrack ? currentTrack.title : "No track selected"}
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-white/15 bg-white/5 p-1.5 text-white hover:border-white/25" aria-label="Previous" onClick={playPrev}>
            <Rewind size={16} />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white text-[#15162c] hover:bg-white/90" aria-label={isPlaying ? "Pause" : "Play"} onClick={() => togglePlayPause("mini")}>
            {isPlaying ? <Pause size={16} className="text-red-500" /> : <Play size={16} className="text-green-500" />}
          </button>
          <button className="rounded-md border border-white/15 bg-white/5 p-1.5 text-white hover:border-white/25" aria-label="Next" onClick={playNext}>
            <FastForward size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 text-xs tabular-nums text-white/70">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-1.5 w-48 cursor-pointer appearance-none rounded bg-white/10 accent-white md:w-64"
          />
          <span className="w-10 text-xs tabular-nums text-white/70">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white">
          {volume === 0 ? <VolumeX size={14} /> : volume < 0.5 ? <Volume1 size={14} /> : <Volume2 size={14} />}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-20 cursor-pointer appearance-none rounded bg-white/20 accent-white md:w-28"
          />
        </div>
      </div>
    </div>
  );

  if (position === "sticky") {
    // sticky within a container (parent controls boundaries)
    return <div className="sticky bottom-0 z-10">{Bar}</div>;
  }

  // fixed to viewport with footer sentinel
  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none fixed bottom-[48px] left-0 right-0 h-1" />
      <div className="fixed left-0 right-0 z-10" style={{ bottom: lift ? 60 : 48 }}>
        {Bar}
      </div>
    </>
  );
} 