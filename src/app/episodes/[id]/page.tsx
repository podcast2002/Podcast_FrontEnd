"use client";

import { useParams, useRouter } from "next/navigation";
import { useEpisodeStore } from "@/app/store/useEpisodeStore";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import Header from "@/components/ui/home/header";
import PlayButton from "@/components/ui/home/playButton";
import logo from "../../../../public/images/logo.jpg";
import { usePlayerStore } from "@/app/store/usePlayerStore";
import Card from "@/components/ui/home/card";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

export default function EpisodeDetails() {
  const router = useRouter();
  const { id } = useParams();
  const { episodes, fetchAllEpisodes, isLoading } = useEpisodeStore();
  const { setEpisode } = usePlayerStore();

  useEffect(() => {
    if (!episodes || episodes.length === 0) fetchAllEpisodes();
  }, [episodes, fetchAllEpisodes]);

  // لو مفيش حلقات لسه
  if (isLoading || !episodes || episodes.length === 0)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500">Loading episode...</p>
      </div>
    );

  // نجيب رقم الحلقة الحالية
  const currentIndex = episodes.findIndex((ep) => ep._id === id);
  const episode = episodes[currentIndex];

  if (!episode) return null;

  // دوال التنقل
  const handleNext = () => {
    if (currentIndex < episodes.length - 1) {
      const nextEpisode = episodes[currentIndex + 1];
      router.push(`/episodes/${nextEpisode._id}`);
      setEpisode(nextEpisode, episodes);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevEpisode = episodes[currentIndex - 1];
      router.push(`/episodes/${prevEpisode._id}`);
      setEpisode(prevEpisode, episodes);
    }
  };

  const formatDate = (date: any) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });

  const formatDuration = (seconds: any) => {
    if (!seconds) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  return (
    <div className="flex row-reverse">
      <div className="w-full">
        <div className="h-screen overflow-hidden bg-[#f2f5f9]">
          <Header />

          <div className="max-w-4xl mx-auto p-8 flex flex-col gap-8 mt-12">
        
            <div className="relative w-full h-[250px]">
              <Image
                src={episode.coverImageUrl || logo}
                alt={episode.title}
                fill
                className="rounded-2xl object-cover"
                priority
                onClick={(e) => {
                  e.stopPropagation();
                  setEpisode(episode, episodes);
                }}
              />

         
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`w-[48px] h-[48px] absolute top-1/2 left-[-3%] -translate-y-1/2 rounded-lg flex items-center justify-center shadow-md transition
                  ${currentIndex === 0 ? "opacity-40 cursor-not-allowed" : "bg-[#8257E5] hover:scale-105"}`}
              >
                <ChevronLeft size={24} color="#ffffff" strokeWidth={2.25} />
              </button>

           
              <button
                onClick={handleNext}
                disabled={currentIndex === episodes.length - 1}
                className={`w-[48px] h-[48px] absolute top-1/2 right-[-3%] -translate-y-1/2 rounded-lg flex items-center justify-center shadow-md transition
                  ${currentIndex === episodes.length - 1 ? "opacity-40 cursor-not-allowed" : "bg-[#04D361] hover:scale-105"}`}
              >
                <ChevronRight size={24} color="#ffffff" strokeWidth={2.25} />
              </button>
            </div>

    
            <div className="flex flex-col  justify-between flex-1">
              <div>
                <h1 className="text-3xl font-semibold text-[#494D4B] mb-2">
                  {episode.title}
                </h1>
               
                <div className="flex items-center gap-[20px] mt-4 text-[#808080] text-sm">
                   <p className="text-[#808080] text-sm">
                  {episode.members || "Guest"}
                </p>
                  <span>{formatDate(episode.releaseDate)}</span>
                  <span>-</span>
                  <span>{formatDuration(episode.duration?.toFixed(0))}</span>
                </div>
                {episode.description && (
                  <p className="mt-[30px] text-[#5e5e5e] leading-relaxed">
                    {episode.description}
                  </p>
                )}
              </div>

              {/* <div
                className="flex w-fit absolute top-1/2 -translate-y-[125px] translate-x-[380px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEpisode(episode, episodes);
                  }}
                  className="p-2 hover:scale-105 transition-transform"
                >
                  <PlayButton />
                </button>
              </div> */}

            </div>
          </div>
        </div>
      </div>

      <div className="w-0 md:w-1/3 max-h-screen">
        <Card />
      </div>
    </div>
  );
}
