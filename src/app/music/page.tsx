"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PauseCircle, PlayCircle, Rewind, FastForward, Volume1, Volume2, VolumeX, Pause, Play, ChevronDown } from "lucide-react";

type Track = { title: string; src: string };

function makeTrack(title: string, src: string): Track {
  return { title, src };
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function Collapsible({ open, id, children }: { open: boolean; id: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className={`mt-2 rounded-md border transition-[max-height,padding,border,opacity] duration-300 ease-out ${
        open
          ? "border-white/10 bg-white/5 p-3 opacity-100 max-h-[80vh] overflow-auto resize-y"
          : "border-transparent bg-white/0 p-0 opacity-0 max-h-0 overflow-hidden"
      }`}
      aria-hidden={!open}
    >
      <div className="text-sm text-white/80 whitespace-pre-line">{children}</div>
    </div>
  );
}

export default function MusicPage() {
  const [view, setView] = useState<"demos" | "complete">("demos");
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [openRows, setOpenRows] = useState<Set<number>>(new Set());
  const [volume, setVolume] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const demoTracks: Track[] = useMemo(
    () => [
      makeTrack("Medicine (Demo)", "/audio/Medicine (Demo).mp3"),
      makeTrack("New Moon (Demo)", "/audio/New Moon (Demo).mp3"),
      makeTrack("She Looks So Beautiful (Demo)", "/audio/She Looks So Beautiful (Demo).mp3"),
    ], [],
  );

  const completeTracks: Track[] = useMemo(() => [], []);

  const tracks = view === "demos" ? demoTracks : completeTracks;
  const currentTrack = currentIndex >= 0 ? tracks[currentIndex] : undefined;

  // Reset selection when switching views
  useEffect(() => {
    setCurrentIndex(-1);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setOpenRows(new Set());
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [view]);

  // Sync volume to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  // Wire up audio event listeners for time/duration and play state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => {
      setDuration(isFinite(audio.duration) ? audio.duration : 0);
      setCurrentTime(isFinite(audio.currentTime) ? audio.currentTime : 0);
    };
    const onTime = () => setCurrentTime(isFinite(audio.currentTime) ? audio.currentTime : 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => playNext();

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, view]);

  const safePlay = async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const loadAndPlay = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentIndex(index);
    audio.src = tracks[index]?.src ?? "";
    audio.currentTime = 0;
    setCurrentTime(0);
    void safePlay(audio);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentIndex === -1 && tracks.length > 0) {
      loadAndPlay(0);
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void safePlay(audio);
    }
  };

  const playPrev = () => {
    if (tracks.length === 0) return;
    if (currentIndex <= 0) {
      loadAndPlay(0);
    } else {
      loadAndPlay(currentIndex - 1);
    }
  };

  const playNext = () => {
    if (tracks.length === 0) return;
    const next = currentIndex + 1;
    if (next >= tracks.length) {
      const audio = audioRef.current;
      if (audio) audio.pause();
      setIsPlaying(false);
      setCurrentIndex(-1);
      setCurrentTime(0);
      return;
    }
    loadAndPlay(next);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(value)) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const toggleRow = (index: number) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const placeholderLyrics = `Placeholder lyrics go here.\n\n[Verse 1]\nWords and melodies flow through the night.\n[Chorus]\nSinging out loud, everything feels right.`;

  // Volume icon by level
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX size={16} />;
    if (volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Music</h1>
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
      </div>

      <section className="animate-rise rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md supports-[backdrop-filter]:bg-white/10">
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
                onClick={togglePlayPause}
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
                <VolumeIcon />
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
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-white"
              aria-label="Seek"
            />
            <span className="w-10 shrink-0 text-xs tabular-nums text-white/70">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Track list with dropdown lyrics */}
        {tracks.length === 0 ? (
          <p className="text-white/70">No tracks yet for this view.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {tracks.map((t, i) => {
              const selected = i === currentIndex;
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
                          togglePlayPause();
                        } else {
                          loadAndPlay(i);
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
                  <Collapsible open={open} id={`lyrics-${i}`}>
                    {placeholderLyrics}
                  </Collapsible>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <audio ref={audioRef} preload="metadata" playsInline className="hidden" />
    </main>
  );
} 