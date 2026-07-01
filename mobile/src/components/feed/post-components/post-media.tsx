/**
 * Created By: Vinícius da Silva Santos
 * Creation Date: 2026-03-17
 * Copyright (c) 2026 Dump Software. All rights reserved.
 * This software is licensed under the MIT License. See the LICENSE file in the project root for more information.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { getPostMedia, handleLike } from '@/services/post.service';
import { useGlobal } from '@/context/GlobalProvider';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LAZY_FULL_MEDIA_DELAY_MS = 2500;
const DOUBLE_TAP_DELAY_MS = 250;

export interface MediaItem {
    url?: string;
    thumbnail?: string;
    width?: number;
    height?: number;
    type: 'image' | 'video';
}

interface PostMediaProps {
    media?: MediaItem[];
    postId?: string;
    isVisible?: boolean;
    onLikeChanged?: (liked: boolean) => void;
}

function hasLazyMedia(media: MediaItem[]) {
    return media.some((item) => !item.url);
}

function getMediaSource(item?: MediaItem) {
    return item?.url || item?.thumbnail || '';
}

function getMediaHeight(item?: MediaItem) {
    if (!item?.width || !item?.height) {
        return SCREEN_WIDTH;
    }

    const ratio = item.height / item.width;
    const calculatedHeight = SCREEN_WIDTH * ratio;

    return Math.min(Math.max(calculatedHeight, 280), SCREEN_WIDTH * 1.35);
}

export default function PostMedia({
    media = [],
    postId = '',
    isVisible = true,
    onLikeChanged
}: PostMediaProps) {
    const {user} = useGlobal();
    const currentUserId = user?.id;

    const [resolvedMedia, setResolvedMedia] = useState<MediaItem[]>(media);
    const [isLoading, setIsLoading] = useState(hasLazyMedia(media));
    const [isLoadingFullMedia, setIsLoadingFullMedia] = useState(false);
    const [hasLoadedFullMedia, setHasLoadedFullMedia] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLike, setShowLike] = useState(false);
    const [showDislike, setShowDislike] = useState(false);

    const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lazyMediaLoadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadFullMedia = useCallback(async () => {
        if (!postId || hasLoadedFullMedia || isLoadingFullMedia) {
            return;
        }

        try {
            setIsLoadingFullMedia(true);

            const response = await getPostMedia(postId);
            const responseData = response as { media?: MediaItem[] };
            const fullMedia = responseData?.media;

            if (Array.isArray(fullMedia) && fullMedia.length > 0) {
                setResolvedMedia(fullMedia);
                setHasLoadedFullMedia(true);
            }
        } catch {
            // não quebra o feed se a mídia completa falhar
        } finally {
            setIsLoading(false);
            setIsLoadingFullMedia(false);
        }
    }, [hasLoadedFullMedia, isLoadingFullMedia, postId]);

    const scheduleFullMediaLoad = useCallback(() => {
        if (!hasLazyMedia(resolvedMedia)) {
            setIsLoading(false);
            return;
        }

        if (hasLoadedFullMedia || isLoadingFullMedia || lazyMediaLoadTimer.current) {
            return;
        }

        lazyMediaLoadTimer.current = setTimeout(() => {
            lazyMediaLoadTimer.current = null;
            loadFullMedia();
        }, LAZY_FULL_MEDIA_DELAY_MS);
    }, [hasLoadedFullMedia, isLoadingFullMedia, loadFullMedia, resolvedMedia]);

    useEffect(() => {
        setResolvedMedia(media);
        setIsLoading(hasLazyMedia(media));
        setHasLoadedFullMedia(false);
        setIsLoadingFullMedia(false);
        setCurrentIndex(0);
    }, [media]);

    useEffect(() => {
        if (!isVisible) {
            if (lazyMediaLoadTimer.current) {
                clearTimeout(lazyMediaLoadTimer.current);
                lazyMediaLoadTimer.current = null;
            }

            return;
        }

        scheduleFullMediaLoad();

        return () => {
            if (lazyMediaLoadTimer.current) {
                clearTimeout(lazyMediaLoadTimer.current);
                lazyMediaLoadTimer.current = null;
            }
        };
    }, [isVisible, scheduleFullMediaLoad]);

    useEffect(() => {
        return () => {
            if (tapTimeout.current) {
                clearTimeout(tapTimeout.current);
                tapTimeout.current = null;
            }
        };
    }, []);

    async function handleDoubleTapLike() {
        if (!postId || !currentUserId) {
            return;
        }

        try {
            const result = await handleLike(postId, currentUserId);
            const liked = Boolean(result);

            if (liked) {
                setShowLike(true);
                onLikeChanged?.(true);
                setTimeout(() => setShowLike(false), 600);
                return;
            }

            setShowDislike(true);
            onLikeChanged?.(false);
            setTimeout(() => setShowDislike(false), 600);
        } catch {
            // não faz nada em caso de erro
        }
    }

    function handleTap() {
        if (!postId) {
            return;
        }

        if (tapTimeout.current) {
            clearTimeout(tapTimeout.current);
            tapTimeout.current = null;
            handleDoubleTapLike();
            return;
        }

        tapTimeout.current = setTimeout(() => {
            tapTimeout.current = null;
        }, DOUBLE_TAP_DELAY_MS);
    }

    function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    }

    function renderMediaItem({ item }: { item: MediaItem }) {
        const source = getMediaSource(item);
        const height = getMediaHeight(item);

        if (item.type === 'video') {
            return (
                <View style={[styles.mediaContainer, { height }]}> 
                    {source ? (
                        <Image
                            source={{ uri: source }}
                            resizeMode="contain"
                            onLoad={() => source === item.url && setIsLoading(false)}
                            style={styles.media}
                        />
                    ) : (
                        <View style={styles.emptyMedia} />
                    )}

                    <View style={styles.videoOverlay}>
                        <Text style={styles.playIcon}>▶</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.mediaContainer, { height }]}> 
                {source ? (
                    <Image
                        source={{ uri: source }}
                        resizeMode="contain"
                        onLoad={() => source === item.url && setIsLoading(false)}
                        style={styles.media}
                    />
                ) : (
                    <View style={styles.emptyMedia} />
                )}
            </View>
        );
    }

    if (!resolvedMedia.length) {
        return null;
    }

    const shouldShowLoader = isVisible && (isLoading || isLoadingFullMedia);

    return (
        <Pressable onPress={handleTap} style={styles.postMedia}>
            {resolvedMedia.length === 1 ? (
                renderMediaItem({ item: resolvedMedia[0] })
            ) : (
                <View>
                    <FlatList
                        data={resolvedMedia}
                        horizontal
                        pagingEnabled
                        keyExtractor={(item, index) => `${item.url || item.thumbnail || 'media'}-${index}`}
                        renderItem={renderMediaItem}
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleScrollEnd}
                    />

                    <View style={styles.dotsWrapper}>
                        {resolvedMedia.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentIndex === index && styles.dotActive
                                ]}
                            />
                        ))}
                    </View>
                </View>
            )}

            {shouldShowLoader ? (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator color="#ffffff" />
                </View>
            ) : null}

            {showLike ? <Text style={styles.likeBurst}>❤️</Text> : null}
            {showDislike ? <Text style={styles.likeBurst}>💔</Text> : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    postMedia: {
        position: 'relative',
        width: '95%',
        alignSelf: 'center',
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#000000'
    },
    mediaContainer: {
        position: 'relative',
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000'
    },
    media: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    emptyMedia: {
        width: '100%',
        height: '100%',
        backgroundColor: '#111111'
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
    },
    playIcon: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 54,
        fontWeight: '700'
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.18)'
    },
    likeBurst: {
        position: 'absolute',
        alignSelf: 'center',
        top: '42%',
        fontSize: 82,
        includeFontPadding: false
    },
    dotsWrapper: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.45)'
    },
    dotActive: {
        backgroundColor: '#ffffff'
    }
});