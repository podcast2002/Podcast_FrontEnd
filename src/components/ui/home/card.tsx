"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "../../../../public/images/Group.png";
import play from "../../../../public/images/Play.png";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { usePlayerStore } from "@/app/store/usePlayerStore";

export default function Card() {
  const {
    currentEpisode,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    progress,
    duration,
    setProgress,
    setDuration,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode?.audioUrl) return;
    audio.load();
    audio.play().catch(() => {});
  }, [currentEpisode]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    playNext();
  };

  const formatTime = (t: number) => {
    if (isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  return (
    <>
   
      <div className="hidden md:flex flex-col justify-between items-center min-h-screen bg-[#8257E5] py-10 px-4 text-white">
        <div className="flex justify-center items-center gap-2 mb-6">
          <Image src={logo} alt="Logo" width={28} height={28} priority />
          <h2 className="font-semibold text-lg tracking-wide">Tocando agora</h2>
        </div>

        <div
          className={`relative w-[296px] h-[346px] rounded-[24px] overflow-hidden 
          ${
            currentEpisode
              ? "border-none bg-transparent"
              : "border-[1.5px] border-dashed border-white/30 bg-white/5 backdrop-blur-md"
          } 
          flex flex-col items-center justify-center text-center`}
        >
          {currentEpisode ? (
            <>
              <div className="relative w-full h-[350px]">
                <Image
                  src={currentEpisode.coverImageUrl || logo}
                  alt={currentEpisode.title}
                  fill
                  className="object-cover rounded-[20px]"
                />
              </div>

              <div className="px-4 py-3">
                <h3 className="text-[22px] font-semibold truncate">
                  {currentEpisode.title}
                </h3>
                <p className="text-[14px] text-white/70">
                  {currentEpisode.podcastTitle || "Podcast"}
                </p>
              </div>

              <audio
                ref={audioRef}
                src={currentEpisode.audioUrl || ""}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
              />
            </>
          ) : (
            <p className="text-base font-medium text-[#ffffff] text-center">
              Selecione um <br /> podcast para ouvir
            </p>
          )}
        </div>

        {currentEpisode ? (
          <div className="mt-10 flex flex-col items-center gap-5 text-white w-full">
            <div className="flex flex-col items-center w-full max-w-[250px]">
              <div className="flex justify-between text-xs opacity-70 w-full mb-1">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                onClick={handleSeek}
                className="w-full h-[4px] bg-white/20 rounded-full overflow-hidden cursor-pointer group"
              >
                <div
                  className="h-full bg-green-400 transition-all duration-150 group-hover:bg-green-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-5 opacity-[90%]">
              <Shuffle className="cursor-pointer hover:text-white" size={20} />
              <SkipBack
                color="#ffffff"
                strokeWidth={1}
                fill="#ffffff"
                onClick={playPrev}
                className="cursor-pointer"
                size={24}
              />
              {isPlaying ? (
                <Pause
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full p-3 cursor-pointer transition"
                />
              ) : (
                <Play
                  onClick={togglePlay}
                  color="#ffffff"
                  strokeWidth={1}
                  fill="#ffffff"
                  className="w-12 h-12 rounded-full p-3 cursor-pointer transition"
                />
              )}
              <SkipForward
                onClick={playNext}
                color="#ffffff"
                strokeWidth={1}
                fill="#ffffff"
                className="cursor-pointer"
                size={24}
              />
              <Repeat className="cursor-pointer" size={20} />
            </div>
          </div>
        ) : (
          <div>
            <Image src={play} alt="play" width={216} height={64} />
          </div>
        )}
      </div>

   
      {currentEpisode && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 text-white bg-[#8257E5] transition-all duration-300 ${
            isExpanded ? "h-[90vh] p-5" : "h-[90px] px-4"
          } md:hidden`}
        >
       
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute right-[187px] top-1 "
          >
            {isExpanded ? <ChevronDown className="w-12 h-12 rounded-full p-3 cursor-pointer transition" /> : <ChevronUp className="w-12 h-12 rounded-full p-3 cursor-pointer transition" />}
          </button>

          {!isExpanded ? (
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <Image
                  src={currentEpisode.coverImageUrl || logo}
                  alt="Episode"
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
                <div>
                  <p className="text-sm font-semibold truncate max-w-[150px]">
                    {currentEpisode.title}
                  </p>
                  <p className="text-xs text-white/60">
                    {currentEpisode.podcastTitle}
                  </p>
                </div>
              </div>

              {isPlaying ? (
                <div className="w-[40px] h-[40px] border-[1px] rounded-lg flex cursor-pointer items-center justify-center">
                  <Pause
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full p-3 cursor-pointer transition"
                  />
                </div>
              ) : (
                <div className="w-[40px] h-[40px] border-[1px] rounded-lg flex cursor-pointer items-center justify-center">
                  <Play
                    onClick={togglePlay}
                    color="#ffffff"
                    fill="#ffffff"
                    className="w-12 h-12 rounded-full p-3 cursor-pointer transition"
                  />
                </div>
              )}
            </div>
          ) : (
           
            <div className="flex flex-col items-center justify-center mt-8 gap-6">
              <div className="relative w-[250px] h-[250px]">
                <Image
                  src={currentEpisode.coverImageUrl || logo}
                  alt="cover"
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
              <h3 className="text-lg font-semibold text-center">
                {currentEpisode.title}
              </h3>
              <p className="text-sm text-white/70 mb-2">
                {currentEpisode.podcastTitle}
              </p>

              <div className="w-full max-w-[250px]">
                <div className="flex justify-between text-xs opacity-70 w-full mb-1">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div
                  onClick={handleSeek}
                  className="w-full h-[4px] bg-white/20 rounded-full overflow-hidden cursor-pointer group"
                >
                  <div
                    className="h-full bg-green-400 transition-all duration-150 group-hover:bg-green-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-5 opacity-[90%]">
                <Shuffle
                  className="cursor-pointer hover:text-white"
                  size={20}
                />
                <SkipBack
                  color="#ffffff"
                  strokeWidth={1}
                  fill="#ffffff"
                  onClick={playPrev}
                  className="cursor-pointer"
                  size={24}
                />
                {isPlaying ? (
                  <div className="w-[40px] h-[40px] border-[1px] rounded-lg flex cursor-pointer items-center justify-center">
                    <Pause
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full p-3 cursor-pointer transition"
                    />
                  </div>
                ) : (
                  <div className="w-[40px] h-[40px] border-[1px] rounded-lg flex cursor-pointer items-center justify-center">
                    <Play
                      onClick={togglePlay}
                      color="#ffffff"
                      fill="#ffffff"
                      className="w-12 h-12 rounded-full p-3 cursor-pointer transition"
                    />
                  </div>
                )}
                <SkipForward
                  onClick={playNext}
                  color="#ffffff"
                  strokeWidth={1}
                  fill="#ffffff"
                  className="cursor-pointer"
                  size={24}
                />
                <Repeat className="cusror-pointer" size={20} />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
