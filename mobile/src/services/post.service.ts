/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { api } from './api';

const API = '/api/v1/posts';

const feedCache = new Map<string, Promise<unknown>>();
const dumpsCache = new Map<string, Promise<unknown>>();
const postMediaCache = new Map<string, Promise<unknown>>();

export interface PostMedia {
    url: string;
    width?: number;
    height?: number;
    type: 'image' | 'video';
}

export interface Post {
    id?: string;
    user?: unknown;
    caption?: string;
    media?: PostMedia[];
    location?: string;
    hashtags?: string[];
    mentions?: unknown[];
    likes?: string[];
    saves?: string[];
    comments?: unknown[];
    reports?: unknown[];
    visibility?: string;
    ml?: unknown;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginatedRequest {
    id: string;
    cursor?: string | Date | null;
    limit?: number;
}

function parsePostError(error: any) {
    const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Não foi possível concluir a operação.';

    return new Error(message);
}

function normalizeCursor(cursor?: string | Date | null) {
    if (cursor instanceof Date) {
        return cursor.toISOString();
    }

    return cursor ?? undefined;
}

export async function getByCurrentUser({
    id,
    cursor,
    limit = 10
}: PaginatedRequest): Promise<unknown> {
    const normalizedCursor = normalizeCursor(cursor) ?? 'first_page';
    const cacheKey = `${id}_${normalizedCursor}_${limit}`;

    if (feedCache.has(cacheKey)) {
        return feedCache.get(cacheKey)!;
    }

    const request = api
        .post(`${API}/feed`, {
            id,
            cursor: normalizeCursor(cursor),
            limit
        })
        .then((response) => response.data)
        .catch((error) => {
            feedCache.delete(cacheKey);
            throw parsePostError(error);
        });

    feedCache.set(cacheKey, request);

    return request;
}

export async function getDumpsByCurrentUser({
    id,
    cursor,
    limit = 6
}: PaginatedRequest): Promise<unknown> {
    const normalizedCursor = normalizeCursor(cursor) ?? 'first_page';
    const cacheKey = `${id}_${normalizedCursor}_${limit}`;

    if (dumpsCache.has(cacheKey)) {
        return dumpsCache.get(cacheKey)!;
    }

    const params: Record<string, string> = {
        limit: String(limit)
    };

    if (cursor) {
        params.cursor = String(normalizeCursor(cursor));
    }

    const request = api
        .get(`${API}/dumps/getByUser/${id}`, { params })
        .then((response) => response.data)
        .catch((error) => {
            dumpsCache.delete(cacheKey);
            throw parsePostError(error);
        });

    dumpsCache.set(cacheKey, request);

    return request;
}

export async function getById(id: string): Promise<unknown> {
    try {
        const response = await api.post(`${API}/getById`, { id });
        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export async function getPostMedia(postId: string): Promise<unknown> {
    if (postMediaCache.has(postId)) {
        return postMediaCache.get(postId)!;
    }

    const request = api
        .get(`${API}/${postId}/media`)
        .then((response) => response.data)
        .catch((error) => {
            postMediaCache.delete(postId);
            throw parsePostError(error);
        });

    postMediaCache.set(postId, request);

    return request;
}

export async function getByUser({
    id,
    cursor = null,
    limit = 12
}: PaginatedRequest): Promise<unknown> {
    try {
        const response = await api.post(`${API}/getByUserProfile`, {
            id,
            cursor: normalizeCursor(cursor),
            limit
        });

        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export async function handleLike(postId: string, likerId: string): Promise<unknown> {
    try {
        const response = await api.post(`${API}/handleLike`, {
            postId,
            likerId
        });

        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export async function getArchivedByUser(id: string): Promise<unknown> {
    try {
        const response = await api.get(`${API}/archived/getByUser/${id}`);
        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export async function createPost(post: Post): Promise<unknown> {
    try {
        clearFeedCache();

        const response = await api.post(API, post);
        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export async function archivePost(postId: string): Promise<unknown> {
    try {
        clearFeedCache();

        const response = await api.patch(`${API}/${postId}/archive`, {});
        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export async function unarchivePost(postId: string): Promise<unknown> {
    try {
        clearFeedCache();

        const response = await api.patch(`${API}/${postId}/unarchive`, {});
        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export async function deletePost(postId: string): Promise<unknown> {
    try {
        clearFeedCache();

        const response = await api.delete(`${API}/${postId}`);
        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export async function restorePost(postId: string): Promise<unknown> {
    try {
        clearFeedCache();

        const response = await api.patch(`${API}/${postId}/restore`, {});
        return response.data;
    } catch (error) {
        throw parsePostError(error);
    }
}

export function clearFeedCache() {
    feedCache.clear();
    dumpsCache.clear();
    postMediaCache.clear();
}