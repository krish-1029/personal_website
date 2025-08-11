"use client";

import { useMemo, useState } from "react";
import { Pause, Play, Rewind, FastForward, Volume1, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { env } from "@/env";
import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import SpotifyPlaylist from "@/components/SpotifyPlaylist";
import AutoBlobTracks, { type Track as BlobTrack } from "@/components/AutoBlobTracks";

type Track = { title: string; src: string };

function makeTrack(title: string, src: string): Track {
  return { title, src };
}

const AUDIO_BASE = (typeof window !== "undefined" && env.NEXT_PUBLIC_AUDIO_BASE) ? env.NEXT_PUBLIC_AUDIO_BASE : undefined;
const audioUrl = (file: string) => (AUDIO_BASE ? `${AUDIO_BASE.replace(/\/$/, "")}/${encodeURIComponent(file)}` : `/audio/${file}`);

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function MusicPage() {
  const { queue, currentIndex, currentTrack, isPlaying, currentTime, duration, volume, loadAndPlay, togglePlayPause, playNext, playPrev, seek, setVolume } = useAudioPlayer();

  const [view, setView] = useState<"demos" | "complete">("demos");
  const [openRows, setOpenRows] = useState<Set<number>>(new Set());
  const [blobDemos, setBlobDemos] = useState<BlobTrack[] | null>(null);
  const [blobCompleted, setBlobCompleted] = useState<BlobTrack[] | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  const tracks = view === "demos" ? (blobDemos ?? []) : (blobCompleted ?? []);

  const toggleRow = (index: number) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const placeholderLyrics = `Placeholder lyrics go here.\n\n[Verse 1]\nWords and melodies flow through the night.\n[Chorus]\nSinging out loud, everything feels right.`;

  return (
    <main className="mx-auto max-w-5xl px-4 pt-16 pb-12 text-white">
      <div className="flex items-center justify-between -mb-2 translate-y-2">
        <div className="sr-only">Music</div>
        <div className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 p-1">
          <button
            type="button"
            className={`rounded px-3 py-1.5 text-sm ${view === "demos" ? "bg-white text-[#15162c]" : "text-white"}`}
            onClick={() => setView("demos")}
          >
            Demos
          </button>
          <button
            type="button"
            className={`rounded px-3 py-1.5 text-sm ${view === "complete" ? "bg-white text-[#15162c]" : "text-white"}`}
            onClick={() => setView("complete")}
          >
            Completed
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsNoteOpen(true)}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white hover:border-white/25"
        >
          Note from me
        </button>
      </div>
      {/* Full-width player */}
      <section className="mt-8 animate-rise rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md supports-[backdrop-filter]:bg-white/10">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-lg md:text-xl font-semibold text-white">My Music</h3>
        </div>
        <AutoBlobTracks onLoaded={(d, c) => { setBlobDemos(d); setBlobCompleted(c); }} />
        {/* Controls */}
        <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 truncate text-white/80">
                {currentTrack ? currentTrack.title : "No track selected"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous"
                  className="rounded-md border border-white/15 bg-white/5 p-2 text-white hover:border-white/25"
                  onClick={playPrev}
                  title="Previous"
                >
                  <Rewind size={18} />
                </button>
                <button
                  type="button"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className={`h-10 w-10 grid place-items-center rounded-full border border-white/15 bg-white text-[#15162c] hover:bg-white/90 transition shadow ${
                    isPlaying ? "ring-2 ring-red-500/30 shadow-red-500/30" : "ring-2 ring-emerald-400/30 shadow-emerald-400/30"
                  }`}
                  onClick={() => togglePlayPause("music")}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={18} className="text-red-500" /> : <Play size={18} className="text-green-500" />}
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  className="rounded-md border border-white/15 bg-white/5 p-2 text-white hover:border-white/25"
                  onClick={playNext}
                  title="Next"
                >
                  <FastForward size={18} />
                </button>

                {/* Volume slider */}
                <div className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-white">
                  {volume === 0 ? <VolumeX size={14} /> : volume < 0.5 ? <Volume1 size={14} /> : <Volume2 size={14} />}
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="h-1 w-24 cursor-pointer appearance-none rounded bg-white/20 accent-white md:w-32"
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-xs tabular-nums text-white/70">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => seek(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-white"
                aria-label="Seek"
              />
              <span className="w-10 shrink-0 text-xs tabular-nums text-white/70">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Track list with dropdown lyrics */}
          {tracks.length === 0 ? (
            <p className="text-white/70">No uploads found for this view.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {tracks.map((t, i) => {
                const selected = queue === tracks && i === currentIndex; // selection if current queue
                const open = openRows.has(i);
                return (
                  <li key={t.title} className="py-1 animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
                    <div className={`flex items-stretch gap-2 rounded-md ${selected ? "bg-white/10" : "hover:bg-white/5"}`}>
                      {/* Play button (does not toggle row) */}
                      <button
                        type="button"
                        aria-label={selected && isPlaying ? "Pause" : "Play"}
                        className="my-1 ml-1 rounded-md border border-white/15 bg-white/5 p-2 text-white hover:border-white/25"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selected) {
                            togglePlayPause("music");
                          } else {
                            loadAndPlay(tracks, i, "music");
                          }
                        }}
                        title={selected && isPlaying ? "Pause" : "Play"}
                      >
                        {selected && isPlaying ? <Pause size={16} className="text-red-500" /> : <Play size={16} className="text-green-500" />}
                      </button>

                      {/* Row toggle area */}
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-2 py-2 text-left"
                        onClick={() => toggleRow(i)}
                        aria-expanded={open}
                        aria-controls={`lyrics-${i}`}
                      >
                        <span className="truncate text-sm md:text-base">{t.title}</span>
                        <span className="flex items-center gap-2 text-xs text-white/70">
                          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
                          <span
                            aria-hidden={open}
                            className={`overflow-hidden whitespace-nowrap transition-all duration-200 ease-out ${
                              open ? "max-w-0 opacity-0" : "max-w-12 opacity-100"
                            }`}
                          >
                            Lyrics
                          </span>
                        </span>
                      </button>
                    </div>

                    {/* Lyrics dropdown */}
                    <div
                      id={`lyrics-${i}`}
                      className={`mt-2 rounded-md border transition-[max-height,padding,border,opacity] duration-300 ease-out ${
                        open ? "border-white/10 bg-white/5 p-3 opacity-100 max-h-[80vh] overflow-auto resize-y" : "border-transparent bg-white/0 p-0 opacity-0 max-h-0 overflow-hidden"
                      }`}
                      aria-hidden={!open}
                    >
                      <div className="text-sm text-white/80 whitespace-pre-line">{`I've been writing songs and music since I was about 15 years old.`}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
      </section>

      {/* Playlist I like */}
      <div className="mt-6 animate-rise rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-lg md:text-xl font-semibold text-white">Playlist I Like</h3>
          <span className="rounded-md border border-[#1DB954]/30 bg-[#1DB954]/10 px-2 py-0.5 text-[10px] font-medium text-[#1DB954]">Spotify</span>
        </div>
        <SpotifyPlaylist />
      </div>

      {/* Note modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
          isNoteOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNoteOpen(false)} />
        <div
          className={`relative mx-4 w-full max-w-lg transform rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-xl transition-all duration-300 ${
            isNoteOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
          }`}
        >
          <button
            className="absolute right-3 top-3 rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs text-white hover:border-white/25"
            onClick={() => setIsNoteOpen(false)}
          >
            Close
          </button>
          <div className="mb-2 text-xs uppercase tracking-wide text-white/60">Note:</div>
          <p className="font-serif italic leading-relaxed text-white/85">
            I&apos;ve been writing songs and music since I was about 15 years old. Over that time, music has probably
            shaped who I am today more than anything else. It speaks a language that I will probably spend the
            rest of my life trying to decipher, knowing all the while that I never will.
          </p>
        </div>
      </div>
    </main>
  );
} 