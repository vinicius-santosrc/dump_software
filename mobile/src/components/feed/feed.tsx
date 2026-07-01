import { useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, NativeScrollEvent, NativeSyntheticEvent, Text, View } from 'react-native';

import { usePosts } from '@/hooks/use-posts';

import PostCard from './post';
import Stories from './stories';
import { useGlobal } from '@/context/GlobalProvider';
const Feed = () => {
    const global = useGlobal();
    const userId = global.user?.id;
    const loadMoreLockRef = useRef(false);
    const lastLoadMoreAtRef = useRef(0);

    const {
        posts,
        loadMore,
        refreshing,
        refresh,
        loading,
        loadingMore,
        error
    } = usePosts({
        userId,
        limit: 10,
        enabled: !!userId
    });
    const getMorePosts = useCallback(() => {
        if (loading || loadingMore || refreshing) return;
        if (!posts.length) return;
        if (loadMoreLockRef.current) return;

        const now = Date.now();

        if (now - lastLoadMoreAtRef.current < 350) {
            return;
        }

        loadMoreLockRef.current = true;
        lastLoadMoreAtRef.current = now;

        Promise.resolve(loadMore())
            .catch(() => undefined)
            .finally(() => {
                setTimeout(() => {
                    loadMoreLockRef.current = false;
                }, 180);
            });
    }, [loadMore, loading, loadingMore, posts.length, refreshing]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);

        if (distanceFromBottom <= 900) {
            getMorePosts();
        }
    }, [getMorePosts]);

    const handleEndReached = useCallback(() => {
        getMorePosts();
    }, [getMorePosts]);

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ActivityIndicator />
            </View>
        );
    }

    if (error) {
        return (
            <View
                style={{
                    flex: 1,
                    padding: 24,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={posts}
            keyExtractor={(item, index) => item.id ?? String(index)}
            renderItem={({ item }) => <PostCard post={item} />}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.25}
            onMomentumScrollEnd={handleEndReached}
            onScrollEndDrag={handleEndReached}
            refreshing={refreshing}
            onRefresh={refresh}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<Stories />}
            contentContainerStyle={{
                flexGrow: 1,
                gap: 12,
                paddingTop: 8,
                paddingBottom: 24
            }}
            ListFooterComponent={
                loadingMore ? (
                    <View style={{ paddingVertical: 20 }}>
                        <ActivityIndicator />
                    </View>
                ) : null
            }
            ListEmptyComponent={
                <View
                    style={{
                        flex: 1,
                        padding: 24,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text>Nenhum post encontrado.</Text>
                </View>
            }
        />
    );
};

export default Feed;