"use client";

import Header from "./header";
import Image from "next/image";
import PlayButton from "./playButton";
import logo from "../../../../public/images/logo.jpg";
import { useEpisodeStore } from "@/app/store/useEpisodeStore";
import { useEffect } from "react";
import { usePlayerStore } from "@/app/store/usePlayerStore";
import Link from "next/link";

function Todo() {
  const { episodes, fetchAllEpisodes, isLoading, error } =useEpisodeStore();

  const { setEpisode } = usePlayerStore();

  useEffect(() => {
    if (!episodes || episodes.length === 0) {
      fetchAllEpisodes();
    }
  }, [episodes, fetchAllEpisodes]);

  if (isLoading) {
    return (
      <div className=" bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ...</p>
        </div>
      </div>
    );
  }
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;
  if (!episodes || episodes.length === 0)
    return <p className="text-center mt-8">No episodes found</p>;

  const latestEpisodes = [...episodes]
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    .slice(0, 2);

  const formatDuration = (seconds: any) => {
    if (!seconds) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const formatDate = (date: any) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });

  return (
    <>
      <div className="h-screen overflow-hidden">
        <Header />

        <div className="flex px-[64px] flex-col bg-[#f2f5f9] py-[32px] h-screen overflow-hidden">
          <div className="flex justify-between items-center">
           
            <div>
            <h2
              style={{ fontWeight: "600" }}
              className="text-[24px] text-[#494D4B] top-[28px] relative "
            >
              Últimos lançamentos
            </h2>
            </div>

           {/* <div>
           <Link
              href={`/podcasts/list`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Episodes
            </Link>
           </div> */}

          </div>

          <div className="flex flex-row flex-wrap justify-around gap-4 mt-[24px]">
            {latestEpisodes.map((episode) => (
              <div
                key={episode._id}
                // href={`/episodes/${episode._id}`}
                className="w-[432px] bg-[#FFFFFF] rounded-2xl border-2 h-[136px] top-[48px] p-4 relative flex items-center hover:shadow-md transition-shadow duration-300"
              >
                <Link href={`/episodes/${episode._id}`}>
                  <Image
                    src={episode.coverImageUrl || logo}
                    alt={episode.title}
                    width={96}
                    height={96}
                    priority
                    className="object-cover object-center rounded-[16px] h-[95px]"
                  />
                </Link>

                <div className="flex flex-col flex-start ml-2">
                  <p
                    style={{ fontWeight: "600" }}
                    className="text-[#494D4B] text-[16px]"
                  >
                    {episode.title}
                  </p>

                  <div className="flex ">
                    <div
                      style={{ fontWeight: "400" }}
                      className="text-[#808080] text-[14px] mt-[15px]"
                    >
                      <p>{episode?.members || "Guest desconhecido"}</p>

                      <div className="flex gap-2">
                        <div className="flex gap-2">
                          <p>{formatDate(episode.releaseDate || "")}</p>
                          <span>-</span>
                          <p>
                            {formatDuration(episode.duration?.toFixed(0) || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="flex ml-auto mt-auto mb-[10px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEpisode(
                          {
                            _id: episode._id,
                            title: episode.title,
                            audioUrl: episode.audioUrl,
                            coverImageUrl: episode.coverImageUrl,
                            podcastTitle: episode.title,
                          },
                          episodes
                        );
                      }}
                      className="p-2 hover:scale-105 transition-transform"
                    >
                      <PlayButton />
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h2
            style={{ fontWeight: "600" }}
            className="text-[24px] text-[#494D4B] mt-[85px] "
          >
            Todos os episódios
          </h2>

          <div className="overflow-y-auto overflow-x-auto max-h-[500px] rounded-lg shadow mt-[20px] custom-scrollbar">
            <table className="w-full min-w-[600px] text-sm text-[#ABA8B2]">
              <thead className=" border-b">
                <tr style={{ fontWeight: "400" }} className="text-left">
                  <th className="p-4 w-[40%]">Podcast</th>
                  <th className="p-4">Integrantes</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Duração</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map((episode) => (
                  <tr
                    key={episode._id}
                    onClick={() =>
                      (window.location.href = `/episodes/${episode._id}`)
                    }
                    className="border-b transition-colors hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <Image
                        src={episode.coverImageUrl || logo}
                        alt={episode.title}
                        width={50}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <span
                        style={{ fontWeight: "600" }}
                        className="font-medium text-[#494D4B] truncate"
                      >
                        {episode.title}
                      </span>
                    </td>

                    <td className="p-4 text-[14px] text-[#808080]">
                      {episode.members || "—"}
                    </td>

                    <td className="p-4 text-[14px] text-[#808080]">
                      {formatDate(episode.releaseDate)}
                    </td>

                    <td className="p-4 text-[14px] text-[#808080]">
                      {formatDuration(episode.duration?.toFixed(0))}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEpisode(
                            {
                              _id: episode._id,
                              title: episode.title,
                              audioUrl: episode.audioUrl,
                              coverImageUrl: episode.coverImageUrl,
                              podcastTitle: episode.title,
                            },
                            episodes
                          );
                        }}
                        className="p-2 hover:scale-105 transition-transform"
                      >
                        <PlayButton />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Todo;
