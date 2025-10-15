import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_ROUTES } from '../utils/api';

export type Episode = {
  _id: string;
  title: string;
  members: string;
  description: string;
  audioUrl: string;
  duration?: number;
  releaseDate?: string;
  coverImageUrl?: string;
  podcastId: string;
  createdAt?: string;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalEpisodes: number;
  count: number;
};

type EpisodeStore = {
  episodes: Episode[];
  selectedEpisode: Episode | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  searchQuery: string;
  currentPage: number;

  // Actions
  fetchAllEpisodes: (page?: number, search?: string) => Promise<void>;
  getEpisodeById: (id: string) => Promise<void>;
  createEpisode: (data: FormData) => Promise<void>;
  updateEpisode: (id: string, data: FormData) => Promise<void>;
  deleteEpisode: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
};

const axiosInstance = axios.create({
  baseURL: API_ROUTES.EPISODES,
  withCredentials: true,
});

export const useEpisodeStore = create<EpisodeStore>()(
  persist(
    (set, get) => ({
      episodes: [],
      selectedEpisode: null,
      isLoading: false,
      error: null,
      pagination: null,
      searchQuery: '',
      currentPage: 1,

      fetchAllEpisodes: async (page = 1, search = '') => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (page > 1) params.append('page', page.toString());
          if (search.trim()) params.append('search', search.trim());

          const res = await axiosInstance.get(`/?${params.toString()}`);
          const data = res.data;

          set({
            episodes: data.episodes || [],
            pagination: {
              currentPage: data.currentPage || 1,
              totalPages: data.totalPages || 1,
              totalEpisodes: data.totalEpisodes || 0,
              count: data.count || 0,
            },
            currentPage: data.currentPage || 1,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message || 'Failed to fetch episodes',
          });
        }
      },

      getEpisodeById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.get(`/${id}`);
          set({ selectedEpisode: res.data, isLoading: false });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.response?.data?.message || 'Failed to fetch episode',
          });
        }
      },

      createEpisode: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.post('/', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          await get().fetchAllEpisodes();
          set({ isLoading: false });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message || 'Failed to create episode',
          });
        }
      },

      updateEpisode: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.patch(`/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          await get().fetchAllEpisodes();
          set({ isLoading: false });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message || 'Failed to update episode',
          });
        }
      },

      deleteEpisode: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.delete(`/${id}`);
          set({
            episodes: get().episodes.filter((ep) => ep._id !== id),
            isLoading: false,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message || 'Failed to delete episode',
          });
        }
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setCurrentPage: (page: number) => set({ currentPage: page }),
    }),
    {
      name: 'episode-storage',
      partialize: (state) => ({ episodes: state.episodes }),
    }
  )
);
