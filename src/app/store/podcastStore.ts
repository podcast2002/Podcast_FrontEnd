import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_ROUTES } from '../utils/api';

export type Podcast = {
  _id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  createdAt: string;
};

export type Episode = {
  _id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration?: number;
  releaseDate?: string;
  coverImageUrl?: string;
  podcastId: string;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalPodcasts: number;
  count: number;
};

type PodcastStore = {
  podcasts: Podcast[];
  selectedPodcast: Podcast | null;
  episodes: Episode[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  searchQuery: string;
  currentPage: number;
  fetchAllPodcasts: (page?: number, search?: string) => Promise<void>;
  getPodcastWithEpisodes: (id: string) => Promise<void>;
  createPodcast: (data: FormData) => Promise<void>;
  updatePodcast: (id: string, data: FormData) => Promise<void>;
  deletePodcast: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  getPodcastById: (id: string) => Podcast | undefined;
};

const axiosInstance = axios.create({
  baseURL: API_ROUTES.PODCASTS,
  withCredentials: true,
});

export const usePodcastStore = create<PodcastStore>()(
  persist(
    (set, get) => ({
      podcasts: [],
      selectedPodcast: null,
      episodes: [],
      isLoading: false,
      error: null,
      pagination: null,
      searchQuery: '',
      currentPage: 1,

      fetchAllPodcasts: async (page = 1, search = '') => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (page > 1) params.append('page', page.toString());
          if (search.trim()) params.append('search', search.trim());
          
          const res = await axiosInstance.get(`/?${params.toString()}`);
          const data = res.data;
          
          set({ 
            podcasts: data.podcasts || [], 
            pagination: {
              currentPage: data.currentPage || 1,
              totalPages: data.totalPages || 1,
              totalPodcasts: data.totalPodcasts || 0,
              count: data.count || 0,
            },
            currentPage: data.currentPage || 1,
            isLoading: false 
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message ||
              'Failed to fetch podcasts',
          });
        }
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setCurrentPage: (page: number) => {
        set({ currentPage: page });
      },

      getPodcastById: (id: string) => {
        return get().podcasts.find(podcast => podcast._id === id);
      },

      getPodcastWithEpisodes: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axiosInstance.get(`/getPodcastWithEpisodes/${id}`);
          set({
            selectedPodcast: res.data.podcast,
            episodes: res.data.episodes,
            isLoading: false,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message ||
              'Failed to fetch podcast details',
          });
        }
      },

      createPodcast: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.post('/', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          await get().fetchAllPodcasts();
          set({ isLoading: false });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message ||
              'Failed to create podcast',
          });
        }
      },

      updatePodcast: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.patch(`/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          await get().fetchAllPodcasts();
          set({ isLoading: false });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message ||
              'Failed to update podcast',
          });
        }
      },

      deletePodcast: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.delete(`/${id}`);
          set({
            podcasts: get().podcasts.filter((p) => p._id !== id),
            isLoading: false,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message ||
              'Failed to delete podcast',
          });
        }
      },
    }),
    {
      name: 'podcast-storage',
      partialize: (state) => ({ podcasts: state.podcasts }),
    }
  )
);
