"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type AudioTrack = { title: string; src: string };

export type AudioPlayerContextValue = {
  queue: AudioTrack[];
  currentIndex: number;
  currentTrack: AudioTrack | undefined;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0..1
  lastPauseSource: "mini" | "music" | null; // New: tracks where pause originated
  globalOrigin: "music" | "none"; // New: tracks if playback started from music page
  // controls
  loadAndPlay: (tracks: AudioTrack[], index: number, source?: "music" | "other") => void; // Added source
  togglePlayPause: (source?: "mini" | "music") => void; // Added source
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}

export default function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1);
  const [lastPauseSource, setLastPauseSource] = useState<"mini" | "music" | null>(null); // New state
  const [globalOrigin, setGlobalOrigin] = useState<"music" | "none">("none"); // New state

  const currentTrack = useMemo(() => (currentIndex >= 0 ? queue[currentIndex] : undefined), [queue, currentIndex]);

  const safePlay = async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      setIsPlaying(true);
      setLastPauseSource(null); // Clear pause source on play
    } catch {
      setIsPlaying(false);
    }
  };

  const loadAndPlay = useCallback((tracks: AudioTrack[], index: number, source?: "music" | "other") => {
    const audio = audioRef.current;
    if (!audio || index < 0 || index >= tracks.length) return;
    setQueue(tracks);
    setCurrentIndex(index);
    audio.src = tracks[index]?.src ?? "";
    audio.currentTime = 0;
    setCurrentTime(0);
    if (source === "music") setGlobalOrigin("music"); // Set origin if from music page
    void safePlay(audio);
  }, []);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    if (currentIndex <= 0) loadAndPlay(queue, 0);
    else loadAndPlay(queue, currentIndex - 1);
  }, [queue, currentIndex, loadAndPlay]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    const next = currentIndex + 1;
    if (next >= queue.length) {
      const audio = audioRef.current;
      if (audio) audio.pause();
      setIsPlaying(false);
      setCurrentIndex(-1);
      setCurrentTime(0);
      return;
    }
    loadAndPlay(queue, next);
  }, [queue, currentIndex, loadAndPlay]);

  const togglePlayPause = useCallback((source?: "mini" | "music") => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentIndex < 0) {
      if (queue.length > 0) loadAndPlay(queue, 0, source === "music" ? "music" : undefined);
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (source) setLastPauseSource(source);
    } else {
      void safePlay(audio);
    }
  }, [currentIndex, isPlaying, loadAndPlay, queue]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(time)) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((v: number) => setVolumeState(v), []);

  // Sync audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(isFinite(audio.duration) ? audio.duration : 0);
      setCurrentTime(isFinite(audio.currentTime) ? audio.currentTime : 0);
    };
    const onTime = () => setCurrentTime(isFinite(audio.currentTime) ? audio.currentTime : 0);
    const onPlay = () => { setIsPlaying(true); setLastPauseSource(null); };
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
  }, [playNext]);

  // Keep element volume in sync
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  // Global spacebar toggles play/pause on any page when a track is loaded
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore typing controls
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isFormField = tag === "input" || tag === "textarea" || tag === "select" || (target as any)?.isContentEditable;
      if (isFormField) return;

      if (e.code === "Space" || e.key === " " || e.key === "Spacebar") {
        if (currentIndex >= 0) {
          e.preventDefault();
          togglePlayPause("mini");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, togglePlayPause]);

  const value: AudioPlayerContextValue = {
    queue,
    currentIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    lastPauseSource,
    globalOrigin,
    loadAndPlay,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    setVolume,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" playsInline className="hidden" />
    </AudioPlayerContext.Provider>
  );
} 