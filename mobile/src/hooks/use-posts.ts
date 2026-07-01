/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { getByCurrentUser, Post } from '@/services/post.service';

interface UsePostsParams {
    userId?: string;
    limit?: number;
    enabled?: boolean;
}

interface FeedResponse {
    posts?: Post[];
    items?: Post[];
    data?: Post[] | FeedResponse;
    result?: Post[] | FeedResponse;
    nextCursor?: string | null;
    cursor?: string | null;
    hasMore?: boolean;
    pagination?: {
        nextCursor?: string | null;
        cursor?: string | null;
        hasMore?: boolean;
    };
}

function normalizeFeedResponse(response: unknown): FeedResponse | Post[] {
    let data = response as any;

    for (let index = 0; index < 3; index += 1) {
        if (!data || Array.isArray(data)) {
            return data as FeedResponse | Post[];
        }

        if (Array.isArray(data.posts) || Array.isArray(data.items) || Array.isArray(data.result)) {
            return data as FeedResponse;
        }

        if (Array.isArray(data.data)) {
            return data.data as Post[];
        }

        if (data.data && typeof data.data === 'object') {
            data = data.data;
            continue;
        }

        if (data.result && typeof data.result === 'object' && !Array.isArray(data.result)) {
            data = data.result;
            continue;
        }

        return data as FeedResponse;
    }

    return data as FeedResponse | Post[];
}

function extractPosts(response: unknown): Post[] {
    const data = normalizeFeedResponse(response) as FeedResponse | Post[];

    if (Array.isArray(data)) {
        return data as Post[];
    }

    if (Array.isArray(data.posts)) return data.posts;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.result)) return data.result;

    return [];
}

function extractNextCursor(response: unknown, posts: Post[]): string | null {
    const data = normalizeFeedResponse(response) as FeedResponse | Post[];

    if (!Array.isArray(data)) {
        const responseCursor = data.nextCursor ?? data.cursor ?? data.pagination?.nextCursor ?? data.pagination?.cursor;

        if (responseCursor) {
            return responseCursor;
        }
    }

    const lastPost = posts[posts.length - 1];
    return lastPost?.createdAt ?? lastPost?.id ?? null;
}

function extractHasMore(response: unknown, postsLength: number): boolean {
    const data = normalizeFeedResponse(response) as FeedResponse | Post[];

    if (!Array.isArray(data)) {
        if (typeof data.hasMore === 'boolean') {
            return data.hasMore;
        }

        if (typeof data.pagination?.hasMore === 'boolean') {
            return data.pagination.hasMore;
        }
    }

    return postsLength > 0;
}

export function usePosts({
    userId,
    limit = 10,
    enabled = true
}: UsePostsParams) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const firstLoadDone = useRef(false);
    const cursorRef = useRef<string | null>(null);
    const hasMoreRef = useRef(true);
    const loadingRef = useRef(false);

    const loadPosts = useCallback(
        async (options?: { reset?: boolean }) => {
            if (!enabled || !userId) {
                return
            }
            const reset = options?.reset ?? false;
            const currentCursor = reset ? undefined : cursorRef.current;

            if (reset) {
                cursorRef.current = null;
                hasMoreRef.current = true;
            }

            if (!reset && !hasMoreRef.current) {
                return;
            }

            if (loadingRef.current) {
                return;
            }

            try {
                if (reset) {
                    setRefreshing(true);
                } else if (firstLoadDone.current) {
                    setLoadingMore(true);
                } else {
                    setLoading(true);
                }

                loadingRef.current = true;
                setError(null);
                const response = await getByCurrentUser({
                    id: userId,
                    cursor: currentCursor,
                    limit
                });

                const newPosts = extractPosts(response).sort((a, b) => {
                    return new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
                });
                const nextCursor = extractNextCursor(response, newPosts);
                const responseHasMore = extractHasMore(response, newPosts.length);
                let addedPostsCount = 0;

                setPosts((currentPosts) => {
                    if (reset) {
                        addedPostsCount = newPosts.length;
                        return newPosts;
                    }

                    const existingIds = new Set(currentPosts.map((post) => post.id));
                    const filteredPosts = newPosts.filter((post) => {
                        if (!post.id) {
                            return true;
                        }

                        return !existingIds.has(post.id);
                    });

                    addedPostsCount = filteredPosts.length;

                    return [...currentPosts, ...filteredPosts].sort((a, b) => {
                        return new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
                    });
                });

                const canLoadMore = responseHasMore && newPosts.length > 0;

                cursorRef.current = nextCursor ?? currentCursor ?? null;
                hasMoreRef.current = canLoadMore;

                setCursor(cursorRef.current);
                setHasMore(canLoadMore);
                firstLoadDone.current = true;
            } catch (err: any) {
                setError(err.message ?? 'Não foi possível carregar os posts.');
            } finally {
                loadingRef.current = false;
                setLoading(false);
                setRefreshing(false);
                setLoadingMore(false);
            }
        },
        [enabled, limit, userId]
    );

    const refresh = useCallback(async () => {
        cursorRef.current = null;
        hasMoreRef.current = true;
        firstLoadDone.current = false;

        setCursor(null);
        setHasMore(true);

        await loadPosts({ reset: true });
    }, [loadPosts]);

    const loadMore = useCallback(async () => {
        if (loadingRef.current) {
            return;
        }

        await loadPosts();
    }, [loadPosts]);

    useEffect(() => {
        cursorRef.current = null;
        hasMoreRef.current = true;
        firstLoadDone.current = false;
        loadingRef.current = false;

        setPosts([]);
        setCursor(null);
        setHasMore(true);
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        setError(null);
    }, [userId]);

    useEffect(() => {
        if (!firstLoadDone.current && userId && enabled) {
            loadPosts({ reset: true });
        }
    }, [enabled, loadPosts, userId]);

    return {
        posts,
        cursor,
        hasMore,
        loading,
        refreshing,
        loadingMore,
        error,
        refresh,
        loadMore,
        setPosts
    };
}