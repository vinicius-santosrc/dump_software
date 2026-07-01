

import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { useGlobal } from '@/context/GlobalProvider';
import { getById, handleLike, Post } from '@/services/post.service';
import PostMedia from '@/components/feed/post-components/post-media';
import PostHeader from '@/components/feed/post-components/post-header';
import PostActionsButtons from '@/components/feed/post-components/post-actions-buttons';
import PostComments from '@/components/feed/post-components/post-comments';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isLargeScreen = SCREEN_WIDTH >= 768;

const PostPage = () => {
    const params = useLocalSearchParams<{ id?: string }>();
    const postId = Array.isArray(params.id) ? params.id[0] : params.id;
    const { user } = useGlobal();

    const [post, setPost] = useState<Post | any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [savesCount, setSavesCount] = useState(0);
    const [sharesCount, setSharesCount] = useState(0);

    const currentUserId = user?.id;

    useEffect(() => {
        loadPost();
    }, [postId]);

    useEffect(() => {
        if (!post) return;

        const likes = Array.isArray(post.likes) ? post.likes : [];
        const saves = Array.isArray(post.saves) ? post.saves : [];

        setLiked(Boolean(currentUserId && likes.includes(currentUserId)));
        setSaved(Boolean(currentUserId && saves.includes(currentUserId)));
        setLikesCount(likes.length);
        setSavesCount(saves.length);
        setSharesCount(Number(post.sharesCount ?? post.shares ?? 0));
    }, [post, currentUserId]);

    async function loadPost() {
        if (!postId) {
            setError('Post não encontrado.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response: any = await getById(postId);
            const resolvedPost = response?.post ?? response?.data ?? response;

            setPost(resolvedPost);
        } catch (err) {
            console.error('[POST_PAGE] Erro ao buscar post', err);
            setError('Não foi possível carregar esse post.');
        } finally {
            setLoading(false);
        }
    }

    const postForActions = useMemo(() => {
        if (!post) return undefined;

        return {
            ...post,
            id: post?.id ?? post?._id ?? postId,
            likes: Array.from({ length: likesCount }),
            saves: Array.from({ length: savesCount }),
            sharesCount
        };
    }, [post, postId, likesCount, savesCount, sharesCount]);

    async function onLike() {
        if (!postId || !currentUserId) {
            console.warn('[POST_PAGE] Like ignorado: postId ou currentUserId ausente', {
                postId,
                currentUserId
            });
            return;
        }

        const previousLiked = liked;
        const nextLiked = !liked;

        setLiked(nextLiked);
        setLikesCount(previous => Math.max(0, previous + (nextLiked ? 1 : -1)));

        try {
            await handleLike(postId, currentUserId);
        } catch (err) {
            setLiked(previousLiked);
            setLikesCount(previous => Math.max(0, previous + (nextLiked ? -1 : 1)));
            console.error('[POST_PAGE] Erro ao curtir post', err);
        }
    }

    function onSave() {
        const nextSaved = !saved;
        setSaved(nextSaved);
        setSavesCount(previous => Math.max(0, previous + (nextSaved ? 1 : -1)));
    }

    async function onSend() {
        try {
            setSharesCount(previous => previous + 1);

            await Share.share({
                message: post?.caption ? `Veja esse post no Dump: ${post.caption}` : 'Veja esse post no Dump'
            });
        } catch (err) {
            setSharesCount(previous => Math.max(0, previous - 1));
            console.error('[POST_PAGE] Erro ao compartilhar post', err);
        }
    }

    function renderBackButton() {
        const ButtonWrapper = Platform.OS === 'ios' ? GlassView : View;

        return (
            <ButtonWrapper
                style={styles.backGlass}
                isInteractive={Platform.OS === 'ios'}
                tintColor="rgba(18, 18, 18, 0.42)"
            >
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <SymbolView name="chevron.left" size={22} tintColor="#ffffff" weight="semibold" />
                </Pressable>
            </ButtonWrapper>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingWrapper}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator color="#ffffff" />
            </SafeAreaView>
        );
    }

    if (error || !post) {
        return (
            <SafeAreaView style={styles.loadingWrapper}>
                <Stack.Screen options={{ headerShown: false }} />
                {renderBackButton()}
                <Text style={styles.errorTitle}>{error || 'Post não encontrado.'}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <Stack.Screen options={{ headerShown: true, headerTransparent: true}} />

            <View style={styles.modalPage}>
                {/* {renderBackButton()} */}

                <View style={styles.modalContent}>
                    <View style={styles.mediaSide}>
                        <PostHeader
                            user={post.user}
                            post={post}
                            caption={post.caption ?? ''}
                            theme="dark"
                        />

                        <PostMedia
                            postId={post?.id ?? post?._id ?? postId}
                            media={post.media ?? []}
                            isVisible
                            onLikeChanged={(nextLiked) => {
                                setLiked(nextLiked);
                                setLikesCount(previous => {
                                    if (nextLiked === liked) return previous;
                                    return Math.max(0, previous + (nextLiked ? 1 : -1));
                                });
                            }}
                        />

                        <PostActionsButtons post={post} />
                    </View>

                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        marginTop: 62
    },
    loadingWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24
    },
    modalPage: {
        flex: 1,
    },
    modalContent: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center'
    },
    mediaSide: {
        flex: 1,
        minHeight: isLargeScreen ? SCREEN_HEIGHT : SCREEN_HEIGHT * 0.52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoGlass: {
        width: isLargeScreen ? 380 : '100%',
        height: isLargeScreen ? '100%' : SCREEN_HEIGHT * 0.42,
        overflow: 'hidden',
        borderTopLeftRadius: isLargeScreen ? 26 : 28,
        borderTopRightRadius: isLargeScreen ? 0 : 28,
        borderBottomLeftRadius: isLargeScreen ? 26 : 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.22)',
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(18, 18, 18, 0.86)'
    },
    infoContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
        gap: 12
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(255, 255, 255, 0.22)'
    },
    commentsScroll: {
        flex: 1
    },
    commentsContent: {
        paddingBottom: 12
    },
    commentInputGlass: {
        minHeight: 48,
        borderRadius: 999,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.18)'
    },
    commentPlaceholder: {
        color: 'rgba(255, 255, 255, 0.62)',
        fontSize: 14
    },
    backGlass: {
        position: 'absolute',
        top: 14,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 999,
        zIndex: 20,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(18, 18, 18, 0.72)',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255, 255, 255, 0.22)'
    },
    backButton: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center'
    }
});

export default PostPage;