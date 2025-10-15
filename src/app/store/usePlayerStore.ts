
import { create } from "zustand";

interface Episode {
  _id: string;
  title: string;
  audioUrl: string;
  coverImageUrl?: string;
  podcastTitle?: string;
}

interface PlayerState {
  currentEpisode: Episode | null;
  episodeList: Episode[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  setEpisode: (episode: Episode, list?: Episode[]) => void;
  togglePlay: () => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  playNext: () => void;
  playPrev: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentEpisode: null,
  episodeList: [],
  currentIndex: -1,
  isPlaying: false,
  progress: 0,
  duration: 0,

  setEpisode: (episode, list) => {
    const state = get();
    let newList = state.episodeList;
    let newIndex = state.currentIndex;

    if (list && list.length > 0) {
      newList = list;
      newIndex = list.findIndex(e => e._id === episode._id);
    }

    set({
      currentEpisode: episode,
      episodeList: newList,
      currentIndex: newIndex,
      isPlaying: true,
      progress: 0
    });
  },

  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),

  playNext: () => {
    const { episodeList, currentIndex } = get();
    if (episodeList.length === 0) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < episodeList.length) {
      set({
        currentEpisode: episodeList[nextIndex],
        currentIndex: nextIndex,
        isPlaying: true,
        progress: 0
      });
    }
  },

  playPrev: () => {
    const { episodeList, currentIndex } = get();
    if (episodeList.length === 0) return;
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      set({
        currentEpisode: episodeList[prevIndex],
        currentIndex: prevIndex,
        isPlaying: true,
        progress: 0
      });
    }
  },
}));
