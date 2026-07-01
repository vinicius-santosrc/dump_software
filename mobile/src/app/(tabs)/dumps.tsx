import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewToken
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';

import DumpItem from '@/components/dumps/dump-item';
import { useGlobal } from '@/context/GlobalProvider';
import { getDumpsByCurrentUser, Post } from '@/services/post.service';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth <= 768;

export default function DumpPage() {
    const params = useLocalSearchParams<{ postId?: string | string[] }>();
    const routePostId = Array.isArray(params.postId) ? params.postId[0] : params.postId;

    const { user: currentUser } = useGlobal();
    const listRef = useRef<FlatList<Post | any>>(null);

    const [reels, setReels] = useState<Array<Post | any>>([]);
    const [activeReelId, setActiveReelId] = useState<string | null>(routePostId ?? null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const ButtonGlass = Platform.OS === 'ios' ? GlassView : View;
    const buttonGlassTint = 'rgba(255, 255, 255, 0.34)';

    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 60,
        minimumViewTime: 80
    }), []);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const activeItem = viewableItems.find(item => item.isViewable);
        const nextReel = activeItem?.item as Post | any;
        const nextId = nextReel?.id ?? nextReel?._id;

        if (!nextId) return;

        setActiveReelId(previousId => {
            if (previousId !== nextId) {
                router.setParams({ postId: nextId } as never);
            }

            return nextId;
        });

        if (typeof activeItem?.index === 'number') {
            setCurrentIndex(activeItem.index);
        }
    }).current;

    const getDumps = useCallback(async (forceRefresh = false) => {
        const userId = currentUser?.id ?? currentUser?._id;

        if (!userId) {
            setLoading(false);
            setRefreshing(false);
            setReels([]);
            return;
        }

        try {
            if (forceRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await getDumpsByCurrentUser(userId);
            const dumps = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.items)
                        ? response.items
                        : Array.isArray(response?.posts)
                            ? response.posts
                            : [];

            setReels(dumps);

            const firstId = dumps?.[0]?.id ?? dumps?.[0]?._id ?? null;

            if (!activeReelId && firstId) {
                setActiveReelId(firstId);
            }
        } catch (error) {
            console.log('[DUMP_PAGE] getDumps failed', error);
            setReels([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeReelId, currentUser?.id, currentUser?._id]);

    useEffect(() => {
        getDumps();
    }, [getDumps]);

    useEffect(() => {
        if (!routePostId || !reels.length) return;

        const index = reels.findIndex(reel => (reel?.id ?? reel?._id) === routePostId);

        if (index === -1) return;

        setActiveReelId(routePostId);
        setCurrentIndex(index);

        requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({
                index,
                animated: false
            });
        });
    }, [reels, routePostId]);

    const scrollToTop = () => {
        if (!reels.length) return;

        const previousIndex = Math.max(currentIndex - 1, 0);

        listRef.current?.scrollToIndex({
            index: previousIndex,
            animated: true
        });
    };

    const scrollToBottom = () => {
        if (!reels.length) return;

        const nextIndex = Math.min(currentIndex + 1, reels.length - 1);

        listRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true
        });
    };

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / screenHeight);
        const reel = reels[index];
        const id = reel?.id ?? reel?._id;

        setCurrentIndex(index);

        if (id && activeReelId !== id) {
            setActiveReelId(id);
            router.setParams({ postId: id } as never);
        }
    };

    const renderItem = ({ item }: { item: Post | any }) => {
        const itemId = item?.id ?? item?._id;

        return (
            <View style={styles.reelItem}>
                <DumpItem
                    reel={item}
                    isActive={activeReelId === itemId}
                    theme="dark"
                    showOptions
                />
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loaderWrapper}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    if (!reels.length) {
        return (
            <SafeAreaView style={styles.emptyWrapper}>
                <Text style={styles.emptyTitle}>Nenhum dump encontrado</Text>
                <Text style={styles.emptySubtitle}>Quando houver vídeos, eles aparecerão aqui.</Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.reelsInside}>
            <FlatList
                ref={listRef}
                data={reels}
                keyExtractor={(item, index) => item?.id ?? item?._id ?? String(index)}
                renderItem={renderItem}
                pagingEnabled
                snapToInterval={screenHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                disableIntervalMomentum
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                refreshing={refreshing}
                onRefresh={() => getDumps(true)}
                getItemLayout={(_, index) => ({
                    length: screenHeight,
                    offset: screenHeight * index,
                    index
                })}
                onScrollToIndexFailed={({ index }) => {
                    setTimeout(() => {
                        listRef.current?.scrollToIndex({
                            index,
                            animated: false
                        });
                    }, 120);
                }}
                style={styles.reelsContainer}
            />

            {!isSmallScreen && (
                <View style={styles.reelsActionsButtons}>
                    <View style={styles.actionButtonClipper}>
                        <ButtonGlass
                            style={styles.actionButtonGlass}
                            isInteractive={Platform.OS === 'ios'}
                            tintColor={buttonGlassTint}
                        >
                            <Pressable style={styles.actionButton} onPress={scrollToTop}>
                                <SymbolView name="chevron.up" size={28} tintColor="#111" weight="semibold" />
                            </Pressable>
                        </ButtonGlass>
                    </View>

                    <View style={styles.actionButtonClipper}>
                        <ButtonGlass
                            style={styles.actionButtonGlass}
                            isInteractive={Platform.OS === 'ios'}
                            tintColor={buttonGlassTint}
                        >
                            <Pressable style={styles.actionButton} onPress={scrollToBottom}>
                                <SymbolView name="chevron.down" size={28} tintColor="#111" weight="semibold" />
                            </Pressable>
                        </ButtonGlass>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    reelsInside: {
        width: '100%',
        flex: 1,
        position: 'relative',
        backgroundColor: '#000'
    },
    reelsContainer: {
        width: '100%',
        height: screenHeight,
        backgroundColor: '#000'
    },
    reelItem: {
        width: '100%',
        height: screenHeight,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000'
    },
    reelsActionsButtons: {
        position: 'absolute',
        right: 48,
        top: '50%',
        transform: [{ translateY: -54 }],
        gap: 12,
        zIndex: 50
    },
    actionButtonClipper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.82)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.28)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 14,
        elevation: 8
    },
    actionButtonGlass: {
        width: '100%',
        height: '100%',
        backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.82)'
    },
    actionButton: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24
    },
    loaderWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000'
    },
    emptyWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 24
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700'
    },
    emptySubtitle: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center'
    }
});