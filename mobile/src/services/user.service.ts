import { api } from './api';
import { User } from '../models/user/user.model';

const API = '/api/v1/user';

const profileCache = new Map<string, Promise<User>>();
const userByIdCache = new Map<string, Promise<User>>();

export const UserService = {
    async loadUser(): Promise<User> {
        const response = await api.get<User>('/api/v1/auth/me');
        return response.data;
    },

    async getUserByUsername(username: string): Promise<User> {
        if (profileCache.has(username)) {
            return profileCache.get(username)!;
        }

        const request = api
            .get<User>(`${API}/${username}`)
            .then(response => response.data);

        profileCache.set(username, request);

        return request;
    },

    async getUserById(id: string): Promise<User> {
        if (userByIdCache.has(id)) {
            return userByIdCache.get(id)!;
        }

        const request = api
            .get<User>(`${API}/getById/${id}`)
            .then(response => response.data);

        userByIdCache.set(id, request);

        return request;
    },

    async getRelatedByCurrentUser(userId: string) {
        const response = await api.get(`${API}/getRelatedByCurrentUser/${userId}`);
        return response.data;
    },

    async followUser(currentUserId: string, targetUserId: string) {
        const response = await api.post(`${API}/follow`, {
            currentUserId,
            targetUserId,
        });

        return response.data;
    },

    async updateUser(user: User) {
        const response = await api.post(`${API}/update`, user);
        return response.data;
    },

    clearCache() {
        profileCache.clear();
        userByIdCache.clear();
    },
};