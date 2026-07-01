import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import * as SecureStore from 'expo-secure-store';
import { User } from '../models/user/user.model';
import { UserService } from '@/services/user.service';
import { clearAuthStorage, getStoredAccessToken } from '@/services/auth.service';

type Theme = 'light' | 'dark';

interface GlobalContextData {
    user: User | null;
    isAuthenticated: boolean;
    isLoadingUser: boolean;
    currentTheme: Theme;

    loadUser: () => Promise<void>;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    changeTheme: (theme: Theme) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextData | null>(null);

interface GlobalProviderProps {
    children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

    async function loadTheme() {
        const storedTheme = await SecureStore.getItemAsync('theme');

        if (storedTheme === 'light' || storedTheme === 'dark') {
            setCurrentTheme(storedTheme);
        }
    }

    async function changeTheme(theme: Theme) {
        setCurrentTheme(theme);
        await SecureStore.setItemAsync('theme', theme);
    }

    async function loadUser() {
        try {
            setIsLoadingUser(true);

            const token = await getStoredAccessToken();
            if (!token) {
                setUser(null);
                return;
            }

            const loggedUser = await UserService.loadUser();
            setUser(loggedUser);
        } catch (error) {
            setUser(null);
            await clearAuthStorage();
        } finally {
            setIsLoadingUser(false);
        }
    }

    async function logout() {
        await clearAuthStorage();

        UserService.clearCache();

        setUser(null);
    }

    useEffect(() => {
        loadTheme();
        loadUser();
    }, []);

    const value = useMemo(() => {
        return {
            user,
            isAuthenticated: !!user,
            isLoadingUser,
            currentTheme,
            loadUser,
            setUser,
            logout,
            changeTheme,
        };
    }, [user, isLoadingUser, currentTheme]);

    return (
        <GlobalContext.Provider value={value}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobal() {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error('useGlobal precisa estar dentro do GlobalProvider');
    }

    return context;
}