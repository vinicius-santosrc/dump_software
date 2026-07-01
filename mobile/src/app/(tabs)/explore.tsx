import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SearchPost, SearchResponse, SearchUser } from "../../models/search/search.model";
import recentSearchService, { RecentSearch } from "../../services/search/recent-search.service";
import searchService from "../../services/search/search";
import GenericInput from "@/components/ui/generic-input";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "@/components/ui/avatar";
import { router } from "expo-router";

export default function ExploreTab() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResponse>({ users: [], posts: [] });
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const searchRequestRef = useRef(0);

    const normalizedSearchTerm = useMemo(() => searchTerm.trim(), [searchTerm]);

    const hasSearchResults = Boolean(
        normalizedSearchTerm
        && !searchLoading
        && ((searchResults.users?.length ?? 0) > 0 || (searchResults.posts?.length ?? 0) > 0)
    );

    useEffect(() => {
        loadRecentSearches();
    }, []);

    useEffect(() => {
        if (!normalizedSearchTerm) {
            setSearchLoading(false);
            setSearchResults({ users: [], posts: [] });
            return;
        }

        const timeout = setTimeout(() => {
            search(normalizedSearchTerm);
        }, 250);

        return () => clearTimeout(timeout);
    }, [normalizedSearchTerm]);

    async function search(query: string) {
        const requestId = searchRequestRef.current + 1;
        searchRequestRef.current = requestId;

        try {
            setSearchLoading(true);
            const result = await searchService.search(query);

            if (searchRequestRef.current !== requestId) {
                return;
            }

            setSearchResults(result ?? { users: [], posts: [] });
        } catch (error) {
            if (searchRequestRef.current !== requestId) {
                return;
            }

            console.error("[EXPLORE_SEARCH] Erro ao buscar", error);
            setSearchResults({ users: [], posts: [] });
        } finally {
            if (searchRequestRef.current === requestId) {
                setSearchLoading(false);
            }
        }
    }

    async function loadRecentSearches() {
        const recent = await recentSearchService.getAll();
        setRecentSearches(recent);
    }

    async function addRecentUser(user: SearchUser) {
        router.push(`profile/${user.username}` as never);
        await recentSearchService.add({
            id: user.username,
            type: "user",
            label: user.username,
            image: user.avatarUrl
        });

        await loadRecentSearches();
    }

    async function addRecentPost(post: SearchPost) {
        router.push(`post/${post.id}` as never);
        await recentSearchService.add({
            id: post.id,
            type: "post",
            label: post.caption || "Post",
            image: post.imageUrl
        });

        await loadRecentSearches();
    }

    async function removeRecentSearch(id: string) {
        await recentSearchService.remove(id);
        await loadRecentSearches();
    }

    async function clearRecentSearches() {
        await recentSearchService.clear();
        await loadRecentSearches();
    }

    function goToSearch(item: RecentSearch) {
        if (item.type == 'user') {
            router.push(`profile/${item.id}` as never)
        }
        else {
            router.push(`post/${item.id}` as never)
        }
    }

    function renderUser(user: SearchUser) {
        return (
            <Pressable key={user.id} style={styles.userItem} onPress={() => addRecentUser(user)}>
                <Avatar
                    user={user}
                />

                <View style={styles.userTexts}>
                    <Text style={styles.userName} numberOfLines={1}>{user.fullName}</Text>
                    <Text style={styles.userUsername} numberOfLines={1}>@{user.username}</Text>
                </View>
            </Pressable>
        );
    }

    function renderPost(post: SearchPost) {
        return (
            <Pressable key={post.id} style={styles.postCard} onPress={() => addRecentPost(post)}>
                {post.imageUrl ? (
                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                ) : (
                    <View style={styles.postImageFallback} />
                )}
            </Pressable>
        );
    }

    function renderRecent(item: RecentSearch) {
        return (
            <View key={item.id} style={styles.recentItem}>
                <Pressable style={styles.recentContent} onPress={() => goToSearch(item)}>
                    {item.image ? (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.recentImage}
                        />
                    ) : (
                        <View style={styles.recentImage} />
                    )}

                    <View style={styles.recentTexts}>
                        <Text style={styles.recentLabel} numberOfLines={1}>{item.label}</Text>
                        <Text style={styles.recentType}>{item.type === "user" ? "Perfil" : "Post"}</Text>
                    </View>
                </Pressable>

                <Pressable hitSlop={12} onPress={() => removeRecentSearch(item.id)}>
                    <Text style={styles.removeText}>×</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <View style={styles.headerSearch}>
                    <GenericInput
                    iconName="search"
                    placeholder="Pesquisar"
                    value={searchTerm}    
                    onValueChange={setSearchTerm}
                />
            </View>

            {searchLoading && (
                <View style={styles.loadingBox}>
                    <ActivityIndicator />
                </View>
            )}

            {!searchLoading && !normalizedSearchTerm && recentSearches.length > 0 && (
                <View style={styles.recentHeader}>
                    <Text style={styles.sectionTitle}>Recentes</Text>

                    <Pressable onPress={clearRecentSearches}>
                        <Text style={styles.clearText}>Limpar tudo</Text>
                    </Pressable>
                </View>
            )}

            {!searchLoading && !normalizedSearchTerm && recentSearches.length > 0 && (
                <FlatList
                    data={recentSearches}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => renderRecent(item)}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                />
            )}

            {hasSearchResults && (
                <ScrollView contentContainerStyle={styles.resultsContent} keyboardShouldPersistTaps="handled">
                    {(searchResults.users?.length ?? 0) > 0 && (
                        <View style={styles.resultSection}>
                            <Text style={styles.sectionTitle}>Contas</Text>
                            {searchResults.users.map(renderUser)}
                        </View>
                    )}

                    {(searchResults.posts?.length ?? 0) > 0 && (
                        <View style={styles.resultSection}>
                            <Text style={styles.sectionTitle}>Posts</Text>

                            <View style={styles.postsGrid}>
                                {searchResults.posts.map(renderPost)}
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}

            {!searchLoading && normalizedSearchTerm && !hasSearchResults && (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyTitle}>Nenhum resultado encontrado</Text>
                    <Text style={styles.emptyDescription}>Tente pesquisar por outro nome, usuário ou assunto.</Text>
                </View>
            )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        // backgroundColor: "#000"
    },
    container: {
        flex: 1,
        // backgroundColor: "#000"
    },
    headerSearch: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "rgba(255,255,255,0.12)"
    },
    loadingBox: {
        paddingTop: 24
    },
    recentHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 6
    },
    sectionTitle: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "700"
    },
    clearText: {
        color: "#4ea3ff",
        fontSize: 13,
        fontWeight: "600"
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24
    },
    recentItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10
    },
    recentContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    recentImage: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#1c1c1e"
    },
    recentTexts: {
        flex: 1
    },
    recentLabel: {
        color: "#000000",
        fontSize: 14,
        fontWeight: "600"
    },
    recentType: {
        marginTop: 2,
        color: "rgba(45, 45, 45, 0.56)",
        fontSize: 12
    },
    removeText: {
        color: "rgba(32, 32, 32, 0.72)",
        fontSize: 28,
        lineHeight: 28
    },
    resultsContent: {
        paddingHorizontal: 16,
        paddingBottom: 28
    },
    resultSection: {
        paddingTop: 18
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#1c1c1e"
    },
    userTexts: {
        flex: 1
    },
    userName: {
        color: "#000000",
        fontSize: 14,
        fontWeight: "700"
    },
    userUsername: {
        marginTop: 2,
        color: "rgba(255,255,255,0.6)",
        fontSize: 13
    },
    postsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 3,
        marginTop: 12
    },
    postCard: {
        width: "32.8%",
        aspectRatio: 1,
        backgroundColor: "#111"
    },
    postImage: {
        width: "100%",
        height: "100%"
    },
    postImageFallback: {
        flex: 1,
        backgroundColor: "#1c1c1e"
    },
    emptyBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32
    },
    emptyTitle: {
        color: "#323232",
        fontSize: 17,
        fontWeight: "700",
        textAlign: "center"
    },
    emptyDescription: {
        marginTop: 8,
        color: "rgba(60, 59, 59, 0.58)",
        fontSize: 13,
        textAlign: "center"
    }
});