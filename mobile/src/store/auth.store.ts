import { DeviceEventEmitter } from 'react-native';
import { create } from 'zustand';

import { api } from '@/services/api';

import {
    AUTH_EVENTS,
    clearAuthStorage,
    getStoredAccessToken,
    getStoredUser,
    login as loginService,
    logout as logoutService,
    register as registerService
} from '@/services/auth.service';

import { LoginDTO, RegisterDTO } from '@/models/auth/auth.dto';

interface AuthState {
    user: any | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isReady: boolean;

    loadStoredAuth: () => Promise<void>;
    login: (data: LoginDTO) => Promise<void>;
    register: (data: RegisterDTO) => Promise<any>;
    logout: () => Promise<void>;
    setUser: (user: any | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isReady: false,

    loadStoredAuth: async () => {
        try {
            const accessToken = await getStoredAccessToken();
            const user = await getStoredUser();

            if (accessToken) {
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
            } else {
                delete api.defaults.headers.common.Authorization;
            }

            set({
                accessToken,
                user,
                isAuthenticated: !!accessToken && !!user,
                isReady: true
            });
        } catch {
            await clearAuthStorage();

            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                isReady: true
            });
        }
    },

    login: async (data) => {
        set({ isLoading: true });

        try {
            const response = await loginService(data);

            const accessToken = response.accessToken ?? null;
            const user = response.user ?? null;

            if (accessToken) {
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
            }

            set({
                user,
                accessToken,
                isAuthenticated: !!accessToken && !!user,
                isLoading: false,
                isReady: true
            });

            DeviceEventEmitter.emit(AUTH_EVENTS.LOGIN, user);
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (data) => {
        set({ isLoading: true });

        try {
            const response = await registerService(data);

            set({ isLoading: false });

            return response;
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        await logoutService();

        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            isReady: true
        });
    },

    setUser: (user) => {
        set({
            user,
            isAuthenticated: !!user
        });
    }
}));