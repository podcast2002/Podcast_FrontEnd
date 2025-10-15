import { API_ROUTES } from "../utils/api";
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type User = {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'admin';
}

type AuthStore = {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    register: (name: string, email: string, phone: string, password: string) => Promise<string | null>;
    login: (email: string, password: string) => Promise<boolean>;
    logout?: () => Promise<void>;
    refreshAccessToken?: () => Promise<boolean>;
};


const axiosInstance = axios.create({
    baseURL: API_ROUTES.AUTH,
    withCredentials: true
})

export const userAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            error: null,
            register: async (name, email, phone, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post('/register', { name, email, phone, password });
                    set({ isLoading: false });
                    return response.data.userId;
                } catch (error) {
                    console.log("error",error)
                    set({
                        isLoading: false,
                        error: axios.isAxiosError(error) ? error?.response?.data?.message || "Registration Failed" : "Registration Failed"
                    });
                    return null;
                }
            },
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axiosInstance.post('/login', { email, password });
                    set({ isLoading: false, user: response.data.userInfo });
                    return true;
                } catch (error) {
                    console.log("error",error)

                    set({
                        isLoading: false,
                        error: axios.isAxiosError(error) ? error?.response?.data?.message || "Login Failed" : "Login Failed"
                    });
                    return false;
                }
            },
            logout: async () => {
                set({ isLoading: true, error: null });
                try {
                    await axiosInstance.post('/logout');
                    set({ user: null, isLoading: false });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: axios.isAxiosError(error) ? error?.response?.data?.message || "Logout Failed" : "Logout Failed"
                    });
                }
            },
            refreshAccessToken: async () => {
                try {
                    await axiosInstance.post('/refresh-token');
                    return true;
                } catch (error) {
                    console.error(error);
                    return false;
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user })
        }
    )
);


