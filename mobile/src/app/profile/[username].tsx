import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";

import GenericText from "@/components/ui/generic-text";
import { useGlobal } from "@/context/GlobalProvider";
import { Post } from "@/services/post.service";
import { profileService } from "@/services/profile.service";
import Avatar from "@/components/ui/avatar";
import GenericActionsButtons from "@/components/ui/generic-actions-buttons";

const screenWidth = Dimensions.get("window").width;
const horizontalPadding = 16;
const gridGap = 3;
const gridItemSize = (screenWidth - horizontalPadding * 2 - gridGap * 2) / 3;

type ProfileTabType = "posts" | "media" | "likes";

const ProfilePage = () => {
    const params = useLocalSearchParams<{ username?: string | string[] }>();
    const rawRouteUsername = Array.isArray(params.username) ? params.username[0] : params.username;
    const routeUsername = rawRouteUsername
        ? decodeURIComponent(rawRouteUsername).trim().replace(/^@/, '')
        : undefined;
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ProfileTabType>("posts");
    const { user: currentUser } = useGlobal();

    useEffect(() => {
        if (!routeUsername) {
            setUser(null);
            setPosts([]);
            setLoading(false);
            return;
        }

        let isMounted = true;

        const getUserData = async () => {
            try {
                setLoading(true);
                let profileUser: any;

                try {
                    profileUser = await profileService.getUserByUsername(routeUsername, true);
                } catch (error) {
                    const currentUsername = currentUser?.username?.trim().replace(/^@/, '').toLowerCase();
                    const requestedUsername = routeUsername.trim().replace(/^@/, '').toLowerCase();

                    if (currentUser && currentUsername === requestedUsername) {
                        profileUser = currentUser;
                    } else {
                        throw error;
                    }
                }

                if (!isMounted) return;

                setUser(profileUser);

                const profileUserId = profileUser?.id ?? profileUser?._id;

                if (!profileUserId) {
                    setPosts([]);
                    return;
                }

                const userPosts = await profileService.getPostsByUser(profileUserId);

                if (!isMounted) return;

                setPosts(userPosts.slice().reverse());
            } catch (error) {
                if (!isMounted) return;

                setUser(null);
                setPosts([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getUserData();

        return () => {
            isMounted = false;
        };
    }, [routeUsername, currentUser]);

    const filteredPosts = useMemo(() => {
        switch (activeTab) {
            case "media":
                return posts.filter((post: Post | any) => (post?.media?.length ?? 0) > 0);
            case "likes":
                return posts.filter((post: Post | any) => (post?.likes?.length ?? 0) > 0);
            default:
                return posts;
        }
    }, [activeTab, posts]);

    const openWebsite = async () => {
        if (!user?.website) return;

        const url = user.website.startsWith("http") ? user.website : `https://${user.website}`;
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
            await Linking.openURL(url);
        }
    };

    const navigateToPost = (post: Post | any) => {
        const postId = post?.id ?? post?._id;
        if (!postId) return;

        router.push(`/post/${postId}` as never);
    };

    const renderPost = ({ item }: { item: Post | any }) => {
        const firstMedia = item?.media?.[0];
        const imageUrl = firstMedia?.thumbnail || firstMedia?.url;
        const isVideo = firstMedia?.type === "video";

        if (!imageUrl) {
            return <View style={styles.emptyGridItem} />;
        }

        return (
            <Pressable style={styles.postCard} onPress={() => navigateToPost(item)}>
                <Image source={{ uri: imageUrl }} style={styles.postImage} />

                {isVideo && (
                    <View style={styles.videoIconWrapper}>
                        <SymbolView name="play.fill" size={18} tintColor="#fff" weight="regular" />
                    </View>
                )}
            </Pressable>
        );
    };

    const renderHeader = () => {
        if (!user) return null;

        return (
            <View style={styles.profile}>
                {/* <View style={styles.navigationRow}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <SymbolView name="chevron.left" size={22} tintColor="#111" weight="semibold" />
                    </Pressable>

                    <Text style={styles.navigationTitle} numberOfLines={1}>{user?.username}</Text>

                    <View style={styles.backButtonPlaceholder} />
                </View> */}

                <View style={styles.profileHeader}>
                    <View style={styles.avatarBlock}>
                        <Avatar user={user} width={92} height={92} />
                    </View>

                    <View style={styles.infoBlock}>
                        <View style={styles.topRow}>
                            <Text style={styles.username} numberOfLines={1}>
                                {user?.username}
                            </Text>

                            {user?.verified && (
                                <SymbolView
                                    name="checkmark.seal.fill"
                                    size={15}
                                    tintColor="#1881E2"
                                    weight="regular"
                                />
                            )}
                        </View>

                        <View style={styles.stats}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{posts.length}</Text>
                                <Text style={styles.statLabel}>posts</Text>
                            </View>

                            <Pressable style={styles.statItem}>
                                <Text style={styles.statNumber}>{user?.followers?.length ?? 0}</Text>
                                <Text style={styles.statLabel}>seguidores</Text>
                            </Pressable>

                            <Pressable style={styles.statItem}>
                                <Text style={styles.statNumber}>{user?.following?.length ?? 0}</Text>
                                <Text style={styles.statLabel}>seguindo</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={styles.bioBlock}>
                    {!!user?.fullName && <Text style={styles.fullName}>{user.fullName}</Text>}

                    {!!user?.bio && (
                        <GenericText
                            text={user.bio}
                            theme="light"
                            expandable={false}
                            clickableMentions
                            clickableHashtags
                            clickableLinks
                        />
                    )}

                    {!!user?.website && (
                        <Pressable onPress={openWebsite}>
                            <Text style={styles.website}>{user.website}</Text>
                        </Pressable>
                    )}
                </View>

                <GenericActionsButtons
                    user={user}
                    style={styles.actionsRow}
                />

                {!!user?.stories?.length && (
                    <View style={styles.stories}>
                        {user.stories.map((story: any, index: number) => (
                            <View key={story?.id ?? index} style={styles.storyBorder}>
                                <Image source={{ uri: story?.url || story?.thumbnail }} style={styles.storyImage} />
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.tabs}>
                    <ProfileTabButton
                        label="POSTS"
                        active={activeTab === "posts"}
                        onPress={() => setActiveTab("posts")}
                    />
                    <ProfileTabButton
                        label="MÍDIA"
                        active={activeTab === "media"}
                        onPress={() => setActiveTab("media")}
                    />
                    <ProfileTabButton
                        label="CURTIDOS"
                        active={activeTab === "likes"}
                        onPress={() => setActiveTab("likes")}
                    />
                </View>
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

    if (!user) {
        return (
            <SafeAreaView style={styles.notFoundWrapper}>
                {/* <Pressable style={styles.notFoundBackButton} onPress={() => router.back()}>
                    <SymbolView name="chevron.left" size={22} tintColor="#111" weight="semibold" />
                </Pressable> */}
                <Text style={styles.notFoundTitle}>Perfil não encontrado</Text>
                <Text style={styles.notFoundSubtitle}>Esse usuário não existe ou não está disponível.</Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={[styles.container]}>
            <FlatList
                data={filteredPosts}
                keyExtractor={(item: Post | any, index: number) => item?.id ?? item?._id ?? String(index)}
                renderItem={renderPost}
                numColumns={3}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Nenhum post encontrado.</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

function ProfileTabButton({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#ffffff"
    },
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: horizontalPadding,
        paddingBottom: 32,
    },
    profile: {
        marginTop: 120,
    },
    navigationRow: {
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    backButtonPlaceholder: {
        width: 40,
        height: 40,
    },
    navigationTitle: {
        flex: 1,
        textAlign: "center",
        color: "#111",
        fontSize: 17,
        fontWeight: "700",
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 20,
    },
    avatarBlock: {
        width: 104,
        alignItems: "center",
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#eee",
    },
    infoBlock: {
        flex: 1,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 18,
    },
    username: {
        maxWidth: "90%",
        color: "#111",
        fontSize: 20,
        fontWeight: "400",
    },
    stats: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        color: "#111",
        fontSize: 15,
        fontWeight: "700",
    },
    statLabel: {
        color: "#333",
        fontSize: 12,
        marginTop: 2,
    },
    bioBlock: {
        marginTop: 18,
        gap: 3,
    },
    fullName: {
        color: "#111",
        fontSize: 14,
        fontWeight: "700",
    },
    website: {
        color: "#1881E2",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 2,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 14,
    },
    actionButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        paddingVertical: 8,
        backgroundColor: "#1881E2",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    actionButtonSecondary: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        paddingVertical: 8,
        backgroundColor: "#efefef",
    },
    actionButtonSecondaryText: {
        color: "#111",
        fontSize: 13,
        fontWeight: "700",
    },
    stories: {
        flexDirection: "row",
        gap: 18,
        marginTop: 26,
        marginBottom: 4,
    },
    storyBorder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        padding: 3,
        backgroundColor: "#dbdbdb",
    },
    storyImage: {
        width: "100%",
        height: "100%",
        borderRadius: 35,
        borderWidth: 2,
        borderColor: "#fff",
    },
    tabs: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 28,
        marginTop: 30,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#dbdbdb",
    },
    tabButton: {
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "transparent",
    },
    tabButtonActive: {
        borderTopColor: "#111",
    },
    tabText: {
        color: "#111",
        opacity: 0.55,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
    },
    tabTextActive: {
        opacity: 1,
    },
    columnWrapper: {
        gap: gridGap,
    },
    postCard: {
        width: gridItemSize,
        height: gridItemSize,
        marginBottom: gridGap,
        backgroundColor: "#eee",
        overflow: "hidden",
    },
    postImage: {
        width: "100%",
        height: "100%",
    },
    videoIconWrapper: {
        position: "absolute",
        right: 8,
        bottom: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.28)",
    },
    emptyGridItem: {
        width: gridItemSize,
        height: gridItemSize,
        backgroundColor: "#eee",
        marginBottom: gridGap,
    },
    empty: {
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        color: "#777",
        fontSize: 14,
    },
    loaderWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    notFoundWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 24,
    },
    notFoundBackButton: {
        position: "absolute",
        top: 56,
        left: 16,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
    },
    notFoundTitle: {
        color: "#111",
        fontSize: 18,
        fontWeight: "700",
    },
    notFoundSubtitle: {
        color: "#777",
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
    },
});

export default ProfilePage;