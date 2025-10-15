'use client';
import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/app/store/usePlayerStore";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export default function PlayerBar() {
  const {
    currentEpisode,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    progress,
    duration,
    setProgress,
    setDuration
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);

    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [isPlaying, currentEpisode]);

  if (!currentEpisode) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white shadow-lg border-t border-gray-800 z-50">
      <audio ref={audioRef} src={currentEpisode.audioUrl} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:w-1/3 w-full">
          <img
            src={currentEpisode.coverImageUrl || "/default-cover.jpg"}
            alt={currentEpisode.title}
            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="font-medium text-sm truncate">{currentEpisode.title}</h4>
            <p className="text-xs text-gray-400 truncate">{currentEpisode.podcastTitle || "Podcast"}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-5 sm:w-1/3 w-full">
          <SkipBack
            onClick={playPrev}
            className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition"
          />
          {isPlaying ? (
            <Pause
              onClick={togglePlay}
              className="w-10 h-10 text-white bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition"
            />
          ) : (
            <Play
              onClick={togglePlay}
              className="w-10 h-10 text-white bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition"
            />
          )}
          <SkipForward
            onClick={playNext}
            className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition"
          />
        </div>

        <div className="flex flex-col sm:w-1/3 w-full items-center sm:items-end">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={(e) => {
              const newTime = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = newTime;
              setProgress(newTime);
            }}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-400 w-full">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
