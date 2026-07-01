

import { getByUser, Post } from './post.service';
import { UserService } from './user.service';

type ProfileCacheValue = Promise<any>;
type PostsCacheValue = Promise<Post[]>;

let backgroundColor = '#ffffff';
const backgroundColorListeners = new Set<(color: string) => void>();

const profileCache = new Map<string, ProfileCacheValue>();
const postsCache = new Map<string, PostsCacheValue>();

const normalizeCursor = (cursor: string | Date | null = null) => {
    if (cursor instanceof Date) {
        return cursor.toISOString();
    }

    return cursor;
};

const notifyBackgroundColor = (color: string) => {
    backgroundColor = color;
    backgroundColorListeners.forEach(listener => listener(color));
};

const lightenRgbColor = (r: number, g: number, b: number) => {
    const lighten = (value: number) => Math.min(255, value + 80);
    return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
};

const generateColorFromUsername = (username: string) => {
    let hash = 0;

    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    const r = Math.min(255, ((hash >> 0) & 255) + 100);
    const g = Math.min(255, ((hash >> 8) & 255) + 100);
    const b = Math.min(255, ((hash >> 16) & 255) + 100);

    const color = `rgb(${r}, ${g}, ${b})`;
    notifyBackgroundColor(color);

    return color;
};

const setBackgroundFromImage = async (imageUrl?: string, username = 'user') => {
    if (!imageUrl) {
        return generateColorFromUsername(username);
    }

    if (imageUrl === 'white' || imageUrl.startsWith('#') || imageUrl.startsWith('rgb')) {
        const color = imageUrl === 'white' ? '#ffffff' : imageUrl;
        notifyBackgroundColor(color);
        return color;
    }

    return generateColorFromUsername(username);
};

const getUserByUsername = (username: string, forceRefresh = false) => {
    const normalizedUsername = username.trim().replace(/^@/, '').toLowerCase();

    if (!normalizedUsername) {
        return Promise.reject(new Error('username is required'));
    }

    if (!forceRefresh && profileCache.has(normalizedUsername)) {
        return profileCache.get(normalizedUsername)!;
    }

    const request = UserService.getUserByUsername(normalizedUsername).catch(error => {
        profileCache.delete(normalizedUsername);
        throw error;
    });

    profileCache.set(normalizedUsername, request);

    return request;
};

const getPostsByUser = (
    userId: string,
    cursor: string | Date | null = null,
    limit = 12,
    forceRefresh = false
) => {
    const normalizedCursor = normalizeCursor(cursor);
    const cacheKey = `${userId}:${normalizedCursor ?? 'first'}:${limit}`;

    if (!forceRefresh && postsCache.has(cacheKey)) {
        return postsCache.get(cacheKey)!;
    }

    const request = getByUser({
        id: userId,
        cursor: normalizedCursor,
        limit
    })
        .then((response: any) => {
            if (Array.isArray(response)) {
                return response as Post[];
            }

            if (Array.isArray(response?.posts)) {
                return response.posts as Post[];
            }

            if (Array.isArray(response?.items)) {
                return response.items as Post[];
            }

            if (Array.isArray(response?.data)) {
                return response.data as Post[];
            }

            return [] as Post[];
        })
        .catch(error => {
            postsCache.delete(cacheKey);
            throw error;
        });

    postsCache.set(cacheKey, request);

    return request;
};

const clearProfileCache = (username?: string) => {
    if (!username) {
        profileCache.clear();
        return;
    }

    profileCache.delete(username.trim().replace(/^@/, '').toLowerCase());
};

const clearPostsCache = (userId?: string) => {
    if (!userId) {
        postsCache.clear();
        return;
    }

    Array.from(postsCache.keys())
        .filter(key => key.startsWith(`${userId}:`))
        .forEach(key => postsCache.delete(key));
};

const subscribeBackgroundColor = (listener: (color: string) => void) => {
    backgroundColorListeners.add(listener);
    listener(backgroundColor);

    return () => {
        backgroundColorListeners.delete(listener);
    };
};

export const profileService = {
    getUserByUsername,
    getPostsByUser,
    setBackgroundFromImage,
    generateColorFromUsername,
    clearProfileCache,
    clearPostsCache,
    subscribeBackgroundColor,
    getBackgroundColor: () => backgroundColor,
};

export default profileService;